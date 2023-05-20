import {
  JSX,
  createMemo,
  createUniqueId,
  For,
  onCleanup,
  splitProps,
  useContext
} from "solid-js";
import { Link, useNavigate } from "@solidjs/router";
import { graph, Id, IdAttr, Vertex } from "../lib/graph";

import { DynamicFormSequence, DynamicFormSequenceProps } from "./dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import { SelectInputField } from "./input/SelectInputField";
import { AttrsTableData } from "./api";
import { GenericField } from "./input/GenaricField";
import { getFormApiFromForm, Record } from "../lib/Record";
import { onDataDirectoryImportClick, updateImportRecord } from "../lib/Import";

// TODO make default component property applied to
export const AllForms = () => {
  const allForms = () => graph.vertexLabelIdMap["Form"]?.map((formVertex) => graph.vertexes[formVertex]) || [];

  return (
    <div class="">
      <For<Vertex[]> each={allForms()}>{(form) => <Link href={`/${form.properties[IdAttr]}/new`}>{form.properties[IdAttr]}</Link>}</For>
    </div>
  );
};

interface AbstractSingleFormProps extends Omit<DynamicFormSequenceProps, "form" | "id"> {
  formId: string;
  id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
  // TODO: add validation on form that AttrsTableData keys should not available.
  let form = AttrsTableData[props.formId];

  if (!form) {
    const formResult = getFormApiFromForm(props.formId);
    if (formResult.error) return formResult.error;
    form = formResult.form!;
  }
  console.log(form);
  const [p, customProps] = splitProps(props, ["formId", "id"]);

  const id = createMemo(() => (p.id === "new" ? undefined : parseInt(p.id as string)));
  return (
    <div class="">
      <DynamicFormSequence form={form!} id={id() as Id} {...customProps} config={props.config || {}} />
    </div>
  );
};

export const Login = (props: {}) => {
  const { setAlert } = useContext(AlertMessageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const event = ["post", "login", 0] as WSEvent;
  Ws.bind(event, (data) => {
    if (data.error) {
      setAlert((prev) => [
        ...prev,
        {
          id: createUniqueId(),
          state: Alert.Error,
          message: data.error,
        },
      ]);
    } else {
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));

  const config = {} as { vertex: Vertex };
  const onLoginClick = () => {
    const email = config.vertex.properties.email as string;
    const password = config.vertex.properties.password as string;
    Ws.trigger([[event, { body: { email, password } }]]);
    // revertTransaction(txnId)
  };

  return (
    <>
      <AbstractSingleForm
        formId={"LogIn"}
        id="new"
        config={config}
        // TODO: add dry option
      />
      <GenericField
       component={"Button"}
        meta={
          {
            properties: {
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ properties: { meta: "Login" } } as unknown as Vertex}
        onClick={onLoginClick}
      />
    </>
  );
};
export const Logout = (props: {}) => {
  const { setAlert } = useContext(AlertMessageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const event = ["post", "logout", 0] as WSEvent;

  Ws.bind(event, (data) => {
    if (data.error) {
      setAlert((prev) => [...prev, { id: createUniqueId(), state: Alert.Error, message: data.error }]);
    } else {
      Ws.isLoggedIn(false);
      navigate("/");
    }
  });
  Ws.trigger([[event, {}]]);
  onCleanup(() => Ws.unbind(event));
  return <>Logging out...</>;
};

export const SignUp = (props: {}) => {
  const { setAlert } = useContext(AlertMessageContext);
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const event = ["post", "register", 0] as WSEvent;
  Ws.bind(event, (data) => {
    if (data.error) {
      setAlert((prev) => [...prev, { id: createUniqueId(), state: Alert.Error, message: data.error }]);
    } else {
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));
  // TODO:
  // 1. Save button text
  // 2. disable save button when submitting
  // 3. validations
  // 4. clear form on success
  // 5. make password not visible

  const config = {} as { vertex: Vertex };
  const onSignupClick = () => {
    const email = config.vertex.properties.email as string;
    const password = config.vertex.properties.password as string;
    Ws.trigger([[event, { body: { email, password } }]]);
    // revertTransaction(txnId);
  };

  return (
    <>
      <AbstractSingleForm
        formId={"SignUp"}
        id="new"
        config={config}
        // TODO: add dry option
      />
      <GenericField
       component={"Button"}
        meta={
          {
            properties: {
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ properties: { meta: "SignUp" } } as unknown as Vertex}
        onClick={onSignupClick}
      />
    </>
  );
};

export const SimpleImport = (props: {}) => {
  const { Ws } = useContext(WsContext);
  const config = {} as { record: Record };

   return (
    <>
      <SelectInputField
        data={{ properties: {} } as Vertex}
        meta={
          {
            properties: {
              [IdAttr]: "import",
              props: {
                stringValue: true,
                displayExpr: "name",
                valueExpr: "name",
                collection:
                  '[{"name": "dataType"},{"name": "component"},{"name": "dataTypeDefault"},{"name": "lookup"},{"name": "attribute"}]',
              },
            },
          } as unknown as Vertex
        }
        setValue={(attr, data) => updateImportRecord(data, config.record)}
      />
      <AbstractSingleForm id={"new"} formId={"SimpleImport"} config={config} />

      <GenericField
       component={"Button"}
        meta={
          {
            properties: {
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ properties: { meta: "Import" } } as unknown as Vertex}
        onClick={_ => onDataDirectoryImportClick(config.record, Ws)}
      />
    </>
  );
};
