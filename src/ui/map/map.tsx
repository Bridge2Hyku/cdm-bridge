import * as React from 'react'

import { CdmFieldInfo } from '../../lib/contentdm'
import { MapSelect } from '../form'
import { Row } from '../layout'
import { Dispatcher } from '../../lib/dispatcher'
import { IField } from '../../lib/app-state'

interface IMapProps {
  readonly dispatcher: Dispatcher
  readonly className?: string
  readonly fields: ReadonlyArray<IField> | null
  readonly collectionFieldInfo: ReadonlyArray<CdmFieldInfo> | null
  readonly alias: string
  readonly crosswalk: any
}

interface IMapState {
  readonly disabledNicks: ReadonlyArray<string>
}

export class Map extends React.Component<IMapProps, IMapState> {

  public constructor(props: IMapProps) {
    super(props)

    this.state = {
      disabledNicks: []
    }
  }

  public componentWillMount() {
    this.loadDisabledNicks(this.props.alias)
  }

  public componentWillReceiveProps(nextProps: IMapProps) {
    this.loadDisabledNicks(nextProps.alias)
  }

  private loadDisabledNicks(alias: string) {
    const crosswalk = this.getCrosswalk(alias)
    const usedNicksArray = Object.keys(crosswalk)
      .map(id => crosswalk[id])
      .map(nicks => nicks.filter((nick: string) => nick !== ""))
      .filter(nick => nick !== "")

    const usedNicks = [].concat(...usedNicksArray)

    this.setState({ disabledNicks: usedNicks })
  }

  private onSelectedFieldChanged = (
    field: IField,
    nick: string,
    prev: string,
    nicks: ReadonlyArray<string>
  ) => {
    this.disableNick(nick, prev)
    this.props.dispatcher.setCrosswalk(this.props.alias, field, nicks)
  }

  private disableNick(nick: string, prev: string) {
    const fields = Array.from(this.state.disabledNicks)
    const index = fields.indexOf(prev)
    fields.splice(index, 1)
    fields.push(nick)

    this.setState({ disabledNicks: fields })
  }

  private getCrosswalk(alias: string) {
    const crosswalk = this.props.crosswalk || {}
    if (!this.props.fields) {
      return null
    }

    if (!crosswalk[alias]) {
      let cw: any = {}
      this.props.fields.map(f => {
        return cw[f.id] = [""]
      })
      return cw
    }

    return crosswalk[alias]
  }

  private onMapFieldAddition = (field: IField | undefined) => {
    if (!field) {
      return
    }

    const crosswalk = this.getCrosswalk(this.props.alias)
    const value = crosswalk[field.id].concat([""])
    this.props.dispatcher.setCrosswalk(this.props.alias, field, value)
  }

  private renderMapItem() {
    const fields = this.props.fields
    const crosswalk = this.getCrosswalk(this.props.alias)
    if (!fields) {
      return
    }

    const mapitems = fields.map((field, index) => {
      const value = crosswalk[field.id] || [""]

      return (
        <Row key={index}>
          <MapItem
            key={index}
            field={field}
            disabledNicks={this.state.disabledNicks}
            collectionFieldInfo={this.props.collectionFieldInfo}
            onSelectedFieldChanged={this.onSelectedFieldChanged}
            onMapFieldAddition={this.onMapFieldAddition}
            value={value}
          />
        </Row>
      )
    })

    return (
      <div className="mapping-fields">
        {mapitems}
      </div>
    )
  }

  private renderMapHeader() {
    return (
      <Row className="header">
        <div className="target">Export Field</div>
        <div className="source">CDM Field</div>
      </Row>
    )
  }

  public render() {
    return (
      <div className={this.props.className}>
        {this.renderMapHeader()}
        {this.renderMapItem()}
      </div>
    )
  }

}

interface IMapItemProps {
  readonly field: IField
  readonly collectionFieldInfo: ReadonlyArray<CdmFieldInfo> | null
  readonly value: ReadonlyArray<string>
  readonly disabledNicks?: ReadonlyArray<string>
  readonly onMapFieldAddition: (field: IField | undefined) => void
  readonly onSelectedFieldChanged: (
    field: IField,
    value: string,
    prev: string,
    nicks: ReadonlyArray<string>
  ) => void
}

interface IMapItemState {
  readonly value: ReadonlyArray<string>
  readonly field: IField
}

class MapItem extends React.Component<IMapItemProps, IMapItemState> {

  public constructor(props: IMapItemProps) {
    super(props)

    this.state = {
      field: this.props.field,
      value: this.props.value || [""]
    }
  }

  public async componentWillReceiveProps(nextProps: IMapItemProps) {
    this.setState({ value: nextProps.value })
  }

  private onSelectedChanged = (
    nick: string,
    index: number
  ) => {
    const prev = this.state.value[index] || ""
    let nicks = Array.from(this.state.value)
    nicks[index] = nick

    this.setState({ value: nicks })
    this.props.onSelectedFieldChanged(this.state.field, nick, prev, nicks)
  }

  public render() {
    const options = this.props.collectionFieldInfo
    if (!options) {
      return
    }

    const labelClass = this.props.field.required ?
      'required' : ''
    const disNicks = this.props.disabledNicks || []

    return (
      <MapSelect
        field={this.props.field}
        label={this.props.field.name}
        labelClassName={labelClass}
        values={this.state.value}
        onChange={this.onSelectedChanged}
        onMapFieldAddition={this.props.onMapFieldAddition}
      >
        <option key="o-none" value="">
          -- Select a field --
        </option>
        {options.map(f => (
          <option
            key={f.nick}
            value={f.nick}
            disabled={disNicks.indexOf(f.nick) !== -1}
          >
            {f.name}
          </option>
        ))}
      </MapSelect>
    )
  }

}