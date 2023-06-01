import { A } from "@solidjs/router";
import { ComponentProps } from "../../../utils/Form";
import { IdAttr } from "../../../lib/graph";

export function TodaysEnergizerSection(props: ComponentProps) {
  return (
    <div class="pt:10">
      <header class="flex ai:center jc:space-between">
        <h3>{props.data.P["title"]}</h3>
        <A
          href="src/pages/home/components/TodaysEnergizerSection#"
          class="text-decoration:none color:white bg:#f22952 p:3|10 r:5"
        >
          View all
        </A>
      </header>

      <div>
        {props.data.P[props.meta.P[IdAttr]].map((item: any) => {
          return (
            <div>
              <img src={item.image} alt="" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
