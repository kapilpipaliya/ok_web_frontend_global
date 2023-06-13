import {
  createMemo,
  createUniqueId,
  For,
  onCleanup,
  splitProps,
  useContext
} from "solid-js";
import { Link, useNavigate } from "@solidjs/router";
import {
  graph,
  Id,
  IdAttr,
  resetDatabaseLogin,
  revertTransaction, setGraph,
  Vertex
} from "../lib/graph";

import { DynamicForm, DynamicFormProps } from "./dynamicForm";
import { AlertMessageContext } from "../appState";
import { Alert } from "../Type";
import { WsContext, WSEvent } from "./ws_events_dispatcher";
import { SelectInputField } from "./input/SelectInputField";
import { GenericField } from "./input/GenaricField";
import { getFormMetaData, Record } from "../lib/Record";
import { onDataDirectoryImportClick, updateImportRecord } from "../lib/Import";

// TODO make default component property applied to
export const AllForms = () => {
  const allForms = () => graph.vertexLabelIdMap["Form"] || [];

  return (
    <div class="">
      <For each={allForms()}>{(vertexId) => <Link href={`/${graph.vertexes[vertexId].P[IdAttr]}/new`}>{graph.vertexes[vertexId].P[IdAttr]}</Link>}</For>
    </div>
  );
};

interface AbstractSingleFormProps extends Omit<DynamicFormProps, "form" | "id"> {
  formId: string;
  id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
  // TODO: add validation on form that AttrsTableData keys should not available.

  const form = getFormMetaData(props.formId);
  if (form.error) return form.error;

  const [p, customProps] = splitProps(props, ["formId", "id"]);

  const id = createMemo(() => (p.id === "new" ? undefined : parseInt(p.id as string)));
  return (
    <div class="">
      <DynamicForm form={form.form!} id={id() as Id} {...customProps} config={props.config || {}} />
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
          message: data.description,
        },
      ]);
    } else {
      revertTransaction(config.record.txnId);
      // because we are doing sync processing in websocket class,
      // this will not be a problem
      resetDatabaseLogin();
      Ws.trigger([
        [
          ["get", "sync", 0],
          {
            from: 0,
            subscriptions: Ws.subscriptions,
          },
        ],
      ])
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));

  const config = {} as { record: Record };
  const onLoginClick = () => {
    const email = config.record.vertex.P.email as string;
    const pass = config.record.vertex.P.pass as string;
    Ws.trigger([[event, { body: { email, pass } }]]);
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
        meta={
          {
            P: {
              component: "Button",
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ P: { meta: "Login" } } as unknown as Vertex}
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
      setGraph('member', null);
      // because we are doing sync processing in websocket class,
      // this will not be a problem
      resetDatabaseLogin();
      Ws.trigger([
        [
          ["get", "sync", 0],
          {
            from: 0,
            subscriptions: Ws.subscriptions,
          },
        ],
      ])
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
      revertTransaction(config.record.txnId)
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));
  // TODO:
  // 1. Save button text
  // 2. disable save button when submitting
  // 3. validations
  // 4. clear form on success

  const config = {} as { record: Record };
  const onSignupClick = () => {
    const email = config.record.vertex.P.email as string;
    const pass = config.record.vertex.P.pass as string;
    Ws.trigger([[event, { body: { email, pass } }]]);
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
        meta={
          {
            P: {
              component: "Button",
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ P: { meta: "SignUp" } } as unknown as Vertex}
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
        component={"SelectBox"}
        data={{ P: {} } as Vertex}
        meta={
          {
            P: {
              [IdAttr]: "import",
              props: {
                stringValue: true,
                items: `dataType
component
dataTypeDefault
lookup
attribute
user
role
perm`
              },
            },
          } as unknown as Vertex
        }
        setValue={(attr,vertex, data) => updateImportRecord(data, config.record)}
      />
      <AbstractSingleForm id={"new"} formId={"Import"} config={config} />

      <GenericField
        meta={
          {
            P: {
              component: "Button",
              [IdAttr]: "meta",
              props: { stylingMode: "contained", width: "120", type: "success" },
            },
          } as unknown as Vertex
        }
        data={{ P: { meta: "Import" } } as unknown as Vertex}
        onClick={() => onDataDirectoryImportClick(config.record, Ws)}
      />
    </>
  );
};
