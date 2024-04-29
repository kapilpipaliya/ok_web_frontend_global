import {createSignal, For, Match, Show, Switch, untrack} from "solid-js";
import '../base.css'
import {TextField} from "~/components/solid-blocks/blocks";
import {Icon} from "@iconify-icon/solid";
import PageHeader from "~/components/custom-component/Breadcumb";
import {getPlans, getUser, updatePassword} from "~/pages/auth/auth";
import './css/tab.css'
import {createStore} from "solid-js/store";
import {API} from "~/components/DataFetcher";
import {useToast} from "~/components/custom-component/toast";
import {validatePassword} from "~/lib/Utils";
import {toast} from "solid-toast";


function Settings() {
    const {showErrorToast} = useToast();
    const [selectedTab, setSelectedTab] = createSignal('General');
    const [isDataFetching, setIsDataFetching] = createSignal(false);
    const breadcrumbData = [
        {name: 'Admin', href: '/admin'},
        {name: 'Settings'},
    ];


    const icons = {
        'Basic': 'quill:stack-alt',
        'Premium': 'ant-design:fire-outlined',
        'Pro': 'mage:electricity',
        'Advanced Pro': 'streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow',
    }
    const [selectedPlan, setSelectedPlan] = createSignal('');
    const [plans, setPlans] = createSignal([]);
    const isSelected = (planName: string) => selectedPlan() === planName;
    const [originalProfileData, setOriginalProfileData] = createStore<{ [key: string]: any }>({}); // Track original data
    const [profileData, setProfileData] = createStore<{ [key: string]: any }>({
        username: '',
        email: '',
        id: '',
        country: 'United States'
    });
    const [isEdit, setIsEdit] = createSignal(false);
    getUser().then(data => {
        setProfileData({
            username: data.properties.username,
            email: data.properties.email,
            id: data.id,
            country: 'United States'
        });
        setOriginalProfileData(profileData); // Set original data
    });
    const sectionStyle = {
        'background-color': '#f5f7fa',
        padding: '20px',
        margin: '20px',
        'border-radius': '8px',
        'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
    };

    const inputStyle = {
        padding: '5px 10px',
        margin: '5px 0',
        width: '40%',
        'border-radius': '4px',
        border: '1px solid #ccc',
    };

    const buttonStyle = {
        padding: '5px 10px',
        margin: '15px 10px',
        'border-radius': '4px',
        border: 'none',
        'background-color': '#5b7dff',
        color: 'white',
        cursor: 'pointer',
    };
    const outlineStyle = {
        padding: '5px 15px',
        margin: '15px 0',
        'border-radius': '4px',
        border: '1px solid #5b7dff',
        'color': '#5b7dff',
        cursor: 'pointer',
    };
    const loadPlans = async () => {
        setIsDataFetching(true);
        console.error('Loading')
        untrack(() => {
            getPlans().then(value => {
                if (value.plans.length > 0) {
                    setPlans(value.plans)
                    setSelectedPlan(value.plans[0].name)
                }
                console.log("sad")
                setIsDataFetching(false);
            });
        });

    }

    loadPlans();
    const GeneralSection = () => {
        const handleInputChange = (e) => {
            const {name, value} = e.target;
            setProfileData({...profileData, [name]: value});
        };

        const profileCall = async () => {
            let updatedData: { [key: string]: any } = {};
            for (const key in profileData) {
                console.log(profileData[key], originalProfileData[key])
                if (profileData[key] !== originalProfileData[key]) { // Compare with original data
                    updatedData[key] = profileData[key];
                }
            }
            try {
                let response = await fetch(API.profileUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        ...updatedData,
                        userId: profileData.id
                    }),
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
            } catch (error) {
                return Promise.reject(error.response);
            }
        }
        const onClickSave = async () => {
            let response;
            await toast.promise(
                profileCall(),
                {
                    loading: 'Saving Changes...',
                    success: (val) => {
                        response = val;
                        return <span>{val.message}</span>
                    },
                    error: (error) => {
                        console.log("error => ", error)
                        return <span>{error}</span>
                    }
                }
            )
            if (response!.error) {
                showErrorToast(response!.error);
                return;
            }
        };
        return <div style={sectionStyle}>
            <div>
                <div class={'font-weight:700'}>Personal Info</div>
                <div class={'font-weight:400 mb:30'}>Update personal details here
                </div>
                <div
                    class={'flex ai:center jc:space-between p:20|20|0|20 m:10|0|5|0 bt:1px|solid|lightgrey'}>
                    <span class={'font-weight:600'}>User Id</span>
                    <TextField labelClass={'w:40%'} name={'id'} label={'Id'} disabled={true}
                               value={profileData.id}
                               onChange={handleInputChange}/>
                </div>
                <div
                    class={'flex ai:center jc:space-between p:20 m:10|0 bt:1px|dashed|lightgrey bb:1px|dashed|lightgrey'}>
                    <span class={'font-weight:600'}>UserName</span>
                    <TextField name={'username'} disabled={!isEdit()} labelClass={'w:40%'}
                               label={'Username'}
                               value={profileData.username}
                               onChange={handleInputChange}/>
                </div>
                <div
                    class={'flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|dashed|lightgrey'}>
                    <span class={'font-weight:600'}>Email Address</span>
                    <TextField name={'email'} disabled={!isEdit()} labelClass={'w:40%'}
                               label={'Email Address'}
                               value={profileData.email}
                               onChange={handleInputChange}/>
                </div>
                <div
                    class={'flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey'}>
                    <span class={'font-weight:600'}>Country</span>
                    <select name={'country'} disabled={!isEdit()} style={inputStyle}
                            value={profileData.country}
                            onChange={handleInputChange}>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                    </select>
                </div>

            </div>
            <div class={'flex jc:end'}>
                <Show when={isEdit()} fallback={<button style={buttonStyle}
                                                        onClick={() => {

                                                            setIsEdit(true)
                                                        }}>Edit
                    Settings
                </button>}>
                    <button style={outlineStyle} onClick={() => {

                        setIsEdit(false)
                    }}>Cancel
                    </button>
                    <button style={buttonStyle} onClick={onClickSave}>Save Changes
                    </button>
                </Show>


            </div>
        </div>;
    }
    const PricingPlans = () => {


        return <>
            <div class={'m:10|20'}>
                <div class={'font-weight:700'}>Account Plans</div>
                <span class={'font-weight:500 color:grey f:14'}>Pick an account plan that fits your workflow.</span>
            </div>

            <div class={'grid grid-template-columns:(2fr|50%) m:0|20 gap:10 grid-rows:2 w:80%@>md'}>
                <For each={plans()}>
                    {(plan: any) => (
                        <div
                            class={`${isSelected(plan.name) ? 'b:2px|solid|rgb(56,114,250) color:black' : 'b:1.5px|solid|rgb(227,227,227) color:black'} r:10 p:0|5 cursor:pointer`}
                            onClick={() => setSelectedPlan(plan.name)}
                        >
                            <div class={'flex jc:space-between ai:center font-weight:medium p:10|20'}>
                                <div class={'flex ai:center'}>
                                    <div class={'h:35 w:35 bg:rgb(227,227,227) r:50% grid place-items:center'}>
                                        <Icon height={22} width={22} class={'color:black'}
                                              icon={icons[plan.name]}
                                        />
                                    </div>
                                    <div class={'p:5|10'}>
                                        <div>{plan.name}</div>
                                        <span class={'color:grey f:14'}>{plan.currency}</span>
                                    </div>
                                </div>
                                <div>
                                    <span>${plan.price} / {plan.type}</span>
                                </div>
                            </div>

                        </div>
                    )}
                </For>
            </div>
        </>
    };
    const CurrentPlan = () => {
        const [plan, setPlan] = createStore({name: 'Premium', currency: 'INR', price: 1000, type: 'Monthly'});
        return <div class={'m:10|20'}>
            <div class={'font-weight:700'}>Current Plan</div>
            <span class={'font-weight:500 color:grey f:14'}>We’ll credit your account if you need to downgrade during the billing cycle.</span>
            <div class={'w:50%@>md w:39%@lg m:10|0 mb:20'}>
                <div
                    class={`b:2px|solid|rgb(33,146,15) color:black r:10 p:0|5 cursor:pointer`}
                >
                    <div class={'flex jc:space-between ai:center font-weight:medium p:10|20'}>
                        <div class={'flex ai:center'}>
                            <div class={'h:35 w:35 bg:rgb(227,227,227) r:50% grid place-items:center'}>
                                <Icon height={22} width={22} class={'color:black'}
                                      icon={icons[plan.name]}
                                />
                            </div>
                            <div class={'p:5|10'}>
                                <div>{plan.name}</div>
                                <span class={'color:grey f:14'}>{plan.currency}</span>
                            </div>
                        </div>
                        <div>
                            <span>${plan.price} / {plan.type}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    }
    const PasswordSection = () => {
        const [passwordData, setPasswordData] = createStore<{ [key: string]: any }>({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        const [showPassword, setShowPassword] = createStore({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false
        })
        const handleInputChange = (e) => {
            const {name, value} = e.target;
            setPasswordData({...passwordData, [name]: value});
        };
        const togglePasswordVisibility = (name: any) => {
            setShowPassword((prev) => ({
                ...prev,
                [name]: !prev[name],
            }));
        };

        const updatePasswordCall = async () => {
            try {
                let response = await updatePassword(passwordData.currentPassword, passwordData.newPassword, profileData.username);
                if (response.error) {
                    return Promise.reject(response.error);
                }
                return response;
            } catch (error) {
                return Promise.reject(error.response);
            }
        }
        const onClickSave = async () => {
            const {currentPassword, newPassword, confirmPassword} = passwordData;
            if (!currentPassword.trim()) {
                showErrorToast("Please enter current password");
                return false;
            }
            if (!newPassword.trim()) {
                showErrorToast("Please enter new password");
                return false;
            }
            if (!confirmPassword.trim()) {
                showErrorToast("Please enter confirm password");
                return false;
            }

            const currentPasswordError = validatePassword(currentPassword);
            if (currentPasswordError) {
                showErrorToast(`Current ${currentPasswordError}`);
                return false;
            }
            const newPasswordError = validatePassword(newPassword);
            if (newPasswordError) {
                showErrorToast(`New ${newPasswordError}`);
                return false;
            }
            if (newPassword.trim() !== confirmPassword.trim()) {
                showErrorToast("New and confirm passwords doesn't match");
                return false;
            }
            if (currentPassword.trim() === newPassword.trim()) {
                showErrorToast("New password can't be the same as current password");
                return false;
            }
            let response;
            await toast.promise(
                updatePasswordCall(),
                {
                    loading: 'Updating Password...',
                    success: (val) => {
                        response = val;
                        setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''});
                        setShowPassword({currentPassword: false, newPassword: false, confirmPassword: false});
                        return <span>Password Updated Successfully</span>
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
        };
        return <div style={sectionStyle}>
            <div>
                <div class={'font-weight:700'}>Password</div>
                <div class={'font-weight:400 mb:30'}>Update your account password here
                </div>
                <div
                    class={'flex@md rel ai:center jc:space-between p:20 m:10|0 bt:1px|solid|lightgrey bb:1px|dashed|lightgrey'}>
                    <span class={'font-weight:600'}>Current Password</span>
                    <TextField name={'currentPassword'} type={`${showPassword.currentPassword ? 'text' : 'password'}`}
                               labelClass={'w:40%'}
                               placeholder={'Enter Current Password'}
                               value={passwordData.currentPassword}
                               onChange={handleInputChange}/>
                    <Icon
                        onClick={() => togglePasswordVisibility('currentPassword')}
                        class="abs top:50px top:25px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                        aria-label="Toggle password visibility"
                        icon={`${showPassword.currentPassword ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                    />
                </div>
                <div
                    class={'flex@md rel ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|dashed|lightgrey'}>
                    <span class={'font-weight:600'}>New Password</span>
                    <TextField name={'newPassword'} type={`${showPassword.newPassword ? 'text' : 'password'}`}
                               labelClass={'w:40%'}
                               placeholder={'Enter New Password'}
                               value={passwordData.newPassword}
                               onChange={handleInputChange}/>
                    <Icon
                        onClick={() => togglePasswordVisibility('newPassword')}
                        class="abs top:33px top:10px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                        aria-label="Toggle password visibility"
                        icon={`${showPassword.newPassword ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                    />
                </div>
                <div
                    class={'flex@md rel ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey'}>
                    <span class={'font-weight:600'}>Confirm Password</span>
                    <TextField name={'confirmPassword'} type={`${showPassword.confirmPassword ? 'text' : 'password'}`}
                               labelClass={'w:40%'}
                               placeholder={'Enter Confirm Password'}
                               value={passwordData.confirmPassword}
                               onChange={handleInputChange}/>
                    <Icon
                        onClick={() => togglePasswordVisibility('confirmPassword')}
                        class="abs top:33px top:10px@md right:20 flex ai:center bg:rgb(232,232,232):hover cursor:pointer p:5 r:50%"
                        aria-label="Toggle password visibility"
                        icon={`${showPassword.confirmPassword ? 'iconamoon:eye-light' : 'iconamoon:eye-off'}`}
                    />
                </div>
            </div>
            <div class={'flex jc:end'}>

                <button style={buttonStyle} onClick={onClickSave}>Update Password
                </button>
            </div>
        </div>;
    }


    return (<>
            <PageHeader
                title="Account Setting"
                breadcrumb={breadcrumbData}
            />
            <div class="radio-inputs m:20">
                <label class="radio" onClick={() => setSelectedTab('General')}>
                    <input type="radio" name="radio" checked={selectedTab() === 'General'}/>
                    <span class="name">General</span>
                </label>
                <label class="radio" onClick={() => setSelectedTab('Pricing')}>
                    <input type="radio" name="radio" checked={selectedTab() === 'Pricing'}/>
                    <span class="name">Pricing</span>
                </label>
                <label class="radio" onClick={() => setSelectedTab('Password')}>
                    <input type="radio" name="radio" checked={selectedTab() === 'Password'}/>
                    <span class="name">Password</span>
                </label>
            </div>


            <Show when={!isDataFetching()} fallback={<div class={'h:50vh grid place-items:center'}>
                <div class={'loader'}/>
            </div>
            }>
                <Switch>
                    <Match when={selectedTab() === 'General'}>
                        <GeneralSection/>
                    </Match>
                    <Match when={selectedTab() === 'Pricing'}>
                        <CurrentPlan/>
                        <PricingPlans/>
                    </Match>
                    <Match when={selectedTab() === 'Password'}>
                        <PasswordSection/>
                    </Match>
                </Switch>
            </Show>
        </>
    );
}

export default Settings;
