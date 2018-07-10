import { v4 } from 'uuid'

const activeIds = new Set<string>()
const poolPrefix = '__'

export function sanitizeId(id: string): string {
  return id.replace(/[^a-z0-9\-_:.]+/gi, '_').toLowerCase()
}

export function createUniqueId(prefix: string): string {
  const safePrefix = sanitizeId(`${poolPrefix}${prefix}`)

  for (let i = 0; i < 100; i++) {
    const id = i > 0 ? `${safePrefix}_${i}` : safePrefix

    if (!activeIds.has(id)) {
      activeIds.add(id)
      return id
    }
  }

  return v4()
}

export function releaseUniqueId(id: string) {
  activeIds.delete(id)
}
