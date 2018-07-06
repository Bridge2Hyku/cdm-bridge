import { CdmServer } from './contentdm'

export enum PopupType {
  Preferences
}

export enum ViewType {
  Collection,
  Export
}

export enum FoldoutType {
  Export
}

export type Field = {
  readonly name: string,
  readonly required: boolean
}

export type Popup = { type: PopupType.Preferences }
export type Foldout = { type: FoldoutType.Export }

export interface IAppState {
  readonly preferences: any
  readonly currentPopup: Popup | null
  readonly currentFoldout: Foldout | null
  readonly collections: any | null
  readonly collectionFieldInfo: any | null
  readonly crosswalk: any | null
  readonly selectedAlias: string
  readonly selectedView: ViewType | null
  readonly exportProgress: IExportProgress
  readonly errors: ReadonlyArray<Error>
  readonly sidebarWidth: number
}

export interface IExportProgress {
  readonly value: number | undefined
  readonly description?: string
}

export interface IPreferences {
  cdm: CdmServer
  fields: Array<string>
}