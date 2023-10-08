import {createUniqueId, onCleanup, useContext} from "solid-js";
import {useNavigate} from "@solidjs/router";
import {resetDatabaseLogin, revertTransaction, setGraph, Vertex} from "../lib/graph";
import {AbstractSingleForm} from "./DynamicForm";
import {Alert} from "../types/Type";
import {WsContext, WSEvent} from "../utils/ws_events_dispatcher";
import {GenericField} from "./input/GenaricField";
import {Record} from "../lib/Record";
import {AlertMessageContext} from "../contexts/AlertMessageContext";
import {createStore} from "solid-js/store";
import {isAdmin} from "./Dashboard";

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
      revertTransaction(config[0].record.txnId);
      // because we are doing sync processing in websocket class,
      // this will not be a problem
      resetDatabaseLogin();
      Ws.trigger([
        [
          ["get", "sync", 0],
          {
            admin: isAdmin() ? true : undefined,
            from: 0,
            subscriptions: Ws.subscriptions,
          },
        ],
      ])
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));

  const config = createStore({} as { record: Record });

  const onLoginClick = () => {
    const email = config[0].record.vertex.P.email as string;
    const pass = config[0].record.vertex.P.pass as string;
    Ws.trigger([[event, { body: { email, pass } }]]);
  };

  return (
   <AbstractSingleForm
    formId={"LogIn"}
    id="new"
    config={config}
    submitButton={<GenericField
     meta={
       {
         P: {
           component: "Button",
           props: { stylingMode: "contained", width: "120", type: "success", text: "Login" },
         },
       } as unknown as Vertex
     }
     onClick={onLoginClick}
    />}
    // TODO: add dry option
   />
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
            admin: isAdmin() ? true : undefined,
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
  return <>Logging out...</>
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
      revertTransaction(config[0].record.txnId)
      navigate("/");
    }
  });
  onCleanup(() => Ws.unbind(event));
  // TODO:
  // 1. Save button text
  // 2. disable save button when submitting
  // 3. validations
  // 4. clear form on success

  const config = createStore({} as { record: Record });
  const onSignupClick = () => {
    const email = config[0].record.vertex.P.email as string;
    const pass = config[0].record.vertex.P.pass as string;
    Ws.trigger([[event, { body: { email, pass } }]]);
  };

  return (
   <AbstractSingleForm
    formId={"SignUp"}
    id="new"
    config={config}
    submitButton={<GenericField
     meta={
       {
         P: {
           component: "Button",

           props: { stylingMode: "contained", width: "120", type: "success", text: "Register", },
         },
       } as unknown as Vertex
     }
     onClick={onSignupClick}
    />}
    // TODO: add dry option
   />
  );
};

