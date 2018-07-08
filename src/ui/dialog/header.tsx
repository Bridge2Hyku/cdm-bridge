import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"

interface IDialogHeaderProps {
  readonly title: string
  readonly titleId?: string
  readonly dismissable: boolean
  readonly onDismissed?: () => void
}

export class DialogHeader extends React.Component<IDialogHeaderProps> {

  private renderCloseButton() {
    if (!this.props.dismissable) {
      return null
    }

    return (
      <a className="close" onClick={this.onCloseButtonClick}>
        <FontAwesomeIcon
          icon={Icons.faTimes}
          size="lg"
        />
      </a>
    )
  }

  private onCloseButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (this.props.onDismissed) {
      this.props.onDismissed()
    }
  }

  public render() {
    return (
      <header className="dialog-header">
        <h1 id={this.props.titleId}>{this.props.title}</h1>
        {this.renderCloseButton()}
      </header>
    )
  }
}