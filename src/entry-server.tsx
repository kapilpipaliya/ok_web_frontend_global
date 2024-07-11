// @refresh reload
// import { MasterCSS } from '@master/css'
// import { parseHTML } from '@master/css-server'
import { StartServer, createHandler } from "@solidjs/start/server";
// import { JSX } from 'solid-js';
import "tippy.js/dist/tippy.css";

import "~/css/modal.css";

// import masterConfig from "./master.css";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => {
      // const context = parseHTML(((children as JSX.ArrayElement)?.[0] as unknown as { t: string })?.t ?? "");
      // const { classes } = context
      // const css = new MasterCSS(masterConfig);
      // classes.forEach(eachClass => css.add(eachClass));
      return (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta
              content="width=device-width, initial-scale=1"
              name="viewport"
            />
            <link
              href="/website_icons/apple-touch-icon.png"
              rel="apple-touch-icon"
              sizes="180x180"
            />
            <link
              href="/website_icons/favicon-32x32.png"
              rel="icon"
              sizes="32x32"
              type="image/png"
            />
            <link
              href="/website_icons/favicon-16x16.png"
              rel="icon"
              sizes="16x16"
              type="image/png"
            />

            <meta content="#da532c" name="msapplication-TileColor" />

            {assets}

            {/* <style id="master">{css.text}</style> */}
          </head>
          <body>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      );
    }}
  />
));
