import {Tab, TabContainer, TabList, Tabs, TextField} from "../solid-blocks/blocks";
import {IdAttr, Vertex} from "../../lib/graph";
import {GenericInputField} from "../input/GenaricInputField";
import StyleEditor from "./styleEditor";
import {ComponentUtils} from "../componentUtils";

export const ClassDesignTab = (props: {
    component: string;
    meta: Vertex;
    title?: string;
    data?: Vertex;
    setValue?: (data: any) => void;
    disabled?: boolean;
    isRealTime?: boolean;
    txnId?: number;
}) => {
    const {ContainerLabel,Container,IconifyIcon} = ComponentUtils();

    const VisibilitySection = () => {
        return <>
            <ContainerLabel title={'Visiblity'}/>
            <GenericInputField
                data={props.data}
                meta={props.meta}
                component={'CheckBox'}
                setValue={props.setValue}
                disabled={props.disabled!}
                title={'asd'}
                txnId={props.txnId!}
            />
        </>
    }

    const SizeSection = () => {
        return <>
            <ContainerLabel title={'Size'}/>
            <TextField label={'adf'} style={{"background-color": "#eeeeec", "font-size": "14px"}}
                       type={'text'}/>
        </>

    }

    return <tr class={'min-w:100% m:5px'}>
        <td colspan="2">
            <Tabs>
                <TabList>
                    <Tab>Design</Tab>
                </TabList>

                <TabContainer>
                    <Container>
                    <StyleEditor/>
                    </Container>
                    <Container>
                        <VisibilitySection/>
                    </Container>
                </TabContainer>
            </Tabs>
        </td>
    </tr>
}