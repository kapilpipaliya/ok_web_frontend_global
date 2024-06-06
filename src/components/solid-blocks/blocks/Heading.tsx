import { JSX, splitProps } from "solid-js";

const Heading = (props: JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement> & { heading?: string, subheading?: string, divider?: boolean }) => {
    const [local, customProps] = splitProps(props, ["heading", "subheading", "divider"]);
    return (
        <div {...customProps}>
            <h1 class="text-2xl font-bold">{local.heading || 'Default Heading'}</h1>
            {local.subheading && <p class="text-base">{local.subheading}</p>}
            {local.divider !== false && <hr class="mt-2 mb-2 h-0.5 bg-lightgrey w-full" />}
        </div>
    );
};

export default Heading;
