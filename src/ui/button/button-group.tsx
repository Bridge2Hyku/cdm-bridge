import * as React from 'react'
import { IButtonProps } from './button'

interface IButtonGroupProps {
  readonly destructive?: boolean
}

export class ButtonGroup extends React.Component<IButtonGroupProps, {}> {
  public render() {
    const buttons = new Array<React.ReactElement<IButtonProps>>()
    React.Children.forEach(this.props.children, c => {
      if (typeof c !== 'string' && typeof c !== 'number') {
        buttons.push(c as React.ReactElement<IButtonProps>)
      }
    })

    if (buttons[0].props.type === 'submit') {
      buttons.reverse()
    }

    return (
      <div className="button-group">{buttons}</div>
    )

  }
}