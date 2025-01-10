import { onCleanup } from "solid-js";
import { useGraph } from "~/lib/graph/graph";
import { useDesignerLayoutStore } from "../context/LayoutContext";
import { getChannel, handleChannelMessage } from "./channel";

export const IFramePreview = () => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const onLoad = () => {
    setTimeout(() => {
      const channel = getChannel(layoutStoreId);
      channel.onmessage = msg => handleChannelMessage(msg, graph, setGraph, layoutStoreId);
      channel.postMessage(JSON.stringify({ graph }));
    }, 1000);
  };

  setGraph("broadcastChannels", (channels) => channels.includes(layoutStoreId) ? channels : [...channels, layoutStoreId]);

  onCleanup(() => {
    setGraph("broadcastChannels", (channels) => channels.filter(id => id !== layoutStoreId));
  });

  { /* TODO: use unique id for each page */ }
  return <iframe
    src={`${window.location.origin}/page_design_preview?id=${layoutStoreId}`}
    style={{ width: "100%", height: "100%", border: "none" }}
    onLoad={onLoad} />;
};
