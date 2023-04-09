import {createEffect, For, Show} from "solid-js";
import {ComponentProps, Vertex} from "./Form";
import Gantt, {Properties} from "devextreme/ui/gantt";
import {newVertex} from "./utils";
import { tasks, dependencies, resources, resourceAssignments} from '../data/ganttData'

const ganttData = [
  {
    id: 1,
    title: "Market Analysis",
    start: "2019-01-05",
    end: "2019-01-13",
    progress: 100
  },
  {
    id: 2,
    title: "Feature Planning",
    start: "2019-01-13",
    end: "2019-02-02",
    progress: 100
  },
  {
    id: 3,
    title: "Implementation",
    start: "2019-02-02",
    end: "2019-03-21",
    progress: 35
  },
  {
    id: 4,
    title: "Demos",
    start: "2019-02-28",
    end: "2019-03-21",
    progress: 0
  },
  {
    id: 5,
    title: "Docs",
    start: "2019-02-28",
    end: "2019-03-21",
    progress: 0
  },
  {
    id: 6,
    title: "Testing",
    start: "2019-03-21",
    end: "2019-04-05",
    progress: 0
  },
  {
    id: 7,
    title: "Bug Fixing",
    start: "2019-03-21",
    end: "2019-04-15",
    progress: 0
  },
  {
    id: 8,
    title: "Feature Release",
    start: "2019-04-15",
    end: "2019-04-15"
  }
]

export function GanttComponent() {
  const meta = newVertex(0, ["Meta"], {
    id: "meta",
    props: { },
  });

  const data = newVertex(0, ["Vertex"], { meta: ganttData });
  const setValue = (attribute: Vertex, data: any) => {
    console.log(attribute, data);
  };

  return <GanttField meta={meta} data={data} setValue={setValue} />
}
export function GanttField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new Gantt(el, {
            tasks: {
              dataSource: tasks,
            },
            dependencies: {
              dataSource: dependencies,
            },
            resources: {
              dataSource: resources,
            },
            resourceAssignments: {
              dataSource: resourceAssignments,
            },
            editing: {
              enabled: true,
            },
            validation: {
              autoUpdateParentTasks: true,
            },
            toolbar: {
              items: [
                'undo',
                'redo',
                'separator',
                'collapseAll',
                'expandAll',
                'separator',
                'addTask',
                'deleteTask',
                'separator',
                'zoomIn',
                'zoomOut',
              ],
            },
            columns: [{
              dataField: 'title',
              caption: 'Subject',
              width: 300,
            }, {
              dataField: 'start',
              caption: 'Start Date',
            }, {
              dataField: 'end',
              caption: 'End Date',
            }],
            scaleType: 'weeks',
            taskListWidth: 500,
          });

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
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