import { useState } from 'react'
import { clampTb, monthlyUsd } from '../lib/price'

export default function Pricing() {
  const [tb, setTb] = useState(1)
  return (
    <section className="plan wrap" id="plan">
      <h2>one plan. any size.</h2>
      <p>pick the space you need. pay monthly. cancel any time.</p>
      <div className="meter">
        <button
          type="button"
          aria-label="less storage"
          onClick={() => setTb(clampTb(tb - 1))}
        >
          −
        </button>
        <p className="tb">
          <strong>{tb} TB</strong>
          of storage
        </p>
        <button
          type="button"
          aria-label="more storage"
          onClick={() => setTb(clampTb(tb + 1))}
        >
          +
        </button>
      </div>
      <p className="price">${monthlyUsd(tb)} per month</p>
      <p className="fine">
        $9 per TB a month. prices in USD, plus local tax where it applies.
      </p>
    </section>
  )
}
