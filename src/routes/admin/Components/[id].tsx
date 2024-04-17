import {Title} from "@solidjs/meta";
import {useParams} from "@solidjs/router";

export default function Isad() {
    const params = useParams()
    return (
        <main>
            <Title>Entity</Title>
            <h1>{params.id}</h1>
        </main>
    );
}
