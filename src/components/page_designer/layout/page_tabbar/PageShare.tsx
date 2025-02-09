import { createEffect, createSignal } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { useGraph, type Vertex } from "~/lib/graph/graph";

export function PageShare(props: { formStoreId: string }) {
  const [graph] = useGraph();
  const [access, setAccess] = createSignal("everyone");
  const [email, setEmail] = createSignal(""); // Initializes email state
  const [showCopiedTooltip, setShowCopiedTooltip] = createSignal(false);
  const [error, setError] = createSignal("");

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;

  createEffect(() => {
    if (access() === "everyone") {
      setEmail("");
    }
  });

  const getLink = () => {
    if (formStoreVertex()) {
      const { hostname, port, protocol } = window.location;
      const formattedPort = port ? `:${port}` : "";
      const { id, L, P } = graph.vertexes[formStoreVertex()?.P.formDataId!];

      if (isNegative(id)) {
        setError(`Please save the ${L[0]} first.`);
        return "";
      }

      if (!P?.key) {
        setError(`Please configure ${L[0]} Name first.`);
        return "";
      }

      return `${protocol}//${hostname}${formattedPort}/view/${L[0]}/${P.key}/new`;
    }
    return "";
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getLink());
    setShowCopiedTooltip(true);
    setTimeout(() => setShowCopiedTooltip(false), 1000);
  };

  const previewLink = () => {
    const url = getLink();
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleAccessChange = (accessType: string) => setAccess(accessType);

  return (
    <div class="p:20px r:10px">
      {error() && <div class="color:red mb:10px">{error()}</div>}
      <div class="flex mb:20px">
        <input
          class="bg:rgb(245,245,245) p:10 r:5|0|0|5 w:full"
          readOnly
          type="text"
          value={getLink()}
        />
        <IconButton
          class="border-l:1px_solid_#ddd bg:rgb(245,245,245) border:none cursor:pointer p:10 r:0|5|5|0"
          icon="mdi:external-link"
          onClick={previewLink}
          size={24}
          title="Preview link"
        />
        <IconButton
          class="border-l:1px_solid_#ddd bg:rgb(245,245,245) border:none cursor:pointer p:10 r:0|5|5|0"
          icon="mdi:clipboard-outline"
          onClick={copyToClipboard}
          size={24}
          title={showCopiedTooltip() ? "Copied" : "Click to copy"}
        />
      </div>
      <div class="mb:20px">
        {["everyone", "invite"].map((type) => (
          <button
            class={
              access() === type
                ? "bg:#554FDC border:none color:white cursor:pointer mr:10px p:10px|20px r:6px"
                : "bg:rgb(245,245,245) border:none cursor:pointer mr:10px p:10px|20px r:6px"
            }
            onClick={() => handleAccessChange(type)}
          >
            {type === "everyone" ? "Everyone" : "Invite only"}
          </button>
        ))}
      </div>
      <div class="flex mb:20px">
        <IconButton
          class="bg:#F5F5F5 p:10 r:5|0|0|5"
          icon="system-uicons:mail"
          onClick={copyToClipboard}
          size={24}
          title="Copy link"
        />
        <input
          class="p:10 r:0|5|5|0 w:full"
          disabled={access() === "everyone"}
          onInput={(e) => setEmail(e.target.value)}
          placeholder="Enter email, for multiple emails use ';' to separate"
          type="email"
          value={email()}
        />
      </div>
      <div class="flex">
        {["🌐", "💬", "✉️", "🔗"].map((icon) => (
          <button class="cursor:pointer mr:10px">{icon}</button>
        ))}
      </div>
    </div>
  );
}
