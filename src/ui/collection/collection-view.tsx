import * as React from 'react';

import { Dispatcher } from '../../lib/dispatcher'
import { Resizeable } from '../resizable';
import { CdmCollection } from '../../lib/contentdm'
import { Collections } from './collections'

interface ICollectionViewProps {
  readonly sidebarWidth: number
  readonly dispatcher: Dispatcher
  collections: ReadonlyArray<CdmCollection>
  alias?: string
}

interface ICollectionViewState {
  maxSidebarWidth: number
  minSidebarWidth: number
  selectedAlias: string
}

export class CollectionView extends React.Component<
  ICollectionViewProps,
  ICollectionViewState
  > {

  public constructor(props: any) {
    super(props)

    this.state = {
      maxSidebarWidth: 400,
      minSidebarWidth: 30,
      selectedAlias: this.props.alias || ''
    }
  }

  private handleSidebarResize = (width: number) => {
    this.props.dispatcher.setSidebarWidth(width)
  }

  private handleSidebarReset = () => {
    this.props.dispatcher.resetSidebarWidth()
  }

  private onCollectionClicked = (alias: string) => {
    this.setState({ selectedAlias: alias })
    this.props.dispatcher.setCollectionFieldInfo(alias)
  }

  public render() {

    return (
      <Resizeable
        id="collection-sidebar"
        width={this.props.sidebarWidth}
        maximumWidth={this.state.maxSidebarWidth}
        minimumWidth={this.state.minSidebarWidth}
        onResize={this.handleSidebarResize}
        onReset={this.handleSidebarReset}
      >
        <Collections
          collections={this.props.collections}
          onCollectionClicked={this.onCollectionClicked}
          selectedAlias={this.props.alias || ''}
        />
      </Resizeable>
    )
  }
}