import { createFileRoute, useParams } from "@tanstack/solid-router";
import { Match, Switch } from "solid-js";

import { PageDesignerLabels } from "~/features/page_designer/functions/PageDesignerLabels";
import { PageDesignerWrapper } from "~/features/page_designer/layout/PageDesignerWrapper";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export const Route = createFileRoute('/admin/_noLayout/$entity/$id/')({
  component: FormEdit,
})

function FormEdit() {
  const params = useParams({strict: false});

  return (
    <Switch>
      <Match
        when={["Component", ...PageDesignerLabels].includes(params().entity)}
      >
        <PageDesignerWrapper />
      </Match>
      <Match when={true}>
        <PageViewWrapper dataId={params().id} pageVertexName={params().entity} />
      </Match>
    </Switch>
  );
}
