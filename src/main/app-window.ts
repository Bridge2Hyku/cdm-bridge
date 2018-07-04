import { BrowserWindow } from 'electron'
import * as path from 'path'
import { staticPath } from '../lib/path'
import { format as formatUrl } from 'url'
import { MenuEvent } from './menu';

let windowStateKeeper: any | null = null
const __DEV__ = process.env.NODE_ENV === 'development'

export class AppWindow {
  private window: Electron.BrowserWindow
  
  private minWidth: number = 992
  private minHeight: number = 600

  public constructor() {
    if (!windowStateKeeper) {
      windowStateKeeper = require('electron-window-state')
    }

    const savedWindowState = windowStateKeeper({
      defaultWidth: this.minWidth,
      defaultHeight: this.minHeight
    })

    const windowOptions: Electron.BrowserWindowConstructorOptions = {
      x: savedWindowState.x,
      y: savedWindowState.y,
      width: savedWindowState.width,
      height: savedWindowState.height,
      minWidth: this.minWidth,
      minHeight: this.minHeight,
      show: false,
      backgroundColor: '#fff',
      webPreferences: {
        webSecurity: false
      }
    }

    /* TODO: lets deail with no window frames later
    if (__DARWIN__) {
      windowOptions.titleBarStyle = 'hidden'
    }
    else if (__WIN32__) {
      windowOptions.frame = false
    }
    else if (__LINUX__) {
      windowOptions.icon = path.join(staticPath(), 'icon-logo.png')
    }
    */

    if (__LINUX__) {
      windowOptions.icon = path.join(staticPath(), 'icon-logo.png')
    }

    this.window = new BrowserWindow(windowOptions)
    savedWindowState.manage(this.window)
  }

  public load() {
    if (__DEV__) {
      this.window.webContents.openDevTools()
    }
  
    if (__DEV__) {
      this.window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    }
    else {
      this.window.loadURL(formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      }))
    }
  }

  public onClose(fn: () => void) {
    this.window.on('closed', fn)
  }

  public show() {
    this.window.show()
  }

  public sendMenuEvent(name: MenuEvent) {
    this.show()

    this.window.webContents.send('menu-event', { name })
  }

}