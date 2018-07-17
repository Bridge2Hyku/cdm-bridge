import * as React from 'react'
import { DialogContent } from '../dialog'
import { TextBox, Checkbox, CheckboxValue } from '../form'
import { Row } from '../layout'
import { Button } from '../button'
import { IField } from '../../lib/app-state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"

interface IFieldsProps {
  readonly fields: ReadonlyArray<IField>

  readonly onFieldValueChanged: (index: number, value: string) => void
  readonly onFieldRequiredChanged: (index: number, value: boolean) => void
  readonly onFieldInsert: (index: number) => void
  readonly onFieldRemove: (index: number) => void
}

export class Fields extends React.Component<IFieldsProps, {}> {

  private hideRemoveField(): boolean {
    return this.props.fields.length <= 1
  }

  private renderFieldItems() {
    return this.props.fields.map((field: IField, index: number) => {
      return (
        <FieldItem
          key={index}
          index={index}
          value={field}
          onFieldValueChanged={this.props.onFieldValueChanged}
          onFieldRequiredChanged={this.props.onFieldRequiredChanged}
          onFieldInsert={this.props.onFieldInsert}
          onFieldRemove={this.props.onFieldRemove}
          hideRemoveField={this.hideRemoveField()}
        />
      )
    })
  }

  private renderHeader() {
    return (
      <Row className="header">
        <div className="name">Name</div>
        <div className="req">Req.</div>
        <div className="action"></div>
      </Row>
    )
  }

  public render() {

    return (
      <DialogContent
        className="fields-container"
      >
        {this.renderHeader()}
        {this.renderFieldItems()}
      </DialogContent>
    )
  }
}

interface IFieldItemProps {
  readonly value: IField
  readonly index: number
  readonly hideRemoveField?: boolean
  readonly hideInsertField?: boolean

  readonly onFieldValueChanged: (index: number, value: string) => void
  readonly onFieldRequiredChanged: (index: number, value: boolean) => void
  readonly onFieldInsert: (index: number) => void
  readonly onFieldRemove: (index: number) => void
}

class FieldItem extends React.Component<IFieldItemProps, {}> {
  private onFieldValueChanged = (value: string) => {
    this.props.onFieldValueChanged(this.props.index, value)
  }

  private onFieldInsert = () => {
    this.props.onFieldInsert(this.props.index)
  }

  private onFieldRemove = () => {
    this.props.onFieldRemove(this.props.index)
  }

  private onFieldRequiredChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.checked
    this.props.onFieldRequiredChanged(this.props.index, value)
  }

  private renderRemoveButton() {
    if (this.props.hideRemoveField) {
      return null
    }
    return (
      <Button
        onClick={this.onFieldRemove}
      >
        <FontAwesomeIcon
          icon={Icons.faMinus}
          size="sm"
        />
      </Button>
    )
  }

  private renderInsertButton() {
    if (this.props.hideInsertField) {
      return null
    }
    return (
      <Button
        onClick={this.onFieldInsert}
      >
        <FontAwesomeIcon
          icon={Icons.faPlus}
          size="sm"
        />
      </Button>
    )
  }

  public render() {
    return (
      <Row>
        <TextBox
          value={this.props.value.name}
          onValueChanged={this.onFieldValueChanged}
        />
        <Checkbox
          key={this.props.value.id}
          value={this.props.value.required ? CheckboxValue.On : CheckboxValue.Off}
          onChange={this.onFieldRequiredChanged}
        />
        {this.renderRemoveButton()}
        {this.renderInsertButton()}
      </Row>
    )
  }

}