import {
  createEffect,
  createResource,
  JSX,
  Match,
  Show,
  Switch,
  useContext,
} from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";

import { LoaderNew } from "~/components/custom/LoaderSimple";

export const DataFetcher = (props: {
  fetchData: string;
  renderContent: JSX.Element;
  errorMessage?: string;
}) => {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [WsData, { refetch }] = createResource(async () => {
    try {
      const response = await fetch(props.fetchData);
      const data = await response.json();
      setGraphData(graph, setGraph, data);
      return data;
    } catch (error) {
      throw error;
    }
  });

  createEffect(() => {
    if (WsData() === undefined) {
      refetch();
    } else {
      setGraphData(graph, setGraph, WsData());
    }
  });

  return (
    <Switch>
      <Match when={WsData.error}>
        <div>Error: {props.errorMessage ?? WsData.error}</div>
      </Match>
      <Match when={WsData.loading}>
        <LoaderNew />
      </Match>
      <Match when={true}>
        <Show when={graph.initialSynced}>{props.renderContent}</Show>
      </Match>
    </Switch>
  );
};

export const API = {
  fetchDataUrl: `/api/get_data`,
  loginUrl: `/api/login`,
  signUpUrl: `/api/signup`,
  profileUrl: `/api/profile`,
  logOutUrl: `/api/logout`,
  getFormDataUrl: `/api/get_form_data`,
  SubmitDataUrl: `/api/submit_data`,
  getPagesDataUrl: `/api/get_pages_data`,
};
