import * as React from 'react'
import * as classNames from 'classnames'

export interface IButtonProps {
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  readonly onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
  readonly disabled?: boolean
  readonly type?: 'submit'
  readonly className?: string
  readonly size?: 'normal' | 'small'
  readonly onButtonRef?: (instance: HTMLButtonElement | null) => void
  readonly tabIndex?: number
  readonly role?: string
  readonly ariaExpanded?: boolean
  readonly ariaHasPopup?: boolean
}

export class Button extends React.Component<IButtonProps, {}> {
  private innterButton: HTMLButtonElement | null = null

  private onButtonRef = (button: HTMLButtonElement | null) => {
    this.innterButton = button

    if (this.props.onButtonRef) {
      this.props.onButtonRef(button)
    }
  }

  public focus = () => {
    if (this.innterButton) {
      this.innterButton.focus()
    }
  }

  public blur() {
    if (this.innterButton) {
      this.innterButton.blur()
    }
  }

  public getBoundingClientReact = (): ClientRect | undefined => {
    return this.innterButton
      ? this.innterButton.getBoundingClientRect()
      : undefined
  }

  public render() {
    const className = classNames(
      'button-component',
      { 'small-button': this.props.size === 'small' },
      this.props.className
    )

    return (
      <button
        className={className}
        disabled={this.props.disabled}
        onClick={this.props.onClick}
        type={this.props.type || 'button'}
        ref={this.onButtonRef}
        tabIndex={this.props.tabIndex}
        onMouseEnter={this.props.onMouseEnter}
        role={this.props.role}
        aria-expanded={this.props.ariaExpanded}
        aria-haspopup={this.props.ariaHasPopup}
      >
        {this.props.children}
      </button>
    )
  }

}