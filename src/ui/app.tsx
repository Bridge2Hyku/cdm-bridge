import * as React from 'react';
import { ipcRenderer } from 'electron'
import { CSSTransitionGroup } from 'react-transition-group'

import { TitleBar } from './window';
import { CollectionView } from './collection'
import { MapView } from './map'
import { UiView } from './ui-view';
import { MenuEvent } from '../main/menu'
import { Dispatcher } from '../lib/dispatcher'
import { AppStore } from '../lib/stores'
import { 
  IAppState, 
  PopupType,
  FoldoutType,
  ViewType ,
  Popup
} from '../lib/app-state'
import { Preferences } from './preferences'
import { ExportView, DropdownState, ExportDropdown } from './export'
import { CdmCollection, CdmFieldInfo } from '../lib/contentdm'
import { AppError } from './app-error'

interface IAppProps {
  readonly appStore: AppStore
  readonly dispatcher: Dispatcher
}

export const dialogTransitionEnterTimeout = 250
export const dialogTransitionLeaveTimeout = 100

export class App extends React.Component<IAppProps, IAppState> {

  public constructor(props: IAppProps) {
    super(props)

    props.dispatcher.loadInitialState()

    this.state = props.appStore.getState()
    props.appStore.onDidUpdate(state => {
      this.setState(state)
    })

    ipcRenderer.on(
      'menu-event',
      (event: Electron.IpcMessageEvent, { name }: { name: MenuEvent }) => {
        this.onMenuEvent(name)
      }
    )
  }

  private onMenuEvent(name: MenuEvent): any {
    switch(name) {
      case 'show-preferences':
        return this.props.dispatcher.showPopup({ type: PopupType.Preferences })
    }
  }

  private getPreferences(): any | null {
    const state = this.props.appStore.getState()
    return state.preferences
  }

  private getCollections(): ReadonlyArray<CdmCollection> {
    const state = this.props.appStore.getState()
    return state.collections
  }

  private getFields(): Array<string> | null {
    const preferences = this.getPreferences()
    return preferences.fields
  }

  private getCollectionFieldInfo(): ReadonlyArray<CdmFieldInfo> | null {
    const state = this.props.appStore.getState()
    return state.collectionFieldInfo
  }

  private getCollectionAlias(): string {
    const state = this.props.appStore.getState()
    return state.selectedAlias
  }

  private getCollectionCrosswalk(): string {
    const state = this.props.appStore.getState()
    return state.crosswalk
  }

  private onPopupDismissed = () => this.props.dispatcher.closePopup()

  private popupContent(): JSX.Element | null {
    const popup = this.state.currentPopup

    if (!popup) {
      return null
    }

    switch(popup.type) {
      case PopupType.Preferences:
        return (
          <Preferences
            dispatcher={this.props.dispatcher}
            preferences={this.state.preferences}
            onDismissed={this.onPopupDismissed}
          />
        )
    }

    return null
  }

  private onExportDropdownChanged = (state: DropdownState) => {
    if (state === 'open') {
      this.props.dispatcher.showFoldout({ type: FoldoutType.Export })
    }
    else {
      this.props.dispatcher.closeFoldout()
    }
  }

  private onSelectExport = (download?: boolean) => {
    this.props.dispatcher.export(download)
    this.props.dispatcher.closeFoldout()
  }

  private renderPopup() {
    return (
      <CSSTransitionGroup
        transitionName="modal"
        component="div"
        transitionEnterTimeout={dialogTransitionEnterTimeout}
        transitionLeaveTimeout={dialogTransitionLeaveTimeout}
      >
        {this.popupContent()}
      </CSSTransitionGroup>
    )
  }

  private renderApp() {
    const state = this.state

    if (state.selectedView === ViewType.Export) {
      return (
        <UiView id="export-view">
          <ExportView progress={state.exportProgress} />
        </UiView>
      )
    }

    return (
      <UiView id="collections">
        <CollectionView 
          dispatcher={this.props.dispatcher}
          collections={this.getCollections()}
          alias={this.getCollectionAlias()}
        />
        <MapView 
          dispatcher={this.props.dispatcher}
          fields={this.getFields()}
          collectionFieldInfo={this.getCollectionFieldInfo()}
          alias={this.getCollectionAlias()}
          crosswalk={this.getCollectionCrosswalk()}
        />
      </UiView>
    )

  }

  private renderAppError() {
    return (
      <AppError
        errors={this.state.errors}
        onClearError={this.clearError}
        onShowPopup={this.showPopup}
      />
    )
  }

  private clearError = (error: Error) => this.props.dispatcher.clearError(error)

  private showPopup = (popup: Popup) => {
    this.props.dispatcher.showPopup(popup)
  }
  
  public render() {
    const disabled = this.state.selectedView === ViewType.Export
      || this.state.selectedAlias === ''
    const isOpen = 
      this.state.currentFoldout &&
      this.state.currentFoldout.type === FoldoutType.Export
    
    const currentState: DropdownState = isOpen ? 'open' : 'closed'

    return (
      <div id="app-container">
        <TitleBar>
          <ExportDropdown
            disabled={disabled}
            dropdownState={currentState}
            dropdownStateChanged={this.onExportDropdownChanged}
            onSelectExport={this.onSelectExport}
          />
        </TitleBar>
        {this.renderApp()}
        {this.renderPopup()}
        {this.renderAppError()}
      </div>
    )
  }
}
