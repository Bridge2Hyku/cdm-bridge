import * as React from 'react'
import { createUniqueId, releaseUniqueId } from './id-pool'

interface ISelectProps {
  readonly label?: string
  readonly value?: string
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

    return label ? <label htmlFor={inputId}>{label}</label> : null
  }

  public render() {
    return (
      <div className="select-component">
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
