import { compare, type CmpValue } from '../copy'
import { Logo } from '../logo'
import { ServiceMark } from './service-mark'

export default function Compare() {
  return (
    <section className="section wrap centered">
      <h2>
        why <em>loft</em>?
      </h2>
      <p className="body">
        your files live in the cloud, open instantly, and don’t fill up your
        mac.
      </p>
      <div className="cmp">
        <table
          className="cmp-table"
          aria-label="loft compared with icloud, google drive and dropbox"
        >
          <thead>
            <tr className="cmp-row cmp-head">
              <td />
              {compare.columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={col === 'loft' ? 'cmp-us' : undefined}
                >
                  <span className="cmp-brand">
                    {col === 'loft' ? (
                      <Logo width={26} height={19} />
                    ) : (
                      <ServiceMark name={col} />
                    )}
                    {col}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr className="cmp-row" key={row.label}>
                <th scope="row" className="cmp-label">
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td
                    key={`${row.label}-${compare.columns[i]}`}
                    className={i === 0 ? 'cmp-us' : undefined}
                  >
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Cell({ value }: { value: CmpValue }) {
  if (value === true) {
    return (
      <span className="cmp-yes" role="img" aria-label="yes">
        <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
          <path
            d="M2 6.2 4.8 9 10 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (value === 'partly') {
    return <span className="cmp-text">partly</span>
  }
  return (
    <span className="cmp-no" role="img" aria-label="no">
      –
    </span>
  )
}
