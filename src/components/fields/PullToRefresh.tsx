import { Icon } from "@iconify-icon/solid";

import { createPullToRefresh } from "~/lib/hooks/createPullToRefresh";

const MAXIMUM_PULL_LENGTH = 240;
const REFRESH_THRESHOLD = 180;

export function PullToRefresh(props: {
  isDisabled: () => boolean;
  onRefresh: () => void;
}) {
  const { isRefreshing, pullPosition } = createPullToRefresh({
    isDisabled: props.isDisabled,
    maximumPullLength: MAXIMUM_PULL_LENGTH,
    onRefresh: props.onRefresh,
    refreshThreshold: REFRESH_THRESHOLD,
  });

  return (
    <div
      class="text-primary inset-x-1/2 z-30 h-8 w-8 -translate-x-1/2 rounded-full shadow fixed"
      style={{
        opacity: isRefreshing() || pullPosition() > 0 ? 1 : 0,
        top: `${(isRefreshing() ? REFRESH_THRESHOLD : pullPosition()) / 3}px`,
      }}
    >
      <div
        class={`h-full w-full ${isRefreshing() ? "animate-spin" : ""}`}
        style={
          isRefreshing() ? {} : { transform: `rotate(${pullPosition()}deg)` }
        }
      >
        <Icon height={32} icon="vaadin:rotate-left" noobserver width={32} />
      </div>
    </div>
  );
}
