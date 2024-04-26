import {Title} from "@solidjs/meta";

export default function SiteTitle(props: {children: string}) {
    return <Title>{props.children} | EasyFormForge</Title>
}
