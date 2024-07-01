import { For, Show, createEffect, createSignal, onCleanup } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import {Breadcrumb} from "~/components/Breadcrumb";
import { useToast } from "~/components/Toast";
import { getUsers } from "~/cypher/get/adminFunctions";
import { syncNodesMGCall } from "~/cypher/mutate/sync";

// TODO: Full Navbar Sync from super
const transferNodes = [
  { key: "Component", value: "Comp" },
  { key: "Data Type", value: "DataType" },
  { key: "Navigation", value: "Nav" },
];

export function SyncData() {
  const { showLoadingToast } = useToast();
  const [users, setUsers] = createSignal([] as Vertex[]);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedUsers, setSelectedUsers] = createSignal([] as Vertex[]);

  getUsers().then((res: any) => {
    setUsers(res.vertexes || []);
  });

  async function migrateNodes(element: Vertex, node: any) {
    const result = await syncNodesMGCall({
      nodesToTransfer: node,
      userport: element.P.driverPort,
    });
    return result; // Ensure result has the expected structure
  }

  const onClickTransfer = (node: any) => {
    selectedUsers().forEach(async (element) => {
      await showLoadingToast({
        errorMessage: `Error Transfering nodes for ${element.P.username}`,
        loadMessage: "Transfering nodes...",
        onSuccess: (value) => {
          setSelectedUsers([]);
        },
        promise: migrateNodes(element, node),
        successMessage: `Transfer completed successfully for ${element.P.username}`,
      });
    });
  };

  return (
    <>
      <Breadcrumb
        breadcrumb={[
          { href: "/admin", icon: "clarity:administrator-line", name: "Admin" },
          { name: "Sync" },
        ]}
        title="Sync"
      />

      <div class="position:relative  overflow-x:auto  box-shadow:0|4px|6px|-1px|rgba(0,0,0,0.1),0|2px|4px|-1px|rgba(0,0,0,0.06)  r:0.5rem@sm">
        {TableActions()}
        {Table()}
        {transferPart()}
      </div>
    </>
  );

  function Table() {
    const [currentPage, setCurrentPage] = createSignal(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(users().length / itemsPerPage);
    const filteredUsers = () => {
      if (!searchQuery()) {
        return users();
      }
      const query = searchQuery().toLowerCase();
      return users().filter(
        (user) =>
          user.P.username.toLowerCase().includes(query) ||
          user.P.email.toLowerCase().includes(query),
      );
    };
    const handleCheckboxChange = (userId: any) => {
      setSelectedUsers((prev: any) => {
        if (prev.includes(userId)) {
          return prev.filter((id: any) => id !== userId);
        }
        return [...prev, userId];
      });
    };

    const handleSelectAll = () => {
      const allSelected = displayedUsers().every((user) =>
        selectedUsers().includes(user),
      );
      if (allSelected) {
        setSelectedUsers((prev) =>
          prev.filter((id) => !displayedUsers().some((user) => user === id)),
        );
      } else {
        setSelectedUsers((prev) => [
          ...new Set([...prev, ...displayedUsers().map((user) => user)]),
        ]);
      }
    };
    const displayedUsers = () => {
      const start = (currentPage() - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredUsers().slice(start, end);
    };
    const rows = () => [
      {
        key: "profile",
        label: "Profile",
      },
      {
        key: "P.labPort",
        label: "Lab Port",
      },
      {
        key: "P.subdomain",
        label: "Subdomain",
      },
    ];

    return (
      <>
        <table class="width:100% f:0.875rem lh:1.25rem text-align:left text-align:right color:rgb(107,114,128) color:rgb(156,163,175)@dark">
          <thead class="f:0.75rem lh:1rem color:rgb(55,65,81) text-transform:uppercase bg:rgb(249,250,251) bg:rgb(55,65,81)@dark color:rgb(156,163,175)@dark">
            <tr>
              <th class="p:1rem" scope="col">
                <div class="flex ai:center">
                  <input
                    checked={displayedUsers().every((user) =>
                      selectedUsers().includes(user),
                    )}
                    class="w:1rem h:1rem color:rgb(37,99,235) bg:rgb(243,244,246) border-color:rgb(209,213,219) r:0.25rem"
                    id="checkbox-all-search"
                    onChange={handleSelectAll}
                    type="checkbox"
                  />
                  <label class="sr-only" for="checkbox-all-search">
                    checkbox
                  </label>
                </div>
              </th>
              <For each={rows()}>
                {(row) => (
                  <th class="px:1.5rem py:0.75rem" scope="col">
                    {row.label}
                  </th>
                )}
              </For>
              <th class="px:1.5rem py:0.75rem" scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={displayedUsers()}>
              {(user) => (
                <tr class="bg:rgb(255,255,255) border-bottom-width:1px bg:rgb(31,41,55)@dark border-color:rgb(55,65,81)@dark bg:rgb(249,250,251):hover bg:rgb(75,85,99):hover@dark">
                  <td class="w:1rem p:1rem">
                    <div class="flex ai:center">
                      <input
                        checked={selectedUsers().includes(user)}
                        class="w:1rem h:1rem color:rgb(37,99,235) bg:rgb(243,244,246) border-color:rgb(209,213,219) r:0.25rem"
                        id={`checkbox-table-search-${user.id}`}
                        onChange={() => handleCheckboxChange(user)}
                        type="checkbox"
                      />

                      <label
                        class="sr-only"
                        for={`checkbox-table-search-${user.id}`}
                      >
                        checkbox
                      </label>
                    </div>
                  </td>
                  <For each={rows()}>
                    {(row) => (
                      <td class="px:1.5rem py:1rem">
                        {row.key === "profile" ? (
                          <div class="flex ai:center">
                            <img
                              alt={"image"}
                              class="object-fit:cover w:2.5rem h:2.5rem r:9999px"
                              src={
                                user.P.profileImage ||
                                "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
                              }
                            />
                            <div class="ml:13">
                              <div class="f:1rem lh:1.5rem font-weight:600">
                                {user.P.username}
                              </div>
                              <div class="font-weight:400 color:rgb(107,114,128)">
                                {user.P.email}
                              </div>
                            </div>
                          </div>
                        ) : (
                          user.P[row.key.split(".")[1]]
                        )}
                      </td>
                    )}
                  </For>
                  <td class="px:1.5rem py:1rem">
                    <a
                      class="font-weight:500 color:rgb(37,99,235) color:rgb(59,130,246)@dark text-decoration:underline:hover"
                      data-modal-show="editUserModal"
                      href="#"
                      type="button"
                    >
                      Edit user
                    </a>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
        <nav
          aria-label="Table navigation"
          class="p:10  flex ai:center flex-column flex-wrap:wrap flex-direction:row@md justify-content:space-between pt:1rem"
        >
          <span class="f:0.875rem lh:1.25rem font-weight:400 color:rgb(107,114,128) color:rgb(156,163,175)@dark mb:1rem mb:0@md display:block width:100% display:inline@md width:auto@md">
            Showing{" "}
            <span class="font-weight:600 color:rgb(17,24,39) color:rgb(255,255,255)@dark">
              {(currentPage() - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span class="font-weight:600 color:rgb(17,24,39) color:rgb(255,255,255)@dark">
              {Math.min(currentPage() * itemsPerPage, users().length)}
            </span>{" "}
            of{" "}
            <span class="font-weight:600 color:rgb(17,24,39) ">
              {users().length}
            </span>
          </span>
          <ul class="display:inline-flex ml:-1px --space-x-reverse:1:rtl f:0.875rem lh:1.25rem h:2rem">
            <li>
              <button
                class="flex ai:center justify-content:center px:0.75rem h:2rem ms-0 lh:1.25 color:rgb(107,114,128) bg:rgb(255,255,255) border-width:1px r:5|0|0|5 border-color:rgb(209,213,219) rounded-s-lg bg:rgb(243,244,246):hover color:rgb(55,65,81):hover"
                onClick={() => setCurrentPage(Math.max(currentPage() - 1, 1))}
              >
                Previous
              </button>
            </li>
            <For each={Array.from({ length: totalPages }, (_, i) => i + 1)}>
              {(page) => (
                <li>
                  <button
                    class={`flex ai:center justify-content:center px:0.75rem h:2rem lh:1.25 color:rgb(107,114,128) bg:rgb(255,255,255) border-width:1px border-color:rgb(209,213,219) ${
                      page === currentPage()
                        ? "color:rgb(37,99,235) border-color:rgb(209,213,219) bg:rgb(239,246,255) bg:rgb(219,234,254):hover color:rgb(29,78,216):hover border-color:rgb(55,65,81)@dark bg:rgb(55,65,81)@dark "
                        : "bg:rgb(243,244,246):hover color:rgb(55,65,81):hover bg:rgb(31,41,55)@dark border-color:rgb(55,65,81)@dark color:rgb(156,163,175)@dark bg:rgb(55,65,81):hover@dark color:rgb(255,255,255):hover@dark"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </li>
              )}
            </For>
            <li>
              <button
                class="r:0|5|5|0 flex ai:center justify-content:center px:0.75rem h:2rem lh:1.25 color:rgb(107,114,128) bg:rgb(255,255,255) border-width:1px border-color:rgb(209,213,219) rounded-e-lg bg:rgb(243,244,246):hover color:rgb(55,65,81):hover"
                onClick={() =>
                  setCurrentPage(Math.min(currentPage() + 1, totalPages))
                }
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </>
    );
  }

  function transferPart() {
    return (
      <Show when={selectedUsers().length > 0}>
        <div class="p:10">
          <h3 class="bg:#f4f4f4 r:5 p:3|6 mb:10 font-weight:500 color:rgb(17,24,39)">
            Transfer nodes
          </h3>
          <button
            class="bg:#37c font-weight:500 r:0.5rem  f:0.875rem p:10 m:2"
            onClick={() => {
              onClickTransfer(transferNodes.map((node) => node.value));
            }}
            style={"background-color: lavender"}
            type="button"
          >
            All Nodes
          </button>
          <For each={transferNodes}>
            {(node) => (
              <button
                class="bg:#37c font-weight:500 r:0.5rem  f:0.875rem p:10 m:2"
                onClick={() => {
                  onClickTransfer([node.value]);
                }}
                style={"background-color: lavender"}
                type="button"
              >
                {node.key}
              </button>
            )}
          </For>
        </div>
      </Show>
    );
  }

  function TableActions() {
    const [showModal, setShowModal] = createSignal(false);
    const handleClickOutside: any = (event: {
      target: { closest: (arg0: string) => any };
    }) => {
      if (
        !event.target.closest("#dropdownAction") &&
        !event.target.closest("#dropdownActionButton")
      ) {
        setShowModal(false);
      }
    };

    createEffect(() => {
      if (showModal()) {
        document.addEventListener("click", handleClickOutside);
      } else {
        document.removeEventListener("click", handleClickOutside);
      }

      // Cleanup the event listener when the component is unmounted
      onCleanup(() => {
        document.removeEventListener("click", handleClickOutside);
      });
    });
    return (
      <div class="p:10 flex ai:center  jc:space-between  flex-column flex-direction:row@md flex-wrap:wrap  space-y:1rem margin-top:0@md py:1rem bg:rgb(255,255,255)  bg:rgb(17,24,39)@dark">
        <div>
          <button
            class="display:inline-flex  ai:center  color:rgb(107,114,128)  bg:rgb(255,255,255)  border-width:1px  border-color:rgb(209,213,219)  outline:none bg:rgb(243,244,246):hover font-weight:500  r:0.5rem  f:0.875rem lh:1.25rem px:0.75rem py:0.375rem"
            id="dropdownActionButton"
            onClick={() => setShowModal(!showModal())}
            type="button"
          >
            <span class="sr-only">Action button</span>
            Action
            <svg
              aria-hidden="true"
              class="w:0.625rem m:5 h:0.625rem ms-2.5"
              fill="none"
              viewBox="0 0 10 6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m1 1 4 4 4-4"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
            </svg>
          </button>
          <div
            class="abs z:10 display:none bg:rgb(255,255,255) r:0.5rem  box-shadow:0|1px|3px|0|rgba(0,0,0,0.1),0|1px|2px|0|rgba(0,0,0,0.06)  w:11rem "
            id="dropdownAction"
            style={{ display: showModal() ? "block" : "none" }}
          >
            <ul
              aria-labelledby="dropdownActionButton"
              class="py:0.25rem f:0.875rem lh:1.25rem color:rgb(55,65,81)"
            >
              <li>
                <a
                  class="display:block  px:1rem py:0.5rem bg:rgb(243,244,246):hover  color:rgb(255,255,255):hover@dark"
                  href="#"
                >
                  Reward
                </a>
              </li>
              <li>
                <a
                  class="display:block  px:1rem py:0.5rem bg:rgb(243,244,246):hover  color:rgb(255,255,255):hover@dark"
                  href="#"
                >
                  Promote
                </a>
              </li>
              <li>
                <a
                  class="display:block  px:1rem py:0.5rem bg:rgb(243,244,246):hover  color:rgb(255,255,255):hover@dark"
                  href="#"
                >
                  Activate account
                </a>
              </li>
            </ul>
            <div class="py:0.25rem">
              <a
                class="display:block bt:1px|solid|rgb(252,238,238,1) px:1rem py:0.5rem f:0.875rem lh:1.25rem color:rgb(243,0,0)  bg:rgb(243,244,246):hover"
                href="#"
              >
                Delete User
              </a>
            </div>
          </div>
        </div>
        <label class="sr-only" for="table-search">
          Search
        </label>
        <div class="">
          <input
            class="display:block p:5 f:0.875rem lh:1.25rem color:rgb(17,24,39)  border-width:1px  border-color:rgb(209,213,219)  r:0.5rem  w:20rem bg:rgb(249,250,251) border-color:rgb(59,130,246):focus outline:none"
            id="table-search-users"
            onInput={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or email"
            type="text"
            value={searchQuery()}
          />
        </div>
      </div>
    );
  }
}
