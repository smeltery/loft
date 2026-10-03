import { compare } from '../copy'

export default function Compare() {
  return (
    <section className="compare wrap" id="why">
      <h2>why loft?</h2>
      <p>
        your files live in the cloud, open instantly, and don’t fill up your
        mac.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th />
              {compare.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                {row.values.map((ok, i) => (
                  <td key={`${row.label}-${compare.columns[i] ?? i}`}>
                    {ok ? '✓' : '—'}
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
