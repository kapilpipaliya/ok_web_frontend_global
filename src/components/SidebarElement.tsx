import {Icon} from "@iconify-icon/solid";
import {Accordion} from "@kobalte/core";
import {useLocation, useNavigate} from "@solidjs/router";
import {For, Setter} from "solid-js";
import {navbarDataI} from "./Sidebar";

export default function SidebarElement(props: {
    navbarData: navbarDataI[];
    resetSearch: () => void;
    isSearchMode: boolean;
    openIds: string[];
    setOpenIds: Setter<string[]>;
}) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div>
            <Accordion.Root
                multiple
                class="overflow-x:hidden overflow-y:auto user-select:none"
                value={props.openIds}
                onChange={props.setOpenIds}
            >
                <For each={props.navbarData ?? []}
                     fallback={<div class="flex ai:center jc:center mt:10">No data found</div>}>
                    {(item) => {
                        return (
                            <li
                                style={{transition: "all .2s ease-in-out"}}
                                class={`cursor:pointer ${
                                    location.pathname.toLowerCase() === item.href.toLowerCase() ? "bg:#337ab7 fg:white" : ""
                                }`}
                            >
                                {item.expanded === undefined ? (
                                    <div
                                        class="flex ai:center p:8 bg:#b2b2b2:hover fg:black:hover"
                                        onclick={() => {
                                            navigate(item.href, {
                                                resolve: false,
                                            });
                                            props.resetSearch();
                                        }}
                                    >
                                        <span class="font:14">{item.name}</span>
                                    </div>
                                ) : (
                                    <Accordion.Item value={item.id}>
                                        <Accordion.Trigger class="w:full">
                                            <Accordion.Header
                                                class="w:full flex ai:center jc:left px:10 bg:#b2b2b2:hover">
                                                <div class="pr-4 font:15">
                                                    <Icon icon={'mdi:chevron-up'} aria-hidden
                                                          class={`${!props.openIds.includes(item.id) ? 'rotate-bottom' : 'rotate-top'} flex-1`}
                                                          style="font-size: 24px; border-radius: 50%; margin-left: 5px;"/>
                                                </div>
                                                <div class="ml:8 font:14 py:8">
                                                    <span>{item.name}</span>
                                                </div>
                                            </Accordion.Header>
                                        </Accordion.Trigger>
                                        <Accordion.Content class="pl:20">
                                            <SidebarElement
                                                openIds={props.openIds}
                                                setOpenIds={props.setOpenIds}
                                                resetSearch={props.resetSearch}
                                                navbarData={item.children}
                                                isSearchMode={props.isSearchMode}
                                            />
                                        </Accordion.Content>
                                    </Accordion.Item>
                                )}
                            </li>
                        );
                    }}
                </For>
            </Accordion.Root>
        </div>
    );
}
