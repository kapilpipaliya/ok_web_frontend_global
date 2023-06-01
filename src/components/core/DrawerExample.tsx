import { createEffect, For, JSXElement, Show, onCleanup } from "solid-js";
import { ComponentProps } from "./Form";
import Drawer, { Properties } from "devextreme/ui/drawer";
import List from "devextreme/ui/list";
import { IdAttr, Vertex } from "../../lib/graph";
import { newVertex } from "../../lib/Vertex";

const navigation = [
  { id: 1, text: "Products", icon: "product" },
  { id: 2, text: "Sales", icon: "money" },
  { id: 3, text: "Customers", icon: "group" },
  { id: 4, text: "Employees", icon: "card" },
  { id: 5, text: "Reports", icon: "chart" },
];

const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Penatibus et magnis dis parturient. Eget dolor morbi non arcu risus. Tristique magna sit amet purus gravida quis blandit. Auctor urna nunc id cursus metus aliquam eleifend mi in. Tellus orci ac auctor augue mauris augue neque gravida. Nullam vehicula ipsum a arcu. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Cursus in hac habitasse platea dictumst. Egestas dui id ornare arcu. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim.Mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. Neque volutpat ac tincidunt vitae semper quis lectus. Sed sed risus pretium quam vulputate dignissim suspendisse in. Urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Amet cursus sit amet dictum sit amet justo donec enim. Vestibulum rhoncus est pellentesque elit ullamcorper. Id aliquet risus feugiat in ante metus dictum at.`;

export function DrawerComponent() {
  const meta = newVertex(0, ["Meta"], {
    [IdAttr]: "meta",
    props: {},
  });

  const data = newVertex(0, ["Vertex"], { meta: navigation });
  const setValue = (attribute: Vertex,vertex:Vertex, data: any) => {
    console.log(attribute, data);
  };

  return (
    <DrawerField meta={meta} data={data} setValue={setValue}>
      {text}
    </DrawerField>
  );
}
export function DrawerField(props: ComponentProps & { children: JSXElement }) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}
        ref={(el) => {
          const instance = new Drawer(el, {
            opened: false,
            height: 300,
            closeOnOutsideClick: true,
            // minSize: 100,
            // maxSize: 200,
            template: function (e) {
              const listInstance = new List(e, {
                dataSource: props.data.P[props.meta.P[IdAttr]],
                hoverStateEnabled: false,
                activeStateEnabled: false,
                focusStateEnabled: false,
                elementAttr: { class: "dx-theme-accent-as-background-color" },
              });
              console.log("listInstance", listInstance, listInstance._$element[0]);
              const drawerContent = listInstance._$element[0];
              drawerContent.setAttribute("style", "width: 200px !important");
              console.log("listInstance el", listInstance._$element[0], drawerContent);
            },
          });

          createEffect(() => {
            // console.log('instance', instance);
            instance.show();
          });


        }}
      >
        <div id="content" class="dx-theme-background-color">
          {props.children}
        </div>
      </div>


  );
}
