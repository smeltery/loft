import { faqs } from '../copy'
import './faq.css'

export default function Faq() {
  return (
    <section className="section wrap centered" id="faq">
      <h2>
        questions, <em>answered</em>.
      </h2>
      <div className="faq">
        {faqs.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
