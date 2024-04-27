import {createSignal} from "solid-js";
import '../base.css'
import {Tab, TabContainer, TabList, Tabs} from "~/components/solid-blocks/blocks";
import StyleEditor from "~/components/drag-drop-pages/styleEditor";
import {Icon} from "@iconify-icon/solid";

function Settings() {
    const [name, setName] = createSignal('John Doe');
    const [email, setEmail] = createSignal('johndoe@example.com');
    const [country, setCountry] = createSignal('United States');

    // You would place your inline styles here
    const sectionStyle = {
        'background-color': '#f5f7fa',
        padding: '20px',
        margin: '20px',
        'border-radius': '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    };

    const inputStyle = {
        padding: '10px',
        margin: '5px 0',
        'border-radius': '4px',
        border: '1px solid #ccc',
    };

    const buttonStyle = {
        padding: '10px 15px',
        margin: '10px 0',
        'border-radius': '4px',
        border: 'none',
        'background-color': '#5b7dff',
        color: 'white',
        cursor: 'pointer',
    };

    return (<>
            <Tabs style={{padding: "10px"}}>
                <TabList class={'m:5px w:25% '}>
                    <Tab class={'w:50% dev-overlay-stack-frame-file'}><Icon icon={'uil:setting'} height={22} width={22} class={'mr:5 pt:5'}/>General</Tab>
                    <Tab class={'w:50%'}>Pricing</Tab>
                </TabList>
                <TabContainer>
                    <div style={sectionStyle}>
                        <div style={{'margin-bottom': '20px', 'font-size': '20px', 'font-weight': 'bold'}}>Settings
                        </div>
                        <div>
                            <label>Name:</label>
                            <input type="text" style={inputStyle} value={name()}
                                   onInput={(e) => setName(e.target.value)}/>
                        </div>
                        <div>
                            <label>Email:</label>
                            <input type="email" style={inputStyle} value={email()}
                                   onInput={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div>
                            <label>Country:</label>
                            <select style={inputStyle} value={country()} onInput={(e) => setCountry(e.target.value)}>
                                <option>United States</option>
                                <option>Canada</option>
                                <option>United Kingdom</option>
                            </select>
                        </div>
                        <button style={buttonStyle} onClick={() => console.log('Settings saved.')}>Save Changes</button>
                    </div>
                </TabContainer>
                <TabContainer/>
            </Tabs>

        </>
    );
}

export default Settings;
