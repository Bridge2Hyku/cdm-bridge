import * as React from 'react'

import { DialogContent } from '../dialog'
import { Row } from '../layout'
import { TextBox, Checkbox, CheckboxValue } from '../form'

interface IContentDmProps {
  readonly hostname: string
  readonly port: string
  readonly ssl: boolean

  readonly onHostnameChanged: (hostname: string) => void
  readonly onPortChanged: (port: string) => void
  readonly onSslChanged: (ssl: boolean) => void
}

export class ContentDm extends React.Component<IContentDmProps, {}> {

  private onSslChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.checked

    if (this.props.onSslChanged) {
      this.props.onSslChanged(value)
    }
  }

  public render() {
    return (
      <DialogContent>
        <Row>
          <TextBox
            label="Hostname"
            value={this.props.hostname}
            onValueChanged={this.props.onHostnameChanged}
            autoFocus={true}
          />
        </Row>
        <Row>
          <TextBox
            label="Port"
            value={this.props.port}
            onValueChanged={this.props.onPortChanged}
          />
        </Row>
        <Row>
          <Checkbox
            label="Uses SSL"
            value={this.props.ssl ? CheckboxValue.On : CheckboxValue.Off}
            onChange={this.onSslChanged}
          />
        </Row>
      </DialogContent>
    )
  }
}