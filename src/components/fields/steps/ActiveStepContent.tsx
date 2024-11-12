import { Match, type ParentProps, splitProps, Switch } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";

import { useStepsContext } from "./StepsContext";

export function StepsContent(props: ParentProps<{}>) {
  const [stepsContext] = useStepsContext();
  const [, others] = splitProps(props, ["children"]);
  const namedStepIndex = () =>
    stepsContext
      .stepsWithName()
      .findIndex(
        (step) =>
          step.P.stepName === stepsContext.currentNamedStep(),
      );

  return (
    <Switch>
      <Match keyed when={stepsContext.currentNamedStep()}>
        {(_) => (
          <DynamicComponent
            meta={
              stepsContext.stepsWithName()[namedStepIndex()]
            }
            {...others}
          />
        )}
      </Match>
      <Match
        keyed
        when={
          stepsContext.steps().length > 0 &&
          stepsContext.currentStepIndex() !== undefined &&
          stepsContext.currentStepIndex()! + 1
        }
      >
        {(_) => (
          <DynamicComponent
            meta={
              stepsContext.steps()[
                stepsContext.currentStepIndex()!
              ]
            }
            {...others}
          />
        )}
      </Match>
    </Switch>
  );
}
