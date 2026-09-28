export default function HomePage() {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date())

  return (
    <div className="desk">
      <p className="eyebrow">{today}</p>
      <h1>Your desk is open.</h1>
      <p className="lede">
        You are signed in. This page stays behind the site password, along with the rest of Personal Helper.
      </p>
      <ul className="desk-list">
        <li>
          <h2>Today</h2>
          <p>A quiet place for the day in front of you.</p>
        </li>
        <li>
          <h2>Notes</h2>
          <p>Private notes can live here when you are ready to add them.</p>
        </li>
        <li>
          <h2>Reminders</h2>
          <p>Nothing is scheduled yet.</p>
        </li>
      </ul>
    </div>
  )
}
