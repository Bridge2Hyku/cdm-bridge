import * as React from 'react';

import { Dispatcher } from '../../lib/dispatcher'
import { Resizeable } from '../resizable';
import { CdmCollection } from '../../lib/contentdm'
import { Collections } from './collections'

interface ICollectionViewProps { 
  readonly dispatcher: Dispatcher
  collections: ReadonlyArray<CdmCollection>
  alias?: string
}

interface ICollectionViewState {
  sidebarWidth: number
  maxSidebarWidth: number
  minSidebarWidth: number
  selectedAlias: string
}

export class CollectionView extends React.Component<
  ICollectionViewProps,
  ICollectionViewState
> {

  private defaultSidebarWidth: number = 200

  public constructor(props: any) {
    super(props)

    this.state = {
      sidebarWidth: this.defaultSidebarWidth,
      maxSidebarWidth: 400,
      minSidebarWidth: 30,
      selectedAlias: this.props.alias || ''
    }
  }

  private handleSidebarResize = (width: number) => {
    this.setState({sidebarWidth: width});
  }

  private handleSidebarReset = () => {
    this.setState({sidebarWidth: this.defaultSidebarWidth})
  }

  private onCollectionClicked = (alias: string) => {
    this.setState({ selectedAlias: alias })
    this.props.dispatcher.setCollectionFieldInfo(alias)
  }

  public render() {

    return (
      <Resizeable
        id="collection-sidebar"
        width={this.state.sidebarWidth}
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