import { ContentDm, CdmServer } from './contentdm'
import { IExportProgress, IField } from './app-state'
import { csvString } from './csv'
import { writeFile } from 'fs';
import { basename, dirname } from 'path';
import { sync } from 'mkdirp'

export class Exporter {
  private exportAlias: string = ''
  private exportCrosswalk: any | null = null
  private cdm: ContentDm
  private files: any | null = null

  public constructor(public cdmServer: CdmServer | null) {
    this.cdm = new ContentDm(this.cdmServer)
  }

  public async export(
    alias: string,
    location: string,
    download: boolean,
    fields: ReadonlyArray<IField>,
    crosswalk: any,
    progressCallback: (progress: IExportProgress) => void
  ): Promise<void> {
    this.exportAlias = alias
    this.exportCrosswalk = crosswalk
    progressCallback({ value: undefined, description: 'Getting item records' })

    this.files = []

    if (download) {
      let csvFile = basename(location)
      let newLocation = dirname(location) + '/' + basename(location, '.csv')
      location = newLocation + '/' + csvFile

      try {
        sync(newLocation)
      }
      catch (err) {
        return Promise.reject(err)
      }
    }

    return this.records(alias)
      .then((data: any) => {
        return this._processRecords(data.records, fields, progressCallback)
      }).then((items) => {
        progressCallback({ value: undefined, description: 'Creating CSV' })
        return csvString(items)
      }).then((csv: string) => {
        writeFile(location, csv, (err) => {
          if (err) {
            return Promise.reject(err)
          }
          return
        })
      }).then(() => {
        if (download && this.files) {
          return this._downloadFiles(
            this.files,
            location,
            progressCallback
          )
        }
        return Promise.resolve()
      })
  }

  private async records(
    alias: string,
    start: number = 1,
    prevData?: any
  ): Promise<any> {
    alias = alias.replace('/', '')
    const s = String(start)

    return this.cdm._request(
      'dmQuery',
      [alias, '0', '0', 'filetype', '1024', s, '0', '0', '0', '0', '1', '0']
    )
      .then((data) => {
        if (prevData) {
          data.records = data.records.concat(prevData.records)
        }
        if (data.pager.total >= start + 1024) {
          return this.records(alias, start + 1025, data)
        }
        else {
          return data
        }
      })
  }

  private async getRecord(record: any): Promise<any> {
    if (record.filetype === 'cpd') {
      return this.cdm.item(this.exportAlias, record.pointer)
        .then((item) => {
          return this.cdm.compoundObject(this.exportAlias, record.pointer)
            .then((object) => {
              item.files = []
              const pages = object.page || object.node.page || []
              pages.map((page: any) => {
                item.files.push({
                  filename: page.pagefile,
                  alias: this.exportAlias,
                  pointer: page.pageptr
                })
              })
              return item
            })
        })
    }
    else {
      return this.cdm.item(this.exportAlias, record.pointer)
        .then((item) => {
          item.files = [{
            filename: record.find,
            alias: this.exportAlias,
            pointer: record.pointer
          }]
          return item
        })
    }
  }

  private _map(item: any, fields: ReadonlyArray<IField>): any {
    let mapItem: any = []
    for (let key of fields) {
      const nick = this.exportCrosswalk[key.id]
      mapItem.push((typeof item[nick] === 'string') ? item[nick] : '')
    }
    return ['GenericWork', ''].concat(mapItem)
  }

  private _processRecords(
    records: any,
    fields: ReadonlyArray<IField>,
    progressCallback: (progress: IExportProgress) => void
  ): Promise<any> {
    let count = 0
    let items: Array<any> = [['Object Type', 'Filename']
      .concat(
        fields.map((key) => {
          return key.name;
        })
      )]

    return records.reduce((p: any, record: any) => {
      return p.then(() => {
        count++
        const progressValue = count / records.length
        progressCallback({
          value: progressValue,
          description: 'Mapping item ' + count + ' of ' + records.length
        })
        return this.getRecord(record)
          .then((item) => {
            items.push(this._map(item, fields))
            item.files.map((file: any) => {
              this.files.push(file)
              items.push(['File', file.filename])
            })
          })
      })
    }, Promise.resolve()
    )
      .then(() => {
        return items
      })
  }

  private _downloadFiles(
    files: any,
    location: string,
    progressCallback: (progress: IExportProgress) => void
  ): Promise<any> {
    let count = 0
    return files.reduce((p: any, file: any) => {
      return p.then(() => {
        count++
        const progressValue = count / files.length
        progressCallback({
          value: progressValue,
          description: 'Downloading file ' + count + ' of ' + files.length
        })
        return this.cdm.download(file, dirname(location))
      })
    }, Promise.resolve())
  }

}