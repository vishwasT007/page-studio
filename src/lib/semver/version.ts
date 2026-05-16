type SemVer = { major: number; minor: number; patch: number }

function parse(version: string): SemVer {
  const parts = version.split('.').map(Number)
  return { major: parts[0] ?? 0, minor: parts[1] ?? 0, patch: parts[2] ?? 0 }
}

function format(v: SemVer): string {
  return `${v.major}.${v.minor}.${v.patch}`
}

export function bumpVersion(
  current: string,
  changeType: 'patch' | 'minor' | 'major'
): string {
  const v = parse(current)
  switch (changeType) {
    case 'major':
      return format({ major: v.major + 1, minor: 0, patch: 0 })
    case 'minor':
      return format({ major: v.major, minor: v.minor + 1, patch: 0 })
    case 'patch':
      return format({ major: v.major, minor: v.minor, patch: v.patch + 1 })
  }
}

export const INITIAL_VERSION = '1.0.0'
