// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The overflow region must be keyboard-scrollable on narrow screens.
import { useId } from 'react'
import './diagram.css'

const flows = {
  storage: {
    actors: ['Your Mac', 'loft API', 'Your storage'],
    steps: [
      [0, 1, 'List files · bearer token'],
      [1, 2, 'Read metadata'],
      [1, 0, 'File names, sizes, and versions'],
      [0, 1, 'Open file · request byte range'],
      [1, 2, 'Read requested bytes'],
      [2, 1, 'Bytes from disk or S3'],
      [1, 0, '206 · requested file range'],
    ],
    caption:
      'Your Mac connects to the API you operate. File contents stay in your storage until requested.',
  },
  sharing: {
    actors: ['You', 'loft API', 'Recipient'],
    steps: [
      [0, 1, 'Issue a share · bearer token'],
      [1, 1, 'Persist link and expiry'],
      [1, 0, 'Signed URL on your web host'],
      [0, 2, 'Send link'],
      [2, 1, 'Open signed link'],
      [1, 2, 'File metadata and bytes'],
      [0, 1, 'Revoke link when finished'],
    ],
    caption:
      'Share links expire after seven days. Recipients use the link; your operator token stays private.',
  },
} as const

export function SequenceDiagram({ kind }: { kind: keyof typeof flows }) {
  const id = useId().replaceAll(':', '')
  const flow = flows[kind]
  const height = 125 + flow.steps.length * 58
  return (
    <figure className="sequence-figure">
      <section
        className="sequence-scroll"
        tabIndex={0}
        aria-label="Scrollable loft sequence"
      >
        <svg
          viewBox={`0 0 720 ${height}`}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>
            {kind === 'sharing' ? 'File sharing' : 'File storage'} sequence
          </title>
          <desc id={`${id}-desc`}>
            {flow.steps
              .map(
                ([from, to, label]) =>
                  `${flow.actors[from]} to ${flow.actors[to]}: ${label}`,
              )
              .join('. ')}
          </desc>
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 10 5 0 10Z" fill="#789166" />
            </marker>
          </defs>
          {flow.actors.map((actor, index) => (
            <g key={actor}>
              <rect
                x={40 + index * 240}
                y="15"
                width="160"
                height="45"
                rx="7"
                fill="#eef3e6"
                stroke="#b4c4a3"
              />
              <text x={120 + index * 240} y="43" textAnchor="middle">
                {actor}
              </text>
              <line
                x1={120 + index * 240}
                x2={120 + index * 240}
                y1="60"
                y2={height - 20}
                stroke="#c5cfbc"
                strokeDasharray="4 5"
              />
            </g>
          ))}
          {flow.steps.map(([from, to, label], index) => {
            const x1 = 120 + from * 240,
              x2 = 120 + to * 240,
              y = 108 + index * 58
            return (
              <g key={label}>
                <text
                  x={from === to ? x1 + 10 : (x1 + x2) / 2}
                  y={y - 10}
                  textAnchor={from === to ? 'start' : 'middle'}
                >
                  {label}
                </text>
                <path
                  d={
                    from === to
                      ? `M${x1} ${y}h130v18h-130`
                      : `M${x1} ${y}H${x2}`
                  }
                  fill="none"
                  stroke="#789166"
                  strokeDasharray={to < from ? '5 4' : undefined}
                  markerEnd={`url(#${id}-arrow)`}
                />
              </g>
            )
          })}
        </svg>
      </section>
      <figcaption>{flow.caption}</figcaption>
    </figure>
  )
}
