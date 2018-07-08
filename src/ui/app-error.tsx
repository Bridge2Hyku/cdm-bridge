import * as React from 'react'

import { Popup } from '../lib/app-state'
import {
  dialogTransitionEnterTimeout,
  dialogTransitionLeaveTimeout
} from './app'
import { CSSTransitionGroup } from 'react-transition-group'
import { Dialog, DialogContent, DialogFooter } from './dialog';
import { Button, ButtonGroup } from './button'

interface IAppErrorProps {
  readonly errors: ReadonlyArray<Error>

  readonly onClearError: (error: Error) => void
  readonly onShowPopup: (popupType: Popup) => void | undefined
}

interface IAppErrorState {
  readonly error: Error | null
  readonly disabled: boolean
}

export class AppError extends React.Component<IAppErrorProps, IAppErrorState> {

  public constructor(props: IAppErrorProps) {
    super(props)
    this.state = {
      error: props.errors[0] || null,
      disabled: false
    }
  }

  public componentWillReceiveProps(nextProps: IAppErrorProps) {
    const error = nextProps.errors[0] || null
    if (error !== this.state.error) {
      this.setState({ error, disabled: false })
    }
  }

  private onDismissed = () => {
    const currentError = this.state.error
    if (currentError) {
      this.setState({ error: null, disabled: true })
      window.setTimeout(() => {
        this.props.onClearError(currentError)
      }, dialogTransitionLeaveTimeout)
    }
  }

  private renderDialog() {
    const error = this.state.error

    if (!error) {
      return null
    }

    return (
      <Dialog
        id="app-error"
        type="error"
        key="error"
        title="Error"
        onDismissed={this.onDismissed}
        dismissable={false}
      >
        <DialogContent>{this.renderErrorMessage(error)}</DialogContent>
        <DialogFooter>
          <ButtonGroup>
            <Button type="submit" onClick={this.onCloseButtonClick}>
              Close
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }

  private onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    this.onDismissed()
  }

  private renderErrorMessage(error: Error) {
    return <p>{error.message}</p>
  }

  public render() {
    return (
      <CSSTransitionGroup
        transitionName="modal"
        component="div"
        transitionEnterTimeout={dialogTransitionEnterTimeout}
        transitionLeaveTimeout={dialogTransitionLeaveTimeout}
      >
        {this.renderDialog()}
      </CSSTransitionGroup>
    )
  }
}