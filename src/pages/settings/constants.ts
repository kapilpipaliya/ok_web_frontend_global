export const SETTINGS_CONSTANTS = {
  FORM_CLASS: "p:10 grid gap:20",
  FORM_GRID_CLASS:
    "grid grid-cols:1 grid-cols:2@xs grid-template-cols:auto|1fr@xs gap-y:8 gap-y:24@xs gap-x:32@xs ai:center",
  GRID_ITEM_CLASS: "grid grid-template-columns:200px|400px ai:center gap:8",
  GRID_ITEM_CLASS_NARROW:
    "grid grid-template-columns:150px|500px ai:center gap:8",
  HEADER_MENU_CLASS: "flex bg:base-5 jc:space-between r:7",
  LABEL_CLASS: "color:base-50 font-weight:500 font:15",
  MODAL: {
    BODY: {
      CLASS: "p:16",
      TEXT_CLASS: "font-size:18 font-weight:500",
    },
    BUTTONS: {
      CANCEL_CLASS:
        "bg:base-10 fg:base-80 p:8|16 r:4 cursor:pointer border:1px|solid|base-20",
      DELETE_CLASS: "bg:error fg:base-5 p:8|16 r:4 cursor:pointer border:none",
      SAVE_CLASS: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
    },
    CONTAINER_CLASS:
      "border:1px|solid|base-20 r:4 p:0 position:fixed top:50% left:50% transform:translate(-50%,-50%) bg:base-5",
    FOOTER: {
      CLASS: "display:flex p:16 gap:6 border-top:1px|solid|base-20 bg:base-5",
    },
    HEADER: {
      CLASS: "p:16 border-bottom:1px|solid|base-20",
      TEXT_CLASS: "font-size:18 font-weight:500",
    },
    OVERLAY_CLASS:
      "position:fixed top:0 left:0 w:100% h:100% bg:base-10 opacity:50 z:1",
  },
  SAVE_BUTTON_CLASS:
    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
  SECONDARY_BUTTON_CLASS:
    "bg:secondary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
  SECTION_DIVIDER_CLASS: "my-8 border-t border-gray-200",
} as const;
