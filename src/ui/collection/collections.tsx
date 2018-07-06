import * as React from 'react'
import * as classNames from 'classnames'

import { CdmCollection } from '../../lib/contentdm'

interface ICollectionsProps {
  readonly collections: ReadonlyArray<CdmCollection>
  readonly onCollectionClicked: (alias: string) => void
  readonly selectedAlias: string | null
}

export class Collections extends React.Component<ICollectionsProps, {}> {

  public render() {

    return (
      <div className="collection-list-contents">
        <div className="header">
          Collections
        </div>
        <div className="collection-list-container">
          <ul
            className="collection-list"
          >
            {this.renderItems()}
          </ul>
        </div>
      </div>
    )
  }

  private renderItems() {
    if (!this.props.collections) {
      return null
    }

    return this.props.collections.map((child, index) => {
      const selected = child.alias === this.props.selectedAlias
      return (
        <CollectionItem
          index={index}
          alias={child.alias}
          selected={selected}
          key={index}
          onClick={this.onCollectionClicked}
        >
          {child.name}
        </CollectionItem>

      )
    })
  }

  private onCollectionClicked = (alias: string) => {
    this.props.onCollectionClicked(alias)
  }

}

interface ICollectionItemProps {
  readonly index: number
  readonly selected: boolean
  readonly alias: string
  readonly onClick?: (alias: string) => void
}

class CollectionItem extends React.Component<ICollectionItemProps, {}> {
  private onClick = (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.onClick) {
      this.props.onClick(this.props.alias)
    }
  }

  public render() {
    const selected = this.props.selected
    const className = classNames('collection-item', { selected })
    return (
      <li
        className={className}
        onClick={this.onClick}
      >
        {this.props.children}
      </li>
    )
  }


}