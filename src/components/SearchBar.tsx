import { createSignal } from "solid-js";
import { Icon } from "solid-heroicons";
import { chevronDown, eye } from "solid-heroicons/solid";
import { bell } from "solid-heroicons/outline";
import { Menu, MenuItem, Popover, PopoverButton, PopoverPanel, Transition } from "solid-headless";
import clsx from "clsx";

export const SearchBar = () => {
  const [x, setX] = createSignal(0);
  const [y, setY] = createSignal(0);
  return (
    <div class="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
      <div class="flex-1 flex">
        <form class="w-full flex md:ml-0" action="#" method="get">
          <label html-for="search-field" class="sr-only">
            Search
          </label>
          <div class="relative w-full text-gray-400 focus-within:text-gray-600">
            <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none" aria-hidden="true">
              <Icon path={eye} class="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search-field"
              name="search-field"
              class="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm"
              placeholder="Search transactions"
              type="search"
            />
          </div>
        </form>
      </div>
      <div class="ml-4 flex items-center md:ml-6">
        <button type="button"
                class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          <span class="sr-only">View notifications</span>
          <Icon path={bell} class="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Profile dropdown */}
        <Popover as="div" class="ml-3 relative" defaultOpen={false}>
          {({ isOpen }) => (
            <>
              <PopoverButton
                class={clsx(isOpen() && "text-opacity-90")}
                onContextMenu={(e: MouseEvent) => {
                  if (e.currentTarget) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setX(e.clientX - rect.left);
                    setY(e.clientY - rect.top);
                  }
                }}
              >
                <div
                  class="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 lg:p-2 lg:rounded-md lg:hover:bg-gray-50 ">
                  <img
                    class="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span class="hidden ml-3 text-gray-700 text-sm font-medium lg:block">
                    <span class="sr-only">Open user menu for </span>Emilia Birch
                  </span>
                  <Icon path={chevronDown}
                        class={clsx(isOpen() && "text-opacity-90", "hidden flex-shrink-0 ml-1 h-5 w-5 text-gray-400 lg:block")} />
                </div>
              </PopoverButton>
              <Transition
                show={isOpen()}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <PopoverPanel
                  unmount={false}
                  class="z-10 transition duration-200"
                  style={{
                    transform: `translateX(${x()}px) translateY(${y()}px)`
                  }}
                >
                  <Menu
                    class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white flex flex-col space-y-1 p-1">
                    <div
                      class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem>
                        {({ disabled }) => (
                          <a href="#" class={clsx(!true ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Your Profile
                          </a>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ disabled }) => (
                          <a href="#" class={clsx(!true ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Settings
                          </a>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ disabled }) => (
                          <a href="#" class={clsx(!true ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Logout
                          </a>
                        )}
                      </MenuItem>
                    </div>
                  </Menu>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  );
};