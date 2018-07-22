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
    this.files = []

    progressCallback({ value: undefined, description: 'Getting item records' })

    const data = await this.records(alias)
    const items = await this._processRecords(data.records, fields, progressCallback)

    progressCallback({ value: undefined, description: 'Creating CSV' })
    const csv = await csvString(items)

    location = download ? this.downloadLocation(location) : location
    writeFile(location, csv, (err) => {
      if (err) {
        return Promise.reject(err)
      }
      return
    })

    if (download && this.files) {
      await this._downloadFiles(this.files, location, progressCallback)
    }
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
      const item = await this.cdm.item(this.exportAlias, record.pointer)
      const object = await this.cdm.compoundObject(
        this.exportAlias,
        record.pointer
      )

      item.files = []
      const pages = this._pages(object)

      pages.map((page: any) => {
        item.files.push({
          filename: page.pagefile,
          alias: this.exportAlias,
          pointer: page.pageptr
        })
      })

      return item
    }
    else {
      const item = await this.cdm.item(this.exportAlias, record.pointer)
      item.files = [{
        filename: record.find,
        alias: this.exportAlias,
        pointer: record.pointer
      }]

      return item
    }
  }

  private _pages(object: any): ReadonlyArray<any> {
    let pages: Array<any> = new Array()

    if (object.node && object.node.node) {
      object.node.node.map((node: any) => {
        pages = pages.concat(node.page || [])
      })
    }
    const otherPages = object.page || object.node.page || []

    return pages.concat(otherPages)
  }

  private _map(item: any, fields: ReadonlyArray<IField>): any {
    let mapItem: any = []
    for (let key of fields) {
      const nick = this.exportCrosswalk[key.id]
      mapItem.push((typeof item[nick] === 'string') ? item[nick] : '')
    }
    return ['GenericWork', ''].concat(mapItem)
  }

  private async _processRecords(
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

    for (let record of records) {
      const progressValue = count / records.length
      progressCallback({
        value: progressValue,
        description: 'Mapping item ' + (++count) + ' of ' + records.length
      })
      const item = await this.getRecord(record)
      items.push(this._map(item, fields))

      item.files.map((file: any) => {
        this.files.push(file)
        items.push(['File', file.filename])
      })
    }

    return items
  }

  private async _downloadFiles(
    files: any,
    location: string,
    progressCallback: (progress: IExportProgress) => void
  ): Promise<any> {

    let count = 0
    for (let file of files) {
      const progressValue = count / files.length
      progressCallback({
        value: progressValue,
        description: 'Downloading file ' + (++count) + ' of ' + files.length
      })
      await this.cdm.download(file, dirname(location))
    }
  }

  private downloadLocation(location: string): string {
    let csvFile = basename(location)
    let newLocation = dirname(location) + '/' + basename(location, '.csv')

    try {
      sync(newLocation)
    }
    catch (err) {
      return location
    }

    return newLocation + '/' + csvFile
  }
}