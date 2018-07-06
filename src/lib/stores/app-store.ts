import { 
  IAppState, 
  Popup, 
  PopupType,
  Foldout,
  ViewType,
  IExportProgress,
  IPreferences,
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


const defaultFields: Array<string> = [
  'Title',
  'Creator',
  'Keyword',
  'Rights statement',
  'Contributor',
  'Abstract / Summary',
  'License',
  'Publisher',
  'Date created',
  'Subject',
  'Language',
  'Identifier',
  'Location',
  'Related URL',
  'Source',
  'Resource type',
  'Extent'
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
  private crosswalk: any | null = null
  private selectedAlias: string = ''
  private selectedView: ViewType | null = null
  private exportProgress: IExportProgress = {value: undefined}

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

    this.crosswalk = JSON.parse(
      String(localStorage.getItem('crosswalk'))
    )

    if (!this.preferences) {
      this.preferences = defaultPreferences
      this._showPopup({ type: PopupType.Preferences })
    }
    else {
      this._setContentDmServer()
      this._setCollections()
    }

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
      exportProgress: this.exportProgress
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

  public async _setAlias(alias: string): Promise<void> {
    this.selectedAlias = alias
    this.emitUpdate()
  }

  public _setCrosswalk(
    alias: string, 
    field: string, 
    value: string
  ): Promise<void> {
    if (!this.crosswalk) {
      this.crosswalk = {}
    }

    if (!this.crosswalk[alias]) {
      let cw: any = {}
      this.preferences.fields.map((f: string) => {
        return cw[f] = ''
      })
      this.crosswalk[alias] = cw
    }
    this.crosswalk[alias][field] = value

    localStorage.setItem('crosswalk', JSON.stringify(this.crosswalk))
    this.emitUpdate()

    return Promise.resolve()
  }

  public _setPreferencesContentDm(
    hostname: string, 
    port: string,
    ssl: boolean
  ): Promise<any> {
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

  public _setPreferencesFields(fields: Array<string>): Promise<any> {
    this.preferences.fields = fields.slice()
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
      .then(data => this.collections = data)
      .catch(() => this.collections = null)
      .then(() => this.emitUpdate())
  }

  public async _export(location: string, download?: boolean): Promise<void> {
    const exporter = new Exporter(this.contentdmServer)
    this.selectedView = ViewType.Export
    this.emitUpdate()

    exporter.export(
      this.selectedAlias, 
      location, 
      download || false,
      this.preferences.fields,
      this.crosswalk[this.selectedAlias],
      (progress) => {
        this.exportProgress = progress
        this.emitUpdate()    
      }
    )
    .then(() => {
      this.selectedView = ViewType.Collection
      this.emitUpdate()
    })
    .catch(() => {
      this.selectedView = ViewType.Collection
      this.emitUpdate()
    })


    return Promise.resolve()
  }

  public async _completeSaveInDesktop(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.selectedAlias) {
        reject('No collection selected')
        return
      }

      const url = remote.dialog.showSaveDialog({
        title: "Export Collection",
        buttonLabel: "Export",
        filters: [
          {
            name: "CSV",
            extensions: ["csv"]
          }
        ]
      })
      if (url) {
        resolve(url)
        return
      }
      reject('No export location set')
    })
  }

}