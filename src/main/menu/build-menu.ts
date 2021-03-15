import { Menu, ipcMain, app } from 'electron'
import { MenuEvent } from './menu-event'

export function buildDefaultMenu(): Menu {
  const template = new Array<Electron.MenuItemConstructorOptions>()
  const separator: Electron.MenuItemConstructorOptions = { type: 'separator' }

  if (__DARWIN__) {
    template.push({
      label: app.name,
      submenu: [
        {
          label: 'About ' + app.name,
          id: 'about',
          click: emit('show-about')
        },
        separator,
        {
          label: 'Preferences...',
          id: 'preferences',
          accelerator: 'CmdOrCtrl+,',
          click: emit('show-preferences')
        },
        separator,
        {
          role: 'services'
        },
        separator,
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        separator,
        { role: 'quit' },
      ]
    })
  }

  if (!__DARWIN__) {
    template.push({
      label: 'File',
      submenu: [
        {
          label: 'Preferences...',
          id: 'preferences',
          click: emit('show-preferences')
        },
        separator,
        { role: 'quit' }
      ]
    })
  }

  template.push({
    label: __DARWIN__ ? 'Edit' : '&Edit',
    submenu: [
      { role: 'undo', label: __DARWIN__ ? 'Undo' : '&Undo' },
      { role: 'redo', label: __DARWIN__ ? 'Redo' : '&Redo' },
      separator,
      { role: 'cut', label: __DARWIN__ ? 'Cut' : 'Cu&t' },
      { role: 'copy', label: __DARWIN__ ? 'Copy' : '&Copy' },
      { role: 'paste', label: __DARWIN__ ? 'Paste' : '&Paste' },
    ],
  })

  template.push({
    label: __DARWIN__ ? 'View' : '&View',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: (() => {
          return __DARWIN__ ? 'Alt+Command+I' : 'Ctrl+Shift+I'
        })(),
        click(item: any, focusedWindow: Electron.BrowserWindow) {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools()
          }
        }
      }
    ]
  })

  if (!__DARWIN__) {
    template.push({
      label: '&Help',
      submenu: [
        {
          label: '&About ' + app.name,
          id: 'about',
          click: emit('show-about')
        }
      ]
    })
  }

  return Menu.buildFromTemplate(template);
}

type ClickHandler = (
  menuItem: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow,
  event: Electron.Event
) => void

function emit(name: MenuEvent): ClickHandler {
  return (menuItem, window) => {
    if (window) {
      window.webContents.send('menu-event', { name })
    }
    else {
      ipcMain.emit('menu-event', { name })
    }
  }
}