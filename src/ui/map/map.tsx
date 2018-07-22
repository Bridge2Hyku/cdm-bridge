import * as React from 'react'

import { CdmFieldInfo } from '../../lib/contentdm'
import { Select } from '../form'
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
    const usedNicks = Object.keys(crosswalk)
      .map(id => crosswalk[id])
      .filter(nick => nick !== '')

    this.setState({ disabledNicks: usedNicks })
  }

  private onSelectedFieldChanged = (
    field: IField,
    nick: string,
    prev: string
  ) => {
    this.disableNick(nick, prev)
    this.props.dispatcher.setCrosswalk(this.props.alias, field, nick)
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
        return cw[f.id] = ''
      })
      return cw
    }

    return crosswalk[alias]
  }

  private renderMapItem() {
    const fields = this.props.fields
    const crosswalk = this.getCrosswalk(this.props.alias)
    if (!fields) {
      return
    }

    const mapitems = fields.map((field, index) => {
      const value = crosswalk[field.id] || ''

      return (
        <Row key={index}>
          <MapItem
            key={index}
            field={field}
            disabledNicks={this.state.disabledNicks}
            collectionFieldInfo={this.props.collectionFieldInfo}
            onSelectedFieldChanged={this.onSelectedFieldChanged}
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
  readonly value?: string
  readonly disabledNicks?: ReadonlyArray<string>
  readonly onSelectedFieldChanged: (
    field: IField,
    value: string,
    prev: string
  ) => void
}

interface IMapItemState {
  readonly value?: string
  readonly field: IField
}

class MapItem extends React.Component<IMapItemProps, IMapItemState> {

  public constructor(props: IMapItemProps) {
    super(props)

    this.state = {
      field: this.props.field,
      value: this.props.value || ""
    }
  }

  public async componentWillReceiveProps(nextProps: IMapItemProps) {
    this.setState({ value: nextProps.value })
  }

  private onSelectedChanged = (
    event: React.FormEvent<HTMLSelectElement>
  ) => {
    const prev = this.state.value || ''
    const value = event.currentTarget.value
    this.setState({ value: value })
    this.props.onSelectedFieldChanged(this.state.field, value, prev)
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
      <Select
        label={this.props.field.name}
        labelClassName={labelClass}
        value={this.state.value}
        onChange={this.onSelectedChanged}
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
      </Select>
    )
  }

}