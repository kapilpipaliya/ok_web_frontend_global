export const SETTINGS_CONSTANTS = {
  FORM_CLASS: "p:10 grid gap:24",
  FORM_GRID_CLASS:
    "grid grid-cols:1 grid-cols:2@xs grid-template-cols:auto|1fr@xs gap-y:8 gap-y:24@xs gap-x:32@xs ai:center",
  GRID_ITEM_CLASS: "grid grid-template-columns:200px|400px ai:center gap:8",
  GRID_ITEM_CLASS_NARROW: "grid grid-template-columns:150px|500px ai:center gap:8",
  LABEL_CLASS: "color:dimgrey font-weight:500 font:15",
  SAVE_BUTTON_CLASS: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
  SECONDARY_BUTTON_CLASS: "bg:secondary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
  SECTION_DIVIDER_CLASS: "my-8 border-t border-gray-200"
} as const; 