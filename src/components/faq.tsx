import { faqs } from '../copy'

export default function Faq() {
  return (
    <section className="faq wrap" id="faq">
      <h2>questions, answered.</h2>
      {faqs.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </section>
  )
}
