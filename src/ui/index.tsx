/// <reference path="../lib/globals.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import { Dispatcher } from '../lib/dispatcher'
import { AppStore } from '../lib/stores'

import '../styles/desktop.scss'

const appStore = new AppStore()
const dispatcher = new Dispatcher(appStore)

ReactDOM.render(
  <App dispatcher={dispatcher} appStore={appStore} />,
  document.getElementById("app")
)
