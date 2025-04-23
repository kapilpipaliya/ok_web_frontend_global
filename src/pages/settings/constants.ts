// CSS-in-JS versions of the constants
export const SETTINGS_CONSTANTS = {
  FORM_CSS: `
    ._id {
      padding: 10px;
      display: grid;
      gap: 20px;
    }
  `,
  FORM_GRID_CSS: `
    ._id {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: center;
      
      @media (min-width: 480px) {
        grid-template-columns: auto 1fr;
        gap-y: 24px;
        gap-x: 32px;
      }
    }
  `,
  GRID_ITEM_CSS: `
    ._id {
      display: grid;
      grid-template-columns: 200px 400px;
      align-items: center;
      gap: 8px;
    }
  `,
  GRID_ITEM_NARROW_CSS: `
    ._id {
      display: grid;
      grid-template-columns: 150px 500px;
      align-items: center;
      gap: 8px;
    }
  `,
  HEADER_MENU_CSS: `
    ._id {
      display: flex;
      background-color: \${args.theme.var.color.base_6};
      justify-content: space-between;
      border-radius: 7px;
    }
  `,
  LABEL_CSS: `
    ._id {
      color: \${args.theme.var.color.base};
      font-weight: 500;
      font-size: 15px;
    }
  `,
  MODAL: {
    BODY: {
      CSS: `
        ._id {
          padding: 16px;
        }
      `,
      TEXT_CSS: `
        ._id {
          font-size: 18px;
          font-weight: 500;
        }
      `,
    },
    BUTTONS: {
      CANCEL_CSS: `
        ._id {
          background-color: \${args.theme.var.color.base_20};
          color: \${args.theme.var.color.base_640};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: 1px solid \${args.theme.var.color.base_40};
        }
      `,
      DELETE_CSS: `
        ._id {
          background-color: \${args.theme.var.color.error};
          color: \${args.theme.var.color.base_10};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
        }
      `,
      SAVE_CSS: `
        ._id {
          background-color: \${args.theme.var.color.primary};
          color: \${args.theme.var.color.base_10};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          border: none;
        }
      `,
    },
    CONTAINER_CSS: `
      ._id {
        border: 1px solid \${args.theme.var.color.base_40};
        border-radius: 4px;
        padding: 0;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: \${args.theme.var.color.base_10};
      }
    `,
    FOOTER: {
      CSS: `
        ._id {
          display: flex;
          padding: 16px;
          gap: 6px;
          border-top: 1px solid \${args.theme.var.color.base_40};
          background-color: \${args.theme.var.color.base_10};
        }
      `,
    },
    HEADER: {
      CSS: `
        ._id {
          padding: 16px;
          border-bottom: 1px solid \${args.theme.var.color.base_40};
        }
      `,
      TEXT_CSS: `
        ._id {
          font-size: 18px;
          font-weight: 500;
        }
      `,
    },
    OVERLAY_CSS: `
      ._id {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: \${args.theme.var.color.base_20};
        opacity: 0.5;
      }
    `,
  },
  SAVE_BUTTON_CSS: `
    ._id {
      background-color: \${args.theme.var.color.primary};
      color: \${args.theme.var.color.base_10};
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
      margin-right: 8px;
    }
  `,
  SECONDARY_BUTTON_CSS: `
    ._id {
      background-color: \${args.theme.var.color.secondary};
      color: \${args.theme.var.color.base_10};
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
    }
  `,
  SECTION_DIVIDER_CSS: `
    ._id {
      margin-top: 2rem;
      margin-bottom: 2rem;
      border-top: 1px solid \${args.theme.var.color.base_40};
    }
  `,
  TITLE_CSS: `
    ._id {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      color: \${args.theme.var.color.base};
    }
  `,
} as const;

// CSS-in-JS functions for standalone constants
export const headerIconButtonCss = `
  ._id {
    border: 1px solid \${args.theme.var.color.base_40};
    background-color: \${args.theme.var.color.base_6};
    color: \${args.theme.var.color.base};
    justify-content: center;
    padding: 0.25rem;
    border-radius: 5px;
    &:hover {
      color: \${args.theme.var.color.primary};
    }
    &:disabled {
      color: \${args.theme.var.color.gray_50};
      cursor: not-allowed;
    }
  }
`;

export const toolBarCss = `
  ._id {
    display: flex;
    background-color: \${args.theme.var.color.base_10};
    gap: 2px;
    border-radius: 5px;
  }
`;

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

// CSS-in-JS version of CONSTANTS
export const CONSTANTS = {
  fullWidthCss: `
    ._id {
      width: 100%;
    }
  `,
  inputBorderRadiusCss: `
    ._id {
      border-radius: 6px;
    }
  `,
  inputFieldBorderCss: `
    ._id {
      border: 1px solid \${args.theme.var.color.base};
    }
  `,
  inputFieldPaddingCss: `
    ._id {
      padding: 7px;
    }
  `,
};

// CSS-in-JS version of PROPERTIES
export const PROPERTIES = {
  Css: {
    CheckBoxCss: `
      ._id {
        border: 1px solid \${args.theme.var.color.base};
        padding: 7px;
        border-radius: 6px;
      }
    `,
    RadioButtonCss: `
      ._id {
        border: 1px solid \${args.theme.var.color.base};
        padding: 7px;
        border-radius: 6px;
      }
    `,
    TextFieldCss: `
      ._id {
        border: 1px solid \${args.theme.var.color.base};
        width: 100%;
        padding: 7px;
        border-radius: 6px;
      }
    `,
  },
};

// CSS-in-JS version of STYLES
export const STYLES = {
  // Common button styles
  buttonCss: `
    ._id {
      cursor: pointer;
      transition: transform 0.2s linear;
    }
  `,
  button2Css: `
    ._id {
      background-color: \${args.theme.var.color.primary};
      color: \${args.theme.var.color.base_10};
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      border: none;
    }
  `,

  // Container styles
  container: {
    baseCss: `
      ._id {
        display: flex;
        width: 100%;
      }
    `,
    sectionCss: `
      ._id {
        border: 1px solid \${args.theme.var.color.base_40};
        padding: 5px 10px;
        width: 100%;
      }
    `,
    withBorderCss: `
      ._id {
        border: 1px solid \${args.theme.var.color.base_40};
        border-radius: 5px;
      }
    `,
  },

  iconButtonCss: `
    ._id {
      align-items: center;
      display: inline-flex;
    
    }
  `,

  // Input styles
  input: {
    baseCss: `
      ._id {
        border: 1px solid #ccc;
        outline: none;
        border-radius: 6px;
        width: 100%;
      }
    `,
    colorCss: `
      ._id {
        border: none;
        font-size: 14px;
        outline: none;
        width: 100%;
      }
    `,
    textCss: `
      ._id {
        font-size: 14px;
        padding: 10px;
      }
    `,
  },

  // Label styles
  labelCss: `
    ._id {
      display: flex;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      gap: 5px;
      white-space: nowrap;
    }
  `,

  overflowCss: `
    ._id {
      overflow: auto;
      scrollbar-color: \${args.theme.var.color.base_40};
      scrollbar-width: thin;
    }
  `,

  // Tooltip styles
  tooltip: {
    animationCss: "",
    arrowCss: `
      ._id {
        color: \${args.theme.var.color.base_280};
      }
    `,
    contentCss: `
      ._id {
        text-align: center;
        background-color: \${args.theme.var.color.base_280};
        color: \${args.theme.var.color.base_10};
        font-size: 13px;
        font-family: poppins;
        font-weight: 300;
        max-width: fit-content;
        min-width: fit-content;
        padding: 3px 10px;
        border-radius: 5px;
        text-wrap: nowrap;
        width: 100%;
        z-index: 1;
      }
    `,
  },
} as const;

export const APP_VERSION = "1.0.0";
export const APP_NAME = "DecodeUI";

// CSS-in-JS version of ICON_BUTTON_STYLES
export const ICON_BUTTON_STYLES = {
  baseCss: `
    ._id {
      cursor: pointer;
      transition: color 0.2s;
      padding: 0;
    }
  `,
  defaultCss: `
    ._id {
      color: \${args.theme.var.color.base_80};
    }
    ._id:hover {
      color: \${args.theme.var.color.primary_40};
    }
  `,
  deleteCss: `
    ._id {
      color: \${args.theme.var.color.error};
    }
    ._id:hover {
      color: \${args.theme.var.color.error_80};
    }
  `,
  spacingCss: `
    ._id {
      margin-right: 0.125rem;
    }
  `,
} as const;
