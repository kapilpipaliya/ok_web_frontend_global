import {createEffect, createSignal, Match, Show, Switch} from "solid-js";
import '../base.css'
import {Tab, TabContainer, TabList, Tabs, TextField} from "~/components/solid-blocks/blocks";
import StyleEditor from "~/components/drag-drop-pages/styleEditor";
import {Icon} from "@iconify-icon/solid";
import PageHeader from "~/components/custom-component/Breadcumb";
import {getUser} from "~/pages/auth/auth";
import './css/tab.css'
import {createStore} from "solid-js/store";
import {API} from "~/components/DataFetcher";
import {useToast} from "~/components/custom-component/toast";

function Settings() {
    const {showSuccessToast}= useToast();

    // createEffect(() => {
        getUser().then(data => {
            setProfileData({
                username: data.properties.username,
                email: data.properties.email,
                id: data.id,
                country: 'United States'
            });
        });
    // });

    const [profileData, setProfileData] = createStore({
        username: '',
        email: '',
        id: '',
        country: 'United States'
    });
    const [isEdit, setIsEdit] = createSignal(false);
    const [selectedTab, setSelectedTab] = createSignal('General');

    // You would place your inline styles here
    const sectionStyle = {
        'background-color': '#f5f7fa',
        padding: '20px',
        margin: '20px',
        'border-radius': '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    const breadcrumbData = [
        {name: 'Home', href: '/'},
        {name: 'Admin', href: '/admin'},
        {name: 'Settings'},
    ];

    const onClickSave = async () => {
        try {
            let response = await fetch(API.profileUrl, {
                method: 'POST',
                body: JSON.stringify({email: profileData.email, username: profileData.username,userId: profileData.id})
            });
            if (response.ok) {
                setIsEdit(false)
                showSuccessToast(response.message)
                const result = await response.json();
                if (result.error) {
                    return Promise.reject(result.error);
                }
                // setProfileData(response.data.properties)
                return result;
            } else {
                setIsEdit(false)
                return Promise.reject(response.statusText);
            }
        } catch (error) {
            setIsEdit(false)
            return Promise.reject(error.response);
        }

    }

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setProfileData({...profileData, [name]: value});
    };



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
                    <input type="radio" name="radio"/>
                    <span class="name">Pricing</span>
                </label>
            </div>


            <Switch>
                <Match when={selectedTab() === 'General'}>
                    <div style={sectionStyle}>
                        <div>
                            <div class={'font-weight:700'}>Personal Info</div>
                            <div class={'font-weight:400 mb:30'}>Update personal details here
                            </div>
                            <div
                                class={'flex ai:center jc:space-between p:20|20|0|20 m:10|0|5|0 bt:1px|dashed|lightgrey'}>
                                <span class={'font-weight:600'}>User Id</span>
                                <TextField labelClass={'w:40%'} name={'id'} label={'Id'} disabled={true}
                                           value={profileData.id}
                                           onChange={handleInputChange}/>
                            </div>
                            <div
                                class={'flex ai:center jc:space-between p:20 m:10|0 bt:1px|dashed|lightgrey bb:1px|dashed|lightgrey'}>
                                <span class={'font-weight:600'}>UserName</span>
                                <TextField name={'username'} disabled={!isEdit()} labelClass={'w:40%'} label={'Username'}
                                           value={profileData.username}
                                           onChange={handleInputChange}/>
                            </div>
                            <div
                                class={'flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|dashed|lightgrey'}>
                                <span class={'font-weight:600'}>Email Address</span>
                                <TextField name={'email'} disabled={!isEdit()} labelClass={'w:40%'} label={'Email Address'}
                                           value={profileData.email}
                                           onChange={handleInputChange}/>
                            </div>
                            <div
                                class={'flex ai:center jc:space-between p:5|20|20|20 mb:10 bb:1px|solid|lightgrey'}>
                                <span class={'font-weight:600'}>Country</span>
                                <select name={'country'} disabled={!isEdit()} style={inputStyle} value={profileData.country}
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
                    </div>
                </Match>
                <Match when={selectedTab() === 'Pricing'}>
                    <></>
                </Match>
            </Switch>

        </>
    );
}

export default Settings;
