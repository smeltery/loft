import { perks, stats, steps } from '../copy'

export default function How() {
  return (
    <section className="how wrap" id="how">
      {steps.map((step) => (
        <article key={step.n}>
          <p className="kicker">
            {step.n} {step.title}
          </p>
          <p>{step.body}</p>
        </article>
      ))}
      <ul className="stats">
        {stats.map((stat) => (
          <li key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
      <p className="kicker">4 what you get</p>
      <ul className="perks">
        {perks.map((perk) => (
          <li key={perk}>{perk}</li>
        ))}
      </ul>
    </section>
  )
}
