import { Icon } from "@iconify-icon/solid";
import { For, type JSX, Show } from "solid-js";
import SiteTitle from "~/components/website/utils";

export type PageHeaderProps = {
  title: string;
  breadcrumb: { name: string; href?: string; icon?: string }[];
  className?: string;
  children?: JSX.Element;
};

export default function PageHeader(props: PageHeaderProps) {
  const headerStyle = {
    margin: "10px",
    "margin-bottom": "1rem",
  };

  const titleStyle = {
    "margin-bottom": "0.5rem",
    "font-size": "22px",
    "font-weight": "bold",
    fontFamily: '"Public Sans", sans-serif',
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

        <nav class="flex" aria-label="Breadcrumb">
          <ol class="display:inline-flex  align-items:center  space-x:0.25rem space-x:0.5rem@md --space-x-reverse:1:rtl">
            <For each={props.breadcrumb}>
              {(item) => (
                <li>
                  <Show
                    when={item.href}
                    fallback={
                      <div class="flex align-items:center ">
                        <Icon
                          icon={"octicon:chevron-right-12"}
                          style={{ color: "rgb(156,163,175)" }}
                        />
                        <span class="ms-1 f:0.875rem lh:1.25rem font-weight:500  color:rgb(107,114,128)  md:ms-2 color:rgb(156,163,175)@dark">
                          {item.name}
                        </span>
                      </div>
                    }
                  >
                    <li>
                      <div class="flex align-items:center text:underline">
                        <Icon
                          icon={item.icon}
                          class="color:rgb(156,163,175) mr:5"
                          height={20}
                          width={20}
                        />
                        <a
                          href={item.href}
                          class="ms-1 f:0.875rem lh:1.25rem font-weight:500  color:rgb(55,65,81)  color:rgb(37,99,235):hover md:ms-2 color:rgb(156,163,175)@dark color:rgb(255,255,255):hover@dark"
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
