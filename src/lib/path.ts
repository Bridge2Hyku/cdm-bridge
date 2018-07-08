import * as Path from 'path'
import fileUrl from 'file-url'

export function encodePathAsUrl(...pathSegments: string[]): string {
  const path = Path.resolve(...pathSegments)
  return fileUrl(path)
}

export function staticPath(): string {
  return process.env.NODE_ENV === 'development' ?
    __static :
    Path.dirname(__dirname) + '/static'
}