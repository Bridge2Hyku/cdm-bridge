import * as React from 'react'
import * as classNames from 'classnames'

interface IRowProps {
  readonly className?: string
}

export class Row extends React.Component<IRowProps, {}> {
  public render() {
    const className = classNames('row-component', this.props.className)
    return <div className={className}>{this.props.children}</div>
  }
}