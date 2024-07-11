import type { Config } from "@master/css";

import badge from "./badge";
import button from "./button";
import segments from "./segments";
import select from "./select";
import switchComponent from "./switch";
import tabs from "./tabs";

export const ui = {
  extends: [button, segments, switchComponent, select, tabs, badge],
  styles: {
    primary: "bg:primary fg:primary-contrast outline:1|primary-ring",
    purple: "bg:purple fg:purple-contrast outline:1|purple-ring",
    red: "bg:red fg:red-contrast outline:1|red-ring",
  },
  variables: {
    primary: {
      ring: {
        "@dark": "$(white)/.3",
        "@light": "$(black)/.1",
      },
    },
    purple: {
      ring: {
        "@dark": "$(white)/.2",
        "@light": "$(black)/.15",
      },
    },
    red: {
      ring: {
        "@dark": "$(white)/.2",
        "@light": "$(black)/.15",
      },
    },
    text: {
      "primary-contrast": {
        "@dark": "$(primary-95)",
        "@light": "$(primary-90)",
      },
      "purple-contrast": "$(white)",
      "red-contrast": "$(white)",
    },
    touch: {
      primary: {
        "@dark": "$(primary-40)",
        "@light": "$(primary-30)",
      },
      purple: {
        "@dark": "$(purple-40)",
        "@light": "$(purple-30)",
      },
      red: {
        "@dark": "$(red-40)",
        "@light": "$(red-30)",
      },
    },
  },
} as Config;

export default ui;
