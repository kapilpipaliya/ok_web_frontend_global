import { Icon } from "@iconify-icon/solid";
import { For, type JSX, createSignal } from "solid-js";

export function StarRating(
  props: { etc: any; heading?: string } & JSX.HTMLAttributes<HTMLDivElement> &
    JSX.IntrinsicAttributes,
) {
  const [rating, setRating] = createSignal(0);
  const [hover, setHover] = createSignal(0);

  return (
    <div class={`${props.etc} flex ai:center flex:col jc:start mb:5 mt:5 p:4`}>
      {props.heading && (
        <h2 class="font-weight:bold mb:2 mr:auto">{props.heading}</h2>
      )}
      <div class="flex ai:center ">
        <For each={[...Array(5)]}>
          {(_, index) => {
            const ratingValue = index() + 1;
            return (
              <Icon
                class={`${
                  ratingValue <= (hover() || rating())
                    ? "color:#ffc107"
                    : "color:lightgray"
                } cursor:pointer h:20 mr:15 w:8`}
                height={24}
                icon="mdi:star"
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                width={24}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
}
