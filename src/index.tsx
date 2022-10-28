/* @refresh reload */
import './index.css';
import '@master/css';
import { render } from "solid-js/web";
import { DebugProvider } from './components/core/SolidDebug';
import { FullDashboard } from "./components/Dashboard";
import {  Router } from "solid-app-router";
import './webcomponents'

render(() => <DebugProvider><Router><FullDashboard /></Router></DebugProvider>, document.getElementById("root") as HTMLElement);
