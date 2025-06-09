google.maps.__gjsload__("log", (_) => {
  var PLa = (a) => {
      var b = _.Uga();
      b.Fg.has(a);
      return new _.Vga(() => {
        performance.now() >= b.Gg && b.reset();
        b.Eg.has(a) || b.Eg.set(a, _.mn());
        return b.Eg.get(a);
      });
    },
    RLa = (a, b, c, d, e, f, g) => {
      const h = new _.Ti();
      QLa.push(h);
      b && _.Ei(h, "complete", b);
      h.Kn.add("ready", h.AD, !0, void 0, void 0);
      f && (h.Ng = Math.max(0, f));
      g && (h.Lg = g);
      h.send(a, c, d, e);
    },
    SLa = (a, b) => {
      if (b && a in b) return a;
      let c = _.LH();
      return c
        ? ((c = c.toLowerCase()),
          (a = c + _.oxa(a)),
          b === void 0 || a in b ? a : null)
        : null;
    },
    TLa = (a) => {
      if (!a) return "";
      if (/^about:(?:blank|srcdoc)$/.test(a)) return window.origin || "";
      a.indexOf("blob:") === 0 && (a = a.substring(5));
      a = a.split("#")[0].split("?")[0];
      a = a.toLowerCase();
      a.indexOf("//") == 0 && (a = window.location.protocol + a);
      /^[\w\-]*:\/\//.test(a) || (a = window.location.href);
      var b = a.substring(a.indexOf("://") + 3),
        c = b.indexOf("/");
      c != -1 && (b = b.substring(0, c));
      c = a.substring(0, a.indexOf("://"));
      if (!c) throw Error("URI is missing protocol: " + a);
      if (
        c !== "http" &&
        c !== "https" &&
        c !== "chrome-extension" &&
        c !== "moz-extension" &&
        c !== "file" &&
        c !== "android-app" &&
        c !== "chrome-search" &&
        c !== "chrome-untrusted" &&
        c !== "chrome" &&
        c !== "app" &&
        c !== "devtools"
      )
        throw Error("Invalid URI scheme in origin: " + c);
      a = "";
      var d = b.indexOf(":");
      if (d != -1) {
        var e = b.substring(d + 1);
        b = b.substring(0, d);
        if ((c === "http" && e !== "80") || (c === "https" && e !== "443"))
          a = ":" + e;
      }
      return c + "://" + b + a;
    },
    ULa = () => {
      function a() {
        e[0] = 1732584193;
        e[1] = 4023233417;
        e[2] = 2562383102;
        e[3] = 271733878;
        e[4] = 3285377520;
        p = n = 0;
      }
      function b(r) {
        for (var u = g, w = 0; w < 64; w += 4)
          u[w / 4] =
            (r[w] << 24) | (r[w + 1] << 16) | (r[w + 2] << 8) | r[w + 3];
        for (w = 16; w < 80; w++)
          (r = u[w - 3] ^ u[w - 8] ^ u[w - 14] ^ u[w - 16]),
            (u[w] = ((r << 1) | (r >>> 31)) & 4294967295);
        r = e[0];
        var x = e[1],
          y = e[2],
          C = e[3],
          G = e[4];
        for (w = 0; w < 80; w++) {
          if (w < 40)
            if (w < 20) {
              var L = C ^ (x & (y ^ C));
              var K = 1518500249;
            } else (L = x ^ y ^ C), (K = 1859775393);
          else
            w < 60
              ? ((L = (x & y) | (C & (x | y))), (K = 2400959708))
              : ((L = x ^ y ^ C), (K = 3395469782));
          L =
            ((((r << 5) | (r >>> 27)) & 4294967295) + L + G + K + u[w]) &
            4294967295;
          G = C;
          C = y;
          y = ((x << 30) | (x >>> 2)) & 4294967295;
          x = r;
          r = L;
        }
        e[0] = (e[0] + r) & 4294967295;
        e[1] = (e[1] + x) & 4294967295;
        e[2] = (e[2] + y) & 4294967295;
        e[3] = (e[3] + C) & 4294967295;
        e[4] = (e[4] + G) & 4294967295;
      }
      function c(r, u) {
        if (typeof r === "string") {
          r = unescape(encodeURIComponent(r));
          for (var w = [], x = 0, y = r.length; x < y; ++x)
            w.push(r.charCodeAt(x));
          r = w;
        }
        u || (u = r.length);
        w = 0;
        if (n == 0)
          while (w + 64 < u) b(r.slice(w, w + 64)), (w += 64), (p += 64);
        while (w < u)
          if (((f[n++] = r[w++]), p++, n == 64))
            for (n = 0, b(f); w + 64 < u; )
              b(r.slice(w, w + 64)), (w += 64), (p += 64);
      }
      function d() {
        var r = [],
          u = p * 8;
        n < 56 ? c(h, 56 - n) : c(h, 64 - (n - 56));
        for (var w = 63; w >= 56; w--) (f[w] = u & 255), (u >>>= 8);
        b(f);
        for (w = u = 0; w < 5; w++)
          for (var x = 24; x >= 0; x -= 8) r[u++] = (e[w] >> x) & 255;
        return r;
      }
      for (var e = [], f = [], g = [], h = [128], l = 1; l < 64; ++l) h[l] = 0;
      var n, p;
      a();
      return {
        reset: a,
        update: c,
        digest: d,
        xI: () => {
          for (var r = d(), u = "", w = 0; w < r.length; w++)
            u +=
              "0123456789ABCDEF".charAt(Math.floor(r[w] / 16)) +
              "0123456789ABCDEF".charAt(r[w] % 16);
          return u;
        },
      };
    },
    WLa = (a, b, c) => {
      var d = String(_.ta.location.href);
      return d && a && b ? [b, VLa(TLa(d), a, c || null)].join(" ") : null;
    },
    VLa = (a, b, c) => {
      var d = [];
      let e = [];
      if ((Array.isArray(c) ? 2 : 1) == 1)
        return (
          (e = [b, a]),
          _.Nb(d, (h) => {
            e.push(h);
          }),
          XLa(e.join(" "))
        );
      const f = [],
        g = [];
      _.Nb(c, (h) => {
        g.push(h.key);
        f.push(h.value);
      });
      c = Math.floor(new Date().getTime() / 1e3);
      e = f.length == 0 ? [c, b, a] : [f.join(":"), c, b, a];
      _.Nb(d, (h) => {
        e.push(h);
      });
      a = XLa(e.join(" "));
      a = [c, a];
      g.length == 0 || a.push(g.join(""));
      return a.join("_");
    },
    XLa = (a) => {
      const b = ULa();
      b.update(a);
      return b.xI().toLowerCase();
    },
    OO = function () {
      this.Eg = document || { cookie: "" };
    },
    PO = (a) => {
      a = (a.Eg.cookie || "").split(";");
      const b = [],
        c = [];
      let d, e;
      for (let f = 0; f < a.length; f++)
        (e = _.EG(a[f])),
          (d = e.indexOf("=")),
          d == -1
            ? (b.push(""), c.push(e))
            : (b.push(e.substring(0, d)), c.push(e.substring(d + 1)));
      return { keys: b, values: c };
    },
    YLa = (a, b, c, d) => {
      (a = _.ta[a]) || typeof document === "undefined" || (a = new OO().get(b));
      return a ? WLa(a, c, d) : null;
    },
    ZLa = (a) => {
      var b = TLa(_.ta?.location.href);
      const c = [];
      var d;
      (d =
        _.ta.__SAPISID ||
        _.ta.__APISID ||
        _.ta.__3PSAPISID ||
        _.ta.__1PSAPISID ||
        _.ta.__OVERRIDE_SID)
        ? (d = !0)
        : (typeof document !== "undefined" &&
            ((d = new OO()),
            (d =
              d.get("SAPISID") ||
              d.get("APISID") ||
              d.get("__Secure-3PAPISID") ||
              d.get("__Secure-1PAPISID"))),
          (d = !!d));
      if (d) {
        var e = (d = b =
          b.indexOf("https:") == 0 ||
          b.indexOf("chrome-extension:") == 0 ||
          b.indexOf("chrome-untrusted://new-tab-page") == 0 ||
          b.indexOf("moz-extension:") == 0)
          ? _.ta.__SAPISID
          : _.ta.__APISID;
        e ||
          typeof document === "undefined" ||
          ((e = new OO()),
          (e = e.get(d ? "SAPISID" : "APISID") || e.get("__Secure-3PAPISID")));
        (d = e ? WLa(e, d ? "SAPISIDHASH" : "APISIDHASH", a) : null) &&
          c.push(d);
        b &&
          ((b = YLa("__1PSAPISID", "__Secure-1PAPISID", "SAPISID1PHASH", a)) &&
            c.push(b),
          (a = YLa("__3PSAPISID", "__Secure-3PAPISID", "SAPISID3PHASH", a)) &&
            c.push(a));
      }
      return c.length == 0 ? null : c.join(" ");
    },
    $La = (a) => a
        ? a.__owner
          ? a.__owner
          : a.parentNode && a.parentNode.nodeType === 11
            ? a.parentNode.host
            : a.parentElement || null
        : null,
    aMa = (a, b, c) => {
      for (c || (a = $La(a)); a && !b(a); ) a = $La(a);
    },
    bMa = () => {},
    cMa = function (a) {
      this.Fg = this.Eg = void 0;
      this.Gg = !1;
      this.Hg = window;
      this.Ig = a;
      this.Jg = bMa;
    },
    gMa = (a, b) => {
      const c = dMa++,
        d = Math.max(a.measure ? a.measure.length : 0, a.by ? a.by.length : 0),
        e = { id: c, jF: a.measure, kF: a.by, context: b, args: [] };
      let f = e;
      return function () {
        var g = f.rB !== 0;
        g && (f = Object.assign({ rB: 0 }, e));
        b || (f.context = this);
        f.args = Array.prototype.slice.call(arguments);
        d > arguments.length && f.args.push(new a.vM());
        g &&
          ((g = QO),
          !a.MB || RO == 0 || (a.measure && RO != 1) || (g = (g + 1) % 2),
          eMa[g].push(f));
        return fMa(a.window);
      };
    },
    kMa = (a, b) => {
      const c = {};
      let d;
      RO = 1;
      for (var e = 0; e < a.length; ++e) {
        d = a[e];
        var f = d.args[d.args.length - 1];
        f && typeof f === "object" && (f.now = b);
        if (d.jF) {
          d.rB = 1;
          try {
            d.jF.apply(d.context, d.args);
          } catch (g) {
            (c[e] = !0), _.Xa(g);
          }
        }
      }
      RO = 2;
      for (e = 0; e < a.length; ++e)
        if (
          ((d = a[e]),
          (f = d.args[d.args.length - 1]) &&
            typeof f === "object" &&
            (f.now = b),
          !c[e] && d.kF)
        ) {
          d.rB = 2;
          try {
            d.kF.apply(d.context, d.args);
          } catch (g) {
            _.Xa(g);
          }
        }
      SO > 0 &&
        b > 1 &&
        ((a = b - SO),
        a < 500 && (hMa++, a > 100 && iMa++, jMa < a && (jMa = a)));
      SO = TO.size && b > 1 ? b : 0;
    },
    fMa = (a) => {
      if (!TO.has(a)) {
        TO.size || (UO = new _.qM());
        TO.add(a);
        const b = UO.resolve;
        a.requestAnimationFrame((c) => {
          TO.clear();
          const d = eMa[QO];
          QO = (QO + 1) % 2;
          try {
            kMa(d, c);
          } finally {
            (RO = 0), (d.length = 0);
          }
          b();
        });
      }
      return UO.promise;
    },
    mMa = (a) => {
      if (lMa.has(a)) return lMa.get(a);
      throw Error("Unrecognized EventLabel " + a + ".");
    },
    nMa = (a) => {
      const b = new Map();
      for (const c of Object.keys(a)) b.set(a[c].Tj, a[c].Uj);
      return b;
    },
    VO = (a, b) => {
      for (let c = 0; c < a.Jg.length; ++c) a.Jg[c](b);
    },
    WO = (a, b) => {
      a.Eg.push(b);
    },
    qMa = () => {
      if (!XO) {
        var a = (XO = new oMa()),
          b = Date.now() * 1e3;
        _.yG(a, 1, b);
        _.Zf(XO, 2, 0);
        _.Zf(XO, 3, 0);
      }
      a = new YO();
      a = _.Jf(a, oMa, 1, XO);
      b = ++pMa;
      return _.yG(a, 2, b);
    },
    uMa = (a, b) => {
      var c = b.LSWHIf || null;
      if (c && (c.Eg.Eg || a.Eg) && c.Eg.Eg != a.Eg) return null;
      var d;
      !(d = c && c.Eg.Sr && !c.Eg.Sr()) &&
        (d = c && c.Eg.Sr && c.Eg.Sr()) &&
        ((d = b.getAttribute("jslog")),
        (d = !(!d || _.eb(d) || d != c.Eg.getAttribute())));
      if (d) return c;
      d = b.getAttribute("jslog");
      if (!d) return null;
      d = rMa(a, d);
      if (!d || ((d.Eg || a.Eg) && d.Eg != a.Eg)) return null;
      a = new sMa(b, d);
      c && c.Eg.Kg && c.Hg && (a.Hg = !0);
      if ((c = a.Oi().getAttribute("data-ved"))) {
        a.Gg = c;
        if (!c || (c.charAt(0) != "0" && c.charAt(0) != "2")) var e = null;
        else {
          c = c.substring(1);
          try {
            const f = tMa(c);
            e = _.Ef(f, YO, 13);
          } catch (f) {
            e = null;
          }
        }
        e && ((a.Fg = e), (a.Kg = e));
      }
      return (b.LSWHIf = a);
    },
    rMa = (a, b) => {
      if (_.eb(b)) return null;
      const c = b.split(";");
      var d = Number(c[0].trim());
      if (isNaN(d)) return null;
      d = a.Gg.ID(d);
      for (let l = 1; l < c.length; l++) {
        var e = c[l].trim();
        if (!_.eb(e)) {
          var f = _.Hh(e);
          if (f.length < 2) return null;
          e = f[0].trim();
          f = f[1].trim();
          if (_.eb(e) || _.eb(f)) return null;
          switch (e) {
            case ZO(a, "track"):
              e = f.split(",");
              for (f = 0; f < e.length; ++f) {
                var g = d,
                  h = e[f].trim();
                if (a.Fg) {
                  if (!g.Gw)
                    throw Error(
                      "Method isTrackingXid should only be used when xidTagComponents_ is true.",
                    );
                  if (!$O.has(h))
                    throw Error("Unrecognized eventLabelXid: " + h + ".");
                  g.uw.add(h);
                } else g.uw.add(g.Hg(h));
              }
              break;
            case ZO(a, "index"):
              d.Gg = Number(f);
              break;
            case ZO(a, "tc"):
              e = f.split(",");
              e = e.map(Number);
              e = e.filter(Number.isInteger);
              d.Lg = e;
              break;
            case "cid":
              d.Eg = f;
              break;
            case ZO(a, "mutable"):
              f == "true"
                ? (d.Ig = !0)
                : f == "rci" && ((d.Ig = !0), (d.Kg = !0));
              break;
            default:
              a.Gg.Bu(d, e);
          }
        }
      }
      return d.setAttribute(b);
    },
    ZO = (a, b) => {
      if (a.Fg)
        if (vMa.has(b)) a = vMa.get(b);
        else throw Error("Unrecognized PartLabel " + b + ".");
      else a = b;
      return a;
    },
    aP = (a) => {
      var b = wMa;
      const c = _.Ca(a),
        d = ([, ...f]) => b(c, f),
        e = ([f, ...g]) => a.apply(f, g);
      return function (...f) {
        const g = this || _.ta;
        let h = xMa.get(g);
        h || ((h = {}), xMa.set(g, h));
        return _.Owa(h, [this, ...f], e, d);
      };
    },
    wMa = (a, b) => {
      a = [a];
      for (let c = b.length - 1; c >= 0; --c) a.push(typeof b[c], b[c]);
      return a.join("\v");
    },
    bP = function (a) {
      _.Oi.call(this);
      a || (a = yMa || (yMa = new _.Sk()));
      this.Eg = a;
      if ((this.Fg = this.pJ()))
        this.Gg = _.Ci(this.Eg.Eg, this.Fg, (0, _.Da)(this.OG, this));
    },
    zMa = (a, b, c) => {
      let d;
      const e = a.Rg,
        f = a.Wg[b];
      aMa(
        c,
        (g) => {
          if (!_.za(g) || g.nodeType != 1) return !1;
          g = uMa(e, g);
          var h;
          if ((h = g != null))
            if (((h = g.Eg), a.Kg)) {
              if (!h.Gw)
                throw Error(
                  "Method isTrackingXid should only be used when xidTagComponents_ is true.",
                );
              if (!$O.has(f))
                throw Error("Unrecognized eventLabelXid: " + f + ".");
              h = h.uw.has(f);
            } else h = f ? h.uw.has(h.Hg(f)) : h.uw.size != 0;
          return h ? ((d = g), !0) : !1;
        },
        !0,
      );
      return d;
    },
    AMa = (a, b) => {
      const c = [],
        d = a.Rg;
      aMa(
        b,
        (e) => {
          if (!_.za(e) || e.nodeType != 1) return !1;
          e = uMa(d, e);
          e != null && c.push(e);
          return !1;
        },
        !1,
      );
      return c;
    },
    BMa = (a) => {
      a.forEach(() => {});
    },
    CMa = (a) => a.map((b) => b.Eg.Fg),
    DMa = function () {
      this.Fg = 0;
      this.Eg = [];
    },
    EMa = (a, b) => {
      if (b >= a.Eg.length) throw Error("Out of bounds exception");
      return a.Eg.length < 50 ? b : (a.Fg + Number(b)) % 50;
    },
    cP = (a, b) => _.ag(a, 8, b),
    HMa = (a) => {
      let b = Date.now();
      b = Number.isFinite(b) ? b.toString() : void 0;
      if (
        a instanceof dP &&
        (!_.Ef(a, eP, 15) || !_.Ef(a, eP, 15).getExtension(FMa))
      ) {
        var c = new fP(),
          d = new gP();
        let e = _.Ef(a, eP, 15);
        e || (e = new eP());
        _.cf(d, 1, _.kG(b));
        _.Jf(c, gP, 1, d);
        _.Pv(e, FMa, c);
        _.Jf(a, eP, 15, e);
      }
      a instanceof hP &&
        ((c = new fP()),
        (d = new gP()),
        _.cf(d, 1, _.kG(b)),
        _.Jf(c, gP, 1, d),
        _.Pv(a, GMa, c));
    },
    IMa = async (a) => {
      var b = new CompressionStream("gzip");
      const c = new Response(b.readable).arrayBuffer();
      b = b.writable.getWriter();
      await b.write(new TextEncoder().encode(a));
      await b.close();
      return new Uint8Array(await c);
    },
    iP = (a, b) => {
      a.Eg = b;
      a.timer && a.enabled ? (a.stop(), a.start()) : a.timer && a.stop();
    },
    KMa = (a) => {
      _.lG(jP, JMa, 1, a);
    },
    MMa = (a, b = LMa) => {
      if (!kP) {
        a = a.navigator?.userAgentData;
        if (
          !a ||
          typeof a.getHighEntropyValues !== "function" ||
          (a.brands && typeof a.brands.map !== "function")
        )
          return Promise.reject(Error("UACH unavailable"));
        KMa(
          (a.brands || []).map((d) => {
            var e = new JMa();
            e = _.ag(e, 1, d.brand);
            return _.ag(e, 2, d.version);
          }),
        );
        typeof a.mobile === "boolean" && _.Wf(jP, 2, a.mobile);
        kP = a.getHighEntropyValues(b);
      }
      const c = new Set(b);
      return kP
        .then((d) => {
          const e = jP.clone();
          c.has("platform") && _.ag(e, 3, d.platform);
          c.has("platformVersion") && _.ag(e, 4, d.platformVersion);
          c.has("architecture") && _.ag(e, 5, d.architecture);
          c.has("model") && _.ag(e, 6, d.model);
          c.has("uaFullVersion") && _.ag(e, 7, d.uaFullVersion);
          return e.ni();
        })
        .catch(() => jP.ni());
    },
    NMa = (a) => _.cg(a, 1, 1),
    OMa = (a, b) => {
      _.Jf(a.Eg, lP, 1, b);
      _.Qf(b, 1) || NMa(b);
      a.No || ((b = mP(a)), _.F(b, 5) || _.ag(b, 5, a.locale));
      a.Gg && ((b = mP(a)), _.Ef(b, nP, 9) || _.Jf(b, nP, 9, a.Gg));
    },
    mP = (a) => {
      a = _.Ef(a.Eg, lP, 1);
      let b = _.Ef(a, oP, 11);
      b || ((b = new oP()), _.Jf(a, oP, 11, b));
      return b;
    },
    PMa = (a, b) => {
      a.Fg = b;
    },
    RMa = (a) => {
      const b = a.No ? void 0 : window;
      b
        ? MMa(b, LMa)
            .then((c) => {
              a.Gg = QMa(c ?? "[]");
              c = mP(a);
              _.Jf(c, nP, 9, a.Gg);
              return !0;
            })
            .catch(() => !1)
        : Promise.resolve(!1);
    },
    pP = () => "https://play.google.com/log?format=json&hasfast=true",
    SMa = (a, b) => a.ah
        ? b
          ? () => {
              b().then(() => {
                a.flush();
              });
            }
          : () => {
              a.flush();
            }
        : () => {},
    qP = (a) => {
      a.Mg ||
        ((a.Gg.isFinal = !0),
        a.Wg && ((a.Gg.Fg = 3), TMa(a)),
        a.Tg && ((a.Gg.Fg = 2), UMa(a)),
        a.flush(),
        (a.Gg.isFinal = !1));
    },
    VMa = (a) => {
      a.Lg || (a.Lg = pP());
      try {
        return new URL(a.Lg).toString();
      } catch (b) {
        return new URL(a.Lg, window.location.origin).toString();
      }
    },
    WMa = (a, b) => {
      a.Ig = new _.OK(b < 1 ? 1 : b, 3e5, 0.1);
      iP(a.Fg, a.Ig.getValue());
    },
    TMa = (a) => {
      XMa(a, 32, 10, (b, c) => {
        b = new URL(b);
        b.searchParams.set("format", "json");
        let d = !1;
        try {
          d = window.navigator.sendBeacon(b.toString(), c.ni());
        } catch {}
        d || (a.gh = !1);
        return d;
      });
    },
    YMa = (a, b, c = null, d = a.withCredentials) => {
      const e = {},
        f = new URL(VMa(a));
      c && (e.Authorization = c);
      a.Vp &&
        ((e["X-Goog-AuthUser"] = a.Vp), f.searchParams.set("authuser", a.Vp));
      e && a.Mg && JSON.stringify(e);
      return {
        url: f.toString(),
        body: b,
        bI: 1,
        py: e,
        Qt: "POST",
        withCredentials: d,
        sw: a.sw,
      };
    },
    UMa = (a) => {
      XMa(a, 6, 5, (b, c) => {
        b = new URL(b);
        b.searchParams.set("format", "base64json");
        b.searchParams.set("p", _.Pwa(c.ni(), 3));
        c = b.toString();
        if (c.length > 15360) return !1;
        new Image().src = c;
        return !0;
      });
    },
    XMa = (a, b, c, d) => {
      if (a.Eg.length !== 0) {
        var e = new URL(VMa(a));
        e.searchParams.delete("format");
        var f = a.Gr();
        f && e.searchParams.set("auth", f);
        e.searchParams.set("authuser", a.Vp || "0");
        for (f = 0; f < c && a.Eg.length; ++f) {
          const g = a.Eg.slice(0, b),
            h = a.Gg.km(g, a.Hg, a.Kg, a.os, a.Rg, a.Qg);
          if (!d(e.toString(), h)) {
            ++a.Kg;
            break;
          }
          a.Hg = 0;
          a.Kg = 0;
          a.Rg = 0;
          a.Qg = 0;
          a.Eg = a.Eg.slice(g.length);
        }
        a.Fg.enabled && a.Fg.stop();
      }
    },
    cNa = (a) => {
      const b = _.xk(_.uk.Eg()),
        c = new ZMa({
          Yr: 1627,
          Gr: () => null,
          Vp: null,
          xl: new $Ma(),
          oG: b,
          No: !0,
          ft: !1,
          Lz: !0,
        });
      c.Yg = !0;
      WMa(c, 500);
      return new aNa(b, new bNa(a), c);
    },
    eNa = () => {
      var a = _.uk;
      const b = new dNa();
      _.cg(b, 1, 0);
      var c = _.Il("gClearcutLoggingE2ETestId");
      c && _.ag(b, 3, c);
      c = _.Dk(_.Gk(a)) === "internal";
      c = _.Wf(b, 2, c);
      var d = _.Dk(_.Gk(a));
      c = _.ag(c, 4, d);
      d = a.Fg();
      c = _.ag(c, 5, d);
      d = a.Gg();
      c = _.ag(c, 6, d);
      a = _.Fk(a.Og, 44, 1) * 100;
      a = _.Yf(c, 10, a);
      _.ag(
        a,
        7,
        (document.location && document.location.host) || window.location.host,
      );
      return b;
    },
    fNa = (a) => {
      if (!a) return performance.now();
      [a.By, a.Ut].filter((b) => b !== void 0);
      if (a.By) return a.By;
      if (a.Ut)
        try {
          if (!performance) return 0;
          const b = performance.getEntriesByType("resource");
          if (!b.length) return 0;
          const c = b.filter(
            (d) =>
              new URL(d.name).hostname.includes("google") &&
              d.name.includes(a.Ut),
          );
          return c.length === 0 ? 0 : c.pop().requestStart || 0;
        } catch (b) {
          return 0;
        }
      return performance.now();
    },
    QLa = [];
  _.nn.prototype.tp = _.ca(13, function () {
    return _.jv(this).toString();
  });
  _.vB.prototype.tp = _.ca(12, function () {
    return _.F(this, 3);
  });
  _.wB.prototype.tp = _.ca(11, function () {
    return _.F(this, 17);
  });
  _.Ti.prototype.AD = _.ca(9, function () {
    this.dispose();
    _.Vb(QLa, this);
  });
  _.H.prototype.Sr = _.ca(4, function () {
    return !_.gd(this);
  });
  var oMa = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    YO = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    gNa = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    hP = class extends _.H {
      constructor(a) {
        super(a, 233);
      }
      getVisible() {
        return _.Qf(this, 6);
      }
      setVisible(a) {
        return _.cg(this, 6, a);
      }
    },
    yMa,
    hNa = _.Ig(
      (a, b, c) => {
        if (a.Fg !== 0) return !1;
        _.Mg(b, c, _.pG(a.Eg));
        return !0;
      },
      _.Kw,
      _.gi,
    ),
    iNa = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    jNa = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    kNa = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    tMa = _.qG(gNa, _.ZA);
  _.B = OO.prototype;
  _.B.isEnabled = function () {
    if (!_.ta.navigator.cookieEnabled) return !1;
    if (!this.isEmpty()) return !0;
    this.set("TESTCOOKIESENABLED", "1", { iF: 60 });
    if (this.get("TESTCOOKIESENABLED") !== "1") return !1;
    this.remove("TESTCOOKIESENABLED");
    return !0;
  };
  _.B.set = function (a, b, c) {
    let d;
    var e = !1;
    let f;
    if (typeof c === "object") {
      f = c.TP;
      e = c.wy || !1;
      d = c.domain || void 0;
      var g = c.path || void 0;
      var h = c.iF;
    }
    if (/[;=\s]/.test(a)) throw Error('Invalid cookie name "' + a + '"');
    if (/[;\r\n]/.test(b)) throw Error('Invalid cookie value "' + b + '"');
    h === void 0 && (h = -1);
    c = d ? ";domain=" + d : "";
    g = g ? ";path=" + g : "";
    e = e ? ";secure" : "";
    h =
      h < 0
        ? ""
        : h == 0
          ? ";expires=" + new Date(1970, 1, 1).toUTCString()
          : ";expires=" + new Date(Date.now() + h * 1e3).toUTCString();
    this.Eg.cookie =
      a + "=" + b + c + g + h + e + (f != null ? ";samesite=" + f : "");
  };
  _.B.get = function (a, b) {
    const c = a + "=",
      d = (this.Eg.cookie || "").split(";");
    for (let e = 0, f; e < d.length; e++) {
      f = _.EG(d[e]);
      if (f.lastIndexOf(c, 0) == 0) return f.slice(c.length);
      if (f == a) return "";
    }
    return b;
  };
  _.B.remove = function (a, b, c) {
    const d = this.get(a) !== void 0;
    this.set(a, "", { iF: 0, path: b, domain: c });
    return d;
  };
  _.B.Jo = function () {
    return PO(this).keys;
  };
  _.B.tl = function () {
    return PO(this).values;
  };
  _.B.isEmpty = function () {
    return !this.Eg.cookie;
  };
  _.B.bk = function () {
    return this.Eg.cookie ? (this.Eg.cookie || "").split(";").length : 0;
  };
  _.B.clear = function () {
    const a = PO(this).keys;
    for (let b = a.length - 1; b >= 0; b--) this.remove(a[b]);
  };
  _.ta.U3bHHf ?? (_.ta.U3bHHf = 0);
  _.ta.U3bHHf++;
  var hMa = 1;
  var eMa = [[], []],
    QO = 0,
    TO = new Set(),
    UO = null,
    SO = 0,
    iMa = 0,
    jMa = 0,
    RO = 0,
    dMa = 0;
  _.B = cMa.prototype;
  _.B.measure = function (a) {
    this.Eg = a;
    return this;
  };
  _.B.by = function (a) {
    this.Fg = a;
    return this;
  };
  _.B.MB = function () {
    this.Gg = !0;
    return this;
  };
  _.B.window = function (a) {
    this.Hg = a;
    return this;
  };
  _.B.km = function () {
    return gMa(
      {
        measure: this.Eg,
        by: this.Fg,
        vM: this.Jg,
        window: this.Hg,
        MB: this.Gg,
      },
      this.Ig,
    );
  };
  var rP = {
      ARROW_KEYS: { Tj: "arrow_keys", Uj: "Wxn7ub" },
      AUTOMATED: { Tj: "automated", Uj: "wjpLYc" },
      CLICK: { Tj: "click", Uj: "cOuCgd" },
      DRAGEND: { Tj: "dragend", Uj: "RlD3W" },
      DROP: { Tj: "drop", Uj: "DaY83b" },
      GENERIC_CLICK: { Tj: "generic_click", Uj: "szJgjc" },
      HOVER: { Tj: "hover", Uj: "ZmdkE" },
      IMPRESSION: { Tj: "impression", Uj: "xr6bB" },
      KEYBOARD_ENTER: { Tj: "keyboard_enter", Uj: "SYhH9d" },
      KEYPRESS: { Tj: "keypress", Uj: "Kr2w4b" },
      LONG_PRESS: { Tj: "long_press", Uj: "tfSNVb" },
      MOUSEOVER: { Tj: "mouseover", Uj: "FrfE3b" },
      RIGHT_CLICK: { Tj: "rightclick", Uj: "CYQmze" },
      SCROLL: { Tj: "scroll", Uj: "XuHpsb" },
      SWIPE: { Tj: "swipe", Uj: "eteedb" },
      VIS: { Tj: "vis", Uj: "HkgBsf" },
    },
    lMa = nMa(rP),
    $O = new Map();
  for (const a of Object.keys(rP)) $O.set(rP[a].Uj, rP[a].Tj);
  var vMa = nMa({
    TRACK: { Tj: "track", Uj: "u014N" },
    INDEX: { Tj: "index", Uj: "cQYSPc" },
    MUTABLE: { Tj: "mutable", Uj: "dYFj7e" },
    COMPONENT_ID: { Tj: "cid", Uj: "cOuyq" },
    TEST_CODE: { Tj: "tc", Uj: "DM6Eze" },
  });
  var sP = class {
    constructor(a, b) {
      this.Fg = a;
      this.Gg = null;
      this.Lg = [];
      this.Eg = void 0;
      this.Kg = this.Ig = !1;
      this.qD = null;
      this.Jg = [];
      this.Gw = b || !1;
      this.uw = new Set();
    }
    Sr() {
      return this.Ig;
    }
    setAttribute(a) {
      this.qD = a;
      return this;
    }
    getAttribute() {
      return this.qD;
    }
    Hg(a) {
      return this.Gw ? mMa(a) : a;
    }
  };
  sP.prototype.isMutable = sP.prototype.Sr;
  var sMa = class {
    constructor(a, b) {
      this.Jg = a;
      this.Eg = b;
      this.Hg = !1;
      this.Kg = this.Fg = void 0;
      this.hidden = !0;
      this.Gg = this.Ig = void 0;
    }
    Oi() {
      return this.Jg;
    }
  };
  var bNa = class {
    constructor(a) {
      this.Eg = a;
    }
    jz(a) {
      cP(a, this.Eg.ni());
    }
    hq() {}
    Bu() {}
    ID() {}
  };
  var tP = class {
    constructor(a) {
      this.Fg = a;
      this.Eg = [];
      this.Gg = [];
    }
  };
  var lNa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var eP = class extends _.H {
    constructor(a) {
      super(a, 1);
    }
  };
  var mNa = _.Nw(187, eP, lNa);
  var dP = class extends _.H {
      constructor(a) {
        super(a, 17);
      }
    },
    nNa = _.Yha(dP);
  var oNa = class extends tP {
    NF(a) {
      WO(this, (b) => {
        if (nNa(b)) {
          const c = new eP();
          _.Pv(c, mNa, a);
          _.Jf(b, eP, 15, c);
        }
      });
    }
  };
  var uP = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var pNa = class extends _.H {
    constructor(a) {
      super(a, 7);
    }
    getTime() {
      return _.Ef(this, _.Qs, 1);
    }
    getStatus() {
      return _.Ef(this, uP, 6);
    }
  };
  var qNa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var rNa = _.Nw(120, eP, qNa);
  var sNa = class extends tP {
    NF(a) {
      WO(this, (b) => {
        if (b instanceof dP) {
          const c = new eP();
          _.Pv(c, rNa, a);
          _.Jf(b, eP, 15, c);
        }
      });
    }
  };
  var tNa = class {
    constructor() {
      this.Eg = this.Fg = this.Hg = void 0;
      this.Gg = [];
    }
  };
  var uNa = class {
    Fg() {
      return [];
    }
    Hg() {
      return [];
    }
  };
  var pMa = 0,
    XO = void 0;
  var vNa = class {
    constructor(a) {
      this.Eg = a;
    }
  };
  var wNa = class {
    constructor(a, b) {
      this.Gg = a;
      this.Fg = b || !1;
      this.Eg = void 0;
    }
  };
  var xNa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var yNa = class extends _.ni {
    constructor(a, b) {
      super("visibilitychange");
      this.hidden = a;
      this.visibilityState = b;
    }
  };
  var xMa = new WeakMap();
  _.Ka(bP, _.Oi);
  _.B = bP.prototype;
  _.B.pJ = aP(function () {
    var a = this.Rx();
    const b = this.Ax() != "hidden";
    if (a) {
      var c;
      b
        ? (c = ((_.LH() || "") + "visibilitychange").toLowerCase())
        : (c = "visibilitychange");
      a = c;
    } else a = null;
    return a;
  });
  _.B.Ax = aP(function () {
    return SLa("hidden", this.Eg.Eg);
  });
  _.B.BJ = aP(function () {
    return SLa("visibilityState", this.Eg.Eg);
  });
  _.B.Rx = function () {
    return !!this.Ax();
  };
  _.B.OG = function () {
    var a = this.Rx() ? this.Eg.Eg[this.BJ()] : null;
    a = new yNa(!!this.Eg.Eg[this.Ax()], a);
    this.dispatchEvent(a);
  };
  _.B.disposeInternal = function () {
    _.Li(this.Gg);
    bP.eo.disposeInternal.call(this);
  };
  var ANa = class extends _.Yv {
    constructor(a, b, c) {
      ({ Sw: e, OI: d = !1 } = { OI: !1, Sw: void 0, dQ: !1 });
      var d, e;
      super();
      this.Pg = a;
      this.Eg = c;
      this.Xg = this.Sg = void 0;
      this.Mg = [];
      this.Kg = d;
      this.Ig = b || new zNa();
      this.Rg = new wNa(this.Ig, this.Kg);
      this.Tg = { click: 3 };
      this.Wg = { click: this.Hg("generic_click") };
      this.ah = new bP();
      this.Yg = new cMa(this)
        .measure(e ? () => e().then(this.Qg.bind(this)) : this.Qg)
        .MB()
        .km();
      new _.tC(this.Yg, 500, this);
      this.Pg instanceof uNa && (this.Gg = this.Pg);
    }
    cj(a, b) {
      var c = this.Tg[a];
      if (!c) return !1;
      b = zMa(this, a, b);
      if (!b) return !1;
      if (this.Gg) {
        c = this.Gg.Fg(b, new vNa(c));
        for (a = 0; a < c.length; ++a)
          this.Ig.jz(c[a]), this.Ig.hq(b, c[a]), this.Eg && this.Eg.hp(c[a]);
        return !0;
      }
      a = AMa(this, b.Oi());
      var d = CMa(a);
      var e = b.Eg.Gg;
      var f = new xNa();
      f = _.cg(f, 4, c);
      f = _.Yf(f, 1, b.Eg.Fg);
      d = _.rf(f, 3, d, _.Yd);
      e != null && _.Yf(d, 2, e);
      e = new tNa();
      e.Hg = this.getMetadata(b, a);
      e.Fg = this.Xg;
      e.Eg = this.Sg;
      b = cP(new vP(), d.ni());
      b = _.rf(b, 20, e.Gg, _.Yd);
      this.Eg && this.Eg.hp(b);
      if (c != null)
        for (c = new vNa(c), b = 0; b < this.Mg.length; b++) this.Mg[b](c);
      BMa(a);
      return !0;
    }
    log(a) {
      this.Eg && this.Eg.hp(a);
      _.Zd(_.af(a, 11, void 0, _.aCa));
    }
    getMetadata(a, b) {
      const c = new hP();
      VO(a.Eg, c);
      for (a = 0; a < b.length; ++a) VO(b[a].Eg, c);
      return c;
    }
    Qg() {
      this.ah.Ax();
    }
    Hg(a) {
      return this.Kg ? mMa(a) : a;
    }
  };
  var wP = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var BNa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var DNa = class {
      constructor(a) {
        this.Eg = a;
        CNa++;
      }
    },
    CNa = 0;
  var zNa = class {
    constructor() {
      this.Gw = !1;
    }
    ID(a) {
      return new sP(a, this.Gw);
    }
    Bu() {}
    jz() {}
    hq() {}
  };
  var gP = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var fP = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var FMa = _.Nw(126, eP, fP);
  var GMa = _.Nw(618, hP, fP);
  _.KA[618] = [0, [0, hNa]];
  _.KA[273] = [-2, {}, _.S];
  _.B = DMa.prototype;
  _.B.add = function (a) {
    const b = this.Eg[this.Fg];
    this.Eg[this.Fg] = a;
    this.Fg = (this.Fg + 1) % 50;
    return b;
  };
  _.B.get = function (a) {
    a = EMa(this, a);
    return this.Eg[a];
  };
  _.B.set = function (a, b) {
    a = EMa(this, a);
    this.Eg[a] = b;
  };
  _.B.bk = function () {
    return this.Eg.length;
  };
  _.B.isEmpty = function () {
    return this.Eg.length == 0;
  };
  _.B.clear = function () {
    this.Fg = this.Eg.length = 0;
  };
  _.B.tl = function () {
    var a = this.bk();
    const b = this.bk();
    var c = this.bk() - a;
    for (a = []; c < b; c++) a.push(this.get(c));
    return a;
  };
  _.B.Jo = function () {
    const a = [],
      b = this.bk();
    for (let c = 0; c < b; c++) a[c] = c;
    return a;
  };
  var ENa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var FNa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var GNa = class extends _.H {
    constructor(a) {
      super(a, 4);
    }
  };
  var vP = class extends _.H {
    constructor(a) {
      super(a, 36);
    }
  };
  var INa = class extends uNa {
      constructor() {
        var a = HNa;
        super();
        this.Eg = a;
        this.Gg = new DMa();
      }
      Fg(a, b) {
        var c = new BNa(),
          d = qMa();
        _.Jf(c, YO, 1, d);
        d = new dP();
        if (a.Gg) _.ag(d, 11, a.Gg);
        else {
          var e = _.Yf(d, 1, a.Eg.Fg);
          _.Yf(e, 2);
        }
        e = _.Yf(d, 3, b.Eg);
        let f = [],
          g = a,
          h = new Set();
        while (g && !h.has(g)) {
          var l = g;
          var n = new hP();
          n = _.Yf(n, 1, l.Eg.Fg);
          Number.isFinite(l.Eg.Gg) && _.Yf(n, 3, l.Eg.Gg);
          VO(l.Eg, n);
          f.unshift(n);
          h.add(g);
          g = g.Ig;
        }
        _.lG(e, hP, 14, f);
        HMa(d);
        e = new wP();
        _.Jf(e, YO, 1, a.Fg);
        _.Jf(c, YO, 3, a.Fg);
        _.Jf(c, dP, 4, d);
        _.Jf(c, wP, 9, e);
        this.Gg.add(new DNa(b.Eg));
        this.Eg("Interaction Event", c);
        a = new vP();
        c = c.ni();
        _.ag(a, 24, c);
        return [a];
      }
      Hg(a) {
        var b = new dP(),
          c = _.Yf(b, 1, a.Fg);
        _.Yf(c, 3, 1);
        if (a.Eg.length > 0) for (var d of a.Eg) d(b);
        HMa(b);
        d = qMa();
        c = new BNa();
        _.Jf(c, YO, 1, d);
        d = new wP();
        _.Jf(d, YO, 1, void 0);
        _.Jf(c, dP, 4, b);
        _.Jf(c, wP, 9, d);
        this.Gg.add(new DNa(1));
        this.Eg("Semantic Event", c);
        b = new vP();
        _.rf(b, 20, a.Gg, _.Yd);
        a = c.ni();
        _.ag(b, 24, a);
        return [b];
      }
    },
    HNa = (a) => a + ":" + JSON.stringify(null, null, 1).replace(/"/g, "");
  var JNa = class {
    Rx(a) {
      return a < 1024 ? !1 : typeof CompressionStream !== "undefined";
    }
  };
  var KNa = class {
    constructor(a, b) {
      this.Eg = a;
      this.ai = b;
      this.enabled = !1;
      this.Fg = () => _.Fa();
      this.Gg = this.Fg();
    }
    start() {
      this.enabled = !0;
      this.timer ||
        ((this.timer = setTimeout(() => {
          this.tick();
        }, this.Eg)),
        (this.Gg = this.Fg()));
    }
    stop() {
      this.enabled = !1;
      this.timer && (clearTimeout(this.timer), (this.timer = void 0));
    }
    tick() {
      if (this.enabled) {
        const a = Math.max(this.Fg() - this.Gg, 0);
        a < this.Eg * 0.8
          ? (this.timer = setTimeout(() => {
              this.tick();
            }, this.Eg - a))
          : (this.timer && (clearTimeout(this.timer), (this.timer = void 0)),
            this.ai(),
            this.enabled && (this.stop(), this.start()));
      } else this.timer = void 0;
    }
  };
  var LNa = class extends _.H {
    constructor(a) {
      super(a);
    }
    Gx() {
      return _.Qf(this, 1);
    }
  };
  var JMa = class extends _.H {
    constructor(a) {
      super(a);
    }
    Fg() {
      return _.F(this, 2);
    }
  };
  var nP = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    QMa = _.gh(nP);
  var oP = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var MNa = [
    0,
    _.T,
    -1,
    _.V,
    _.T,
    -1,
    _.V,
    _.T,
    -1,
    [0, _.U, [0, _.T, -1], _.S, _.T, -5],
    [0, _.V, _.S, _.R, -2],
  ];
  var LMa = [
      "platform",
      "platformVersion",
      "architecture",
      "model",
      "uaFullVersion",
    ],
    jP = new nP(),
    kP = null;
  var NNa = [0, _.T, _.V, 1, _.T, -1, _.V, 1, _.V];
  var ONa = [0, _.V, _.T, -2];
  var PNa = [0, _.T, _.V];
  var QNa = [0, _.T, _.V];
  var RNa = [0, _.S, -3];
  var SNa = [
    0,
    _.V,
    _.T,
    -1,
    _.Lz,
    _.R,
    -1,
    _.T,
    -5,
    _.U,
    [0, _.T, -4],
    -1,
    _.S,
    [0, _.S, -3],
    _.V,
  ];
  var lP = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  _.qA[66321687] = [
    0,
    _.V,
    1,
    [0, _.T, -6, _.Lz, _.R],
    1,
    [0, _.T, 1, _.T, -5],
    _.T,
    -1,
    [0, _.V, _.T, -8],
    [0, _.T, -3],
    [0, _.T, _.V, _.T, -2],
    MNa,
    _.Lz,
    [0, _.T, -3, _.Lz, _.R, _.T],
    [0, _.V, _.T, -1],
    [0, _.T, -9],
    [0, _.T, -6, _.V, _.T, 1, _.T, _.S, _.V, -1, _.S, _.T, -2, _.V, _.T, _.V],
    1,
    [0, _.V],
    1,
    [0, _.T, -4],
    1,
    NNa,
    [
      0,
      [1, 2, 3, 4, 5, 6],
      _.Zz,
      NNa,
      _.Zz,
      PNa,
      _.Zz,
      QNa,
      _.Zz,
      [0, _.V],
      _.Zz,
      SNa,
      _.Zz,
      ONa,
    ],
    PNa,
    QNa,
    SNa,
    [
      0,
      [0, _.V, _.T, -1, _.Lz, _.R, -1, _.T, -4, _.U, [0, _.T, -4], -1, 1, RNa],
      [0, _.V, _.T, -1, _.Lz, _.R, -1, _.T, -4, RNa],
    ],
    ONa,
    [0, _.T],
    4,
    [0, _.T, _.V, _.T, -1, _.Lz, _.V, _.T],
  ];
  var TNa = class extends _.H {
    constructor(a) {
      super(a, 19);
    }
    hw(a) {
      return _.cg(this, 2, a);
    }
  };
  var UNa = class {
    constructor(a, b = !1) {
      this.No = b;
      this.Gg = this.locale = null;
      this.Fg = 0;
      this.isFinal = !1;
      this.Eg = new TNa();
      Number.isInteger(a) && this.Eg.hw(a);
      b || (this.locale = document.documentElement.getAttribute("lang"));
      OMa(this, new lP());
    }
    hw(a) {
      this.Eg.hw(a);
      return this;
    }
    km(a, b = 0, c = 0, d = null, e = 0, f = 0) {
      if (!this.No) {
        var g = mP(this);
        var h = new LNa();
        h = _.cg(h, 1, this.Fg);
        h = _.Wf(h, 2, this.isFinal);
        c = _.Yf(h, 3, c > 0 ? c : void 0);
        e = _.Yf(c, 4, e > 0 ? e : void 0);
        f = _.Yf(e, 5, f > 0 ? f : void 0).uC();
        _.Jf(g, LNa, 10, f);
      }
      g = this.Eg.clone();
      f = Date.now().toString();
      g = _.cf(g, 4, _.kG(f));
      a = _.lG(g, vP, 3, a.slice());
      d &&
        ((g = new ENa()),
        (d = _.Yf(g, 13, d)),
        (g = new FNa()),
        (d = _.Jf(g, ENa, 2, d)),
        (g = new GNa()),
        (d = _.Jf(g, FNa, 1, d)),
        (d = _.cg(d, 2, 9)),
        _.Jf(a, GNa, 18, d));
      b && _.yG(a, 14, b);
      return a;
    }
  };
  var VNa = class extends _.H {
      constructor(a) {
        super(a, 8);
      }
    },
    WNa = _.gh(VNa);
  var XNa = _.Nw(
    175237375,
    VNa,
    class extends _.H {
      constructor(a) {
        super(a);
      }
    },
  );
  var ZMa = class extends _.mi {
    constructor(a) {
      super();
      this.xi = "";
      this.Eg = [];
      this.ih = "";
      this.Tg = this.Wg = this.Mg = !1;
      this.mh = this.Sg = -1;
      this.Yg = !1;
      this.Pg = this.Ng = null;
      this.Qg = this.Rg = this.Kg = this.Hg = 0;
      this.qh = 1;
      this.sw = 0;
      this.Yr = a.Yr;
      this.Gr = a.Gr || (() => {});
      this.Gg = new UNa(a.Yr, a.No);
      this.xl = a.xl || null;
      this.os = a.os || null;
      this.Lg = a.oG || null;
      this.Vp = a.Vp || null;
      this.ft = a.ft || !1;
      this.pj = null;
      this.withCredentials = !a.Lz;
      this.No = a.No || !1;
      this.gh =
        !this.No &&
        !!window &&
        !!window.navigator &&
        window.navigator.sendBeacon !== void 0;
      this.ah =
        typeof URLSearchParams !== "undefined" &&
        !!new URL(pP()).searchParams &&
        !!new URL(pP()).searchParams.set;
      const b = NMa(new lP());
      OMa(this.Gg, b);
      this.Ig = new _.OK(1e4, 3e5, 0.1);
      a = SMa(this, a.Sw);
      this.Fg = new KNa(this.Ig.getValue(), a);
      this.Xg = new KNa(6e5, a);
      this.ft || this.Xg.start();
      this.No ||
        (document.addEventListener("visibilitychange", () => {
          document.visibilityState === "hidden" && qP(this);
        }),
        document.addEventListener("pagehide", () => {
          qP(this);
        }));
    }
    disposeInternal() {
      qP(this);
      this.Fg.stop();
      this.Xg.stop();
      super.disposeInternal();
    }
    hp(a) {
      if (a instanceof vP) this.log(a);
      else
        try {
          var b = cP(new vP(), a.ni());
          this.log(b);
        } catch {}
    }
    log(a) {
      if (this.ah) {
        a = a.clone();
        var b = this.qh++;
        a = _.yG(a, 21, b);
        this.xi && _.ag(a, 26, this.xi);
        b = a;
        if (_.qe(_.af(b, 1)) == null) {
          var c = Date.now();
          c = Number.isFinite(c) ? c.toString() : "0";
          _.cf(b, 1, _.kG(c));
        }
        _.IG(b, 15) != null || _.yG(b, 15, new Date().getTimezoneOffset() * 60);
        this.Ng && ((c = this.Ng.clone()), _.Jf(b, kNa, 16, c));
        b = this.Eg.length - 1e3 + 1;
        b > 0 && (this.Eg.splice(0, b), (this.Hg += b));
        this.Eg.push(a);
        this.ft || this.Fg.enabled || this.Fg.start();
      }
    }
    flush(a, b) {
      if (this.Eg.length === 0) a && a();
      else {
        var c = Date.now();
        if (this.mh > c && this.Sg < c) b && b("throttled");
        else {
          this.xl &&
            (typeof this.xl.Gx === "function"
              ? PMa(this.Gg, this.xl.Gx())
              : (this.Gg.Fg = 0));
          var d = this.Gg.km(
              this.Eg,
              this.Hg,
              this.Kg,
              this.os,
              this.Rg,
              this.Qg,
            ),
            e = this.Gr();
          if (e && this.ih === e) b && b("stale-auth-token");
          else if (
            ((this.Eg = []),
            this.Fg.enabled && this.Fg.stop(),
            (this.Hg = 0),
            this.Mg)
          )
            d.ni(), a && a();
          else {
            c = d.ni();
            let f;
            this.Pg && this.Pg.Rx(c.length) && (f = IMa(c));
            const g = YMa(this, c, e),
              h = (p) => {
                this.Ig.reset();
                iP(this.Fg, this.Ig.getValue());
                if (p) {
                  var r = null;
                  try {
                    const u = JSON.stringify(
                      JSON.parse(p.replace(")]}'\n", "")),
                    );
                    r = WNa(u);
                  } catch (u) {}
                  r &&
                    ((p = Number(_.mG(r, 1, _.wd("-1")))),
                    p > 0 && ((this.Sg = Date.now()), (this.mh = this.Sg + p)),
                    (r = r.uh(XNa))) &&
                    ((r = _.Nf(r, 1, -1)),
                    r !== -1 && (this.Yg || WMa(this, r)));
                }
                a && a();
                this.Kg = 0;
              },
              l = (p, r) => {
                var u = _.Hf(d, vP, 3);
                var w = Number(_.mG(d, 14));
                _.sBa(this.Ig);
                iP(this.Fg, this.Ig.getValue());
                p === 401 && e && (this.ih = e);
                w && (this.Hg += w);
                r === void 0 &&
                  (r = (500 <= p && p < 600) || p === 401 || p === 0);
                r &&
                  ((this.Eg = u.concat(this.Eg)),
                  this.ft || this.Fg.enabled || this.Fg.start());
                b && b("net-send-failed", p);
                ++this.Kg;
              },
              n = () => {
                this.xl && this.xl.send(g, h, l);
              };
            f
              ? f.then(
                  (p) => {
                    g.py["Content-Encoding"] = "gzip";
                    g.py["Content-Type"] = "application/binary";
                    g.body = p;
                    g.bI = 2;
                    n();
                  },
                  () => {
                    n();
                  },
                )
              : n();
          }
        }
      }
    }
  };
  var YNa = class {
    constructor() {
      this.xH = typeof AbortController !== "undefined";
    }
    async send(a, b, c) {
      const d = this.xH ? new AbortController() : void 0,
        e = d
          ? setTimeout(() => {
              d.abort();
            }, a.sw)
          : void 0;
      try {
        const f = await fetch(a.url, {
          method: a.Qt,
          headers: { ...a.py },
          ...(a.body && { body: a.body }),
          ...(a.withCredentials && { credentials: "include" }),
          signal: a.sw && d ? d.signal : null,
        });
        f.status === 200 ? b?.(await f.text()) : c?.(f.status);
      } catch (f) {
        switch (f?.name) {
          case "AbortError":
            c?.(408);
            break;
          default:
            c?.(400);
        }
      } finally {
        clearTimeout(e);
      }
    }
    Gx() {
      return 4;
    }
  };
  var ZNa = class extends _.mi {
    constructor() {
      super();
      this.Yr = 1627;
      this.Vp = "0";
      this.Eg = "https://play.google.com/log?format=json&hasfast=true";
      this.xl = null;
      this.xi = "";
      this.os = null;
    }
    Lz() {
      this.Fg = !0;
      return this;
    }
    km() {
      this.xl || (this.xl = new YNa());
      const a = new ZMa({
        Yr: this.Yr,
        Gr: this.Gr ? this.Gr : ZLa,
        Vp: this.Vp,
        oG: this.Eg,
        No: !1,
        ft: !1,
        Lz: this.Fg,
        Sw: this.Sw,
        xl: this.xl,
      });
      _.rG(this, a);
      a.Pg = new JNa();
      this.xi && (a.xi = this.xi);
      this.os && (a.os = this.os);
      RMa(a.Gg);
      this.xl.hw && this.xl.hw(this.Yr);
      this.xl.jM && this.xl.jM(a);
      return a;
    }
  };
  var aNa = class extends ANa {
    constructor(a, b, c) {
      var d = new INa();
      c || ((c = new ZNa()), a && (c.Eg = a), (c = c.km()));
      super(d, b || null, c);
      this.Lg = c;
      this.Lg.Mg = !1;
      a = this.Lg;
      a.Wg = a.gh;
      this.Lg.Tg = !0;
    }
  };
  var xP = class extends _.H {
      constructor(a) {
        super(a);
      }
    },
    $Na = _.gh(xP);
  var aOa = _.Nw(194, eP, xP);
  var dNa = class extends _.H {
    constructor(a) {
      super(a);
    }
    Fg() {
      return _.F(this, 4);
    }
    xx() {
      return _.F(this, 5);
    }
  };
  var bOa = class extends _.H {
    constructor(a) {
      super(a);
    }
    getInternalUsageAttributionIds(a) {
      const b = _.nf(this, 3, _.we, 3, !0);
      _.ld(b, a);
      return b[a];
    }
    tp() {
      return _.F(this, 4);
    }
  };
  var cOa = _.Nw(189, eP, bOa);
  var $Ma = class {
    send(a, b = () => {}, c = () => {}) {
      RLa(
        a.url,
        (d) => {
          d = d.target;
          _.bj(d) ? b(d.uq()) : c(d.getStatus());
        },
        a.Qt,
        a.body,
        a.py,
        a.sw,
        a.withCredentials,
      );
    }
    Gx() {
      return 1;
    }
  };
  var dOa = class {
    constructor(a) {
      this.Fg = a;
      this.Eg = new Map();
    }
    Bu(a, b) {
      for (const c of b.metadata || []) c instanceof xP && _.Pv(a, aOa, c);
      for (const c of b.fM || []) _.Pv(a, aOa, $Na(c));
    }
    hq(a, b) {
      WO(a, (c) => {
        if (c instanceof dP) {
          const g = new eP();
          var d = g;
          if (
            b.gF ||
            b.aA === !0 ||
            b.nE === !0 ||
            (b.internalUsageAttributionIds &&
              b.internalUsageAttributionIds.length !== 0)
          ) {
            var e = new bOa(),
              f = b.gF;
            f && _.ag(e, 4, f);
            b.aA === !0 && _.Yf(e, 2, 1e4);
            b.nE === !0 && _.cg(e, 1, 2);
            b.internalUsageAttributionIds &&
              _.KG(e, 3, b.internalUsageAttributionIds);
            _.Pv(d, cOa, e);
          }
          this.Bu(g, b);
          _.Jf(c, eP, 15, g);
        }
      });
    }
    Hg(a, b, c) {
      var d = _.Wm(a);
      if (!this.Eg.has(d) || !this.Eg.get(d).has(b)) {
        var e = this.Eg.has(d) ? this.Eg.get(d) : new Set();
        e.add(b);
        this.Eg.set(d, e);
        d = void 0;
        typeof a?.tp === "function" && (d = a?.tp() || void 0);
        a = new tP(b);
        this.hq(a, { ...c, gF: d });
        this.Fg(a);
      }
    }
    Gg(a) {
      a = new tP(a);
      this.hq(a, { nE: !0 });
      this.Fg(a);
    }
  };
  var eOa = class {
    constructor(a) {
      this.Eg = new Map();
      this.Jg = 1;
      this.Gg = a;
      this.Fg = [];
      _.nx(document, "visibilitychange", this, this.Ig);
    }
    sr(a, b) {
      if (document.visibilityState !== "visible") return null;
      const c = b && b.sI ? b.sI : 3e4,
        d = fNa(b);
      if (b && b.Ut && d === 0) return null;
      const e = `e-${this.Jg++}`;
      this.Eg.set(e, { Qq: a, startTime: d });
      setTimeout(() => {
        this.Am(e, 4);
      }, c);
      return e;
    }
    ur(a) {
      a && this.Eg.get(a) && this.Eg.delete(a);
    }
    Hg() {
      this.Eg.clear();
    }
    Am(a, b, c) {
      if (a) {
        var d = this.Eg.get(a);
        if (d) {
          this.Eg.delete(a);
          var { Qq: e, startTime: f, KF: g = {} } = d;
          a = _.QK(performance.now() - f);
          var h = new uP();
          b = _.Yf(h, 1, b);
          h = new pNa();
          a = _.Jf(h, _.PK, 3, a);
          a = _.Jf(a, uP, 6, b);
          b = new qNa();
          a = _.Jf(b, pNa, 1, a);
          this.hq(new sNa(e), a);
          if (Object.keys(g).length || c) {
            a = new lNa();
            typeof c?.EE === "number" && _.Yf(a, 2, c.EE);
            if (Object.keys(g).length) {
              c = new jNa();
              for (const [l, n] of Object.entries(g))
                (b = n),
                  (h = new iNa()),
                  (h = _.Yf(h, 1, +l)),
                  (b = _.yG(h, 2, b)),
                  _.Gw(c, 1, iNa, b);
              _.Jf(a, jNa, 1, c);
            }
            this.hq(new oNa(d.Qq), a);
          }
          for (const l of this.Fg) this.Gg(l);
          this.Fg = [];
          performance.now();
        }
      }
    }
    Bu(a, { WP: b, XP: c }) {
      if ((a = this.Eg.get(a)) && b && c) {
        const d = a.KF || {};
        d[b] = Math.max(d[b] || 0, c);
        a.KF = d;
      }
    }
    hq(a, b) {
      a.NF(b);
      this.Fg.push(a);
    }
    Ig() {
      document.visibilityState !== "visible" && this.Eg.clear();
    }
  };
  var fOa = new (class {
    constructor() {
      this.JF = PLa(this);
      const a = eNa();
      this.Eg = cNa(a);
      const b = (c) => {
        _.ag(a, 8, this.JF.toString());
        var d = this.Eg;
        if (d.Gg) {
          c = d.Gg.Hg(c);
          for (let e = 0; e < c.length; ++e)
            d.Ig.jz(c[e]), d.Eg && d.Eg.hp(c[e]);
        }
      };
      this.Ay = new eOa(b);
      this.fE = new dOa(b);
    }
  })();
  _.dl("log", fOa);
});
