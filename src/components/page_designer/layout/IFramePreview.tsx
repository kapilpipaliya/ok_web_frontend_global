import { createEffect, onCleanup } from "solid-js";
import { useGraph } from "~/lib/graph/graph";
import { getChannel, handleChannelMessage } from "./channel";
import { useDesignerLayoutStore } from "../context/LayoutContext";

export const IFramePreview = (props: {formStoreId: string}) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const onLoad = () => {
    setTimeout(() => {
      const channel = getChannel(props.formStoreId);
      channel.onmessage = msg => handleChannelMessage(msg, graph, setGraph, props.formStoreId);
      channel.postMessage(JSON.stringify({ graph: {...graph, broadcastChannels: []} }));
    }, 1000);
  };

  setGraph("broadcastChannels", (channels) => channels.includes(props.formStoreId) ? channels : [...channels, props.formStoreId]);

  onCleanup(() => {
    setGraph("broadcastChannels", (channels) => channels.filter(id => id !== props.formStoreId));
  });

  { /* TODO: use unique id for each page */ }
  return <iframe
    src={`${window.location.origin}/page_design_preview?layoutStoreId=${layoutStoreId}&formStoreId=${props.formStoreId}`}
    style={{ width: "100%", height: "100%", border: "none" }}
    allow="clipboard-read; clipboard-write"
    onLoad={onLoad} />;
};
