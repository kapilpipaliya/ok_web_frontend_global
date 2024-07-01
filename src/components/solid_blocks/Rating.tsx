import { Icon } from "@iconify-icon/solid";
import { For, type JSX, createSignal, } from "solid-js";

export function StarRating(
  props: { etc: any; heading?: string } &
    JSX.HTMLAttributes<HTMLDivElement> & JSX.IntrinsicAttributes,
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
                class={`w:8 h:20 mr:15 cursor:pointer ${
                  ratingValue <= (hover() || rating())
                    ? "color:#ffc107"
                    : "color:lightgray"
                }`}
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
