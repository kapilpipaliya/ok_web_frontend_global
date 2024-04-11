import {Tab, TabContainer, TabList, Tabs } from "../solid-blocks/blocks";
import {Vertex} from "../../lib/graph";
import StyleEditor from "./styleEditor";
import {StyleCSSComponents} from "../StyleCSSComponents";

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
    const {Container} = StyleCSSComponents();

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
                </TabContainer>
            </Tabs>
        </td>
    </tr>
}