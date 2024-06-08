// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import "~/css/modal.css";
import { LoaderNew } from "./components/custom/LoaderSimple";
import "tippy.js/dist/tippy.css";
export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/Website_Icons/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/Website_Icons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/Website_Icons/favicon-16x16.png"
          />

          <meta name="msapplication-TileColor" content="#da532c" />

          {assets}
          <style>
            {`
              /* Hide the loader after the page has loaded */
              body.loaded #loader {
                display: none;
              }
            `}
          </style>
        </head>
        <body>
          <div id="loader" class="h:10 w:10">
            <LoaderNew />
          </div>
          <div id="app">{children}</div>
          {scripts}
          <script>
            {`
              window.addEventListener('load', () => {
                document.body.classList.add('loaded');
              });
            `}
          </script>
        </body>
      </html>
    )}
  />
));
