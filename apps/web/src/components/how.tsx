import { perks, stats, notes } from '../copy'

export default function How() {
  return (
    <section className="notes wrap" id="how">
      {notes.map((note) => (
        <article key={note.n} className="note">
          <p className="note-head">
            <span className="badge">{note.n}</span>
            {note.title}
          </p>
          {note.lead ? <p className="note-lead">{note.lead}</p> : null}
          {note.paras?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {note.facts ? (
            <div className="facts">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          {note.steps ? (
            <ol className="steps">
              {note.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : null}
          {note.perks ? (
            <ul className="feature-list">
              {perks.map((perk) => (
                <li key={perk}>
                  <LinkIcon />
                  {perk}
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  )
}

function LinkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.14 10.69 9.35 10.48a4.95 4.95 0 0 1 7.17 0 4.95 4.95 0 0 1 0 7.17l-2.87 2.86a4.95 4.95 0 0 1-7.16 0 4.95 4.95 0 0 1 0-7.16l.46-.47"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="m17.05 11.11.47-.46a4.95 4.95 0 1 0-7-7l-2.87 2.86a4.95 4.95 0 0 0 0 7.17 4.95 4.95 0 0 0 7.17 0l.2-.21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
