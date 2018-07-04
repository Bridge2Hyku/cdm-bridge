import * as React from 'react'
import { staticPath, encodePathAsUrl } from '../../lib/path'

const LogoImage = encodePathAsUrl(
  staticPath(),
  'logo.png'
)

interface ITitleBarProps {

}

export class TitleBar extends React.Component<ITitleBarProps, {}> {
  public render() {
    return (
      <div id="app-title-bar">
        <img src={LogoImage} />
        {this.props.children}
      </div>
    )
  }
}