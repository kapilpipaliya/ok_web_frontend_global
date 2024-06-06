import { For, JSX, createSignal, splitProps } from 'solid-js';

const StarRating = (props: JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement> & { heading?: string, subheading?: string }) => {
    const [rating, setRating] = createSignal(0);
    const [hover, setHover] = createSignal(0);
    const [local, customProps] = splitProps(props, ["heading", "subheading"]);

    return (
        <div class="p:4" {...customProps}>
            {props.heading && <h2 class="font-weight:bold mb:2">{local.heading}</h2>}
            {local.subheading && <p class="mb:2">{local.subheading}</p>}
            <div class="flex ai:center">
                <For each={[...Array(5)]}>
                    {(_, index) => {
                        const ratingValue = index() + 1;
                        return (
                            <svg
                                key={ratingValue}
                                class={`w:8 h:8 cursor:pointer ${ratingValue <= (hover() || rating()) ? 'color:yellow' : 'color:lightgray'
                                    }`}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                onClick={() => setRating(ratingValue)}
                                onMouseEnter={() => setHover(ratingValue)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <path d="M12 .587l3.668 7.431L24 9.751l-6 5.848 1.417 8.281L12 18.905 4.583 23.88 6 15.599 0 9.751l8.332-1.733z" />
                            </svg>
                        );
                    }}
                </For>
            </div>
        </div>
    );
};

export default StarRating;
