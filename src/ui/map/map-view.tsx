import * as React from 'react';

import { BlankMap } from './blank-map'
import { Map } from './map'
import { Dispatcher } from '../../lib/dispatcher'
import { CdmFieldInfo } from '../../lib/contentdm'
import { IField } from '../../lib/app-state'

interface IMapProps {
  readonly dispatcher: Dispatcher
  readonly fields: ReadonlyArray<IField> | null
  readonly collectionFieldInfo: ReadonlyArray<CdmFieldInfo> | null
  readonly alias: string
  readonly crosswalk: any
}

export class MapView extends React.Component<IMapProps, {}> {

  private renderMap() {
    if (!this.props.collectionFieldInfo) {
      return this.renderMapEmpty()
    }

    return (
      <Map
        dispatcher={this.props.dispatcher}
        className="mapping-container"
        fields={this.props.fields}
        collectionFieldInfo={this.props.collectionFieldInfo}
        alias={this.props.alias}
        crosswalk={this.props.crosswalk}
      />
    )
  }

  private renderMapEmpty() {
    return (
      <BlankMap />
    )
  }

  public render() {
    return (
      <div className="mappings">
        {this.renderMap()}
      </div>
    )
  }
}