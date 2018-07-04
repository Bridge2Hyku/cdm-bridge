import { app, Menu, ipcMain } from 'electron'
import { AppWindow } from './app-window'
import { buildDefaultMenu, MenuEvent } from './menu'

let mainWindow: AppWindow | null = null

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  createMainWindow()

  let menu = buildDefaultMenu()
  Menu.setApplicationMenu(menu)

  ipcMain.on('menu-event', (event: Electron.IpcMessageEvent, args: any[]) => {
    const { name }: { name: MenuEvent } = event as any
    if (mainWindow) {
      mainWindow.sendMenuEvent(name)
    }
  })
})

function createMainWindow() {
  const window = new AppWindow()

  window.onClose(() => {
    if (__DARWIN__) {
      app.quit()
    }
  })

  window.load()
  window.show()

  mainWindow = window
}
