import { onCleanup } from "solid-js";
import { useGraph } from "~/lib/graph/graph";
import { getChannel, handleChannelMessage } from "./channel";
import { useDesignerLayoutStore } from "../context/LayoutContext";

export const IFramePreview = (props: {formId: string}) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const onLoad = () => {
    setTimeout(() => {
      const channel = getChannel(props.formId);
      channel.onmessage = msg => handleChannelMessage(msg, graph, setGraph, props.formId);
      channel.postMessage(JSON.stringify({ graph }));
    }, 1000);
  };

  setGraph("broadcastChannels", (channels) => channels.includes(props.formId) ? channels : [...channels, props.formId]);

  onCleanup(() => {
    setGraph("broadcastChannels", (channels) => channels.filter(id => id !== props.formId));
  });

  { /* TODO: use unique id for each page */ }
  return <iframe
    src={`${window.location.origin}/page_design_preview?layoutStoreId=${layoutStoreId}&formId=${props.formId}`}
    style={{ width: "100%", height: "100%", border: "none" }}
    allow="clipboard-read; clipboard-write"
    onLoad={onLoad} />;
};
