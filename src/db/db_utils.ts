const options = {
  // Default will run as Web Worker, i.e. runInWebWorker = true if not specified
  // Set runInWebWorker to false to run in same thread as main page javascript
  runInWebWorker: true,

  // Proxy for xmlhttprequest to avoid CORS. This is optional. If not provided
  // will attempt to download from given URL directly which might give error
  // Access denied for URL resource due to "Cross-Origin Request Blocked"
  // The data download proxy must take one GET parameter, u, which is the URL to download
  // and must return the data from the URL to download.
  // Also it should add the "Access-Control-Allow-Origin: *" http header to the response
  // if the proxy is not served from same url as Cypher.js script is run from
  dataDownloadProxy: "http://proxy_url?u=",
};
// @ts-ignore
const cypher = new Cypher(options);

export const run = (q: string) => {
  // const query = 'merge (n:Test{what:"Hello World"}) return n';

  return new Promise((resolve, reject) => {
    cypher.execute(
      q,
      function (results) {
        console.log(results)
        resolve(results.output);
      },
      function (errorText) {
        console.error(errorText);
        reject(errorText)
      }
    );
  })
};
const bootstrap = () => {
  run("");
};
// bootstrap();
window.run = run;
