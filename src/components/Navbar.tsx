import {Icon} from "@iconify-icon/solid";
import {JSXElement, Match, Show, Switch} from "solid-js";
import {DisplayComponentProps} from "./ComponentType";
import {useNavigate} from "@solidjs/router";
import './css/sideBarSearch.css';
import {currentTheme, onChangeTheme} from "./css/Theme";
import './css/table.css'

function NavToggleBtn(props: { toggleSidebar: () => void }) {
    return (
        <>
            <input type="checkbox" id="checkbox" onClick={props.toggleSidebar}/>
            <label for="checkbox" class="toggle">
                <div class="bars" id="bar1"></div>
                <div class="bars" id="bar2"></div>
                <div class="bars" id="bar3"></div>
            </label>
        </>);
}

export function Navbar(
    props: DisplayComponentProps & {
        left?: JSXElement;
        right?: JSXElement;
        showNavBar: boolean;
        toggleSidebar: () => void;
    }
) {
    // let {events} = useContext(PageContext);
    // bg:white box-shadow:1|1|10|#ddd
    const navigate = useNavigate();
    return (
        <nav
            class={`p:10 flex jc:space-between ai:center r:0|0|10|10 ${
                props.meta?.P.class || ""
            }`}
        >
            <Show
                when={
                    props.meta?.P.menuPosition === "left" || !props.meta?.P.menuPosition
                }
            >
                <Show
                    when={props.showNavBar}
                    fallback={
                        <div
                            class="bg:rgb(255,253,253) flex ai:center jc:center bg:rgb(232,229,229):hover r:5|5|5|5 h:30px w:30px cursor:pointer"
                            onclick={() => {
                                navigate("/Page");
                            }}
                            title="Back"
                        >


                            <Icon
                                icon={"flowbite:caret-left-outline"}
                                class={'color:black:hover color:lightgrey'}
                                height={30}
                                width={30}
                            />
                        </div>
                    }
                >
                    <NavToggleBtn toggleSidebar={props.toggleSidebar}/>
                </Show>
            </Show>

            {props.left}

            {/*<div class="f:16 font-weight:bold">{props.meta?.P?.title}</div>*/}
            {/*  Theme Change Button*/}
            {/*<button class="px:5x r:2x font:18 h:48 bg:slate-10@light bg:gray-80@dark fg:strong rel">
        <Switch>
          <Match when={currentTheme() === 'dark'}>
            <span>🌜 Dark Theme</span>
          </Match>
          <Match when={currentTheme() === 'light'}>
            <span>☀️ Light Theme</span>
          </Match>
          <Match when={true}>
            <span>{currentTheme().charAt(0).toUpperCase() + currentTheme().slice(1)} Theme</span>
          </Match>
        </Switch>
        <select
          class="abs full inset:0 opacity:0"
          value={currentTheme()}
          onChange={onChangeTheme}
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌜 Dark</option>
          <option value="system">System</option>
        </select>
      </button>*/}


            {/* Actions */}
            <div class="flex ai:center jc:center gap:8">
                {props.right}
                <Show when={props.meta?.P.menuPosition === "right"}>

                    <NavToggleBtn toggleSidebar={props.toggleSidebar}/>
                </Show>
            </div>
        </nav>
    );
}
