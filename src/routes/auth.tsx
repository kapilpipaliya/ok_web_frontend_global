import type { RouteSectionProps } from "@solidjs/router";

import { createSignal, onMount, Show } from "solid-js";

import { LoaderNew } from "~/components/LoaderSimple";
import { GetInitialData } from "~/GetInitialData";
import { getInitialDataAndSetToGraph } from "~/getInitialDataAndSetToGraph";
import { useGraph } from "~/lib/graph/graph";

export default function AuthLayout(props: Readonly<RouteSectionProps>) {
  return <GetInitialData>{props.children}</GetInitialData>;
}
