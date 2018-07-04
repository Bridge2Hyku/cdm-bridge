import * as React from 'react';

export interface IResizeableProps extends React.Props<Resizeable> {
  readonly width: number
  readonly id?: string
  readonly maximumWidth: number
  readonly minimumWidth: number

  readonly onResize?: (newWidth: number) => void
  readonly onReset?: () => void
}

export class Resizeable extends React.Component<IResizeableProps> {

  private startWidth: number | null = null
  private startX: number | null = null


  private getCurrentWidth() {
    return this.clampWidth(this.props.width)
  }

  private clampWidth(width: number) {
    return Math.max(
      this.props.minimumWidth,
      Math.min(this.props.maximumWidth!, width)
    )
  }

  public handleDragStart = (e: React.MouseEvent<any>) => {
    this.startX = e.clientX
    this.startWidth = this.getCurrentWidth() || null

    document.addEventListener('mousemove', this.handleDragMove)
    document.addEventListener('mouseup', this.handleDragStop)
  }

  private handleDragMove = (e: MouseEvent) => {
    if (this.startWidth == null || this.startX == null) {
      return
    }

    const deltaX = e.clientX - this.startX
    const newWidth = this.startWidth + deltaX
    const newWidthClamped = this.clampWidth(newWidth)

    if (this.props.onResize) {
      this.props.onResize(newWidthClamped)
    }

    e.preventDefault()
  }

  private handleDragStop = (e: MouseEvent) => {
    document.removeEventListener('mousemove', this.handleDragMove)
    document.removeEventListener('mouseup', this.handleDragStop)

    e.preventDefault()
  }

  private handleDoubleClick = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }
  }


  public render() {
    const style: React.CSSProperties = {
      width: this.getCurrentWidth(),
      maxWidth: this.props.maximumWidth,
      minWidth: this.props.minimumWidth
    }


    return (
      <div id={this.props.id} style={style}>
        {this.props.children}
        <div
          onMouseDown={this.handleDragStart}
          onDoubleClick={this.handleDoubleClick}
          className="resize-handle"
        />

      </div>
    )
  }

}