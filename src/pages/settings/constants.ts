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
      "position:fixed top:0 left:0 w:100% h:100% bg:base-10 opacity:0.5",
  },
  SAVE_BUTTON_CLASS:
    "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none mr:8",
  SECONDARY_BUTTON_CLASS:
    "bg:secondary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
  SECTION_DIVIDER_CLASS: "my-8 border-t border-gray-200",
  TITLE_CLASS: "font-size:24 font-weight:bold text-align:center color:base-50",
} as const;

export const headerIconButtonClass =
  "b:1px|solid|base-20 bg:base-5 color:base-50 color:primary-50:hover jc:center p:6 r:7";
export const toolBarClass = "flex bg:base-5 gap:6 r:7";
export const profileImage = "/images/profile.png";

export const EMAIL_TEMPLATES = {
  AccountDeletionRequest: "AccountDeletionRequest",
  EmailChanged: "EmailChanged",
  EmailChangeSuccessful: "EmailChangeSuccessful",
  EmailConfirmation: "EmailConfirmation",
  InvitationEmail: "InvitationEmail",
  PasswordChanged: "PasswordChanged",
  PasswordReset: "PasswordReset",
  ProfileUpdated: "ProfileUpdated",
  SignupConfirmation: "SignupConfirmation",
  SignupEmailVerification: "SignupEmailVerification",
  TestEmail: "TestEmail",
  TwoFactorAuth: "TwoFactorAuth",
  VerificationCode: "VerificationCode",
  WelcomeEmail: "WelcomeEmail",
} as const;

export const isDev = false;
export const CONSTANTS = {
  fullWidth: "w:100%",
  inputBorderRadius: "r:6",
  inputFieldBorder: "border:1px|solid|base",
  inputFieldPadding: "p:7", // use p:7 to make select and text input same height
};
export const PROPERTIES = {
  Css: {
    CheckBox: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
    RadioButton: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
    TextField: `${CONSTANTS.inputFieldBorder} ${CONSTANTS.fullWidth} ${CONSTANTS.inputFieldPadding} ${CONSTANTS.inputBorderRadius}`,
  },
};
export const STYLES = {
  // Common button styles
  button: "cursor:pointer transition:transform|0.2s|linear",
  button2: "bg:primary fg:base-5 p:8|16 r:4 cursor:pointer border:none",
  // Container styles
  container: {
    base: "flex w:full",
    section: "b:1px|solid|lightgray p:5|10 w:full",
    withBorder: "b:1px|solid|lightgray r:5",
  },

  iconButton: "ai:center d:inline-flex",

  // Input styles
  input: {
    base: "b:1px|solid|#ccc outline:none r:6px w:100%",
    color: "b:none f:14 outline:none w:100%",
    text: "f:14 p:10px",
  },

  // Label styles
  label: "flex ai:center font-weight:400 f:14 gap:5 white-space:nowrap",

  overflow: "overflow:auto scrollbar-color:lightgrey {scrollbar-width:thin}",
  // Tooltip styles
  tooltip: {
    animation: "",
    arrow: "color:base-60",
    content:
      "center bg:base-60 color:base-5 f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content p:3|10 r:5 text:nowrap w:full z-index:1",
  },
} as const;
export const APP_VERSION = "1.0.0";
export const APP_NAME = "DecodeUI";

export const ICON_BUTTON_STYLES = {
  base: "cursor:pointer transition:color|0.2s",
  default: "color:base-5 color:primary-20:hover",
  delete: "color:error-50 color:error-40:hover",
  spacing: "mr:2",
} as const;
