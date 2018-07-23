import * as React from 'react'
import { createUniqueId } from '../../lib/id-pool'

export enum CheckboxValue {
  On,
  Off,
  Mixed
}

interface ICheckboxProps {
  readonly disabled?: boolean
  readonly value: CheckboxValue
  readonly onChange?: (event: React.FormEvent<HTMLInputElement>) => void
  readonly tabIndex?: number
  readonly label?: string | JSX.Element
}

interface ICheckboxState {
  readonly inputId?: string
}

export class Checkbox extends React.Component<ICheckboxProps, ICheckboxState> {
  private input: HTMLInputElement | null = null

  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(event)
    }
  }

  public componentWillMount() {
    const friendlyName = this.props.label || 'unknown'
    const inputId = createUniqueId(`Checkbox_${friendlyName}`)

    this.setState({ inputId })
  }

  public componentWillReceiveProps(nextProps: ICheckboxProps) {
    this.updateInputState(nextProps.value)
  }

  private onInputRef = (input: HTMLInputElement | null) => {
    this.input = input
    this.updateInputState(this.props.value)
  }

  private updateInputState(value: CheckboxValue) {
    const input = this.input
    if (input) {
      input.indeterminate = value === CheckboxValue.Mixed
      input.checked = value !== CheckboxValue.Off
    }
  }

  private renderLabel() {
    const label = this.props.label
    const inputId = this.state.inputId

    return label ? <label htmlFor={inputId}>{label}</label> : null
  }

  public render() {
    return (
      <div className="checkbox-component">
        <input
          id={this.state.inputId}
          tabIndex={this.props.tabIndex}
          type="checkbox"
          onChange={this.onChange}
          ref={this.onInputRef}
          disabled={this.props.disabled}
        />
        {this.renderLabel()}
      </div>
    )
  }

}