import * as React from 'react'
import * as classNames from 'classnames'

import { DialogHeader } from './header'

interface IDialogProps {
  readonly title?: string
  readonly titleId?: string
  readonly onSubmit?: () => void
  readonly onDismissed: () => void
  readonly id?: string
  readonly type?: 'normal' | 'warning' | 'error'
  readonly className?: string
  readonly dismissable?: boolean
}

interface IDialogState {

}

export class Dialog extends React.Component<IDialogProps, IDialogState> {
  private dialogElement: HTMLElement | null = null

  public componentDidMount() {
    ; (this.dialogElement as any).showModal()
  }

  private onDialogClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target !== this.dialogElement) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()

    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width

    if (!isInDialog) {
      e.preventDefault()
      this.onDismiss()
    }
  }

  private onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (this.props.onSubmit) {
      this.props.onSubmit()
    }
    else {
      this.onDismiss()
    }
  }

  private onDismiss = () => {
    if (this.props.onDismissed) {
      this.props.onDismissed()
    }
  }

  private onDialogRef = (e: HTMLElement | null) => {
    this.dialogElement = e
  }

  private isDismissable() {
    return this.props.dismissable === undefined || this.props.dismissable
  }

  public renderHeader() {
    if (!this.props.title) {
      return null
    }

    return (
      <DialogHeader
        title={this.props.title}
        titleId={this.props.titleId}
        dismissable={this.isDismissable()}
        onDismissed={this.onDismiss}
      />
    )
  }

  public render() {
    const className = classNames(
      {
        error: this.props.type === 'error',
        warning: this.props.type === 'warning'
      },
      this.props.className
    )

    return (
      <dialog
        ref={this.onDialogRef}
        id={this.props.id}
        onClick={this.onDialogClick}
        className={className}
      >
        {this.renderHeader()}
        <form onSubmit={this.onSubmit}>
          <fieldset>
            {this.props.children}
          </fieldset>
        </form>
      </dialog>
    )
  }

}