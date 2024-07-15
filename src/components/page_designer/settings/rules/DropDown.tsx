import { createSignal, JSX } from 'solid-js';

type ButtonProps = {
  onClick: () => void;
  children: JSX.Element;
};

function Button(props: ButtonProps) {
  return (
    <button
      type="button"
      class="display:inline-flex width:100% justify-content:center gap-x:0.375rem border-radius:0.375rem bg:rgb(255,255,255) px:0.75rem py:0.5rem f:0.875rem lh:1.25rem font-weight:600 color:rgb(17,24,39) box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) box-shadow:0|0|0|1px|rgba(0,0,0,0.5) ring-inset --ring-color:rgb(209,213,219) bg:rgb(249,250,251):hover"
      id="menu-button"
      aria-expanded="true"
      aria-haspopup="true"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

type DropdownMenuProps = {
  isOpen: boolean;
  children: JSX.Element;
};

function DropdownMenu(props: DropdownMenuProps) {
  return (
    <div
      class={`position:absolute right:0 z:10 mt:0.5rem w:14rem transform-origin:top|right bt:0>*+* bb:1px>*+* bl:1|solid|gray-10>*+* bl:1|solid|gray-10>*+* border-radius:0.375rem bg:rgb(255,255,255) box-shadow:0|10px|15px|-3px|rgba(0,0,0,0.1),0|4px|6px|-2px|rgba(0,0,0,0.05) box-shadow:0|0|0|1px|rgba(0,0,0,0.5) --ring-color:rgb(0,0,0) --ring-opacity:0.05 outline:2px|solid|transparent outline-offset:2px:focus ${
        props.isOpen ? 'block' : 'hidden'
      }`}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabindex="-1"
    >
      {props.children}
    </div>
  );
}

type DropdownItemProps = {
  icon: JSX.Element;
  text: string;
};

function DropdownItem(props: DropdownItemProps) {
  return (
    <div
      class="color:rgb(55,65,81) group flex align-items:center px:1rem py:0.5rem f:0.875rem lh:1.25rem"
      role="menuitem"
    >
      {props.icon}
      {props.text}
    </div>
  );
}

type MenuItem = {
  href: string;
  icon: JSX.Element;
  text: string;
};

type WithIconsProps = {
  menuItems: MenuItem[];
};

export function MenuWithIcons(props: WithIconsProps) {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="position:relative display:inline-block text-align:left">
      <Button onClick={() => setIsOpen(!isOpen())}>
        <>
          Options
          <svg
            class="mr:-0.25rem h:1.25rem w:1.25rem color:rgb(156,163,175)"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </>
      </Button>

      <DropdownMenu isOpen={isOpen()}>
        <>
          {props.menuItems.map((item) => (
            <div class="py:0.25rem" role="none">
              <DropdownItem icon={item.icon} text={item.text} />
            </div>
          ))}
        </>
      </DropdownMenu>
    </div>
  );
}
