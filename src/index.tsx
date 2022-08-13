/* @refresh reload */
import { render } from "solid-js/web";
import { App } from "./components/App";
import { DebugProvider, useDebugger } from './components/core/SolidDebug';

render(() => <DebugProvider><App /></DebugProvider>, document.getElementById("root") as HTMLElement);
