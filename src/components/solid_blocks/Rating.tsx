import { Icon } from "@iconify-icon/solid";
import { For, type JSX, createSignal, } from "solid-js";

export function StarRating(
  props: JSX.IntrinsicAttributes &
    JSX.HTMLAttributes<HTMLDivElement> & { etc: any; heading?: string },
) {
  const [rating, setRating] = createSignal(0);
  const [hover, setHover] = createSignal(0);

  return (
    <div class={`p:4 flex mt:5 mb:5 ai:center jc:start flex:col ${props.etc}`}>
      {props.heading && (
        <h2 class="font-weight:bold mb:2 mr:auto">{props.heading}</h2>
      )}
      <div class="flex ai:center ">
        <For each={[...Array(5)]}>
          {(_, index) => {
            const ratingValue = index() + 1;
            return (
              <Icon
                icon="mdi:star"
                width={24}
                height={24}
                class={`w:8 h:20 mr:15 cursor:pointer ${
                  ratingValue <= (hover() || rating())
                    ? "color:#ffc107"
                    : "color:lightgray"
                }`}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
}
