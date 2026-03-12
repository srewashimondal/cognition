const STORAGE_KEY_PREFIX = "cognition_interface_prefs";

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

export type InterfacePrefs = {
  fontSize: number;
  lineSpacing: number;
  theme: "light" | "dark";
  reducedMotion: boolean;
  focusMode: boolean;
};

const DEFAULTS: InterfacePrefs = {
  fontSize: 16,
  lineSpacing: 1.5,
  theme: "light",
  reducedMotion: false,
  focusMode: false,
};

export function getInterfacePrefs(userId?: string): InterfacePrefs {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<InterfacePrefs>;
    return {
      fontSize: typeof parsed.fontSize === "number" ? Math.min(24, Math.max(12, parsed.fontSize)) : DEFAULTS.fontSize,
      lineSpacing: typeof parsed.lineSpacing === "number" ? Math.min(2.5, Math.max(1.2, parsed.lineSpacing)) : DEFAULTS.lineSpacing,
      theme: parsed.theme === "dark" ? "dark" : DEFAULTS.theme,
      reducedMotion: !!parsed.reducedMotion,
      focusMode: !!parsed.focusMode,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveInterfacePrefs(prefs: InterfacePrefs, userId?: string): void {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function applyInterfacePrefs(prefs: InterfacePrefs): void {
  const root = document.documentElement;
  const basePx = 16;
  root.style.setProperty("--readability-font-size", `${prefs.fontSize}px`);
  root.style.setProperty("--readability-scale", String(prefs.fontSize / basePx));
  root.style.setProperty("--readability-line-height", String(prefs.lineSpacing));
  if (prefs.theme === "dark") {
    root.classList.add("readability-dark");
    root.classList.remove("readability-light");
  } else {
    root.classList.add("readability-light");
    root.classList.remove("readability-dark");
  }
  if (prefs.reducedMotion) {
    root.classList.add("readability-reduce-motion");
  } else {
    root.classList.remove("readability-reduce-motion");
  }
  if (prefs.focusMode) {
    root.classList.add("readability-focus-mode");
  } else {
    root.classList.remove("readability-focus-mode");
  }
}
