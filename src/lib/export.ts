import { ContentDm, CdmServer } from './contentdm'
import { IExportProgress, IExportError, IField } from './app-state'
import { csvString } from './csv'
import { writeFile } from 'fs';
import { basename, dirname } from 'path';
import { sync } from 'mkdirp'
import * as filesize from 'filesize';


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
    progressCallback: (progress: IExportProgress) => void,
    errorCallback: (error: IExportError) => void
  ): Promise<void> {

    const errors: Array<IExportError> = []
    this.exportAlias = alias
    this.exportCrosswalk = crosswalk
    this.files = []

    const missing = this._missingFields(fields, crosswalk)
    if (missing) {
      return Promise.reject(
        new Error(missing.toString().replace(/,/gi, "\n"))
      )
    }

    progressCallback({ value: undefined, description: 'Getting item records' })

    const data = await this.records(alias)
    const csvData = await this._processRecords(
      data.records,
      fields,
      progressCallback,
      (error: IExportError) => {
        errors.push(error)
        errorCallback(error)
      }
    )

    progressCallback({ value: undefined, description: 'Creating CSV' })
    const csv = await csvString(csvData)

    location = download ? this.downloadLocation(location) : location
    writeFile(location, csv, (err) => {
      if (err) {
        return Promise.reject(err)
      }
      return
    })

    if (errors.length > 0) {
      this.processErrors(errors, location)
    }

    if (download && this.files) {
      await this._downloadFiles(this.files, location, progressCallback)
    }

    progressCallback({ value: 1, description: '' })
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

  private async getRecord(
    record: any,
    compoundProgressCallback?: (item: number, total: number) => void
  ): Promise<any> {
    const item = await this.cdm.item(this.exportAlias, record.pointer)

    if (record.filetype === 'cpd') {
      const object = await this.cdm.compoundObject(
        this.exportAlias,
        record.pointer
      )
      const pages = this._pages(object)

      item.files = []
      let count = 0;
      for (let page of pages) {
        if (compoundProgressCallback) {
          compoundProgressCallback(++count, pages.length)
        }
        const pageInfo = await this.cdm.item(this.exportAlias, page.pageptr)

        item.files.push({
          filename: page.pagefile,
          alias: this.exportAlias,
          pointer: page.pageptr,
          size: pageInfo.cdmfilesize,
          info: pageInfo
        })
      }
    }
    else {
      item.files = [{
        filename: record.find,
        alias: this.exportAlias,
        pointer: record.pointer,
        size: item.cdmfilesize,
        info: null
      }]
    }

    return item
  }

  private _pages(object: any): ReadonlyArray<any> {
    let pages: Array<any> = new Array()

    if (object.node && object.node.node) {
      const nodes = this._toArray(object.node.node)
      nodes.map((node: any) => {
        pages = pages.concat(this._toArray(node.page))
      })
    }
    const otherPages = object.page || object.node.page || []

    return pages.concat(this._toArray(otherPages))
  }

  private _toArray(obj: any): Array<any> {
    if (!obj) {
      return []
    }
    return Array.isArray(obj) ? obj : [obj]
  }

  private _map(
    item: any,
    fields: ReadonlyArray<IField>,
    errorCallback: (error: IExportError) => void
  ): any {

    if (!item) {
      return []
    }

    let mapItem: any = []
    for (let field of fields) {
      const nicks = this.exportCrosswalk[field.id] ?
        this.exportCrosswalk[field.id].filter((nick: string) => nick !== '') :
        []

      let value = '';
      nicks.map((nick: string) => {
        value += (typeof item[nick] === 'string') ? item[nick].replace(/;+$/g, '') + "; " : ""
      })
      value = value.slice(0, -2)

      if (field.required && value === "") {
        errorCallback({
          description: `Item ${item['dmrecord']} '${item['title']}' is missing data for required field '${field.name}'`
        })
      }

      mapItem.push(value)
    }
    return mapItem
  }

  private async _processRecords(
    records: any,
    fields: ReadonlyArray<IField>,
    progressCallback: (progress: IExportProgress) => void,
    errorCallback: (error: IExportError) => void
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
        description: `Mapping item ${++count} of ${records.length}`
      })

      const item = await this.getRecord(record, (cpo, cpototal) => {
        if (cpototal > 30) { // threshold so the display doesn't get to crazy
          progressCallback({
            value: progressValue,
            description: `Mapping item ${count} of ${records.length}`,
            subdescription: `Getting compound object item record ${cpo} of ${cpototal}`
          })
        }
      })
      items.push(['GenericWork', ''].concat(this._map(item, fields, errorCallback)))

      item.files.map((file: any) => {
        this.files.push(file)
        items.push(['File', file.filename].concat(this._map(file.info, fields, errorCallback)))
      })
    }

    return items
  }

  private async _downloadFiles(
    files: any,
    location: string,
    progressCallback: (progress: IExportProgress) => void
  ): Promise<any> {

    let totalTransfered = 0
    const totalSize = files.reduce((acc: number, cur: any) => acc + Number(cur.size), 0)

    for (let file of files) {
      await this.cdm.download(file, dirname(location), (bytes) => {
        totalTransfered += bytes
        const transfered = filesize(totalTransfered, { output: "object" }) as any

        progressCallback({
          value: (totalTransfered / totalSize),
          description: `Downloaded ${transfered.value.toFixed(1)} ${transfered.symbol}
            of ${filesize(totalSize, { round: 1 })}`,
          subdescription: `Downloading ${file.filename}`
        })
      })
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

  private _missingFields(
    fields: ReadonlyArray<IField>,
    crosswalk: any
  ): ReadonlyArray<string> | null {
    if (!crosswalk) {
      return ["No fields mapped"]
    }

    const required = fields.filter(field => field.required)
    const missing = required.filter(field => {
      return crosswalk[field.id].filter((nick: string) => nick !== '').length === 0
    })

    const err = missing.map((field) => {
      return `Missing required field '${field.name}'`
    })

    return err.length > 0 ? err : null
  }

  private processErrors(errors: ReadonlyArray<IExportError>, location: string) {
    const date = this.toLocalDateString()
    const alias = this.exportAlias.replace('/', '')
    const errorLocation = dirname(location) + `/errors_${alias}_${date}.txt`
    let errorString = ""
    errors.map((error) => {
      errorString += error.description + "\n"
    })
    writeFile(errorLocation, errorString, (err) => {
      if (err) {
        console.error(err)
      }
    })
  }

  private toLocalDateString(): string {
    const date = new Date();
    return String(date.getFullYear()) +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) + '_' +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2)
  }
}