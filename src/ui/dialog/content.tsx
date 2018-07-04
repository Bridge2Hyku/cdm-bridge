import * as React from 'react'
import * as classNames from 'classnames'

interface IDialogContentProps {
  readonly className?: string
  readonly onRef?: (element: HTMLElement | null) => void
}

export class DialogContent extends React.Component<IDialogContentProps, {}> {
  public render() {
    const className = classNames('dialog-content', this.props.className)
    return (
      <div className={className} ref={this.props.onRef}>
        {this.props.children}
      </div>
    )
  }

}