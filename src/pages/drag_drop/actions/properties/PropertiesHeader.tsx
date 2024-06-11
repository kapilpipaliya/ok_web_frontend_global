import { Icon } from "@iconify-icon/solid";

export function PropertiesHeader(props: { setShowDrawer: (show: boolean) => void }) {
    return (
        <div
            style={{
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                cursor: "pointer",
            }}
        >
            <div
                class="mb:2px ml:5px p:3|0 f:16"
                style="flex-grow: 1; font-weight: bold;text-align-last: left;"
            >
                Properties
            </div>
            <Icon
                onclick={() => props.setShowDrawer(false)}
                icon={"iconamoon:close-light"}
                class="bg:#ededed:hover r:50%"
                height={24}
                width={24}
                style={{ color: "lightgray", cursor: "pointer" }}
            />
        </div>
    );
}
