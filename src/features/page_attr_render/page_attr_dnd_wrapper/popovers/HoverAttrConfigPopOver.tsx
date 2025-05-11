import { Icon } from "@iconify-icon/solid";

import { useZIndex } from "~/components/fields/ZIndex";
import { getComponentLabel } from "~/features/page_designer/functions/component/getComponentLabel";
import { iconMap } from "~/lib/ui/iconMap";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { ComponentName } from "../components/ComponentName";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export const HoverAttrConfigPopOver = (props: Readonly<{ item: Vertex }>) => {
  const zIndex = useZIndex();
  const [graph] = useGraph();
  const getComponentName = () => getComponentLabel(graph, props.item);
  return (
    <As
      as="span"
      css={[
        css`
  position: relative;
`,
      ]}
    >
      <As
        as="div"
        css={css`
  display: flex;
  align-items: center;
  background-color: \${args.theme.var.color.primary};
  bottom: 100%;
  color: \${args.theme.var.color.base_5};
  padding: 0.25rem;
  position: absolute;
  border-radius: 5px 5px 0px 0px;
  right: 0px;
  z-index: ${zIndex};
`}
      >
        <As
          as={Icon}
          css={[ICON_BUTTON_STYLES.baseCss]}
          icon={iconMap[getComponentName() as keyof typeof iconMap]}
          noobserver
        />
        <ComponentName componentName={getComponentName()!} />
      </As>
    </As>
  );
};
