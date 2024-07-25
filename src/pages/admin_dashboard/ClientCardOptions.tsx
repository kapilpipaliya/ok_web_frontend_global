import { createSignal } from "solid-js";

export function ClientCardOptions(props: { clientName: string; }) {
  const [isDropdownOpen, setDropdownOpen] = createSignal(false);
  const toggleDropdown = () => setDropdownOpen(!isDropdownOpen());

  return (
    <div class="position:relative ml:auto">
      <button
        type="button"
        class="m:-0.625rem display:block p:0.625rem color:rgb(156,163,175) color:rgb(107,114,128):hover"
        id={`options-menu-${props.clientName}-button`}
        aria-expanded={isDropdownOpen()}
        aria-haspopup="true"
        onClick={toggleDropdown}
      >
        <span class="sr-only">Open options</span>
        <svg class="h:1.25rem w:1.25rem" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </svg>
      </button>
      {isDropdownOpen() && (
        <div
          class="position:absolute right:0 z:10 mt:0.125rem w:8rem transform-origin:top|right border-radius:0.375rem bg:rgb(255,255,255) py:0.5rem box-shadow:0|10px|15px|-3px|rgba(0,0,0,0.1),0|4px|6px|-2px|rgba(0,0,0,0.05) box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|calc(1px+5px)|rgba(17,24,39,0.05) outline:2px|solid|transparent outline-offset:2px:focus"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={`options-menu-${props.clientName}-button`}
          tabindex="-1"
        >
          <a
            href="#"
            class="display:block px:0.75rem py:0.25rem f:0.875rem lh:1.25rem leading:1.5rem color:rgb(17,24,39)"
            role="menuitem"
            tabindex="-1"
            id={`options-menu-${props.clientName}-item-0`}
          >
            View<span class="sr-only">, {props.clientName}</span>
          </a>
          <a
            href="#"
            class="display:block px:0.75rem py:0.25rem f:0.875rem lh:1.25rem leading:1.5rem color:rgb(17,24,39)"
            role="menuitem"
            tabindex="-1"
            id={`options-menu-${props.clientName}-item-1`}
          >
            Edit<span class="sr-only">, {props.clientName}</span>
          </a>
        </div>
      )}
    </div>
  );
}
