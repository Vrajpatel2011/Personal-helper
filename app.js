const EXPECTED_HASH = "5f4dcc3b5aa765d61d8327deb882cf99"
const SESSION_KEY = "personal-helper-open"
const SUBMITTED_KEY = "personal-helper-submitted"

const SHIFT = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21]

function md5(message) {
  const bytes = new TextEncoder().encode(message)
  const total = paddedLength(bytes.length)
  const data = new Uint8Array(total)
  data.set(bytes)
  data[bytes.length] = 0x80

  const view = new DataView(data.buffer)
  const bits = bytes.length * 8
  view.setUint32(total - 8, bits >>> 0, true)
  view.setUint32(total - 4, Math.floor(bits / 0x100000000), true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  for (let offset = 0; offset < total; offset += 64) {
    const words = new Uint32Array(16)
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, true)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let index = 0; index < 64; index += 1) {
      let mixed = 0
      let wordIndex = 0

      if (index < 16) {
        mixed = (b & c) | (~b & d)
        wordIndex = index
      } else if (index < 32) {
        mixed = (d & b) | (~d & c)
        wordIndex = (5 * index + 1) % 16
      } else if (index < 48) {
        mixed = b ^ c ^ d
        wordIndex = (3 * index + 5) % 16
      } else {
        mixed = c ^ (b | ~d)
        wordIndex = (7 * index) % 16
      }

      const sum = add32(add32(add32(a, mixed), sineConstant(index)), words[wordIndex])
      const shift = SHIFT[(index >> 4) * 4 + (index % 4)]
      const rotated = ((sum << shift) | (sum >>> (32 - shift))) >>> 0

      a = d
      d = c
      c = b
      b = add32(b, rotated)
    }

    a0 = add32(a0, a)
    b0 = add32(b0, b)
    c0 = add32(c0, c)
    d0 = add32(d0, d)
  }

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0)
}

function paddedLength(byteLength) {
  const withMarker = byteLength + 1
  const remainder = withMarker % 64
  const zeroPad = remainder <= 56 ? 56 - remainder : 120 - remainder
  return withMarker + zeroPad + 8
}

function sineConstant(index) {
  return Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0
}

function add32(left, right) {
  return (left + right) >>> 0
}

function toHex(word) {
  const bytes = [word & 255, (word >>> 8) & 255, (word >>> 16) & 255, (word >>> 24) & 255]
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function initLogin() {
  if (typeof document === "undefined") return

  const login = document.querySelector("#login")
  const site = document.querySelector("#site")
  const form = document.querySelector("#login-form")
  const input = document.querySelector("#password")
  const error = document.querySelector("#login-error")
  const date = document.querySelector("#today")
  const signOut = document.querySelector("#sign-out")
  const tabs = document.querySelectorAll(".nav-tab")
  const homeView = document.querySelector("#view-home")
  const assignmentsView = document.querySelector("#view-assignments")
  const assignmentList = document.querySelector("#assignment-list")
  let assignmentsLoaded = false

  date.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())

  function showSite() {
    login.hidden = true
    site.hidden = false
    document.title = "Personal Helper"
  }

  function showLogin() {
    site.hidden = true
    login.hidden = false
    error.hidden = true
    input.value = ""
    document.title = "Sign in · Personal Helper"
    input.focus()
  }

  if (sessionStorage.getItem(SESSION_KEY) === "1") showSite()

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const hashed = md5(input.value)
    if (hashed === EXPECTED_HASH) {
      sessionStorage.setItem(SESSION_KEY, "1")
      showSite()
      return
    }
    error.hidden = false
    input.focus()
  })

  signOut.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY)
    showLogin()
  })

  function showView(name) {
    const home = name !== "assignments"
    homeView.hidden = !home
    assignmentsView.hidden = home
    tabs.forEach((tab) => {
      const active = tab.dataset.view === (home ? "home" : "assignments")
      tab.classList.toggle("is-active", active)
      if (active) tab.setAttribute("aria-current", "page")
      else tab.removeAttribute("aria-current")
    })
    document.title = home ? "Personal Helper" : "Assignments · Personal Helper"
    if (!home) loadAssignments()
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showView(tab.dataset.view))
  })

  async function loadAssignments() {
    if (assignmentsLoaded) return
    assignmentList.replaceChildren(statusLine("Loading assignments…"))
    try {
      const response = await fetch("assignments.json")
      if (!response.ok) throw new Error("missing file")
      const assignments = await response.json()
      assignmentsLoaded = true
      renderAssignments(assignments)
    } catch {
      assignmentList.replaceChildren(statusLine("Assignments could not be loaded."))
    }
  }

  function renderAssignments(assignments) {
    const upcoming = assignments
      .filter((item) => item && item.due)
      .slice()
      .sort((left, right) => new Date(left.due) - new Date(right.due))

    if (upcoming.length === 0) {
      assignmentList.replaceChildren(statusLine("Nothing is due."))
      return
    }

    const fragment = document.createDocumentFragment()
    let currentDay = ""
    let group = null

    upcoming.forEach((item) => {
      const due = new Date(item.due)
      const day = dayLabel(due)
      if (day !== currentDay) {
        currentDay = day
        group = document.createElement("section")
        group.className = "day-group"
        const label = document.createElement("h2")
        label.className = "day-label" + (isDueSoon(due) ? " is-soon" : " is-later")
        label.textContent = day
        group.append(label)
        fragment.append(group)
      }

      const card = document.createElement("article")
      card.className = "assignment"
      const meta = document.createElement("div")
      meta.className = "assignment-meta"
      const soon = isDueSoon(due)
      const when = document.createElement("p")
      when.className = "due-time" + (soon ? " is-soon" : " is-later")
      const dueWord = document.createElement("span")
      dueWord.textContent = "Due"
      when.append(dueWord, document.createTextNode(" " + dueBadgeText(due, soon)))
      meta.append(when, submissionButton(item))
      const title = document.createElement("h3")
      title.textContent = item.title || "Untitled assignment"
      card.append(meta, title)

      const description = cleanDescription(item.description)
      if (description) {
        const body = document.createElement("p")
        body.className = "assignment-description"
        body.textContent = description
        card.append(body)
      }

      const files = collectFiles(item)
      if (files.length > 0) {
        const list = document.createElement("ul")
        list.className = "file-list"
        files.forEach((file) => {
          const entry = document.createElement("li")
          const link = document.createElement("a")
          link.href = file.url
          link.textContent = file.name
          link.target = "_blank"
          link.rel = "noopener noreferrer"
          entry.append(link)
          list.append(entry)
        })
        card.append(list)
      }

      group.append(card)
    })

    assignmentList.replaceChildren(fragment)
  }
}

function statusLine(message) {
  const line = document.createElement("p")
  line.className = "assignment-status"
  line.textContent = message
  return line
}

function dayLabel(due) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(due)
}

function isDueSoon(due) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(due)
  dueDay.setHours(0, 0, 0, 0)
  const days = Math.round((dueDay - today) / 86400000)
  return days <= 2
}

function dueBadgeText(due, soon) {
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: soon ? "short" : undefined,
    month: "short",
    day: "numeric",
  }).format(due)
  return soon ? `${date} · ${timeLabel(due)}` : `${date}, ${timeLabel(due)}`
}

function timeLabel(due) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(due)
}

function assignmentId(item) {
  const file = Array.isArray(item.files) && item.files[0]
  if (file && file.url) return file.url
  return `${item.title || ""}|${item.due || ""}`
}

function readSubmitted() {
  try {
    const saved = JSON.parse(localStorage.getItem(SUBMITTED_KEY))
    return saved && typeof saved === "object" ? saved : {}
  } catch {
    return {}
  }
}

function submissionButton(item) {
  const id = assignmentId(item)
  const button = document.createElement("button")
  button.type = "button"
  button.className = "submission"

  function paint(submitted) {
    button.classList.toggle("is-submitted", submitted)
    button.classList.toggle("is-open", !submitted)
    button.textContent = submitted ? "Submitted" : "Not submitted"
    button.setAttribute("aria-pressed", submitted ? "true" : "false")
  }

  paint(Boolean(readSubmitted()[id]))
  button.addEventListener("click", () => {
    const saved = readSubmitted()
    const next = !saved[id]
    if (next) saved[id] = true
    else delete saved[id]
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(saved))
    paint(next)
  })
  return button
}

function collectFiles(item) {
  const files = []
  const seen = new Set()

  function add(url, name) {
    if (!url || seen.has(url)) return
    seen.add(url)
    files.push({ url, name: name || "Attached file" })
  }

  if (Array.isArray(item.files)) {
    item.files.forEach((file) => {
      if (typeof file === "string") add(file, "Attached link")
      else if (file) add(file.url, file.name)
    })
  }

  const description = String(item.description || "")
  const matches = description.match(/https?:\/\/\S+/g) || []
  matches.forEach((match) => add(match.replace(/[).,;]+$/, ""), "Attached link"))
  return files
}

function cleanDescription(description) {
  let text = String(description || "")
  text = text.replace(/\s*-\s*Link:\s*https?:\/\/\S+/gi, "")
  text = text.replace(/https?:\/\/\S+/g, "")
  text = text.replace(/\*/g, "")
  text = text.replace(/[ \t]*\n[ \t]*/g, " ")
  text = text.replace(/[ \t]{2,}/g, " ")
  text = text.trim()
  if (text === "-" || text === "Link:") return ""
  return text
}

initLogin()

if (typeof module !== "undefined" && module.exports) {
  module.exports = { md5 }
}
