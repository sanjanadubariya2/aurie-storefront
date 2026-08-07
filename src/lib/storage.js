/** Storage throws in private mode and sandboxed frames — never let that break a render. */
export function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or access denied — the session still works, it just won't persist */
  }
}

export function clear(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
