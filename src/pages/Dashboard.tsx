import {A, useLocation} from "@solidjs/router";
// import {get, set} from "idb-keyval";
import {
    createEffect,
    createSignal,
    For,
    JSX,
    lazy,
    Show,
    useContext,
} from "solid-js";
import {getNewGraphId, GraphContext} from "../lib/graph";
import Dismiss from "solid-dismiss";
import {Navbar} from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {APP_BASE_URL, PageContext} from "../lib/Utils";
import {addNewVertex, mergeVertexProperties, newVertex} from "../lib/Vertex";
import {isLoginPage, isSignUpPage, setIsLoginPage, setSignUpPage} from "../signals/common";
import '../components/css/modal.css'
import {Icon} from "@iconify-icon/solid";
import '../components/css/modal.css'
import {getUser, logout} from "~/pages/auth/auth";
import {createStore} from "solid-js/store";

// const IS_SIDEBAR_OPEN_KEY = "isSideBarOpen";

// @ts-ignore
const GraphViewPage = lazy(() => import("./GraphViewPage"));

const border = "|solid|rgb(212,219,231)";
const [isSideBarOpen, setSideBarOpen] = createSignal(true);
// get(IS_SIDEBAR_OPEN_KEY).then((data) => setSideBarOpen(data));

// Todo use mastercss
// const AlertDisplay = () => {
//     const {alerts, setAlert} = useContext(AlertMessageContext);
//     return (
//         <For each={alerts}>
//             {(alert, index) => (
//                 <div
//                     color={alert.state}
//                     // @ts-ignore
//                     isClosable={true}
//                     content={alert.message}
//                     duration={5000}
//                     // onHide={() =>
//                     //     setAlert((prev) => prev.filter((_, i) => i !== index()))
//                     // }
//                 />
//             )}
//         </For>
//     );
// };

// Best Template: https://www.tailwind-kit.com/templates#dashboard
export const FullDashboard = (props: { children?: JSX.Element }) => {
    const [graph, setGraph] = useContext(GraphContext)!;
    const vertexId = getNewGraphId();
    addNewVertex(
        0,
        newVertex(vertexId, ["MainNavBarTitle"], {class: `bb:1${border}`}), graph, setGraph
    );

    const location = useLocation();
    const [isShowDrawer, setIsShowDrawer] = createSignal(true);
    const [userData, setUserData] = createStore({});


    getUser().then(value => {
        setUserData(value)
        console.log(value)
    });

    createEffect(() => {
        const path = location.pathname;

        setIsLoginPage(path.includes("/auth/login"));
        setSignUpPage(path.includes("/auth/signup"));
        setIsShowDrawer(
            !(
                path.includes("/auth/login") ||
                path.includes("/auth/signup") ||
                path.includes("/admin/Page/")
            )
        );

    });

    return (
        <div class="flex">
            <Show when={isSideBarOpen() && isShowDrawer()}>
                <Sidebar isSideBarOpen={isSideBarOpen()}/>
            </Show>
            <div
                class={`${
                    isSideBarOpen() && isShowDrawer() ? "ml:220" : ""
                } flex:1 transition:margin-left|200ms|ease-in-out`}
            >
                <div class="flex flex:col flex:1">
                    <PageContext.Provider
                        value={{
                            events: {
                                setSideBarOpen,
                                setTitle: (title: string) =>
                                    mergeVertexProperties(0, vertexId, graph, setGraph, {title}),
                            },
                        }}
                    >
                        <Show when={!isLoginPage() && !isSignUpPage()}>
                            <Navbar
                                showNavBar={isShowDrawer()}
                                toggleSidebar={() => {
                                    // set(IS_SIDEBAR_OPEN_KEY, !isSideBarOpen());
                                    setSideBarOpen((prev) => !prev);
                                }}
                                right={
                                    <>
                                        <div class="container">
                                            <DropdownMenu isLoggedIn={graph.member?.id} user={userData}/>
                                        </div>
                                    </>
                                }
                                meta={graph.vertexes[vertexId]}
                            />
                        </Show>

                        {/*<AlertDisplay/>*/}
                        <main class="p:10 bg:white">
                            <Show when={graph.initialSynced}>{props.children}</Show>
                        </main>
                    </PageContext.Provider>
                </div>
            </div>
        </div>
    );
};

const DropdownMenu = (props: { isLoggedIn: boolean, user: { [key: string]: any } }) => {
    const [isOpen, setIsOpen] = createSignal(false);
    let btnEl: any;
    let dropdownContainerEl: any;
    const handleOpen = () => {
        setIsOpen(true);
    };
    const handleClose = () => {
        setIsOpen(false);
    };

    createEffect(() => {
        if (isOpen()) {
            const {bottom, left, width} = btnEl.getBoundingClientRect();
            const {scrollX, scrollY} = window;

            dropdownContainerEl.style.position = "absolute";
            dropdownContainerEl.style.top = bottom + scrollY + "px";
            dropdownContainerEl.style.left = left + scrollX + "px";
            dropdownContainerEl.style.width = width + "px";
            dropdownContainerEl.style.zIndex = "100";
        }
    });

    return (
        <>
            <button
                id="dropdown-toggle"
                ref={btnEl}
                onClick={handleOpen}
                class={'flex ai:center bg:rgb(229,234,253) bg:rgb(190,211,238,.7):hover p:.2rem|.3rem r:6|6|6|6'}
                style="border: none; cursor: pointer;background-color:rgb(237,237,255)"
            >
                <img
                    src="https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
                    alt="profile"
                    style="width: 40px; height: 40px;"
                />
                <div class={'ml:5 mr:1rem'}>
                    <div class={'text-align:start f:15 font-weight:bold'}>{props.user.properties?.username ?? 'anonymus'}</div>
                    <div class={'text-align:start f:13'}>{props.user.properties?.email ?? 'anonymus@gmail.com'}</div>
                </div>
                <div>
                    <Icon
                        icon="mingcute:down-fill"
                        class={"transform 2s ease-in-out"}
                        height={25} width={25}
                        style={{
                            transition: "transform 0.2s linear",
                            "margin-top": "7px",
                            color: 'royalblue',
                            transform: `${
                                !isOpen()
                                    ? "rotate(0deg)"
                                    : "rotate(180deg)"
                            }`,
                        }}
                    />
                </div>
            </button>
            <Dismiss
                menuButton={btnEl}
                open={isOpen}
                setOpen={setIsOpen}
                mount="body"
                overlay
                cursorKeys
                ref={dropdownContainerEl}
            >
                <div
                    style={`position: absolute; top: calc(100% + 5px); background-color: #fff; border: 1px solid #ccc; border-radius: 5px; padding: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); opacity: ${
                        isOpen() ? 1 : 0
                    }; pointer-events: ${
                        isOpen() ? "auto" : "none"
                    }; transition: opacity 0.2s ease-in-out; width: 100%; right: -15px`} // Adjust width here
                >
                    <div style="position:fixed; top:0; left:0; bottom:0; right:0; background:#01093138; z-index:-1;"
                         onClick={handleClose}></div>
                    <ul style="list-style-type: none; padding: 0; margin: 0; position:relative;">
                        {props.isLoggedIn ? ( // Conditionally render "Log Out" link if user is logged in
                            <div>
                                <li style="margin-bottom: 5px;">
                                    <A
                                        href={`/auth/login`}
                                        replace={true}
                                        onclick={() => {
                                            setIsOpen(false);
                                        }}
                                        class="bg:rgb(229,234,253):hover r:5|5|5|5"
                                        style="text-decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 3px 7px;"

                                    >
                                        <Icon height={22} width={22} icon={'ic:twotone-login'}/>Log In
                                    </A>
                                </li>
                                <li style="margin-bottom: 5px;">
                                    <A
                                        href={`/auth/signup`}
                                        replace={true}
                                        onclick={() => {
                                            setIsOpen(false);
                                        }}
                                        class="bg:rgb(229,234,253):hover r:5|5|5|5"
                                        style="text-decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 3px 7px;"

                                    >
                                        <Icon height={22} width={22} icon={'mdi:register-outline'}/>Sign Up
                                    </A>
                                </li>
                            </div>
                        ) : (
                            <div>
                                <li style="margin-bottom: 5px;">
                                    <A
                                        href={`${APP_BASE_URL}/`}
                                        onclick={() => {
                                            setIsOpen(false);
                                        }}
                                        class="bg:rgb(229,234,253):hover r:5|5|5|5"
                                        style="text-decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 3px 7px;"

                                    >
                                        <Icon height={22} width={22} icon={'tdesign:edit'}/>Edit
                                    </A>
                                </li>

                                <li style="margin-top: 5px;">
                                    <A
                                        href={`${APP_BASE_URL}/setting`}
                                        onclick={() => {
                                            setIsOpen(false);
                                        }}
                                        class="bg:rgb(229,234,253):hover r:5|5|5|5"
                                        style="text  -decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 3px 7px;"

                                    >
                                        <Icon height={22} width={22} icon={'solar:settings-linear'}/>Setting
                                    </A>
                                </li>
                                <li style="margin-top: 5px;">
                                    <A
                                        href={`${APP_BASE_URL}/`}
                                        onclick={() => {
                                            setIsOpen(false);
                                        }}
                                        class="bg:rgb(229,234,253):hover r:5|5|5|5"
                                        style="text  -decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 3px 7px;"

                                    >
                                        <Icon height={22} width={22} icon={'material-symbols:help-outline'}/>Help
                                    </A>
                                </li>
                                <hr style="color:lightgrey" class={'mt:.5rem'}/>
                                <li style="margin-top: 5px;">
                                    <A
                                        href={`/`}
                                        onClick={async () => {
                                            await logout();
                                            setIsOpen(false);
                                        }}
                                        class="bg:rgb(229,234,253):hover r:5|5|5|5"
                                        style="text  -decoration: none; color: #333; display: flex; align-items: center; justify-content: space-between; padding: 3px 7px; font-weight:bold"

                                    >
                                        <Icon height={22} width={22} icon={'tabler:logout'}/>Log Out
                                    </A>
                                </li>
                            </div>
                        )}
                    </ul>
                </div>
            </Dismiss>
        </>
    );
};
