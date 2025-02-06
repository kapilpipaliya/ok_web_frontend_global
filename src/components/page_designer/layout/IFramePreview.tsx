import { onCleanup, onMount } from "solid-js";

import { useGraph } from "~/lib/graph/graph";
import { getChannel, handleChannelMessage } from "~/lib/graph/mutate/channel";

import { useDesignerLayoutStore } from "../context/LayoutContext";

export const IFramePreview = (props: {
  formStoreId: string;
  noMinHeight?: boolean;
}) => {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();

  const onLoad = () => {
    const channel = getChannel(props.formStoreId);
    channel.onmessage = msg => handleChannelMessage(msg, graph, setGraph, props.formStoreId);
    channel.postMessage(JSON.stringify({ graph: {...graph, broadcastChannels: []} }));
  }

  setGraph("broadcastChannels", (channels) => channels.includes(props.formStoreId) ? channels : [...channels, props.formStoreId]);

  onCleanup(() => {
    setGraph("broadcastChannels", (channels) => channels.filter(id => id !== props.formStoreId));
  });

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOADED') {
        onLoad();
      }
    };

    window.addEventListener('message', handleMessage);

    onCleanup(() => {
      console.log('cleanup');
      window.removeEventListener('message', handleMessage);
    });
  });
  return <iframe
    allow="clipboard-read; clipboard-write"
    src={`${window.location.origin}/page_design_preview?layoutStoreId=${layoutStoreId}&formStoreId=${props.formStoreId}${props.noMinHeight ? '&noMinHeight=true' : ''}`}
    style={{ border: "none", height: "100%", width: "100%" }}
  />;
};
