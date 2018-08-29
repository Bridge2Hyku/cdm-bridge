import * as React from 'react'
import * as classNames from 'classnames'

import { shell } from '../../lib/app-shell'

interface ILinkButtonProps {
  readonly uri?: string
  readonly onClick?: () => void
  readonly className?: string
  readonly title?: string
}

export class LinkButton extends React.Component<ILinkButtonProps, {}> {
  public render() {
    const href = this.props.uri || ''
    const className = classNames('link-button-component', this.props.className)

    return (
      <a
        className={className}
        href={href}
        onClick={this.onClick}
        title={this.props.title}
      >
        {this.props.children}
      </a>
    )
  }

  private onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const uri = this.props.uri
    if (uri) {
      shell.openExternal(uri)
    }

    if (this.props.onClick) {
      this.props.onClick
    }
  }

}