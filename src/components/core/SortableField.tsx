import { ComponentProps } from "./Form";
import { createEffect, For, Show } from "solid-js";
import Sortable, { Properties } from "devextreme/ui/sortable";
import ScrollView from "devextreme/ui/scroll_view";
// @ts-ignore
import { tasks, employees } from "../data/sortableData";
import "../assets/styles/sortable.css";

const statuses = [
  "Not Started",
  "Need Assistance",
  "In Progress",
  "Deferred",
  "Completed",
];

export default function SortableKanban(props: ComponentProps) {
  function renderKanban(container: HTMLElement, statusList: string[]) {
    statusList.forEach((status) => {
      renderList(container, status);
    });

    container.classList.add("sortable-board");
    new ScrollView(container, {
      direction: "horizontal",
      showScrollbar: "always",
    });

    container.classList.add("sortable-lists");

    const sortable = new Sortable(container, {
      filter: ".list",
      itemOrientation: "horizontal",
      handle: ".list-title",
      moveItemOnDrop: true,
    });
  }

  function renderList(container: HTMLElement, status: string) {
    const divEl = document.createElement("div");
    divEl.classList.add("list");
    const list = container.appendChild(divEl);

    renderListTitle(list, status);

    const listTasks = tasks.filter((task) => task.Task_Status === status);

    renderCards(list, listTasks);
  }

  function renderListTitle(container: HTMLElement, status: string) {
    const divEl = document.createElement("div");
    divEl.classList.add("list-title", "dx-theme-text-color");
    divEl.textContent = status;
    container.appendChild(divEl);
  }

  function renderCards(container: HTMLElement, tasks: any[]) {

    const scroll = document.createElement("div");
    const items = document.createElement("div");

    container.appendChild(scroll);
    scroll.appendChild(items);

    tasks.forEach((task) => {
        renderCard(items, task);
    });

    scroll.classList.add("scrollable-list");
    items.classList.add("sortable-cards");

    new ScrollView(scroll, {
        direction: "vertical",
        showScrollbar: "always",
    });

    new Sortable(items, {
        group: "tasksGroup",
        moveItemOnDrop: true,
    });
  }

  function renderCard(container: HTMLElement, task: any) {
    const divEl = document.createElement("div");
    divEl.classList.add("card", "dx-card", "dx-theme-text-color", "dx-theme-background-color");
    const item = container.appendChild(divEl);

    const employee = employees.filter((e) => e.ID === task.Task_Assigned_Employee_ID)[0];

    const divEl1 = document.createElement("div");
    divEl1.classList.add("card-priority", `priority-${task.Task_Priority}`);
    item.appendChild(divEl1);

    const divEl2 = document.createElement("div");
    divEl2.classList.add("card-subject");
    divEl2.textContent = task.Task_Subject;
    item.appendChild(divEl2);

    const divEl3 = document.createElement("div");
    divEl3.classList.add("card-assignee");
    divEl3.textContent = employee.Name;
    item.appendChild(divEl3);
  }

  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        id="sortable1"
        ref={(el) => {
          {
            renderKanban(el, statuses);
          }
        }}
      />

      <Show when={props.errors}>
        <For each={Object.values(props.errors!)}>
          {(errorMsg: string) => <small>{errorMsg}</small>}
        </For>
      </Show>
    </div>
  );
}
