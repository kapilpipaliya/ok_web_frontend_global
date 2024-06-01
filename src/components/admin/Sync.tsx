import {
  For,
  JSX,
  Show,
  createEffect,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";
import PageHeader from "../custom/Breadcumb";
import { getUsers } from "../../cypher_api/functions/get/adminFunctions";
import { useToast } from "../custom/Toast";
import { syncNodesMGCall } from "~/cypher_api/functions/mutate/sync";
import type { Vertex } from "~/lib/graph/graph";

// TODO: Full Navbar Sync from super
const transferNodes = [
  { key: "Component", value: "Comp" },
  { key: "Data Type", value: "DataType" },
  { key: "Navigation", value: "Nav" },
];

export function SyncComopnent() {
  const { showLoadingToast } = useToast();
  const [users, setUsers] = createSignal([] as Vertex[]);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedUsers, setSelectedUsers] = createSignal([] as Vertex[]);

  getUsers().then((res: any) => {
    setUsers(res.vertexes || []);
  });

  async function migrateNodes(element: Vertex, node: any) {
    const result = await syncNodesMGCall({
      userport: element.P.driverPort,
      nodesToTransfer: node,
    });
    return result; // Ensure result has the expected structure
  }

  const onClickTransfer = (node: any) => {
    selectedUsers().forEach(async (element) => {
      await showLoadingToast({
        promise: migrateNodes(element, node),
        loadMessage: "Transfering nodes...",
        successMessage:
          "Transfer completed successfully for " + element.P.username,
        errorMessage: "Error Transfering nodes for " + element.P.username,
        onSuccess: (value) => {
          setSelectedUsers([]);
        },
      });
    });
  };

  return (
    <>
      <PageHeader
        title="Sync"
        breadcrumb={[
          { name: "Admin", icon: "clarity:administrator-line", href: "/admin" },
          { name: "Sync" },
        ]}
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
        } else {
          return [...prev, userId];
        }
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
              <th scope="col" class="p:1rem">
                <div class="flex ai:center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    class="w:1rem h:1rem color:rgb(37,99,235) bg:rgb(243,244,246) border-color:rgb(209,213,219) r:0.25rem"
                    checked={displayedUsers().every((user) =>
                      selectedUsers().includes(user),
                    )}
                    onChange={handleSelectAll}
                  />
                  <label for="checkbox-all-search" class="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <For each={rows()}>
                {(row) => (
                  <th scope="col" class="px:1.5rem py:0.75rem">
                    {row.label}
                  </th>
                )}
              </For>
              <th scope="col" class="px:1.5rem py:0.75rem">
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
                        id={`checkbox-table-search-${user.id}`}
                        type="checkbox"
                        class="w:1rem h:1rem color:rgb(37,99,235) bg:rgb(243,244,246) border-color:rgb(209,213,219) r:0.25rem"
                        checked={selectedUsers().includes(user)}
                        onChange={() => handleCheckboxChange(user)}
                      />

                      <label
                        for={`checkbox-table-search-${user.id}`}
                        class="sr-only"
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
                              class="object-fit:cover w:2.5rem h:2.5rem r:9999px"
                              src={
                                user.P.profileImage ||
                                "https://i.pinimg.com/originals/05/5a/91/055a91979264664a1ee12b9453610d82.png"
                              }
                              alt={`image`}
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
                      href="#"
                      type="button"
                      data-modal-show="editUserModal"
                      class="font-weight:500 color:rgb(37,99,235) color:rgb(59,130,246)@dark text-decoration:underline:hover"
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
          class="p:10  flex ai:center flex-column flex-wrap:wrap flex-direction:row@md justify-content:space-between pt:1rem"
          aria-label="Table navigation"
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
                onClick={() => setCurrentPage(Math.max(currentPage() - 1, 1))}
                class="flex ai:center justify-content:center px:0.75rem h:2rem ms-0 lh:1.25 color:rgb(107,114,128) bg:rgb(255,255,255) border-width:1px r:5|0|0|5 border-color:rgb(209,213,219) rounded-s-lg bg:rgb(243,244,246):hover color:rgb(55,65,81):hover"
              >
                Previous
              </button>
            </li>
            <For each={Array.from({ length: totalPages }, (_, i) => i + 1)}>
              {(page) => (
                <li>
                  <button
                    onClick={() => setCurrentPage(page)}
                    class={`flex ai:center justify-content:center px:0.75rem h:2rem lh:1.25 color:rgb(107,114,128) bg:rgb(255,255,255) border-width:1px border-color:rgb(209,213,219) ${page === currentPage() ? "color:rgb(37,99,235) border-color:rgb(209,213,219) bg:rgb(239,246,255) bg:rgb(219,234,254):hover color:rgb(29,78,216):hover border-color:rgb(55,65,81)@dark bg:rgb(55,65,81)@dark " : "bg:rgb(243,244,246):hover color:rgb(55,65,81):hover bg:rgb(31,41,55)@dark border-color:rgb(55,65,81)@dark color:rgb(156,163,175)@dark bg:rgb(55,65,81):hover@dark color:rgb(255,255,255):hover@dark"}`}
                  >
                    {page}
                  </button>
                </li>
              )}
            </For>
            <li>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(currentPage() + 1, totalPages))
                }
                class="r:0|5|5|0 flex ai:center justify-content:center px:0.75rem h:2rem lh:1.25 color:rgb(107,114,128) bg:rgb(255,255,255) border-width:1px border-color:rgb(209,213,219) rounded-e-lg bg:rgb(243,244,246):hover color:rgb(55,65,81):hover"
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
            onClick={() => {
              onClickTransfer(transferNodes.map((node) => node.value));
            }}
            type="button"
            style={"background-color: lavender"}
            class="bg:#37c font-weight:500 r:0.5rem  f:0.875rem p:10 m:2"
          >
            All Nodes
          </button>
          <For each={transferNodes}>
            {(node) => (
              <button
                onClick={() => {
                  onClickTransfer([node.value]);
                }}
                type="button"
                style={"background-color: lavender"}
                class="bg:#37c font-weight:500 r:0.5rem  f:0.875rem p:10 m:2"
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
            id="dropdownActionButton"
            onClick={() => setShowModal(!showModal())}
            class="display:inline-flex  ai:center  color:rgb(107,114,128)  bg:rgb(255,255,255)  border-width:1px  border-color:rgb(209,213,219)  outline:none bg:rgb(243,244,246):hover font-weight:500  r:0.5rem  f:0.875rem lh:1.25rem px:0.75rem py:0.375rem"
            type="button"
          >
            <span class="sr-only">Action button</span>
            Action
            <svg
              class="w:0.625rem m:5 h:0.625rem ms-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            id="dropdownAction"
            style={{ display: showModal() ? "block" : "none" }}
            class="abs z:10 display:none bg:rgb(255,255,255) r:0.5rem  box-shadow:0|1px|3px|0|rgba(0,0,0,0.1),0|1px|2px|0|rgba(0,0,0,0.06)  w:11rem "
          >
            <ul
              class="py:0.25rem f:0.875rem lh:1.25rem color:rgb(55,65,81)"
              aria-labelledby="dropdownActionButton"
            >
              <li>
                <a
                  href="#"
                  class="display:block  px:1rem py:0.5rem bg:rgb(243,244,246):hover  color:rgb(255,255,255):hover@dark"
                >
                  Reward
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="display:block  px:1rem py:0.5rem bg:rgb(243,244,246):hover  color:rgb(255,255,255):hover@dark"
                >
                  Promote
                </a>
              </li>
              <li>
                <a
                  href="#"
                  class="display:block  px:1rem py:0.5rem bg:rgb(243,244,246):hover  color:rgb(255,255,255):hover@dark"
                >
                  Activate account
                </a>
              </li>
            </ul>
            <div class="py:0.25rem">
              <a
                href="#"
                class="display:block bt:1px|solid|rgb(252,238,238,1) px:1rem py:0.5rem f:0.875rem lh:1.25rem color:rgb(243,0,0)  bg:rgb(243,244,246):hover"
              >
                Delete User
              </a>
            </div>
          </div>
        </div>
        <label for="table-search" class="sr-only">
          Search
        </label>
        <div class="">
          <input
            type="text"
            id="table-search-users"
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.target.value)}
            class="display:block p:5 f:0.875rem lh:1.25rem color:rgb(17,24,39)  border-width:1px  border-color:rgb(209,213,219)  r:0.5rem  w:20rem bg:rgb(249,250,251) border-color:rgb(59,130,246):focus outline:none"
            placeholder="Search by username or email"
          />
        </div>
      </div>
    );
  }
}
