import {createMemo, createSignal, For, Show} from 'solid-js';
import '../css/componentUtilCSS.css'
import {Icon} from "@iconify-icon/solid";
import {RenderComponent} from "./RenderComponent";
import JSONSchema from "./Utils";

const StyleEditor = () => {
    const filterSections = (query) => {
        const filteredSections = Object.entries(JSONSchema)
            .map(([sectionName, properties]) => {
                const isOpen = !!query; // Set isOpen to true if there's a query
                const filteredProperties = Object.entries(properties)
                    .map(([propertyName, property]) => {
                        let includeProperty = false;
                        if (property.label && property.label.toLowerCase().includes(query.toLowerCase())) {
                            includeProperty = true;
                        }
                        if (property.component === 'grid' && property.children && property.children.length > 0) {
                            const matchingChildren = property.children.filter((child) =>
                                child.label && child.label.toLowerCase().includes(query.toLowerCase())
                            );
                            if (matchingChildren.length > 0) {
                                includeProperty = true;
                                property = { ...property, children: matchingChildren };
                            }
                        }
                        return includeProperty ? [propertyName, property] : null;
                    })
                    .filter(Boolean) // Remove null entries
                    .reduce((acc, [propertyName, property]) => {
                        acc[propertyName] = property;
                        return acc;
                    }, {});
                console.log(query.toLowerCase(),sectionName,filteredProperties)
                return {[sectionName]: {properties: filteredProperties, isOpen: isOpen}};
            })
            .reduce((acc, section) => {

                const [sectionName, data] = Object.entries(section)[0];
                if (Object.entries(data.properties).length > 0) {
                    acc[sectionName] = data;
                }
                return acc;
            }, {});

        return filteredSections;
    };

    const [search, setSearch] = createSignal('');
    const [filteredSections, setFilteredSections] = createSignal(filterSections(search()));
    const length = createMemo(() => Object.keys(filteredSections()).length);

    const CollapsibleSection = (props: { index: any, title: any, properties: any, isOpen: boolean }) => {
        const [isOpen, setIsOpen] = createSignal(props.isOpen ?? false);

        return (
            <div
                class={`p:5|10 w:full b:1px|solid|lightgray ${props.index === 0 && length() === 1 ? 'r:5' :
                    props.index === length() - 1 ? 'r:0|0|5|5' : props.index === 0 && length() > 1 ? 'r:5|5|0|0' : ''}

`}>
                <div onClick={() => setIsOpen(!isOpen())} class={'cursor:pointer flex ai:center jc:space-between'}>
                    <span class={'f:15 font-weight:600'}>{props.title}</span>
                    <Icon
                        icon="uil:angle-up"
                        height={25}
                        width={25}
                        class={"cursor:pointer transform 1s ease-in-out"}
                        style={{
                            transition: "transform 0.2s linear",
                            transform: `${
                                isOpen()
                                    ? "rotate(0deg)"
                                    : "rotate(180deg)"
                            }`,
                        }}
                    />
                </div>
                <Show when={isOpen()}>
                    <hr class={'color:#e1e1e1 m:2'}/>
                    <For each={Object.entries(props.properties)}>
                        {([name, value]) => <RenderComponent value={value}/>}
                    </For>
                </Show>
            </div>
        );
    };


    // Function to handle search input
    const handleSearch = (value) => {
        setSearch(value);
        setFilteredSections(filterSections(value));
    };
    return <>
        <span class={'flex ai:start jc:space-between flex-direction:column w:full mb:10 mt:10'}>
            <nav class="bg:white 0px 0px 10px 10px w:full p:5|0">
                <div class="group">
                    <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
                        <g>
                            <path
                                d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
                        </g>
                    </svg>
                    <input placeholder="Search Style..." type="search" class="inputSearch f:14" value={search()}
                           onInput={(e) => {
                               handleSearch(e.target.value);
                           }}
                    />
                </div>
            </nav>
        <For each={Object.entries(filteredSections())} fallback={''}>
    {(section, index) => {
        const [sectionName, {properties, isOpen}] = section;

        return (
            <Show when={Object.keys(properties).length > 0}>
                <CollapsibleSection
                    title={sectionName}
                    properties={properties}
                    index={index()}
                    isOpen={isOpen}
                />
            </Show>
        );
    }}
</For>
        </span>
    </>
};

export default StyleEditor;

