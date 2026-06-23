import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createSignal, onMount, Show } from "solid-js";
import { isServer } from "solid-js/web";

import { ZIndex } from "~/components/fields/ZIndex";
import { As } from "~/components/As";

export function isPortraitOrientation() {
  if (isServer) {
    return false;
  }
  return window.innerHeight > window.innerWidth;
}

export function LandscapeOrientationPrompt() {
  const [isPortrait, setIsPortrait] = createSignal(false);

  onMount(() => {
    const updateOrientation = () => {
      setIsPortrait(isPortraitOrientation());
    };

    updateOrientation();
    makeEventListener(window, "resize", updateOrientation);
    makeEventListener(window, "orientationchange", updateOrientation);
  });

  return (
    <Show when={isPortrait()}>
      <ZIndex>
        <As
          as="div"
          css={`return \`._id {
            position: fixed;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            padding: 2rem;
            background: \${args.theme.var.color.background};
            opacity: 0.97;
            z-index: 9999;
            text-align: center;
          }\`;`}
        >
          <Icon icon="ph:device-rotate" height={64} width={64} />
          <As
            as="p"
            css={`return \`._id {
              color: \${args.theme.var.color.text};
              font-size: 1.125rem;
              font-weight: 500;
              max-width: 20rem;
              margin: 0;
            }\`;`}
          >
            Please rotate your device to landscape mode to use the Page Designer.
          </As>
        </As>
      </ZIndex>
    </Show>
  );
}
