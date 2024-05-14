import { createEffect, JSX, onMount, Show, useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/websocket/ws_events";
import { LoaderNew } from "~/components/custom/LoaderSimple";

export const DataFetcher = (props: {
  fetchData: string;
  renderContent: JSX.Element;
  errorMessage?: string;
}) => {
  const [graph, setGraph] = useContext(GraphContext)!;

  const getdata = async () => {
    try {
      const response = await fetch(props.fetchData);
      const data = await response.json();
      setGraphData(graph, setGraph, data);
      return data;
    } catch (error) {
      throw error;
    }
  };
  onMount(() => {
    getdata();
  });

  return (
    <Show when={graph.initialSynced} fallback={<LoaderNew />}>
      {props.renderContent}
    </Show>
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
  getUserUrl: `/api/get_user`,
};
