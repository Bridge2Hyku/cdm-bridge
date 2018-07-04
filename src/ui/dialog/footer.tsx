import * as React from 'react'

export class DialogFooter extends React.Component<{}, {}> {
  public render() {
    return <div className="dialog-footer">{this.props.children}</div>
  }
}