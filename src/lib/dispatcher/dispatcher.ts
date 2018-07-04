import { AppStore } from '../stores'
import { Popup, Foldout } from '../app-state'

export class Dispatcher {
  private readonly appStore: AppStore

  public constructor(appStore: AppStore) {
    this.appStore = appStore
  }

  public loadInitialState(): Promise<void> {
    return this.appStore.loadInitialState()
  }

  public showPopup(popup: Popup): Promise<void> {
    return this.appStore._showPopup(popup)
  }

  public closePopup(): Promise<void> {
    return this.appStore._closePopup()
  }

  public showFoldout(foldout: Foldout): Promise<void> {
    return this.appStore._showFoldout(foldout)
  }

  public closeFoldout(): Promise<void> {
    return this.appStore._closeFoldout()
  }

  public setPreferencesContentDm(hostname: string, port: string, ssl: boolean): Promise<void> {
    return this.appStore._setPreferencesContentDm(hostname, port, ssl)
  }

  public setPreferencesFields(fields: Array<string>): Promise<void> {
    return this.appStore._setPreferencesFields(fields)
  }

  public setCollectionFieldInfo(alias: string): Promise<void> {
    return this.appStore._setCollectionFieldInfo(alias)
  }

  public setAlias(alias: string): Promise<void> {
    return this.appStore._setAlias(alias)
  }

  public setCrosswalk(alias: string, field: string, value: string): Promise<void> {
    return this.appStore._setCrosswalk(alias, field, value)
  }

  public export(download?: boolean): Promise<void> {
    return this.appStore._completeSaveInDesktop()
      .then(location => this.appStore._export(location, download))
      .catch((reason) => console.warn(reason))
  }
}