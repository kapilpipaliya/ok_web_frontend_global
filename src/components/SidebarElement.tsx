import { Icon } from "@iconify-icon/solid";
import { Accordion } from "@kobalte/core";
import { useLocation, useNavigate } from "@solidjs/router";
import { For, Setter, Show, createEffect, createSignal } from "solid-js";
import { navbarDataI } from "./Sidebar";
import treeViewFilter from "~/lib/treeViewFilter";

export default function SidebarElement(props: {
    navbarData: navbarDataI[];
}) {
    const [searchData, setSearchData] = createSignal<navbarDataI[]>([]);
    const location = useLocation();
    const [activeSection, setActiveSection] = createSignal('Home');
    const [searchTerm, setSearchTerm] = createSignal("");
    const [isSearchMode, setIsSearchMode] = createSignal(false);

    function resetSearch() {
        setIsSearchMode(false);
        setSearchData([]);
        setSearchTerm("");
    }


    createEffect(() => {
        const res = props.navbarData;
        if (!res) return;

        if (isSearchMode()) {
            const ids = res
                .map((e) => {
                    if (e.expanded !== undefined) return e.id;
                    return null;
                })
                .filter((e) => e) as string[];
            return;
        } else {
            setSearchData(res);
        }
    });
    const activeLinks = () => searchData().find(link => link.name === activeSection() && link.children);
    function handleSearch(input: string) {
        setSearchTerm(input);

        const searchName = input.trim().toLowerCase();
        setIsSearchMode(searchName.length > 0);

        if (searchName.length === 0) return;

        const res = searchData();
        if (!res) return;
        const result: navbarDataI[] = treeViewFilter(res, (node: navbarDataI) =>
            node.name.toLowerCase().includes(searchName),
        );

        setSearchData(result);
    }

    const mainIcon: any = {
        '/admin/dashboards/': 'akar-icons:dashboard',
        '/admin/': 'fluent:home-24-regular',
        '/admin/DataType': 'carbon:data-1',
        '/admin/CompCategory': 'material-symbols-light:settings-input-component-outline',
        '/admin/Comp': 'iconoir:component',
        '/admin/SimpleImport': 'uil:import',
        '/admin/backup_restore': 'lucide:database-backup',
        '/admin/User': 'ci:users',
        '/admin/Role': 'eos-icons:role-binding-outlined',
        '/admin/Perm': 'tabler:lock-access',
        '/admin/Coll': 'ep:collection-tag',
        '/admin/CollCategory': 'ic:outline-collections-bookmark',
        '/admin/Page': 'iconoir:multiple-pages',
        '/admin/Dashboard': 'mage:dashboard-2',
    }

    return (
        <div>
            <aside class="flex">
                <div class="bg:#EFF0FB r:0|15|15|0"
                    style={`display: flex; padding-bottom: 2rem; flex-direction: column; align-items: center; width: 4rem; height: 100vh`}>
                    <nav style="display: flex; margin-top: 1rem; padding-top: .5rem; flex-direction: column; flex: 1 1 0%; align-items: center;">
                        <a href="#">
                            <img style="height: 35px; " src="../../public/graphics/icon/CMYK_logo_favicon.svg" alt="logo" />
                        </a>
                        <div class="flex flex:col gap:10 mt:20">
                            <For each={searchData()}>
                                {(link) => (
                                    <Show when={link.href !== 'undefined'}>
                                        <a class={`${activeSection() === link.name ? "bg:white" : ""} gap:10 `} href={link.href}
                                            style={`display: inline-block; padding: 5px 5px 0px 5px; transition-property: background-color, border-color, color, fill, stroke; transition-duration: 200ms; border-radius: 0.5rem; `}
                                            onClick={() => setActiveSection(link.name)}>
                                            <Icon color={`${activeSection() === link.name ? "#3B82F6" : "#4B5563"}`} icon={mainIcon[link.href]} height={24} width={24} />
                                        </a>
                                    </Show>

                                )}
                            </For>
                        </div>
                    </nav>
                </div>

                <div class="p:20|10 bg:ghostwhite r:0|0|15|0 ">
                    <nav class="flex 0px 0px 10px 10px">
                        <div class="group">
                            <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                                <g>
                                    <path
                                        d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                                </g>
                            </svg>
                            <input placeholder="Search..." type="search" class="inputSearch f:14" value={searchTerm()} onInput={(e) => {
                                handleSearch(e.target.value);
                            }} />
                        </div>
                    </nav>
                    <nav class="mt:16 ml:-12 mr:-12 overflow:auto">
                        <Show when={activeLinks()}>
                            <For each={activeLinks()?.children}>
                                {(nav) => {
                                    return (
                                        <div style="padding-top: 12px; padding-bottom: 12px;">
                                            <Show when={nav.children}>
                                                <label class="pl:12 f:15 pr:12 capitalize">{nav.name}</label>
                                                <For each={nav.children}>
                                                    {(child) => (
                                                        <a class={`${location.pathname === child.href ? "bg:#E5EAFE font-weight:600" : "font-weight:400"} r:7 f:14 d:flex ai:center p:8|12 color:#4B5563 trs:color|.3s|bg|.3s td:none bg:#E5E7EB:hover m:5px|10px`} href={child.href}>
                                                            <Icon color={`${activeSection() === child.name ? "#3B82F6" : "#4B5563"}`} icon={mainIcon[child.href]} height={24} width={24} />
                                                            <span class="ml:8 color:#4B5563 ">{child.name}</span>
                                                        </a>
                                                    )}
                                                </For>
                                            </Show>
                                        </div>

                                    )
                                }

                                }
                            </For>
                        </Show>


                    </nav>

                </div>
            </aside>
            {/* <Accordion.Root
                multiple
                class="overflow-x:hidden overflow-y:auto user-select:none r:5|5|5|5"
                value={props.openIds}
                onChange={props.setOpenIds}
            >
                <For
                    each={props.navbarData ?? []}
                    fallback={
                        <div class="flex ai:center jc:center mt:10">No data found</div>
                    }
                >

                    {(item) => {
                        return (
                            <li
                                style={{transition: "all .2s ease-in-out"}}
                                class={`cursor:pointer r:5 mr:2 ${
                                    location.pathname.toLowerCase() === item.href.toLowerCase()
                                        ? "bg:#3477CC fg:white"
                                        : ""
                                }`}
                            >
                                {item.expanded === undefined ? (
                                    <div
                                        class="flex ai:center p:8 r:5|5|5|5 bg:#CDDDF3:hover fg:black:hover"
                                        onclick={() => {
                                            navigate(item.href, {
                                                resolve: false,
                                            });
                                            props.resetSearch();
                                        }}
                                    >
                                        <Icon icon={mainIcon[item.href]} height={20}/>&nbsp;&nbsp;
                                        <span class="font:14 font-weight:medium">{item.name}</span>
                                    </div>
                                ) : (
                                    <Accordion.Item value={item.id}>
                                        <Accordion.Trigger class="w:full">
                                            <Accordion.Header
                                                class="w:full m:0 flex r:5|5|5|5 p:1 ai:center jc:left ml:10 py:0 bg:#CDDDF3:hover">
                                                <div class="pr-4 font:15">
                                                    <Icon
                                                        icon={"mdi:chevron-up"}
                                                        aria-hidden
                                                        class={`${
                                                            !props.openIds.includes(item.id)
                                                                ? "rotate-bottom"
                                                                : "rotate-top"
                                                        } flex-1`}
                                                        style="font-size: 24px; border-radius: 50%; margin-left: 5px; margin-top:7px"
                                                    />
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
            </Accordion.Root> */}
        </div>
    );
}
