import { perks, stats, steps } from '../copy'

export default function How() {
  return (
    <section className="notes wrap" id="how">
      {steps.map((step) => (
        <article key={step.n} className="note">
          <p className="note-head">
            <span className="badge">{step.n}</span>
            {step.title}
          </p>
          <p className="note-lead">{lead(step.body)}</p>
          <p>{step.body}</p>
        </article>
      ))}
      <ul className="facts">
        {stats.map((stat) => (
          <li key={stat.label}>
            <b>{stat.value}</b>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
      <p className="note-head">
        <span className="badge">4</span>
        what you get
      </p>
      <ul className="feature-list">
        {perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>
    </section>
  )
}

function lead(body: string) {
  return body.split('.')[0] ?? body
}
