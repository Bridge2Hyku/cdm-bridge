import * as request from 'request'
import * as rp from 'request-promise'
import { createWriteStream, existsSync, rename, } from 'fs'

export type CdmServer = {
  hostname: string
  port: number | null
  ssl: boolean
}

export enum CdmType {
  Published = 0,
  Unpublished = 1
}

export type CdmCollection = {
  readonly alias: string
  readonly name: string
  readonly path: string
  readonly secondary_alias: string
}

export type CdmFieldInfo = {
  readonly admin: number
  readonly dc: string
  readonly find: string
  readonly hide: number
  readonly name: string
  readonly nick: string
  readonly readonly: number
  readonly req: number
  readonly search: number
  readonly size: number
  readonly type: string
  readonly vocab: number
  readonly vocdb: string
}

export class ContentDm {
  public constructor(public server: CdmServer | null) { }

  public async collections(published?: CdmType): Promise<any> {
    return this._request('dmGetCollectionList', [String(published)])
      .then((data) => {
        return data as ReadonlyArray<CdmCollection>
      })
  }

  public async collectionFieldInfo(alias: string): Promise<any> {
    alias = alias.replace('/', '')
    return this._request('dmGetCollectionFieldInfo', [alias])
      .then((data) => {
        return data as ReadonlyArray<CdmFieldInfo>
      })
  }

  public async compoundObject(alias: string, pointer: string): Promise<any> {
    alias = alias.replace('/', '')
    return this._request('dmGetCompoundObjectInfo', [alias, pointer])
  }

  public async item(alias: string, pointer: string): Promise<any> {
    alias = alias.replace('/', '')
    return this._request('dmGetItemInfo', [alias, pointer])
  }

  public download(file: any, location: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this._fileUrl(file.alias, file.pointer)
      let destination = location + '/' + file.filename
      let part = destination + '.part'

      if (existsSync(destination)) {
        resolve()
      }

      const output = createWriteStream(part)
      output.on('finish', () => {
        output.close()
        rename(part, destination, (e) => {
          if (e) {
            reject(e)
          }
          resolve()
        })
      })

      request.get(url)
        .on('error', (err) => reject(err))
        .pipe(output)
    })
  }

  public async _request(fnc: string, params?: Array<string>): Promise<any> {
    if (this._endpoint() === '') {
      const error = new Error('ContentDM settings are not set.')
      console.error(error.message)
      return Promise.reject(error)
    }

    const strParams = params ? params.join('/') : ''
    const query = 'q=' + fnc + '/' + strParams + ('/json')

    const options = {
      url: this._endpoint() + query,
      headers: {
        Connection: 'keep-alive'
      },
      forever: true,
      json: true,
      resolveWithFullResponse: true
    }

    return rp(options)
      .then((response) => {
        return response.body
      })
  }

  private _fileUrl(alias: string, pointer: string): string {
    if (!this.server) {
      return ''
    }

    return 'http' + (this.server.ssl ? 's' : '') + '://' +
      this.server.hostname + ':' + this.server.port +
      '/cgi-bin/showfile.exe?CISOROOT=' + alias + '&CISOPTR=' + pointer
  }

  private _endpoint(): string {
    if (!this.server) {
      return ''
    }

    return 'http' + (this.server.ssl ? 's' : '') + '://' +
      this.server.hostname + ':' + this.server.port +
      '/dmwebservices/index.php?'
  }

}