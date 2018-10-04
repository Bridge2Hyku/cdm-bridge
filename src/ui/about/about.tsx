import * as React from 'react'

import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { Button, ButtonGroup, LinkButton } from '../button'
import { Row } from '../layout'
import { staticPath, encodePathAsUrl } from '../../lib/path'

const LogoImage = encodePathAsUrl(
  staticPath(),
  'icon-logo.png'
)

interface IAboutProps {
  readonly appName: string
  readonly appVersion: string
  readonly onDismissed: () => void
}

const b2hWebsiteUri = 'https://bridge2hyku.github.io/'

export class About extends React.Component<IAboutProps, {}> {


  public render() {
    return (
      <Dialog
        id="about"
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <Row className="logo">
            <img src={LogoImage} />
          </Row>
          <h2>{this.props.appName}</h2>
          <p>Version {this.props.appVersion}</p>
          <p>
            Application built for the <LinkButton
              uri={b2hWebsiteUri}
            >
              Bridge2Hyku
            </LinkButton> project
          </p>
          <p>This software was made possible in part by the<br />
            Institute of Museum and Library Services<br />
            (LG-70-17-0217-17)
          </p>
        </DialogContent>

        <DialogFooter>
          <ButtonGroup>
            <Button
              onClick={this.props.onDismissed}
            >
              Close
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </Dialog>
    )
  }
}