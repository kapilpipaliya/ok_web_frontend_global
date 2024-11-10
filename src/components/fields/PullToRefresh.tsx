import { Icon } from "@iconify-icon/solid";
import { createPullToRefresh } from "~/lib/hooks/createPullToRefresh";

const MAXIMUM_PULL_LENGTH = 240;
const REFRESH_THRESHOLD = 180;

export function PullToRefresh(props: {
  onRefresh: () => void;
  isDisabled: () => boolean;
}) {
  const { isRefreshing, pullPosition } = createPullToRefresh({
    onRefresh: props.onRefresh,
    maximumPullLength: MAXIMUM_PULL_LENGTH,
    refreshThreshold: REFRESH_THRESHOLD,
    isDisabled: props.isDisabled,
  });

  return (
    <div
      style={{
        top: `${(isRefreshing() ? REFRESH_THRESHOLD : pullPosition()) / 3}px`,
        opacity: isRefreshing() || pullPosition() > 0 ? 1 : 0,
      }}
      class="text-primary fixed inset-x-1/2 z-30 h-8 w-8 -translate-x-1/2 rounded-full shadow"
    >
      <div
        class={`h-full w-full ${isRefreshing() ? "animate-spin" : ""}`}
        style={
          !isRefreshing() ? { transform: `rotate(${pullPosition()}deg)` } : {}
        }
      >
        <Icon icon="vaadin:rotate-left" width={32} height={32} />
      </div>
    </div>
  );
}
