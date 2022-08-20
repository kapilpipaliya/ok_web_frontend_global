/* @refresh reload */
import './index.css';
import { render } from "solid-js/web";
import { DebugProvider } from './components/core/SolidDebug';
import { StyleRegistry } from 'solid-styled';
import { FullDashboard } from "./components/Dashboard";
import {  Router } from "solid-app-router";
import './webcomponents'

render(() => <DebugProvider><StyleRegistry><Router><FullDashboard /></Router></StyleRegistry></DebugProvider>, document.getElementById("root") as HTMLElement);
