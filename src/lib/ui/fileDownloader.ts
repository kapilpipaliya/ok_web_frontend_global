export function fileDownloader(opt: {
  bom?: string;
  data: ArrayBuffer | ArrayBufferView | Blob | string;
  fileName: string;
  mime?: string;
  title: string;
}) {
  const throwError = (key: string) => {
    throw new Error(`No ${key} provided to generate-download-link.`);
  };

  const data = opt.data || throwError("data");
  const title = opt.title || throwError("title");
  const fileName = opt.fileName || throwError("fileName");

  const anchor = document.createElement("a");
  anchor.style.display = "none";
  const blobData = typeof opt.bom !== "undefined" ? [opt.bom, data] : [data];
  const blob = new Blob(blobData, {
    type: opt.mime || "application/octet-stream",
  });
  const blobURL = window.URL?.createObjectURL
    ? window.URL.createObjectURL(blob)
    : window.webkitURL.createObjectURL(blob);

  const attachDataAsOctetStream = (_data: any) => {
    // const link = 'data:application/octet-stream,' + encodeURIComponent(data);
    // anchor.setAttribute('href', link);
    anchor.href = blobURL;
  };

  const setFilename = (fileName: string) => {
    anchor.setAttribute("download", fileName);
  };

  const setTitle = (title: string) => {
    anchor.appendChild(document.createTextNode(title));
  };

  // Safari thinks _blank anchor are pop ups. We only want to set _blank
  // target if the browser does not support the HTML5 download attribute.
  // This allows you to download files in desktop safari if pop up blocking
  // is enabled.
  if (typeof anchor.download === "undefined") {
    anchor.setAttribute("target", "_blank");
  }

  attachDataAsOctetStream(data);
  setFilename(fileName);
  setTitle(title);

  document.body.appendChild(anchor);
  anchor.click();

  // Fixes "webkit blob resource error 1"
  setTimeout(() => {
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(blobURL);
  }, 200);
}
