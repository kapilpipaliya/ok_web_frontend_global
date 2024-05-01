import '../base.css'
import { createSignal, Match, Show, Switch, useContext } from "solid-js";
import { APP_BASE_URL, validateEmail, validatePassword, validateUsername } from "~/lib/Utils";
import logo from "../../assets/signup/logo.png";
import { loginOrRegister } from "~/pages/auth/auth";
import { A, useNavigate } from "@solidjs/router";
import { API } from "~/components/DataFetcher";
import { useToast } from "~/components/custom-component/toast";
import { toast } from "solid-toast";
import { Icon } from "@iconify-icon/solid";
import { LoadingContext } from "~/globals/global";
import  sendEmail  from '~/email';
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
        <div style={{ 'background-size': 'cover', 'background-image': "url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais')", display: 'flex', "background-color": 'rgb(239,235,233)', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '100vh', }}>
            <img src={logo} alt="logo" class="h:70px mb:100px" style={{ 'justify-self': 'center' }} />
            <form class='w:inherit mb:5rem bg:white jc:center r:10' onSubmit={handleSubmit} style={{ display: 'flex', padding: '20px 30px', 'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' }}>
                <img src={'../../public/graphics/login_vector.jpg'}
                    alt="logo" class="w:25vw d:none@<md" />
                <div class='mt:25 w:50% w:100%@<md grid align-content:center m:0|30@lg'>
                    <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                        Log In
                    </div>
                    <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                        You Will be Redirected to Home Page
                    </div>
                    <div style={{ margin: '10px 0' }}>
                        <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Username</label>
                        <input
                            name="email"
                            type="text"
                            value={formData().email}
                            onInput={(e) => setFormData({ ...formData(), email: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                            placeholder="Your email"
                            required
                        />
                    </div>
                    <div style={{ margin: '10px 0' }}>
                        <label for="password" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Password</label>
                        <div class="rel">
                            <input
                                name="password"
                                type={`${showPassword() ? 'text' : 'password'}`}
                                value={formData().password}
                                onInput={(e) => setFormData({ ...formData(), password: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                                placeholder="Your Password"
                                required
                            />
                            <Icon
                                onClick={togglePasswordVisibility}
                                class="abs top:8 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                                aria-label="Toggle password visibility"
                                icon={`${showPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                            />

                        </div>
                    </div>
                    <div style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', margin: '10px 0' }}>
                        <label>
                            <input type="checkbox" />
                            &nbsp;Remember me
                        </label>
                        <a href="/auth/forgotPassword" style={{ color: '#069', 'text-decoration': 'none' }}>Forgot Password?</a>
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', background: 'rgb(226,65,74)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
                        Log In
                    </button>
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
                if (response.headers.get('content-type')?.includes('application/json')) {
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
        <div style={{ 'background-size': 'cover', 'background-image': "url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais')", display: 'flex', "background-color": 'rgb(239,235,233)', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '100vh', }}>
            <img src={logo} alt="logo" class="h:70px mb:100px" style={{ 'justify-self': 'center' }} />
            <form class='mb:5rem bg:white jc:center r:10' onSubmit={handleSubmit} style={{ display: 'flex', padding: '20px 30px', 'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' }}>
                <img src={'../../public/graphics/register_vector.png'}
                    alt="logo" class="w:25vw d:none@<md" />
                <div class='w:50% w:100%@<md grid align-content:center m:0|30@lg'>
                    <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                        Sign Up
                    </div>
                    <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                        Let's Bright up your future!
                    </div>
                    <div class='m:10|0|0|0'>
                        <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Username</label>
                        <input
                            name="username"
                            type="text"
                            value={formData().username}
                            onInput={(e) => setFormData({ ...formData(), username: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                            placeholder="Enter Name"
                            required
                        />
                    </div>
                    <div class='m:10|0|0|0'>
                        <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Email Address</label>
                        <input
                            name="email"
                            type="text"
                            value={formData().email}
                            onInput={(e) => setFormData({ ...formData(), email: e.target.value })}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                            placeholder="Enter Email"
                            required
                        />
                    </div>
                    <div class='m:10|0|10|0'>
                        <label for="password" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Password</label>
                        <div class="rel">
                            <input
                                name="password"
                                type={`${showPassword() ? 'text' : 'password'}`}
                                value={formData().password}
                                onInput={(e) => setFormData({ ...formData(), password: e.target.value })}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                                placeholder="Enter Password"
                                required
                            />
                            <Icon
                                onClick={togglePasswordVisibility}
                                class="abs top:8 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                                aria-label="Toggle password visibility"
                                icon={`${showPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                            />

                        </div>
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '8px', background: 'rgb(226,65,74)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
                        Sign Up
                    </button>
                    <div class="flex text-align:center jc:center mt:20 f:15">
                        Already have an account?&nbsp;
                        <a href={`/auth/login`} replace={true}>
                            <u class="font:bold">Sign In</u>
                        </a>
                    </div>

                </div>

            </form>
        </div>

        // <div class="login rel bg:#FFF1F1 r:5|5|5|5 flex ai:center jc:center" style={{ 'flex-flow': 'column' }}>
        //     <div class="flex justify-content:center ai:center mt:80px">
        //         <img src={logo} alt="logo" onClick={() => navigate('/')} class="h:60" />
        //     </div>

        //     <div class="p:10@md box-shadow:100 shadow:black h:70% flex ai:center jc:center">

        //         <div class={'flex justify-content:center ai:center'}>

        //             <div
        //                 class="mt:50 b:2 b:#c5daff bg:#f4f8fe sticky z:10 flex jc:center r:10|10|10|10 m:10 w:70vw@<xs w:35vw@md w:40vw@lg w:25vw@>xl">
        //                 <form onSubmit={handleSubmit} class={'w:full'}>
        //                     <div class="w:100% flex:col w:fit p:3.25rem">
        //                         <div class="jc:center mb:10 f:30 font-weight:bold flex z:10">
        //                             Sign Up
        //                         </div>
        //                         <input
        //                             type="Name"
        //                             value={formData().username}
        //                             onChange={(e) => setFormData({ ...formData(), username: e.target.value })}
        //                             placeholder="Enter Name"
        //                             required={true}
        //                             class="my:10 p:10 w:100% r:5|5|5|5"
        //                         />
        //                         <input
        //                             type="Email"
        //                             value={formData().email}
        //                             onChange={(e) => setFormData({ ...formData(), email: e.target.value })}
        //                             placeholder="Enter Email"
        //                             autocomplete='email'
        //                             required={true}
        //                             minLength="4"
        //                             class="my:10 p:10 w:100% r:5|5|5|5"
        //                         />

        //                         <div class="rel">
        //                             <input
        //                                 type={showPassword() ? 'text' : 'password'}
        //                                 value={formData().password}
        //                                 onChange={(e) => setFormData({ ...formData(), password: e.target.value })}
        //                                 placeholder="Enter Password"
        //                                 required={true}
        //                                 autocomplete='password'
        //                                 class="my:10 p:10 w:100% r:5|5|5|5"
        //                             />
        //                             <Icon
        //                                 onClick={togglePasswordVisibility}
        //                                 class="abs top:20 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
        //                                 aria-label="Toggle password visibility"
        //                                 icon={`${showPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
        //                             />
        //                         </div>
        //                         <div>
        //                             <button class="w:100% h:40 r:5|5|5|5 text-fill:white"
        //                                 style={{ "background-color": "#4A92FD" }}
        //                                 type="submit">
        //                                 Sign Up
        //                             </button>
        //                         </div>

        //                         <span class="my:10 flex jc:end">
        //                             <a>
        //                                 <u class="font:bolder text-fill:black f:15 cursor:pointer">Forgot password ?</u>
        //                             </a>
        //                         </span>
        //                         <span class={'flex jc:center mt:20'}>
        //                             Already have an account?&nbsp;
        //                             <a href={`/auth/login`} replace={true}>
        //                                 <u class="font:bold">Sign In</u>
        //                             </a>
        //                         </span>
        //                     </div>
        //                 </form>
        //             </div>
        //         </div>
        //         <div class="flex justify-content:center mt:20 f:15">

        //         </div>
        //     </div>
        // </div>
    );
};

function ForgotPasswordForm() {
    const { showErrorToast } = useToast();
    const [username, setUsername] = createSignal('');
    const [otp, setOtp] = createSignal('');
    const [newPassword, setNewPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [showConfirmPassword, setConfirmShowPassword] = createSignal(false);
    const [showNewPassword, setNewShowPassword] = createSignal(false);
    const [isLoading, setIsLoading] = createSignal(false);
    const [stage, setStage] = createSignal(0); // 0: Email, 1: OTP, 2: New Passwords
    const validatePassword = (password) => {
        // Example validation: Minimum eight characters, at least one letter and one number
        const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{6,16}$/;
        return regex.test(password);
    };
    const handleEmailSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const data = await sendEmail(username(), 'Reset Password', 'Reset Password');
        setIsLoading(false);
        // setStage(1); // Move to OTP stage
    };

    const handleOtpSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true);
        console.log('OTP submitted:', otp());
        // Verify OTP
        // On success:
        setIsLoading(false);
        setStage(2); // Move to password reset stage
    };


    const handlePasswordResetSubmit = (event) => {
        event.preventDefault();
        if (newPassword() !== confirmPassword()) {
            showErrorToast('Passwords do not match.');
            return; // Stop the form submission
        }

        // Validate the new password
        if (!validatePassword(newPassword())) {
            showErrorToast('Password must be at least 6 characters long and include at least one letter and one number and one uppercase.');
            return; // Stop the form submission
        }
        setIsLoading(true);
        console.log('New password submitted:', newPassword(), confirmPassword());
        // Reset password
        // On success:
        setIsLoading(false);
        alert('Password has been reset successfully.');
        // Optionally redirect to login or inform the user
    };

    return (
        <div style={{ 'background-size': 'cover', 'background-image': "url('https://img.freepik.com/free-vector/blurred-background-with-light-colors_1034-245.jpg?size=338&ext=jpg&ga=GA1.1.1224184972.1714435200&semt=ais')", display: 'flex', "background-color": 'rgb(239,235,233)', 'flex-direction': 'column', 'align-items': 'center', 'justify-content': 'center', height: '100vh', }}>
            <img src={logo} alt="logo" class="h:70px mb:100px" style={{ 'justify-self': 'center' }} />
            <Switch>
                <Match when={isLoading()}>
                    <div class="p:5rem bg:white r:10">
                        <div class="loader" />
                    </div>
                </Match>
                <Match when={true}>
                    <Show when={stage() === 0}>
                        <form class='mb:5rem bg:white r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl' onSubmit={handleEmailSubmit} style={{ display: 'grid', 'max-width': '600px', padding: '20px 30px', 'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                                Forgot Password
                            </div>
                            <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                                Provide the email address associated with your account. We will send you a link to reset your password.
                            </div>
                            <div style={{ margin: '10px 0' }}>
                                <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Email Address</label>
                                <input
                                    name="email"
                                    type="text"
                                    value={username()}
                                    onInput={(e) => setUsername(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                                    placeholder="Your email"
                                    required
                                />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '10px', background: 'rgb(226,65,74)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
                                Confirm
                            </button>
                            <div class="flex justify-content:center mt:20 f:15">
                                <span>
                                    Return to&nbsp;
                                    <A href={`/auth/login`}>
                                        <u class="font:bolder text-fill:black">Log In</u>
                                    </A>
                                </span>
                            </div>
                        </form>
                    </Show>
                    <Show when={stage() === 1}>
                        <form class='mb:5rem bg:white r:10 w:70vw@<xs w:50vw@<md w:40vw@lg w:28vw@>xl' onSubmit={handleOtpSubmit} style={{ display: 'grid', 'max-width': '600px', padding: '20px 30px', 'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                                OTP Verification
                            </div>
                            <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                                We have sent an OTP to your email. Please enter it below to proceed.
                            </div>
                            <div style={{ margin: '10px 0' }}>
                                <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>One Time Password (OTP)</label>
                                <input
                                    maxlength={6}
                                    value={otp()}
                                    onInput={(e) => setOtp(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                                    placeholder="Enter 6 digit code"
                                    required
                                />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '10px', background: 'rgb(226,65,74)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
                                Submit
                            </button>
                            <div class="flex justify-content:center mt:20 f:15">
                                <span>
                                    Return to&nbsp;
                                    <A href={`/auth/login`}>
                                        <u class="font:bolder text-fill:black">Log In</u>
                                    </A>
                                </span>
                            </div>
                        </form>
                    </Show>
                    <Show when={stage() === 2}>
                        <form class='mb:5rem bg:white r:10 w:70vw@<xs w:50vw<@md w:40vw@lg w:28vw@>xl' onSubmit={handlePasswordResetSubmit} style={{ display: 'grid', 'max-width': '600px', padding: '20px 30px', 'box-shadow': '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <div class="mb:5 f:20 font-weight:bold flex jc:left z:10">
                                Reset Password
                            </div>
                            <div class="mb:10 f:15 font-weight:medium color:rgb(152,152,153) flex jc:left z:10">
                                Below you can enter your new password.
                            </div>
                            <div class="rel" style={{ margin: '10px 0' }}>
                                <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>New Password</label>
                                <input
                                    type={`${showNewPassword() ? 'text' : 'password'}`}
                                    value={newPassword()}
                                    onInput={(e) => setNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                                    placeholder="New Password"
                                    required
                                />
                                <Icon
                                    onClick={() => setNewShowPassword(!showNewPassword())}
                                    class="abs top:32 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                                    aria-label="Toggle password visibility"
                                    icon={`${showNewPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                                />
                            </div>
                            <div class="rel" style={{ margin: '10px 0' }}>
                                <label for="username" class='f:14' style={{ display: 'block', 'margin-bottom': '5px' }}>Confirm Password</label>
                                <input
                                    type={`${showConfirmPassword() ? 'text' : 'password'}`}
                                    value={confirmPassword()}
                                    onInput={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', 'border-radius': '4px' }}
                                    placeholder="Confirm Password"
                                    required
                                />
                                <Icon
                                    onClick={() => setConfirmShowPassword(!showConfirmPassword())}
                                    class="abs top:32 right:5 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                                    aria-label="Toggle password visibility"
                                    icon={`${showConfirmPassword() ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                                />
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '10px', background: 'rgb(226,65,74)', color: 'white', border: 'none', 'border-radius': '4px', cursor: 'pointer' }}>
                                Confirm
                            </button>
                            <div class="flex mt:20 f:15" style={{ "text-align": "center" }}>
                                Return to&nbsp;
                                <A href={`/auth/login`}>
                                    <u class="font:bolder text-fill:black">Log In</u>
                                </A>
                            </div>
                        </form>
                    </Show>
                </Match>
            </Switch>

        </div>
    );
}

export default ForgotPasswordForm;