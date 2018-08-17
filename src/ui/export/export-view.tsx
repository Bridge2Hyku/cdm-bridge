import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"
import { IExportProgress, IExportError } from '../../lib/app-state'


interface IExportViewProps {
  readonly progress: IExportProgress
  readonly error: ReadonlyArray<IExportError>
}

export class ExportView extends React.Component<IExportViewProps, {}>{

  public renderError() {
    if (this.props.error.length > 0) {
      return (
        <div className="error">
          Found {this.props.error.length} errors, see error log with exported CSV
        </div>
      )
    }
    return
  }

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
        {this.renderError()}
      </div>
    )
  }

}