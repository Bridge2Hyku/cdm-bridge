import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"
import { IExportProgress, IExportError } from '../../lib/app-state'
import { Button } from '../button'
import { Dispatcher } from '../../lib/dispatcher'
import { Row } from '../layout'


interface IExportViewProps {
  readonly dispatcher: Dispatcher
  readonly progress: IExportProgress
  readonly error: ReadonlyArray<IExportError>
  readonly done: boolean
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

  public renderDone() {
    if (this.props.done) {
      return (
        <Row className="done-button">
          <Button
            onClick={this.onDone}
            type="submit"
          >
            Done
          </Button>
        </Row>
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
        <div className="subdetails">{this.props.progress.subdescription}</div>
        {this.renderError()}
        {this.renderDone()}
      </div>
    )
  }

  private onDone = () => {
    this.props.dispatcher.closeExport()
  }

}