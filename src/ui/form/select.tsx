import * as React from 'react'
import { createUniqueId, releaseUniqueId } from '../../lib/id-pool'
import * as classNames from 'classnames'

interface ISelectProps {
  readonly label?: string
  readonly labelClassName?: string
  readonly value?: string
  readonly className?: string
  readonly defaultValue?: string
  readonly onChange?: (event: React.FormEvent<HTMLSelectElement>) => void
}

interface ISelectState {
  readonly inputId?: string
}

export class Select extends React.Component<ISelectProps, ISelectState> {
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

  public render() {
    const className = classNames('select-component', this.props.className)

    return (
      <div className={className}>
        {this.renderLabel()}
        <div>
          <select
            id={this.state.inputId}
            onChange={this.props.onChange}
            value={this.props.value}
            defaultValue={this.props.defaultValue}
          >
            {this.props.children}
          </select>
        </div>
      </div>
    )
  }
}
