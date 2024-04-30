import '../base.css'
import { createSignal, useContext } from "solid-js";
import { APP_BASE_URL, validateEmail, validatePassword, validateUsername } from "~/lib/Utils";
import logo from "../../assets/signup/logo.png";
import { loginOrRegister } from "~/pages/auth/auth";
import { A, useNavigate } from "@solidjs/router";
import { API } from "~/components/DataFetcher";
import { useToast } from "~/components/custom-component/toast";
import { toast } from "solid-toast";
import { Icon } from "@iconify-icon/solid";
import { LoadingContext } from "~/globals/global";
import { LoginImage } from "../../public/graphics/Mobile login-pana.svg";

export const Login = () => {
    const navigate = useNavigate();
    const { showErrorToast } = useToast();
    const [loadingSite, setLoadingSite] = useContext(LoadingContext);

    const [formData, setFormData] = createSignal({ email: '', password: '', loginType: 'login' });
    const [showPassword, setShowPassword] = createSignal(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword());
    };
    const loginCall = async () => {
        try {
            let response = await fetch(API.loginUrl, {
                method: 'POST',
                body: JSON.stringify({ email: formData().email, password: formData().password })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.error) {
                    return Promise.reject(result.error);
                }
                return result;
            } else {
                return Promise.reject(response.statusText);
            }
        } catch (error: any) {
            return Promise.reject(error.response);
        }
    }
    const handleSubmit = async (event: SubmitEvent) => {

        event.preventDefault();
        const emailError = validateEmail(formData().email);
        const passwordError = validatePassword(formData().password);
        if (emailError) {
            showErrorToast(emailError); // Show the error message if validation fails
        } else if (passwordError) {
            showErrorToast(passwordError); // Show the error message if validation fails
        } else {
            setLoadingSite(true);
            let response: any;
            await toast.promise(
                loginCall(),
                {
                    loading: 'Logging In...',
                    success: (val) => {
                        response = val;
                        return <span>Login Successfully</span>
                    },
                    error: (error) => {
                        console.log("error => ", error)
                        return <span>{error}</span>
                    }
                }
            )
            setLoadingSite(false);
            if (response!.error) {
                showErrorToast(response!.error);
                return;
            }
            if (response != null && response.id !== null) {
                navigate(`${APP_BASE_URL}/Page`)
            }
        }
    };


    return (
        <div class="login rel bg:#FFF1F1 r:5|5|5|5 flex ai:center jc:center" style={{ 'flex-flow': 'column' }}>
            <div class="flex justify-content:center ai:center mt:80px">
                <img src={logo} alt="logo" onClick={() => navigate('/')} class="h:60" />
            </div>

            <div class="p:10@md box-shadow:100 shadow:black h:70% flex ai:center jc:center">
                
                <div
                    class="mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex justify-content:center r:10|10|10|10 m:10 w:70vw@<xs w:35vw@md w:40vw@lg w:25vw@>xl">
                    <form onSubmit={handleSubmit} class={'w:full'}>
                        <div class="w:100% flex:col w:fit p:3.25rem">
                            <div class="mb:10 f:30 font-weight:bold flex jc:center z:10">
                                Sign In
                            </div>
                            <input
                                type="Email"
                                value={formData().email}
                                onChange={(e) => setFormData({ ...formData(), email: e.target.value })}
                                placeholder="Email"
                                required={true}
                                minLength="8"
                                autocomplete='email'
                                class="my:10 p:10 w:full r:5|5|5|5"
                            />
                            <div class="rel">
                                <input
                                    type={showPassword() ? 'text' : 'password'}
                                    value={formData().password}
                                    autocomplete="password"
                                    onChange={(e) => setFormData({ ...formData(), password: e.target.value })}
                                    placeholder="Password"
                                    required={true}

                                    class="my:10 p:10 w:full r:5|5|5|5"
                                />
                                <Icon
                                    onClick={togglePasswordVisibility}
                                    class="abs top:20 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                                    aria-label="Toggle password visibility"
                                    icon={`${showPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                                />
                            </div>
                            <div>
                                <button class="w:100% h:40 r:5|5|5|5 text-fill:white"
                                    style={{ "background-color": "#4A92FD" }}
                                    type="submit">
                                    Login
                                </button>
                            </div>

                            <span class="my:10 flex justify-content:center">
                                <a>
                                    <u class="font:bolder text-fill:black f:15 cursor:pointer">Forgot password ?</u>
                                </a>
                            </span>
                            <div class="flex justify-content:center mt:20 f:15">
                                <span>
                                    Don't have an account?{" "}
                                    <A href={`/auth/signup`}>
                                        <u class="font:bolder text-fill:black">Sign Up</u>
                                    </A>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
export const SignUp = () => {
    // const {setAlert} = useContext(AlertMessageContext);
    // const {Ws} = useContext(WsContext);
    const navigate = useNavigate();
    const { showErrorToast } = useToast();

    const [formData, setFormData] = createSignal({
        username: '',
        email: '',
        password: '',
        loginType: 'signup'
    });
    const [showPassword, setShowPassword] = createSignal(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword());
    };
    const signUpCall = async () => {
        try {
            let response = await fetch(API.signUpUrl, {
                method: 'POST',
                body: JSON.stringify({
                    username: formData().username,
                    email: formData().email,
                    password: formData().password
                })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.error) {
                    return Promise.reject(result.error);
                }
                return result;
            } else {
                if(response.headers.get('content-type')?.includes('application/json')){
                    const result = await response.json();
                    return Promise.reject(result.error);
                }
                return Promise.reject(response.statusText);
            }
        } catch (error: any) {
            return Promise.reject(error.response);
        }
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();

        const usernameError = validateUsername(formData().username);
        const emailError = validateEmail(formData().email);
        const passwordError = validatePassword(formData().password);
        if (usernameError) {
            showErrorToast(usernameError); // Show the error message if validation fails
        } else if (emailError) {
            showErrorToast(emailError); // Show the error message if validation fails
        } else if (passwordError) {
            showErrorToast(passwordError); // Show the error message if validation fails
        } else {
            let response: any;
            await toast.promise(
                signUpCall(),
                {
                    loading: 'Registering User...',
                    success: (val) => {
                        response = val;
                        return <span>Registered Successfully</span>
                    },
                    error: (error) => {
                        return <span>{error}</span>
                    }
                }
            )
            if (response!.error) {
                showErrorToast(response!.error);
                return;
            }
            if (response != null && response.id !== null) {
                navigate(`${APP_BASE_URL}/Page`)
            }
        }
    };

    return (
        <div class="login rel bg:#FFF1F1 r:5|5|5|5 flex ai:center jc:center" style={{ 'flex-flow': 'column' }}>
            <div class="flex justify-content:center ai:center mt:80px">
                <img src={logo} alt="logo" onClick={() => navigate('/')} class="h:60" />
            </div>

            <div class="p:10@md box-shadow:100 shadow:black h:70% flex ai:center jc:center">
               
                <div class={'flex justify-content:center ai:center'}>

                    <div
                        class="mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex jc:center r:10|10|10|10 m:10 w:70vw@<xs w:35vw@md w:40vw@lg w:25vw@>xl">
                        <form onSubmit={handleSubmit} class={'w:full'}>
                            <div class="w:100% flex:col w:fit p:3.25rem">
                                <div class="jc:center mb:10 f:30 font-weight:bold flex z:10">
                                    Sign Up
                                </div>
                                <input
                                    type="Name"
                                    value={formData().username}
                                    onChange={(e) => setFormData({ ...formData(), username: e.target.value })}
                                    placeholder="Enter Name"
                                    required={true}
                                    class="my:10 p:10 w:100% r:5|5|5|5"
                                />
                                <input
                                    type="Email"
                                    value={formData().email}
                                    onChange={(e) => setFormData({ ...formData(), email: e.target.value })}
                                    placeholder="Enter Email"
                                    autocomplete='email'
                                    required={true}
                                    minLength="4"
                                    class="my:10 p:10 w:100% r:5|5|5|5"
                                />

                                <div class="rel">
                                    <input
                                        type={showPassword() ? 'text' : 'password'}
                                        value={formData().password}
                                        onChange={(e) => setFormData({ ...formData(), password: e.target.value })}
                                        placeholder="Enter Password"
                                        required={true}
                                        autocomplete='password'
                                        class="my:10 p:10 w:100% r:5|5|5|5"
                                    />
                                    <Icon
                                        onClick={togglePasswordVisibility}
                                        class="abs top:20 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                                        aria-label="Toggle password visibility"
                                        icon={`${showPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                                    />
                                </div>
                                <div>
                                    <button class="w:100% h:40 r:5|5|5|5 text-fill:white"
                                        style={{ "background-color": "#4A92FD" }}
                                        type="submit">
                                        Sign Up
                                    </button>
                                </div>

                                <span class="my:10 flex jc:end">
                                    <a>
                                        <u class="font:bolder text-fill:black f:15 cursor:pointer">Forgot password ?</u>
                                    </a>
                                </span>
                                <span class={'flex jc:center mt:20'}>
                                    Already have an account?&nbsp;
                                    <a href={`/auth/login`} replace={true}>
                                        <u class="font:bold">Sign In</u>
                                    </a>
                                </span>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="flex justify-content:center mt:20 f:15">

                </div>
            </div>
        </div>
    );
};
