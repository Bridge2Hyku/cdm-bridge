import * as React from 'react'

import { Dispatcher } from '../../lib/dispatcher'
import { PreferencesTab } from '../../lib/preferences'
import { Dialog, DialogFooter } from '../dialog'
import { TabBar } from '../tab-bar'
import { ContentDm } from './contentdm'
import { Button, ButtonGroup } from '../button'
import { Fields } from './fields'

interface IPreferencesProps {
  readonly dispatcher: Dispatcher
  readonly preferences: any
  readonly defaultFields: Array<string>
  readonly onDismissed: () => void
}

interface IPreferencesState {
  readonly selectedIndex: PreferencesTab
  readonly contentDmHostname: string
  readonly contentDmPort: string
  readonly contentDmSsl: boolean
  readonly exportFields: Array<string>
  readonly defaultFields: Array<string>
}

export class Preferences extends React.Component<
  IPreferencesProps, 
  IPreferencesState
> {
  public constructor(props: IPreferencesProps) {
    super(props)

    this.state = {
      selectedIndex: PreferencesTab.ContentDM,
      contentDmHostname: this.props.preferences.cdm.hostname,
      contentDmPort: this.props.preferences.cdm.port.toString(),
      contentDmSsl: this.props.preferences.cdm.ssl,
      exportFields: Array.from(this.props.preferences.fields),
      defaultFields: Array.from(this.props.defaultFields)
    }
  }

  private onSave = async() => {
    this.props.dispatcher.setPreferencesContentDm(
      this.state.contentDmHostname,
      this.state.contentDmPort,
      this.state.contentDmSsl
    )
    this.props.dispatcher.setPreferencesFields(
      this.state.exportFields
    )

    this.props.onDismissed()
  }

  private onHostnameChanged = (hostname: string) => {
    this.setState({ contentDmHostname: hostname })
  }

  private onPortChanged = (port: string) => {
    this.setState({ contentDmPort: port })
  }

  private onSslChanged = (ssl: boolean) => {
    this.setState({ contentDmSsl: ssl})
  }

  private onFieldValueChanged = (index: number, value: string) => {
    const state = this.state
    state.exportFields[index] = value
    this.setState({ exportFields: state.exportFields })
  }

  private onFieldInsert = (index: number) => {
    const state = this.state
    state.exportFields.splice(index + 1, 0, '')
    this.setState({ 
      exportFields: state.exportFields 
    })
  }

  private onFieldRemove = (index: number) => {
    const state = this.state
    state.exportFields.splice(index, 1) 
    this.setState({ 
      exportFields: state.exportFields
    })
  }

  private onReset = () => {
    this.setState({ exportFields: this.state.defaultFields })
  }

  public render() {
    return (
      <Dialog
        id="preferences"
        title="Preferences"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSave}
      >
        <TabBar
          onTabClicked={this.onTabClicked}
          selectedIndex={this.state.selectedIndex}
        >
          <span>CONTENTdm</span>
          <span>Export Fields</span>
        </TabBar>
        {this.renderActiveTab()}
        <DialogFooter>
          {this.renderActiveButtons()}
        </DialogFooter>
      </Dialog>
    )
  }

  private renderActiveButtons() {
    const index = this.state.selectedIndex
    switch(index) {
      case PreferencesTab.ContentDM:
        return (
          <ButtonGroup>
            <Button type="submit">Save</Button>
            <Button onClick={this.props.onDismissed}>Cancel</Button>
          </ButtonGroup>
        )
      case PreferencesTab.Fields:
        return (
          <ButtonGroup>
            <Button
              className="reset"
              onClick={this.onReset}
            >
              Reset Fields
            </Button>
            <Button onClick={this.props.onDismissed}>Cancel</Button>
            <Button type="submit">Save</Button>
          </ButtonGroup>
        )
    }
  }

  private renderActiveTab() {
    const index = this.state.selectedIndex
    switch(index) {
      case PreferencesTab.ContentDM:
        return (
          <ContentDm
            hostname={this.state.contentDmHostname}
            port={this.state.contentDmPort}
            ssl={this.state.contentDmSsl}

            onHostnameChanged={this.onHostnameChanged}
            onPortChanged={this.onPortChanged}
            onSslChanged={this.onSslChanged}
          />
        )
      case PreferencesTab.Fields:
        return (
          <Fields
            fields={this.state.exportFields}
            onFieldValueChanged={this.onFieldValueChanged}
            onFieldInsert={this.onFieldInsert}
            onFieldRemove={this.onFieldRemove}
          />
        )
    }
  }
  
  private onTabClicked = (index: number) => {
    this.setState({ selectedIndex: index })
  }
}