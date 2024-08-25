import { createWritableMemo } from "@solid-primitives/memo";
import { Match, splitProps, Switch } from "solid-js";

import { useFormContext } from "~/components/form/FormContext";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import type { TextFieldOptionsField } from "../../constants/FieldSchemaType";

import { sizeTypes } from "../../constants/csseditor_constants";
import { useCssState } from "../../CssEditorContext";
import { useCssEditorProps } from "../../CSSEditorPropsContext";
import { getCssSelectedFileEdgeName } from "../../utils/getCssSelectedFileEdgeName";
import { CenterDiv } from "../CenterDiv";
import { Container } from "../Container";
import { LabelWrapper } from "../LabelWrapper";
import { TextFieldWithUnitContent } from "./TextFieldWithUnitContent";

export const TextFieldWithSelect = (props: Readonly<TextFieldOptionsField>) => {
  const [graph, setGraph] = useGraph();
  const [formStore] = useFormContext();
  const cssEditorProps = useCssEditorProps();
  const [state] = useCssState();

  // input will automatically display value without units, if its number field.

  const [selectedOption, setSelectedOption] = createWritableMemo(() =>
    determineSelectedOption(),
  );

  function determineSelectedOption(): string {
    return (
      sizeTypes.find((unit) => props.value?.includes(unit)) ??
      props.unitOptions?.[0] ??
      ""
    );
  }
  const [local, _others] = splitProps(props, ["componentName", "onChange"]);

  function changeValue(value?: string) {
    local.onChange?.(value);
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (props.type === "number") {
      handleNumberInputChange(value);
    } else {
      changeValue(value);
    }
  }

  function handleNumberInputChange(value: string) {
    const numericValue = Number.parseFloat(value);
    if (Number.isNaN(numericValue)) {
      return;
    }

    if (
      props.inputProps?.min !== undefined &&
      numericValue < props.inputProps.min
    ) {
      return;
    }
    if (
      props.inputProps?.max !== undefined &&
      numericValue > props.inputProps.max
    ) {
      return;
    }

    changeValue(
      props.unitOptions
        ? `${numericValue}${selectedOption()}`
        : `${numericValue}`,
    );
  }

  const clearFileSelection = () => {
    const txnId = formStore?.txnId;
    if (!txnId) {
      return;
    }
    if (!(cssEditorProps?.meta && cssEditorProps?.data)) {
      return;
    }
    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        type: getCssSelectedFileEdgeName(
          cssEditorProps.data.L[0],
          cssEditorProps.meta.P.name,
          state() || "Default",
          props.name,
        ),
      },
    } as Vertex;

    setSelectionValue(
      txnId,
      cssEditorProps.data,
      graph,
      setGraph,
      selectedFileMetaVertex,
    );
  };

  const resetValue = () => {
    changeValue(undefined);
    setSelectedOption(determineSelectedOption());
    clearFileSelection();
  };

  return (
    <Container>
      <Switch>
        <Match when={props.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper onResetIconClick={resetValue} />
            <TextFieldWithUnitContent
              changeValue={changeValue}
              determineSelectedOption={determineSelectedOption}
              handleInputChange={handleInputChange}
              meta={props}
              resetValue={resetValue}
              value={props.value}
            />
          </div>
        </Match>
        <Match when={props.label}>
          <CenterDiv>
            <LabelWrapper onResetIconClick={resetValue} />
            <TextFieldWithUnitContent
              changeValue={changeValue}
              determineSelectedOption={determineSelectedOption}
              handleInputChange={handleInputChange}
              meta={props}
              resetValue={resetValue}
              value={props.value}
            />
          </CenterDiv>
        </Match>
        <Match when={true}>
          <TextFieldWithUnitContent
            changeValue={changeValue}
            determineSelectedOption={determineSelectedOption}
            handleInputChange={handleInputChange}
            meta={props}
            resetValue={resetValue}
            value={props.value}
          />
        </Match>
      </Switch>
    </Container>
  );
};
