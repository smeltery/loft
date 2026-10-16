import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)

export function highlightCode(code: string, label: string) {
  const name = label.toLowerCase()
  const language = /typescript|\.ts$/.test(name)
    ? 'typescript'
    : /javascript|\.m?js$/.test(name)
      ? 'javascript'
      : /json|response/.test(name)
        ? 'json'
        : /shell|terminal|bash|curl/.test(name)
          ? 'bash'
          : undefined
  return language
    ? hljs.highlight(code, { language }).value
    : code
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}
