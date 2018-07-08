import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"
import { IExportProgress } from '../../lib/app-state'


interface IExportViewProps {
  readonly progress: IExportProgress
}

export class ExportView extends React.Component<IExportViewProps, {}>{

  public render() {
    return (
      <div className="export-container">
        <div className="title-container">
          <FontAwesomeIcon
            className="icon"
            icon={Icons.faCompass}
            size="5x"
          />
          <div className="title">Exporting Collection</div>
        </div>
        <progress value={this.props.progress.value} />
        <div className="details">{this.props.progress.description}</div>
      </div>
    )
  }

}