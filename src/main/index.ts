import { app, Menu, ipcMain, shell } from 'electron'
import { AppWindow } from './app-window'
import { buildDefaultMenu, MenuEvent } from './menu'

let mainWindow: AppWindow | null = null

// Increase default max memory size
app.commandLine.appendSwitch('js-flags', '--max_old_space_size=4096');

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

  ipcMain.on('menu-event', (event: Electron.IpcMainEvent, args: any[]) => {
    const { name }: { name: MenuEvent } = event as any
    if (mainWindow) {
      mainWindow.sendMenuEvent(name)
    }
  })

  ipcMain.on(
    'open-external',
    (event: Electron.IpcMainEvent, { path }: { path: string }) => {
      const result = shell.openExternal(path)
      event.sender.send('open-external-result', { result })
    }
  )

})

function createMainWindow() {
  const window = new AppWindow()

  window.onClose(() => {
    if (__DARWIN__) {
      app.quit()
    }
  })

  window.onDidLoad(() => {
    window.show()
  })
  window.load()

  mainWindow = window
}
