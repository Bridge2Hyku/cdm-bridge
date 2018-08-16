import * as React from 'react'
import { createUniqueId, releaseUniqueId } from '../../lib/id-pool'
import * as classNames from 'classnames'
import { IField } from '../../lib/app-state';
import { Button } from '../button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"

interface IMapSelectProps {
  readonly field?: IField
  readonly label?: string
  readonly labelClassName?: string
  readonly values?: ReadonlyArray<string>
  readonly className?: string
  readonly defaultValue?: string
  readonly onChange?: (value: string, index: number) => void
  readonly onMapFieldAddition?: (field: IField | undefined) => void
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

  private onMapFieldAddition = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.props.onMapFieldAddition) {
      this.props.onMapFieldAddition(this.props.field)
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

  private renderButton() {
    return (
      <Button
        onClick={this.onMapFieldAddition}
      >
        <FontAwesomeIcon
          icon={Icons.faPlus}
          size="sm"
        />
      </Button>
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

  public render() {
    const className = classNames('select-component', this.props.className)
    return (
      <div className={className}>
        {this.renderLabel()}
        <div className="selects">
          {this.renderSelects()}
        </div>
        <div className="button">
          {this.renderButton()}
        </div>
      </div>
    )
  }
}
