import type { RouteSectionProps } from "@solidjs/router";

import { GetInitialData } from "~/GetInitialData";
import { TemplateGraphProvider } from "../pages/TemplateGraphProvider";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  return (
    <GetInitialData>
      <TemplateGraphProvider>{props.children}</TemplateGraphProvider>
    </GetInitialData>
  );
}
