import {For, Show} from 'solid-js';
import {Title} from "@solidjs/meta";
import {Breadcrumbs} from "~/components/solid-blocks/blocks";
import {A} from "@solidjs/router";

export type PageHeaderProps = {
    title: string;
    breadcrumb: { name: string; href?: string }[];
    className?: string;
};

export default function PageHeader(props: PageHeaderProps) {
    const headerStyle = {
        margin: '10px',
        'margin-bottom': '3rem'
    };


    const titleStyle = {
        'margin-bottom': '0.8rem', // 'mb-2'
        'font-size': '22px',
        'font-weight': 'bold',
        fontFamily: '"Public Sans", sans-serif'
        // ...add more responsive styles as needed
    };

    const breadcrumbsStyle = {
        'flex-wrap': 'wrap', // 'flex-wrap'
    };

    const breadcrumbItemStyle = {
        // Define your breadcrumb item inline styles here
    };

    // You can still use `cn` if you want to combine inline styles with class names
    return (
        <header style={{...headerStyle, ...props.className && {className: props.className}}}>

            <div>
                <h2 style={titleStyle}>
                    {props.title}
                </h2>

                <Breadcrumbs separator={" › "} aria-label="breadcrumb" style={breadcrumbsStyle}>
                    <For each={props.breadcrumb}>
                        {(item) => (
                            <li
                                style={breadcrumbItemStyle}
                            >
                                <Show when={item.href}
                                      fallback={<span class={'f:15 color:#9c9797 letter-spacing:.5 font-weight:500'}
                                                      style={{'font-family': '"Public Sans", sans-serif'}}>{item.name}</span>}>
                                    <a href={item.href || '#'}
                                       class={'text:underline color:rgb(87,83,83) f:15 letter-spacing:.4 font-weight:500'}
                                       style={{'font-family': '"Public Sans", sans-serif'}}>{item.name}</a>
                                </Show>
                            </li>
                        )}
                    </For>
                </Breadcrumbs>
            </div>
            {props.children}
        </header>
    );
}
