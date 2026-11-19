const INTRO_SEEN_KEY = 'kuai-intro-seen-v1'

/** Show the intro once per browser tab session. */
export function shouldShowIntro(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) !== '1'
  } catch {
    return true
  }
}

export function rememberIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, '1')
  } catch {
    // Storage blocked (private mode): the intro may show again next visit.
  }
}
