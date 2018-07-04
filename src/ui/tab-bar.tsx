import * as React from 'react'

import * as classNames from 'classnames'

interface ITabBarProps {
  readonly selectedIndex: number
  readonly onTabClicked: (index: number) => void
}

export class TabBar extends React.Component<ITabBarProps> {
  private readonly tabRefsByIndex = new Map<number, HTMLButtonElement>()

  public render() {
    return (
      <div
        className='tab-bar'
        role="tablist"
      >
        {this.renderItems()}
      </div>
    )
  }

  private onTabClicked = (index: number) => {
    this.props.onTabClicked(index)
  }

  private onTabRef = (index: number, ref: HTMLButtonElement | null) => {
    if (!ref) {
      this.tabRefsByIndex.delete(index)
    }
    else {
      this.tabRefsByIndex.set(index, ref)
    }
  }

  private renderItems() {
    const children = this.props.children as ReadonlyArray<JSX.Element> | null
    if (!children) {
      return null
    }

    return children.map((child, index) => {
      const selected = index === this.props.selectedIndex
      return (
        <TabBarItem
          selected={selected}
          index={index}
          onClick={this.onTabClicked}
          onButtonRef={this.onTabRef}
          key={index}
        >
          {child}
        </TabBarItem>
      )
    })
  }

}

interface ITabBarItemProps {
  readonly index: number
  readonly selected: boolean
  readonly onClick: (index: number) => void
  readonly onButtonRef: (
    index: number,
    button: HTMLButtonElement | null
  ) => void
}

class TabBarItem extends React.Component<ITabBarItemProps> {
  private onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onClick(this.props.index)
  }

  private onButtonRef = (buttonRef: HTMLButtonElement | null) => {
    this.props.onButtonRef(this.props.index, buttonRef)
  }

  public render() {
    const selected = this.props.selected
    const className = classNames('tab-bar-item', { selected })
    return (
      <button
        ref={this.onButtonRef}
        className={className}
        onClick={this.onClick}
        role="tab"
        aria-selected={selected}
        tabIndex={selected ? 0 : -1}
        type="button"
      >
        {this.props.children}
      </button>
    )
  }
}