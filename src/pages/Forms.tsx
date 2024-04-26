import {createSignal} from "solid-js";
import {createStore} from "solid-js/store";
import {APP_BASE_URL, Record} from "~/lib/Utils";
import logo from "../../assets/signup/logo.png";
import {loginOrRegister} from "~/pages/auth/auth";
import {A, useNavigate} from "@solidjs/router";
import '../base.css'

export const Login = () => {
    // const {setAlert} = useContext(AlertMessageContext);
    // const [graph,setGraph] = useContext(GraphContext)!;
    // const {Ws} = useContext(WsContext);
    const navigate = useNavigate();

    // const event = ["post", "login", 0] as WSEvent;
    // Ws.bind(event, (data) => {
    //     if (data.error) {
    //         setAlert((prev) => [
    //             ...prev,
    //             {
    //                 id: createUniqueId(),
    //                 state: Alert.Error,
    //                 message: data.description,
    //             },
    //         ]);
    //     } else {
    //         revertTransaction(config[0].record.txnId);
    //         // because we are doing sync processing in websocket class,
    //         // this will not be a problem
    //         resetDatabaseLogin(setGraph);
    //         Ws.trigger([
    //             [
    //                 ["get", "sync", 0],
    //                 {
    //                     admin: isAdmin() ? true : undefined,
    //                     from: 0,
    //                     subscriptions: Ws.subscriptions,
    //                 },
    //             ],
    //         ]);
    //         navigate("/");
    //     }
    // });
    // onCleanup(() => Ws.unbind(event));
    //
    // const config = createStore({} as { record: Record });

    const [formData, setFormData] = createSignal({username: '', password: '', loginType: 'login'});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await loginOrRegister(formData());
        if (result instanceof Error) {
            console.log("Error login or register", result);
        } else {
            navigate(`${APP_BASE_URL}`);
        }
    };


    return (
        <div class="login rel bg:#FFF1F1 r:5|5|5|5">
            <div class="flex justify-content:center ai:center">
                <img src={logo} alt="logo" class="mt:80px w:200 h:50"/>
            </div>

            <div class="p:10@md box-shadow:100 shadow:black mt:50 h:70% flex ai:center jc:center">

                <div>
                    {/*<img src={bg} alt="bg"*/}
                    {/*     class="abs z:1 w:200@md h:200@md"/>*/}
                    <div>

                        <div
                            class="mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex justify-content:center r:10|10|10|10 m:10">

                            <div class="flex:col m:20@md m:20 w:fit p:20">
                                <div class=" mb:10 f:30 font-weight:bold flex justify-content:center z:10">
                                    Sign In
                                </div>
                                <input
                                    type="Email"
                                    value={formData().username}
                                    onChange={(e) => setFormData({...formData(), username: e.target.value})}
                                    placeholder="Email"
                                    required={true}
                                    minLength="8"
                                    class="my:10 p:10 w:full r:5|5|5|5"
                                />
                                <input
                                    type="text"
                                    value={formData().password}
                                    onChange={(e) => setFormData({...formData(), password: e.target.value})}
                                    placeholder="Password"
                                    required={true}
                                    class="my:10 p:10 w:full r:5|5|5|5"
                                />

                                <div>
                                    <button class="w:full bg:#4A92FD h:40 r:5|5|5|5 text-fill:white"
                                            onClick={handleSubmit}>
                                        Login
                                    </button>
                                </div>

                                <span class="my:10 flex justify-content:center">
              <a>
                <u class="font:bolder text-fill:black f:15 cursor:pointer">Forgot password ?</u>
              </a>
            </span>
                            </div>

                        </div>
                    </div>
                    <div class="flex justify-content:center mt:20 f:15">
          <span>
            Don't have an account?{" "}
              <A href={`/auth/signup`}>
              <u class="font:bolder text-fill:black">Sign Up</u>
            </A>
          </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export const SignUp = () => {
    // const {setAlert} = useContext(AlertMessageContext);
    // const {Ws} = useContext(WsContext);
    const navigate = useNavigate();
    // const event = ["post", "register", 0] as WSEvent;
    // Ws.bind(event, (data) => {
    //     if (data.error) {
    //         setAlert((prev) => [...prev, {id: createUniqueId(), state: Alert.Error, message: data.error}]);
    //     } else {
    //         revertTransaction(config[0].record.txnId);
    //         navigate("/");
    //     }
    // });
    // onCleanup(() => Ws.unbind(event));
    // TODO:
    // 1. Save button text
    // 2. disable save button when submitting
    // 3. validations
    // 4. clear form on success
    const [formData, setFormData] = createSignal({
        username: '',
        email: '',
        password: '',
        loginType: 'signup'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await loginOrRegister(formData());
        if (result instanceof Error) {
            console.log("Error login or register", result);
        } else {
            navigate(`${APP_BASE_URL}`);
        }
    };
    // const onSignupClick = () => {
    //     const email = config[0].record.vertex.P.email as string;
    //     const pass = config[0].record.vertex.P.pass as string;
    //     Ws.trigger([[event, {body: {email, pass}}]]);
    // };

    return (
        <div class="login rel bg:#FFF1F1 r:5|5|5|5">
            <div class="flex justify-content:center ai:center">
                <img src={logo} alt="logo" class="mt:80px w:200 h:50"/>
            </div>

            <div class="p:10@md box-shadow:100 shadow:black mt:50 h:70% flex ai:center jc:center">

                <div>
                    {/*<img src={bg} alt="bg"*/}
                    {/*     class="abs z:1 w:200@md h:200@md"/>*/}
                    <div class={'flex justify-content:center ai:centernp'}>

                        <div
                            class="mt:50 w:70% b:2 b:#c5daff bg:#f4f8fe z:10 flex justify-content:center r:10|10|10|10">

                            <div class="flex:col m:20 w:70%">
                                <div class=" mb:10 f:30 font-weight:bold flex justify-content:center z:10">
                                    Sign Up
                                </div>
                                <input
                                    type="Name"
                                    value={formData().username}
                                    onChange={(e) => setFormData({...formData(), username: e.target.value})}
                                    placeholder="Enter Name"
                                    required={true}
                                    class="my:10 p:10 w:full r:5|5|5|5"
                                />
                                <input
                                    type="Email"
                                    value={formData().email}
                                    onChange={(e) => setFormData({...formData(), email: e.target.value})}
                                    placeholder="Enter Email"
                                    required={true}
                                    minLength="4"
                                    class="my:10 p:10 w:full r:5|5|5|5"
                                />
                                <input
                                    type="text"
                                    value={formData().password}
                                    onChange={(e) => setFormData({...formData(), password: e.target.value})}
                                    placeholder="Enter Password"
                                    required={true}
                                    minLength="8"
                                    class="my:10 p:10 w:full r:5|5|5|5"
                                />

                                <div>
                                    <button onClick={handleSubmit}
                                            class="w:full bg:#4A92FD h:40 r:5|5|5|5 text-fill:white">
                                        Sign Up
                                    </button>
                                </div>

                                <span class="my:10 flex justify-content:center">
              <a>
                <u class="font:bolder text-fill:black f:15 cursor:pointer">Forgot password ?</u>
              </a>
            </span>
                            </div>

                        </div>
                    </div>
                    <div class="flex justify-content:center mt:20 f:15">
          <span>
            Already have an account?{" "}
              <A href={`/auth/signup`} replace={true}>
              <u class="font:bold">Sign In</u>
            </A>
          </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
