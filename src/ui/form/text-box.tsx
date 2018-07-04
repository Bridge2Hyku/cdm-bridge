import * as React from 'react'
import * as classNames from 'classnames'

export interface ITextBoxProps {
  readonly label?: string | JSX.Element
  readonly className?: string
  readonly placeholder?: string
  readonly value?: string
  readonly autoFocus?: boolean
  readonly disabled?: boolean
  readonly onValueChanged?: (value: string) => void
  readonly onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  readonly type?: 'text' | 'search' | 'password'
  readonly labelLinkText?: string
  readonly labelLinkUri?: string
  readonly onLabelLinkClick?: () => void
  readonly tabIndex?: number
  readonly onFocus?: () => void
  readonly onBlur?: () => void
  readonly onSearchCleared?: () => void
}

interface ITextBoxState {
  readonly inputId?: string
  readonly value?: string
}

export class TextBox extends React.Component<ITextBoxProps, ITextBoxState> {
  private inputElement: HTMLInputElement | null = null

  public componentWillMount() {
    const friendlyName = this.props.label || this.props.placeholder
    const inputId = `TextBox_${friendlyName}`

    this.setState({ inputId, value: this.props.value })
  }

  public componentWillReceiveProps(nextProps: ITextBoxProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({ value: nextProps.value })
    }
  }

  private onInputRef = (element: HTMLInputElement | null) => {
    this.inputElement = element
  }

  public selectAll() {
    if (this.inputElement !== null) {
      this.inputElement.select()
    }
  }

  public focus() {
    if (this.inputElement !== null) {
      this.inputElement.focus()
    }
  }

  public blur() {
    if (this.inputElement !== null) {
      this.inputElement.blur()
    }
  }

  private renderLabel() {
    if (!this.props.label) {
      return null
    }
    return (
      <div className="label-container">
        <label htmlFor={this.state.inputId}>{this.props.label}</label>
      </div>
    )
  }

  private onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (this.props.onKeyDown !== undefined) {
      this.props.onKeyDown(event)
    }
  }

  public render() {
    const className = classNames('text-box-component', this.props.className)
    const inputId = this.props.label ? this.state.inputId : undefined

    return (
      <div className={className}>
        {this.renderLabel()}
        <input
          id={inputId}
          ref={this.onInputRef}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          autoFocus={this.props.autoFocus}
          disabled={this.props.disabled}
          type={this.props.type}
          placeholder={this.props.placeholder}
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          tabIndex={this.props.tabIndex}
        />
      </div>
    )
  }

  private onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!this.props.autoFocus && this.props.onFocus !== undefined) {
      this.props.onFocus()
    }
  }

  private onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (this.props.onBlur !== undefined) {
      this.props.onBlur()
    }
  }

  private onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value

    this.setState({ value }, () => {
      if (this.props.onValueChanged) {
        this.props.onValueChanged(value)
      }
    })
  }


}