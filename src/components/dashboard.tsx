import { createSignal, For } from "solid-js";

import { Dialog, DialogPanel, Fragment, Menu, MenuItem, Popover, PopoverButton, PopoverPanel, Transition, TransitionChild } from "solid-headless";

import { Icon } from "@amoutonbrady/solid-heroicons";
import { bell, clock, cog, creditCard, documentReport, home, menuAlt_1, questionMarkCircle, scale, shieldCheck, userGroup, xCircle } from "@amoutonbrady/solid-heroicons/outline";
import { cash, checkCircle, chevronDown, chevronRight, officeBuilding, search } from "@amoutonbrady/solid-heroicons/solid";
import clsx from "clsx";
import { Link, Route, Routes } from "solid-app-router";

import SchemaDetail from "./core/schemaDetail";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { CollectionEditor } from "./collection_editor";

const navigation = [
  { name: "Home", href: "/", icon: home, current: true },
  { name: "Attributes", href: "/attributes", icon: clock, current: false },
  { name: "Collections", href: "/collections", icon: scale, current: false },
  { name: "New Collection", href: "/collections/new", icon: scale, current: false },
];

const secondaryNavigation = [
  { name: "Settings", href: "#", icon: cog },
  { name: "Help", href: "#", icon: questionMarkCircle },
  { name: "Privacy", href: "#", icon: shieldCheck },
];
const cards = [
  { name: "Account balance", href: "#", icon: home, amount: "$30,659.45" },
  // More items...
];
const transactions = [
  {
    id: 1,
    name: "Payment to Molly Sanders",
    href: "#",
    amount: "$20,000",
    currency: "USD",
    status: "success" as keyof typeof statusStyles,
    date: "July 11, 2020",
    datetime: "2020-07-11",
  },
  // More transactions...
];
const statusStyles = {
  success: "bg-green-100 text-green-800",
  processing: "bg-yellow-100 text-yellow-800",
  failed: "bg-gray-100 text-gray-800",
};
const [isSideBarOpen, setSidebarOpen] = createSignal(false);

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

//  Static side bar Hidden
export const StaticSideBar = (props: any) => {
  return (
    <>
      <Transition show={props.isOpen()} as={Fragment}>
        <Dialog isOpen={props.isOpen()} as="div" class="relative z-40 lg:hidden" onClose={() => setSidebarOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div class="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </TransitionChild>

          <div class="fixed inset-0 flex z-40">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel class="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-cyan-700">
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div class="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span class="sr-only">Close sidebar</span>
                      <Icon path={xCircle} class="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </TransitionChild>
                <div class="flex-shrink-0 flex items-center px-4">
                  <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/easywire-logo-cyan-300-mark-white-text.svg" alt="Easywire logo" />
                </div>
                <nav class="mt-5 flex-shrink-0 h-full divide-y divide-cyan-800 overflow-y-auto" aria-label="Sidebar">
                  <div class="px-2 space-y-1">
                    <For each={navigation} fallback={<div>Loading...</div>}>
                      {(item) => (
                        <Link
                          href={item.href}
                          class={classNames(
                            item.current ? "bg-cyan-800 text-white" : "text-cyan-100 hover:text-white hover:bg-cyan-600",
                            "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          <Icon path={item.icon} class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" aria-hidden="true" />
                          {item.name}
                        </Link>
                      )}
                    </For>
                  </div>
                  <div class="mt-6 pt-6">
                    <div class="px-2 space-y-1">
                      <For each={secondaryNavigation} fallback={<div>Loading...</div>}>
                        {(item) => (
                          <a href={item.href} class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600">
                            <Icon path={item.icon} class="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" />
                            {item.name}
                          </a>
                        )}
                      </For>
                    </div>
                  </div>
                </nav>
              </DialogPanel>
            </TransitionChild>
            <div class="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition>
      <div class={"hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0"}>
        <div class="flex flex-col flex-grow bg-cyan-700 pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/easywire-logo-cyan-300-mark-white-text.svg" alt="Easywire logo" />
          </div>
          <nav class="mt-5 flex-1 flex flex-col divide-y divide-cyan-800 overflow-y-auto" aria-label="Sidebar">
            <div class="px-2 space-y-1">
              <For each={navigation} fallback={<div>Loading...</div>}>
                {(item) => (
                  <Link
                    href={item.href}
                    class={clsx(
                      item.current ? "bg-cyan-800 text-white" : "text-cyan-100 hover:text-white hover:bg-cyan-600",
                      "group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <Icon path={item.icon} class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" aria-hidden="true" />
                    {item.name}
                  </Link>
                )}
              </For>
            </div>
            <div class="mt-6 pt-6">
              <div class="px-2 space-y-1">
                <For each={secondaryNavigation} fallback={<div>Loading...</div>}>
                  {(item) => (
                    <a href={item.href} class="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600">
                      <Icon path={item.icon} class="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" />
                      {item.name}
                    </a>
                  )}
                </For>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

// Menu Button =

export const MenuButtonToggle = () => {
  return (
    <button
      type="button"
      class="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
      onClick={() => {
        setSidebarOpen(true);
      }}
    >
      <span class="sr-only">Open sidebar</span>
      <Icon path={menuAlt_1} class="h-6 w-6" aria-hidden="true" />
    </button>
  );
};

//  Search bar

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
              <Icon path={search} class="h-5 w-5" aria-hidden="true" />
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
        <button type="button" class="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          <span class="sr-only">View notifications</span>
          <Icon path={bell} class="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Profile dropdown */}
        <Popover as="div" class="ml-3 relative">
          {({ isOpen }) => (
            <>
              <PopoverButton
                class={classNames(isOpen() && "text-opacity-90")}
                onContextMenu={(e: MouseEvent) => {
                  if (e.currentTarget) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setX(e.clientX - rect.left);
                    setY(e.clientY - rect.top);
                  }
                }}
              >
                <div class="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 lg:p-2 lg:rounded-md lg:hover:bg-gray-50 ">
                  <img
                    class="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <span class="hidden ml-3 text-gray-700 text-sm font-medium lg:block">
                    <span class="sr-only">Open user menu for </span>Emilia Birch
                  </span>
                  <Icon path={chevronDown} class={classNames(isOpen() && "text-opacity-90", "hidden flex-shrink-0 ml-1 h-5 w-5 text-gray-400 lg:block")} />
                </div>
              </PopoverButton>
              <Transition
                show={isOpen()}
                // as={Fragment}
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
                    transform: `translateX(${x()}px) translateY(${y()}px)`,
                  }}
                >
                  <Menu class="overflow-hidden w-64 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white flex flex-col space-y-1 p-1">
                    <div class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuItem>
                        {({ disabled }) => (
                          <a href="#" class={classNames(!true ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Your Profile
                          </a>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ disabled }) => (
                          <a href="#" class={classNames(!true ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
                            Settings
                          </a>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ disabled }) => (
                          <a href="#" class={classNames(!true ? "bg-gray-100" : "", "block px-4 py-2 text-sm text-gray-700")}>
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

const Home = () => {
  return (
    <>
      {" "}
      <div class="bg-white shadow">
        <div class="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div class="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-gray-200">
            <div class="flex-1 min-w-0">
              {/* Profile */}
              <div class="flex items-center">
                <img
                  class="hidden h-16 w-16 rounded-full sm:block"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                  alt=""
                />
                <div>
                  <div class="flex items-center">
                    <img
                      class="h-16 w-16 rounded-full sm:hidden"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.6&w=256&h=256&q=80"
                      alt=""
                    />
                    <h1 class="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">Good morning, Emilia Birch</h1>
                  </div>
                  <dl class="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                    <dt class="sr-only">Company</dt>
                    <dd class="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                      <Icon path={officeBuilding} class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Duke street studio
                    </dd>
                    <dt class="sr-only">Account status</dt>
                    <dd class="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0 capitalize">
                      <Icon path={checkCircle} class="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" aria-hidden="true" />
                      Verified account
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="mt-6 flex space-x-3 md:mt-0 md:ml-4">
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Add money
              </button>
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Send money
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-lg leading-6 font-medium text-gray-900">Overview</h2>
          <div class="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card */}

            <For each={cards} fallback={<div>Loading...</div>}>
              {(card) => (
                <div class="bg-white overflow-hidden shadow rounded-lg">
                  <div class="p-5">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <Icon path={creditCard} class="h-6 w-6 text-gray-400" aria-hidden="true" />
                      </div>
                      <div class="ml-5 w-0 flex-1">
                        <dl>
                          <dt class="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                          <dd>
                            <div class="text-lg font-medium text-gray-900">{card.amount}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-5 py-3">
                    <div class="text-sm">
                      <a href={card.href} class="font-medium text-cyan-700 hover:text-cyan-900">
                        View all
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>

        <h2 class="max-w-6xl mx-auto mt-8 px-4 text-lg leading-6 font-medium text-gray-900 sm:px-6 lg:px-8">Recent activity</h2>

        {/* Activity list (smallest breakpoint only) */}
        <div class="shadow sm:hidden">
          <ul role="list" class="mt-2 divide-y divide-gray-200 overflow-hidden shadow sm:hidden">
            <For each={transactions} fallback={<div>Loading...</div>}>
              {(transaction) => (
                <li>
                  <a href={transaction.href} class="block px-4 py-4 bg-white hover:bg-gray-50">
                    <span class="flex items-center space-x-4">
                      <span class="flex-1 flex space-x-2 truncate">
                        <Icon path={cash} class="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <span class="flex flex-col text-gray-500 text-sm truncate">
                          <span class="truncate">{transaction.name}</span>
                          <span>
                            <span class="text-gray-900 font-medium">{transaction.amount}</span> {transaction.currency}
                          </span>
                          <time dateTime={transaction.datetime}>{transaction.date}</time>
                        </span>
                      </span>
                      <Icon path={chevronRight} class="flex-shrink-0 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </a>
                </li>
              )}
            </For>
          </ul>

          <nav class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200" aria-label="Pagination">
            <div class="flex-1 flex justify-between">
              <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500">
                Previous
              </a>
              <a href="#" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:text-gray-500">
                Next
              </a>
            </div>
          </nav>
        </div>

        {/* Activity table (small breakpoint and up) */}
        <div class="hidden sm:block">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col mt-2">
              <div class="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                        Transaction
                      </th>
                      <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                        Amount
                      </th>
                      <th class="hidden px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:block" scope="col">
                        Status
                      </th>
                      <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <For each={transactions} fallback={<div>Loading...</div>}>
                      {(transaction) => (
                        <tr class="bg-white">
                          <td class="max-w-0 w-full px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div class="flex">
                              <a href={transaction.href} class="group inline-flex space-x-2 truncate text-sm">
                                <Icon path={cash} class="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                <p class="text-gray-500 truncate group-hover:text-gray-900">{transaction.name}</p>
                              </a>
                            </div>
                          </td>
                          <td class="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                            <span class="text-gray-900 font-medium">{transaction.amount} </span>
                            {transaction.currency}
                          </td>
                          <td class="hidden px-6 py-4 whitespace-nowrap text-sm text-gray-500 md:block">
                            <span class={classNames(statusStyles[transaction.status], "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize")}>
                              {transaction.status}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                            <time dateTime={transaction.datetime}>{transaction.date}</time>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
                {/* Pagination */}
                <nav class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6" aria-label="Pagination">
                  <div class="hidden sm:block">
                    <p class="text-sm text-gray-700">
                      Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">20</span> results
                    </p>
                  </div>
                  <div class="flex-1 flex justify-between sm:justify-end">
                    <a href="#" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Previous
                    </a>
                    <a
                      href="#"
                      class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Next
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
// Dashboard View

export const DashboardView = () => {
  return (
    <div class="lg:pl-64 flex flex-col flex-1">
      {/* <div class="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-green-200 lg:border-none">
        <MenuButtonToggle />
        <SearchBar />
      </div> */}
      <main class="flex-1 pb-8">
        {/* Page header */}
        <Routes>
          <Route path="/" component={() => <Home />} />
          <Route path="/collections/new" component={() => <CollectionEditor />} />
          <Route path="/:entity" component={() => <SchemaTable />} />
          <Route path="/:entity/:id" component={() => <SchemaDetail />} />
          <Route path="/**" component={() => <Page404 />} />
        </Routes>
      </main>
    </div>
  );
};

export const FullDashboard = () => {
  return (
    <div class="min-h-full bg-gray-100">
      {/* <StaticSideBar isOpen={isSideBarOpen} /> */}
      <DashboardView />
    </div>
  );
};

export default FullDashboard;
