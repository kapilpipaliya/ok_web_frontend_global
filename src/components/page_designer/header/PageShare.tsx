import { createEffect, createSignal } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Tooltip } from "~/components/solid_blocks";
import { useDesignerLayoutStore } from "../LayoutContext";

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
      const port = window.location.port ? `:${window.location.port}` : '';
      return `${protocol}//${hostname}${port}/view/${layoutStore.formData.formData.L[0]}/${layoutStore.formData.formData.P.name}/new`;
    }
    return ""
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
          type="text"
          value={getLink()}
          readOnly
          class={"w:full bg:rgb(245,245,245) r:5|0|0|5 p:10"}
        />
        <Tooltip content={"Preview link"}>
          <button
            onClick={previewLink}
            class={"p:10 border:none bg:rgb(245,245,245) border-l:1px_solid_#ddd cursor:pointer r:0|5|5|0"}
          >
            🚀
          </button>
        </Tooltip>
        <Tooltip content={showCopiedTooltip() ? "Copied" : "Click to copy"} nowrap>
          <button
            onClick={copyToClipboard}
            class={"p:10 border:none bg:rgb(245,245,245) border-l:1px_solid_#ddd cursor:pointer r:0|5|5|0"}
          >
            📋
          </button>
        </Tooltip>
      </div>
      <div class="mb:20px">
        <button
          onClick={() => {
            setAccess("everyone");
          }}
          class={
            access() === "everyone"
              ? "p:10px_20px border:none r:6px bg:rgb(245,245,245) mr:10px cursor:pointer bg:#554FDC color:white"
              : "p:10px_20px border:none r:6px bg:rgb(245,245,245) mr:10px cursor:pointer"
          }
        >
          Everyone
        </button>
        <button
          onClick={() => setAccess("invite")}
          class={
            access() === "invite"
              ? "p:10px_20px border:none r:6px bg:rgb(245,245,245) mr:10px cursor:pointer bg:#554FDC color:white"
              : "p:10px_20px border:none r:6px bg:rgb(245,245,245) mr:10px cursor:pointer"
          }
        >
          Invite only
        </button>
      </div>
      <div class="flex mb:20px">
        <button onClick={copyToClipboard} class={"r:5|0|0|5 p:10 bg:#F5F5F5"}>
          <Icon icon={"system-uicons:mail"} height={25} width={25}/>
        </button>

        <input
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
          class="w:full r:0|5|5|0 p:10"
          type="email"
          name="email"
          disabled={access() === "everyone"}
          placeholder="Enter email, for multiple email use';' separate"
        />
      </div>
      <div class="flex">
        <button class="mr:10px cursor:pointer">🌐</button>
        <button class="mr:10px cursor:pointer">💬</button>
        <button class="mr:10px cursor:pointer">✉️</button>
        <button class="mr:10px cursor:pointer">🔗</button>
      </div>
    </div>
  );
};
