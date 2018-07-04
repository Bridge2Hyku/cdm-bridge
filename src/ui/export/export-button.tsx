import * as React from 'react'
import * as classNames from 'classnames'
import { Button } from '../button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icons from "@fortawesome/free-solid-svg-icons"

interface IExportButtonProps {
  readonly disabled?: boolean
  readonly className?: string
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export class ExportButton extends React.Component<IExportButtonProps, {}> {
  public render() {
    const className = classNames('export-button', this.props.className)

    return (
      <div className={className}>
        <Button
          onClick={this.props.onClick}
          disabled={this.props.disabled}
        >
          <div className="text">
            Export Collection
          </div>
          <FontAwesomeIcon
            className="icon"
            icon={Icons.faCaretDown}
            size="lg"
          />
        </Button>
      </div>
    )
  }
}