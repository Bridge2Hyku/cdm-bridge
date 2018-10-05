import { CdmServer } from './contentdm'

export enum PopupType {
  Preferences,
  About
}

export enum ViewType {
  Collection,
  Export
}

export enum FoldoutType {
  Export
}

export type Popup =
  | { type: PopupType.Preferences }
  | { type: PopupType.About }
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
  readonly exportError: ReadonlyArray<IExportError>
  readonly exportDone: boolean
  readonly errors: ReadonlyArray<Error>
  readonly sidebarWidth: number
  readonly defaultFields: ReadonlyArray<IField>
}

export interface IExportProgress {
  readonly value: number | undefined
  readonly description?: string
  readonly subdescription?: string
}

export interface IPreferences {
  cdm: CdmServer
  fields: ReadonlyArray<IField>
}

export interface IField {
  id: string
  name: string
  required: boolean
}

export interface IExportError {
  readonly description: string
}