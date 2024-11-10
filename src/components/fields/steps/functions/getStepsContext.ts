import { useContext } from "solid-js";

import type { StepsContext } from "~/components/fields/steps/StepsContext";

import { useKeyedContext } from "@corvu/utils/create/keyedContext";

export function getStepsContext() {
  const stepsContextProvider = useKeyedContext("steps") as typeof StepsContext;
  return useContext(stepsContextProvider);
}
