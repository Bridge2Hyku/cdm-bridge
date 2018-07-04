import * as React from 'react'
import { staticPath, encodePathAsUrl } from '../../lib/path'

const BlankMapImage = encodePathAsUrl(
  staticPath(),
  'blank-map.svg'
)

export class BlankMap extends React.Component<{}, {}> {

  public render() {
    return (
      <div id="blank-map">
        <img src={BlankMapImage} className="blankmap-image" />
        <div className="blank-map-text">
          Select a collection to start mapping your metadata
        </div>
      </div>
    )
  }
}