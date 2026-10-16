const path = window.location.pathname
if (path === '/docs' || path.startsWith('/docs/')) {
  void import('./docs/main')
} else {
  void import('./marketing')
}

export {}
