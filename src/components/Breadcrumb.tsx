import { Icon } from "@iconify-icon/solid";
import { For, type JSX, Show } from "solid-js";

import {SiteTitle} from "~/pages/website/SiteTitle";

export type PageHeaderProps = {
  breadcrumb: { href?: string; icon?: string; name: string }[];
  children?: JSX.Element;
  className?: string;
  title: string;
};

export function Breadcrumb(props: PageHeaderProps) {
  const headerStyle = {
    margin: "10px",
    "margin-bottom": "1rem",
  };

  const titleStyle = {
    "font-size": "22px",
    "font-weight": "bold",
    fontFamily: '"Public Sans", sans-serif',
    "margin-bottom": "0.5rem",
  };

  const breadcrumbsStyle = {
    "flex-wrap": "wrap",
  };

  return (
    <header
      style={{
        ...headerStyle,
        ...(props.className && { className: props.className }),
      }}
    >
      <div>
        <SiteTitle>{props.title}</SiteTitle>
        <h2 style={titleStyle}>{props.title}</h2>

        <nav aria-label="Breadcrumb" class="flex">
          <ol class="space-x:0.25rem  space-x:0.5rem@md  --space-x-reverse:1:rtl align-items:center display:inline-flex">
            <For each={props.breadcrumb}>
              {(item) => (
                <li>
                  <Show
                    fallback={
                      <div class="flex align-items:center ">
                        <Icon
                          icon={"octicon:chevron-right-12"}
                          style={{ color: "rgb(156,163,175)" }}
                        />
                        <span class="ms-1 lh:1.25rem md:ms-2 color:rgb(107,114,128)  color:rgb(156,163,175)@dark  f:0.875rem font-weight:500">
                          {item.name}
                        </span>
                      </div>
                    }
                    when={item.href}
                  >
                    <li>
                      <div class="flex align-items:center text:underline">
                        <Show when={item.icon}>
                          <Icon
                            class="color:rgb(156,163,175) mr:5"
                            height={20}
                            icon={item.icon!}
                            width={20}
                          />
                        </Show>
                        <a
                          class="ms-1 lh:1.25rem md:ms-2 color:rgb(55,65,81)  color:rgb(37,99,235):hover  color:rgb(156,163,175)@dark color:rgb(255,255,255):hover@dark f:0.875rem font-weight:500"
                          href={item.href}
                        >
                          {item.name}
                        </a>
                      </div>
                    </li>
                  </Show>
                </li>
              )}
            </For>
          </ol>
        </nav>
      </div>
      {props.children}
    </header>
  );
}
