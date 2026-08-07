/**
 * Patch http(s).Server.listen so Nitro/srvx can share PORT across processes.
 * srvx defaults to exclusive:true (and no reusePort), which blocks multi-process bind.
 */
import http from "node:http";
import https from "node:https";

function patchServerListen(Server, label) {
  const original = Server.prototype.listen;
  if (original.__okSharedPortPatched) return;

  function listenPatched(...args) {
    if (args[0] && typeof args[0] === "object") {
      args[0] = {
        ...args[0],
        exclusive: false,
        reusePort: true,
      };
    }
    return original.apply(this, args);
  }
  listenPatched.__okSharedPortPatched = true;
  Server.prototype.listen = listenPatched;
  console.log(
    `[SharedPort] patched ${label}.Server.listen (exclusive:false, reusePort:true)`,
  );
}

patchServerListen(http.Server, "http");
patchServerListen(https.Server, "https");
