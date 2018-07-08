import * as React from 'react';
import * as classNames from 'classnames';

interface IUiViewProps extends React.HTMLProps<HTMLDivElement> { }

export class UiView extends React.Component<IUiViewProps, {}> {
  public render() {
    const className = classNames(this.props.className, 'ui-view')
    const props = { ...this.props, className }

    return (
      <div {...props}>
        {this.props.children}
      </div>
    )
  }
}