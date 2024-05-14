import { createSignal, JSX } from "solid-js";

function Drawer(props: {
    customButton: (props: { onClick: () => void; isOpen: boolean }) => JSX.Element;
    width: string, title: any, children: any
}) {
    const [isOpen, setIsOpen] = createSignal(false);

    const toggleDrawer = () => {
        setIsOpen(!isOpen());
    };

    return (
        <>
            <props.customButton onClick={toggleDrawer} isOpen={isOpen()} />

            <div style={{ display: isOpen() ? "block" : "none" }}>
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        'background-color': "rgba(0, 0, 0, 0.5)",
                        'z-index': 10,
                        opacity: isOpen() ? 1 : 0,
                        transition: "opacity 0.5s",
                    }}
                    onClick={toggleDrawer}
                />
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        right: isOpen() ? 0 : `-${props.width}`,
                        width: props.width || "350px",
                        height: "100%",
                        'background-color': "white",
                        'box-shadow': "0 2px 5px rgba(0,0,0,0.5)",
                        "border-radius": '15px 0px 0px 15px',
                        'z-index': 20,
                        transition: "right 0.5s",
                    }}
                >
                    <div style={{ padding: "20px" }}>
                        <h2>{props.title || "Drawer Content"}</h2>
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Drawer;
