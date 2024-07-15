import { Icon } from "@iconify-icon/solid";
import { createEffect, createSignal } from "solid-js";

import { useDesignerLayoutStore } from "../../LayoutContext";

export function ShareSection() {
  const [layoutStore] = useDesignerLayoutStore() || [];
  const [access, setAccess] = createSignal("everyone");
  const [email, setEmail] = createSignal(""); // Initializes email state
  const [showCopiedTooltip, setShowCopiedTooltip] = createSignal(false);
  createEffect(() => {
    if (access() === "everyone") {
      setEmail("");
    }
  });

  const getLink = () => {
    if (layoutStore) {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : "";
      return `${protocol}//${hostname}${port}/view/${layoutStore.formData.formData.L[0]}/${layoutStore.formData.formData.P.name}/new`;
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

  return (
    <div class="p:20px r:10px">
      <div class="flex mb:20px">
        <input
          class={"bg:rgb(245,245,245) p:10 r:5|0|0|5 w:full"}
          readOnly
          type="text"
          value={getLink()}
        />
     
          <button
            class={
              "border-l:1px_solid_#ddd bg:rgb(245,245,245) border:none cursor:pointer p:10 r:0|5|5|0"
            }
            onClick={previewLink}
            title="Preview link"
          >
            🚀
          </button>
        

          <button
            class={
              "border-l:1px_solid_#ddd bg:rgb(245,245,245) border:none cursor:pointer p:10 r:0|5|5|0"
            }
            onClick={copyToClipboard}
            title={showCopiedTooltip() ? "Copied" : "Click to copy"}
          >
            📋
          </button>

      </div>
      <div class="mb:20px">
        <button
          class={
            access() === "everyone"
              ? "bg:#554FDC border:none color:white cursor:pointer mr:10px p:10px_20px r:6px"
              : "bg:rgb(245,245,245) border:none cursor:pointer mr:10px p:10px_20px r:6px"
          }
          onClick={() => {
            setAccess("everyone");
          }}
        >
          Everyone
        </button>
        <button
          class={
            access() === "invite"
              ? "bg:#554FDC border:none color:white cursor:pointer mr:10px p:10px_20px r:6px"
              : "bg:rgb(245,245,245) border:none cursor:pointer mr:10px p:10px_20px r:6px"
          }
          onClick={() => setAccess("invite")}
        >
          Invite only
        </button>
      </div>
      <div class="flex mb:20px">
        <button class={"bg:#F5F5F5 p:10 r:5|0|0|5"} onClick={copyToClipboard}>
          <Icon height={25} icon={"system-uicons:mail"} width={25} />
        </button>

        <input
          class="p:10 r:0|5|5|0 w:full"
          disabled={access() === "everyone"}
          name="email"
          onInput={(e) => setEmail(e.target.value)}
          placeholder="Enter email, for multiple email use';' separate"
          type="email"
          value={email()}
        />
      </div>
      <div class="flex">
        <button class="cursor:pointer mr:10px">🌐</button>
        <button class="cursor:pointer mr:10px">💬</button>
        <button class="cursor:pointer mr:10px">✉️</button>
        <button class="cursor:pointer mr:10px">🔗</button>
      </div>
    </div>
  );
}
