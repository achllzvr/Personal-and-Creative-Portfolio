/** Resolve a public asset path against Vite `base` (GitHub Pages project URL). */
export function asset(path) {
  const clean = String(path).replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${clean}`
}
