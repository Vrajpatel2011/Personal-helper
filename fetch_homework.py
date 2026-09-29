"""Fetch upcoming Schoology assignments from a private iCal feed."""

from __future__ import annotations

import json
import os
import re
from datetime import date, datetime
from pathlib import Path

import requests
from icalendar import Calendar

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT / ".env"
OUTPUT_PATH = ROOT / "assignments.json"


def load_schoology_url(env_path: Path) -> str:
    from_env = os.environ.get("SCHOOLOGY_URL", "").strip().strip('"').strip("'")
    if from_env:
        return from_env

    if not env_path.is_file():
        raise SystemExit(f"Missing {env_path.name}. Add SCHOOLOGY_URL there.")

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() != "SCHOOLOGY_URL":
            continue
        url = value.strip().strip('"').strip("'")
        if url:
            return url

    raise SystemExit("SCHOOLOGY_URL is missing from .env.")


def to_https(url: str) -> str:
    if url.startswith("webcal://"):
        return "https://" + url[len("webcal://") :]
    if url.startswith("webcals://"):
        return "https://" + url[len("webcals://") :]
    return url


def as_datetime(value) -> datetime | None:
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day)
    return None


def event_due(component) -> datetime | None:
    # Schoology assignment events use DTSTART as the due moment.
    # Fall back to DTEND when a feed only marks the end of the window.
    for field in ("dtstart", "dtend"):
        prop = component.get(field)
        if prop is None:
            continue
        due = as_datetime(prop.dt)
        if due is not None:
            return due
    return None


def is_upcoming(due: datetime, now: datetime) -> bool:
    if due.tzinfo is not None and now.tzinfo is None:
        now = now.astimezone()
    if due.tzinfo is None and now.tzinfo is not None:
        due = due.replace(tzinfo=now.tzinfo)
    return due >= now


LINK_PATTERN = re.compile(r"https?://\S+")


def event_files(component, description: str) -> list[dict]:
    files = []
    seen = set()

    def add(href: str, name: str) -> None:
        cleaned = href.strip().rstrip(").,;")
        if not cleaned or cleaned in seen:
            return
        seen.add(cleaned)
        files.append({"name": name, "url": cleaned})

    raw_url = component.get("url")
    if raw_url is not None:
        add(str(raw_url), "Open in Schoology")

    for match in LINK_PATTERN.findall(description):
        add(match, "Attached link")

    return files


def text_field(component, name: str) -> str:
    value = component.get(name)
    if value is None:
        return ""
    return str(value).strip()


def fetch_assignments(url: str) -> list[dict]:
    response = requests.get(to_https(url), timeout=30)
    response.raise_for_status()

    calendar = Calendar.from_ical(response.content)
    now = datetime.now().astimezone()
    assignments = []

    for component in calendar.walk("VEVENT"):
        due = event_due(component)
        if due is None or not is_upcoming(due, now):
            continue
        description = text_field(component, "description")
        assignments.append(
            {
                "title": text_field(component, "summary") or "Untitled assignment",
                "description": description,
                "due": due.isoformat(),
                "files": event_files(component, description),
            }
        )

    assignments.sort(key=lambda item: item["due"])
    return assignments


def main() -> None:
    url = load_schoology_url(ENV_PATH)
    assignments = fetch_assignments(url)
    OUTPUT_PATH.write_text(
        json.dumps(assignments, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(assignments)} upcoming assignment(s) to {OUTPUT_PATH.name}.")


if __name__ == "__main__":
    main()
