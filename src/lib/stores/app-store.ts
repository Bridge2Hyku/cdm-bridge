import {
  IAppState,
  Popup,
  PopupType,
  Foldout,
  ViewType,
  IExportProgress,
  IPreferences,
  IField,
  ICrosswalk,
  ICrosswalkFieldHash,
  IExportError,
  ICrosswalkField
} from '../app-state'
import { TypedBaseStore } from './base-store'
import {
  ContentDm,
  CdmType,
  CdmServer,
  CdmCollection,
  CdmFieldInfo
} from '../contentdm'
import { Exporter } from '../export'
import { remote } from 'electron'


const defaultSidebarWidth: number = 200

const defaultFields: ReadonlyArray<IField> = [
  { id: 'title', name: 'Title', required: true },
  { id: 'creator', name: 'Creator', required: true },
  { id: 'keyword', name: 'Keyword', required: true },
  { id: 'rights_statement', name: 'Rights statement', required: true },
  { id: 'contributor', name: 'Contributor', required: false },
  { id: 'abstract_or_summary', name: 'Abstract or Summary', required: false },
  { id: 'license', name: 'License', required: false },
  { id: 'publisher', name: 'Publisher', required: false },
  { id: 'date_created', name: 'Date created', required: false },
  { id: 'subject', name: 'Subject', required: false },
  { id: 'language', name: 'Language', required: false },
  { id: 'identifier', name: 'Identifier', required: false },
  { id: 'location', name: 'Location', required: false },
  { id: 'related_url', name: 'Related URL', required: false },
  { id: 'source', name: 'Source', required: false },
  { id: 'resource_type', name: 'Resource type', required: false },
  { id: 'extent', name: 'Extent', required: false }
]

const defaultPreferences: IPreferences = {
  cdm: {
    hostname: '',
    port: null,
    ssl: false
  },
  fields: defaultFields
}

export class AppStore extends TypedBaseStore<IAppState> {

  private emitQueued = false

  private preferences: IPreferences = defaultPreferences
  private currentPopup: Popup | null = null
  private currentFoldout: Foldout | null = null
  private collections: Array<CdmCollection> | null = null
  private collectionFieldInfo: Array<CdmFieldInfo> | null = null
  private contentdmServer: CdmServer | null = null
  private crosswalk: ICrosswalk = {}
  private selectedAlias: string = ''
  private selectedView: ViewType | null = null
  private exportProgress: IExportProgress = { value: undefined }
  private exportError: ReadonlyArray<IExportError> = new Array<IExportError>()
  private exportDone: boolean = false
  private errors: ReadonlyArray<Error> = new Array<Error>()
  private sidebarWidth: number = defaultSidebarWidth
  private defaultFields: ReadonlyArray<IField> = defaultFields

  protected emitUpdate() {
    if (this.emitQueued) {
      return
    }
    this.emitQueued = true
    this.emitUpdateNow()
  }

  private emitUpdateNow() {
    this.emitQueued = false
    const state = this.getState()
    super.emitUpdate(state)
  }

  public async loadInitialState() {
    this.selectedView = ViewType.Collection

    this.preferences = JSON.parse(
      String(localStorage.getItem('preferences'))
    ) as IPreferences

    this.collections = []

    this.crosswalk = this._convertCrosswalk(JSON.parse(
      String(localStorage.getItem('crosswalk'))
    ) as ICrosswalk)

    if (!this.preferences) {
      this.preferences = defaultPreferences
      this._showPopup({ type: PopupType.Preferences })
    }
    else {
      this._setContentDmServer()
      this._setCollections()
    }

    this.sidebarWidth = parseInt(localStorage.getItem('sidebarWidth') || '', 10) ||
      defaultSidebarWidth

    this.emitUpdateNow()
  }

  public getState(): IAppState {
    return {
      preferences: this.preferences,
      currentPopup: this.currentPopup,
      currentFoldout: this.currentFoldout,
      collections: this.collections,
      collectionFieldInfo: this.collectionFieldInfo,
      crosswalk: this.crosswalk,
      selectedAlias: this.selectedAlias,
      selectedView: this.selectedView,
      exportProgress: this.exportProgress,
      exportError: this.exportError,
      exportDone: this.exportDone,
      errors: this.errors,
      sidebarWidth: this.sidebarWidth,
      defaultFields: this.defaultFields
    }
  }

  public async _showPopup(popup: Popup): Promise<void> {
    this._closePopup()

    this.currentPopup = popup
    this.emitUpdate()
  }

  public _closePopup(): Promise<any> {
    this.currentPopup = null
    this.emitUpdate()

    return Promise.resolve()
  }

  public async _showFoldout(foldout: Foldout): Promise<void> {
    this.currentFoldout = foldout
    this.emitUpdate()
  }

  public async _closeFoldout(): Promise<void> {
    if (this.currentFoldout == null) {
      return
    }
    this.currentFoldout = null
    this.emitUpdate()
  }

  public _setSidebarWidth(width: number): Promise<void> {
    this.sidebarWidth = width
    localStorage.setItem('sidebarWidth', width.toString())
    this.emitUpdate()

    return Promise.resolve()
  }

  public _resetSidebarWidth(): Promise<void> {
    this.sidebarWidth = defaultSidebarWidth
    localStorage.removeItem('sidebarWidth')
    this.emitUpdate()

    return Promise.resolve()
  }

  public async _setAlias(alias: string): Promise<void> {
    this.selectedAlias = alias
    this.emitUpdate()
  }

  public _setCrosswalk(
    alias: string,
    field: IField,
    value: ReadonlyArray<string>
  ): Promise<void> {
    if (!this.crosswalk) {
      this.crosswalk = {}
    }

    if (!this.crosswalk[alias]) {
      this.crosswalk[alias] = this._crosswalkDefault()
    }
    if (!this.crosswalk[alias][field.id]) {
      this.crosswalk[alias][field.id] = this._crosswalkDefaultField()
    }
    this.crosswalk[alias][field.id].nicks = value

    localStorage.setItem('crosswalk', JSON.stringify(this.crosswalk))
    this.emitUpdate()

    return Promise.resolve()
  }

  public async _removeCrosswalkField(alias: string, field: IField): Promise<void> {
    if (!this.crosswalk || !this.crosswalk[alias]) {
      return
    }

    delete this.crosswalk[alias][field.id]
    localStorage.setItem('crosswalk', JSON.stringify(this.crosswalk))
    this.emitUpdate()

    return Promise.resolve()
  }

  public async _setCrosswalkItemExport(
    alias: string,
    field: IField,
    value: boolean
  ): Promise<void> {
    if (!this.crosswalk) {
      this.crosswalk = {}
    }

    if (!this.crosswalk[alias]) {
      this.crosswalk[alias] = this._crosswalkDefault()
    }
    if (!this.crosswalk[alias][field.id]) {
      this.crosswalk[alias][field.id] = this._crosswalkDefaultField()
    }
    this.crosswalk[alias][field.id].itemExport = value

    localStorage.setItem('crosswalk', JSON.stringify(this.crosswalk))
    this.emitUpdate()

    return Promise.resolve()
  }

  public _setPreferencesContentDm(
    hostname: string,
    port: string,
    ssl: boolean
  ): Promise<any> {
    if (port === '') {
      port = ssl ? '443' : '80'
    }

    this.preferences.cdm.hostname = hostname
    this.preferences.cdm.port = Number(port)
    this.preferences.cdm.ssl = ssl
    localStorage.setItem('preferences', JSON.stringify(this.preferences))

    this.collectionFieldInfo = null
    this.selectedAlias = ''

    this._setContentDmServer()
    this._setCollections()

    return Promise.resolve()
  }

  public _setPreferencesFields(fields: ReadonlyArray<IField>): Promise<any> {
    const removedFields = this.preferences.fields.filter((field) => {
      return fields.findIndex(f => f.id === field.id) === -1
    })

    removedFields.map((field) => {
      for (let alias in this.crosswalk) {
        this._removeCrosswalkField(alias, field)
      }
    })

    this.preferences.fields = Array.from(fields)
    localStorage.setItem('preferences', JSON.stringify(this.preferences))

    return Promise.resolve()
  }

  private async _setContentDmServer(): Promise<void> {
    this.contentdmServer = {
      hostname: this.preferences.cdm.hostname,
      port: this.preferences.cdm.port,
      ssl: this.preferences.cdm.ssl
    }
  }

  public _setCollectionFieldInfo(alias: string): Promise<any> {
    this.selectedAlias = alias
    const cdm = new ContentDm(this.contentdmServer)

    return cdm.collectionFieldInfo(alias)
      .then(data => this.collectionFieldInfo = data)
      .catch(() => this.collectionFieldInfo = null)
      .then(() => this.emitUpdate())
  }

  private async _setCollections(): Promise<void> {
    const cdm = new ContentDm(this.contentdmServer)

    return cdm.collections(CdmType.Unpublished)
      .then((data) => {
        if (typeof data === 'string') {
          const regex = /<body[^>]*>((.|[\n\r])*)<\/body>/im
          const body = regex.exec(data)
          if (body) {
            data = body[1].trim()
          }
          throw new Error(data)
        }
        this.collections = data
      })
      .catch((error) => {
        this.collections = null
        this._pushError(
          new Error("Unable to get collection information. Please make sure you have the correct CONTENTdm API information in Preferences.")
        )
        return
      })
      .then(() => this.emitUpdate())
  }

  public _pushError(error: Error): Promise<void> {
    const newErrors = Array.from(this.errors)
    newErrors.push(error)
    this.errors = newErrors
    this.emitUpdate()

    return Promise.resolve()
  }

  public _clearError(error: Error): Promise<void> {
    this.errors = this.errors.filter(e => e !== error)
    this.emitUpdate()

    return Promise.resolve()
  }

  public async _export(location: string, download?: boolean): Promise<void> {
    const exporter = new Exporter(this.contentdmServer)
    this.selectedView = ViewType.Export
    this.exportError = []
    this.exportDone = false
    this.emitUpdate()

    const pwrid = remote.powerSaveBlocker.start('prevent-app-suspension');

    exporter.export(
      this.selectedAlias,
      location,
      download || false,
      this.preferences.fields,
      this.crosswalk[this.selectedAlias],
      (progress) => {
        this.exportProgress = progress
        this.emitUpdate()
      },
      (error) => {
        const exportErrors = Array.from(this.exportError)
        exportErrors.push(error)
        this.exportError = exportErrors
        this.emitUpdate()
      }
    )
      .then(() => {
        this.exportDone = true
        this.emitUpdate()
      })
      .catch((err) => {
        this._closeExport()
        this._pushError(err)
      })
      .then(() => {
        remote.powerSaveBlocker.stop(pwrid)
      })


    return Promise.resolve()
  }

  public async _exportBulkrax(location: string): Promise<void> {
    const exporter = new Exporter(this.contentdmServer)
    this.selectedView = ViewType.Export
    this.exportError = []
    this.exportDone = false
    this.emitUpdate()

    const pwrid = remote.powerSaveBlocker.start('prevent-app-suspension');

    exporter.bulkrax(
      this.selectedAlias,
      location,
      this.preferences.fields,
      this.crosswalk[this.selectedAlias],
      (progress) => {
        this.exportProgress = progress
        this.emitUpdate()
      },
      (error) => {
        const exportErrors = Array.from(this.exportError)
        exportErrors.push(error)
        this.exportError = exportErrors
        this.emitUpdate()
      }
    )
      .then(() => {
        this.exportDone = true
        this.emitUpdate()
      })
      .catch((err) => {
        this._closeExport()
        this._pushError(err)
      })
      .then(() => {
        remote.powerSaveBlocker.stop(pwrid)
      })

    return Promise.resolve()
  }

  public async _closeExport() {
    this.selectedView = ViewType.Collection
    this.emitUpdate()
  }

  public async _completeSaveInDesktop(folder?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.selectedAlias) {
        reject('No collection selected')
        return
      }

      const filters = folder ? [] : [
        {
          name: "CSV",
          extensions: ["csv"]
        }
      ]

      return remote.dialog.showSaveDialog({
        title: "Export Collection",
        buttonLabel: "Export",
        filters: filters
      })
        .then(result => {
          const url = result.filePath
          if (url) {
            resolve(url)
            return
          }
        })
        .catch(err => reject('No export location set'))
    })
  }

  private _convertCrosswalk(crosswalk: ICrosswalk): ICrosswalk {
    let newCrosswalk: ICrosswalk = {}
    for (let alias in crosswalk) {
      newCrosswalk[alias] = {}
      for (let f in crosswalk[alias]) {
        newCrosswalk[alias][f] = this._checkCrosswalkFields(crosswalk[alias][f])
      }
    }

    return newCrosswalk
  }

  private _checkCrosswalkFields(field: ICrosswalkField): ICrosswalkField {
    if (field.nicks === undefined) {
      return {
        nicks: [""],
        itemExport: false
      }
    }

    return field
  }

  private _crosswalkDefault(): ICrosswalkFieldHash {
    let cw: ICrosswalkFieldHash = {}
    this.preferences.fields.map((f: IField) => {
      return cw[f.id] = this._crosswalkDefaultField()
    })

    return cw
  }

  private _crosswalkDefaultField(): ICrosswalkField {
    return {
      nicks: [""],
      itemExport: false
    }
  }

}