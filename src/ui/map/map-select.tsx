import * as React from 'react'
import { createUniqueId, releaseUniqueId } from '../../lib/id-pool'
import * as classNames from 'classnames'
import { IField } from '../../lib/app-state'
import { Button } from '../button'
import { Checkbox, CheckboxValue } from '../form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"

interface IMapSelectProps {
  readonly field?: IField
  readonly label?: string
  readonly labelClassName?: string
  readonly values?: ReadonlyArray<string>
  readonly itemExport?: boolean
  readonly className?: string
  readonly defaultValue?: string
  readonly onChange?: (value: string, index: number) => void
  readonly onMapFieldAddition?: (field: IField | undefined) => void
  readonly onMapFieldSubtract?: (field: IField | undefined, index: number) => void
  readonly onMapItemExportChange?: (field: IField | undefined) => void
}

interface IMapSelectState {
  readonly inputId?: string
}

export class MapSelect extends React.Component<IMapSelectProps, IMapSelectState> {
  public componentWillMount() {
    const friendlyName = this.props.label || 'unknown'
    const inputId = createUniqueId(`Select_${friendlyName}`)

    this.setState({ inputId })
  }

  public componentWillUnmount() {
    if (this.state.inputId) {
      releaseUniqueId(this.state.inputId)
    }
  }

  private onChange = (event: React.FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value
    const index = Number(event.currentTarget.dataset.index)
    if (this.props.onChange) {
      this.props.onChange(value, index)
    }
  }

  private onMapFieldAddition = (field: IField | undefined) => {
    if (this.props.onMapFieldAddition) {
      this.props.onMapFieldAddition(field)
    }
  }

  private onMapFieldSubtract = (field: IField | undefined, index: number) => {
    if (this.props.onMapFieldSubtract) {
      this.props.onMapFieldSubtract(field, index)
    }
  }

  private renderLabel() {
    const label = this.props.label
    const inputId = this.state.inputId

    if (!label) {
      return null
    }

    return (
      <label
        className={this.props.labelClassName}
        htmlFor={inputId}
      >
        {label}
      </label>
    )
  }

  private renderButtons() {
    if (!this.props.values) {
      return
    }

    const buttons = this.props.values.map((value, index) => {
      return (
        <MapButton
          key={index}
          field={this.props.field}
          index={index}
          onMapFieldAddition={index === 0 ? this.onMapFieldAddition : undefined}
          onMapFieldSubtract={index !== 0 ? this.onMapFieldSubtract : undefined}
        >
          <FontAwesomeIcon
            icon={index === 0 ? Icons.faPlus : Icons.faMinus}
            size="sm"
          />
        </MapButton>
      )
    })

    return (
      <div className="buttons">
        {buttons}
      </div>
    )
  }

  public renderSelects() {
    if (!this.props.values) {
      return
    }

    return this.props.values.map((value, index) => {
      return (
        <select
          key={index}
          id={this.state.inputId}
          data-index={index}
          onChange={this.onChange}
          value={value}
          defaultValue={this.props.defaultValue}
          aria-label={this.state.inputId}
          className='map-select-component'
        >
          {this.props.children}
        </select>
      )
    })
  }

  public renderCheckbox() {
    return (
      <MapCheckbox
        field={this.props.field}
        value={this.props.itemExport}
        onChange={this.props.onMapItemExportChange}
      />
    )
  }

  public render() {
    const className = classNames('select-component', this.props.className)
    return (
      <div className={className}>
        {this.renderLabel()}
        {this.renderCheckbox()}
        <div className="selects">
          {this.renderSelects()}
        </div>
        {this.renderButtons()}
      </div>
    )
  }
}

interface IMapButtonProps {
  readonly field: IField | undefined
  readonly index: number
  readonly onMapFieldAddition?: (field: IField | undefined) => void
  readonly onMapFieldSubtract?: (field: IField | undefined, index: number) => void
}

export class MapButton extends React.Component<IMapButtonProps, {}> {

  public render() {
    return (
      <Button
        onClick={this.onClick}
      >
        {this.props.children}
      </Button>
    )
  }

  private onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.props.onMapFieldAddition) {
      this.props.onMapFieldAddition(this.props.field)
    }
    if (this.props.onMapFieldSubtract) {
      this.props.onMapFieldSubtract(this.props.field, this.props.index)
    }
  }
}

interface IMapCheckboxProps {
  readonly field: IField | undefined
  readonly value: boolean | undefined
  readonly onChange?: (field: IField | undefined) => void
}

export class MapCheckbox extends React.Component<IMapCheckboxProps, {}> {

  public render() {
    return (
      <Checkbox
        value={this.props.value ? CheckboxValue.On : CheckboxValue.Off}
        onChange={this.onChange}
      />
    )
  }

  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(this.props.field)
    }
  }
}

