import { ComponentProps } from "./Form";
import ResponsiveBox, { Properties } from "devextreme/ui/responsive_box";
import { createEffect, For, Show, onCleanup } from "solid-js";

import { IdAttr } from "../../lib/graph";

export function ResponsiveBoxField(props: ComponentProps) {
  return (
      <div aria-labeledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new ResponsiveBox(el, {
            rows: [{ ratio: 1 }, { ratio: 2 }, { ratio: 1 }],
            cols: [{ ratio: 1 }, { ratio: 2, screen: "lg" }, { ratio: 1 }],
            singleColumnScreen: "sm",
            screenByWidth: (width: number) => {
              return width < 700 ? "sm" : "lg";
            },
            // onOptionChanged: (e) => {
            //   props.setValue(props.meta, e.value);
            // },
          });
          createEffect(
            () =>
              props.data.P[props.meta.P[IdAttr]] &&
              instance.option("value", props.data.P[props.meta.P[IdAttr]]),
          );

        }}
      >
        <div
          class="header"
          data-options="dxItem: {
                    location: [{
                        row: 0,
                        col: 0,
                        colspan: 3,
                        screen: 'lg'
                    }, {
                        row: 0,
                        col: 0,
                        colspan: 2,
                        screen: 'sm'
                    }]
                }"
        >
          <p>Header</p>
        </div>
        <div
          class="content"
          data-options="dxItem: {
                    location: [{
                        row: 1,
                        col: 1,
                        screen: 'lg'
                    }, {
                        row: 1,
                        col: 0,
                        colspan: 2,
                        screen: 'sm'
                    }]
                }"
        >
          <p>Content</p>
        </div>
        <div
          class="left-side-bar"
          data-options="dxItem: {
                    location: [{
                        row: 1,
                        col: 0,
                        screen: 'lg'
                    }, {
                        row: 2,
                        col: 0,
                        screen: 'sm'
                    }]
                }"
        >
          <p>Left Bar</p>
        </div>
        <div
          class="right-side-bar"
          data-options="dxItem: {
                    location: [{
                        row: 1,
                        col: 2,
                        screen: 'lg'
                    }, {
                        row: 2,
                        col: 1,
                        screen: 'sm' }]
                    }"
        >
          <p>Right Bar</p>
        </div>
        <div
          class="footer"
          data-options="dxItem: {
                    location: [{
                        row: 2,
                        col: 0,
                        colspan: 3,
                        screen: 'lg'
                    }, {
                        row: 3,
                        col: 0,
                        colspan: 2,
                        screen: 'sm' }]
                    }"
        >
          <p>Footer</p>
        </div>
      </div>
  );
}
