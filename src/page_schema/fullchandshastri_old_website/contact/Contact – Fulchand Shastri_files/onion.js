google.maps.__gjsload__("onion", (_) => {
  var sR,
    tR,
    lTa,
    mTa,
    nTa,
    oTa,
    pTa,
    qTa,
    xR,
    wR,
    sTa,
    tTa,
    uTa,
    rTa,
    vTa,
    zR,
    wTa,
    xTa,
    yTa,
    ATa,
    CTa,
    DTa,
    FTa,
    GTa,
    JTa,
    LTa,
    NTa,
    PTa,
    RTa,
    STa,
    QTa,
    FR,
    GR,
    ER,
    HR,
    XTa,
    YTa,
    ZTa,
    $Ta,
    bUa,
    aUa,
    IR,
    jUa,
    iUa,
    LR,
    oUa,
    pUa,
    qUa,
    nUa,
    tUa,
    uUa,
    wUa,
    NR,
    AUa,
    BUa,
    CUa,
    vUa,
    xUa,
    yUa,
    DUa,
    EUa,
    MR,
    LUa,
    MUa,
    NUa,
    OUa,
    PUa,
    QUa,
    uR,
    PR,
    RUa,
    OR,
    SUa,
    TUa,
    UUa,
    VUa,
    WUa,
    BR,
    AR,
    XUa,
    BTa,
    CR,
    zTa,
    yR,
    YUa,
    ZUa,
    $Ua;
  sR = (a, b = !1) => _.Qy(a, b);
  tR = (a) => a.length > 0 && a[0].includes("/featureMaps?");
  lTa = (a, b) => {
    const c = a.length,
      d = typeof a === "string" ? a.split("") : a;
    for (let e = 0; e < c; e++)
      if (e in d && b.call(void 0, d[e], e, a)) return !0;
    return !1;
  };
  mTa = (a) => _.F(a, 4);
  nTa = (a) => _.Z(a, _.kA, 3);
  oTa = (a) => _.Bf(a, uR, 1);
  pTa = (a, b) => {
    _.ag(a, 1, b);
  };
  qTa = (a, b) => {
    _.ag(a, 2, b);
  };
  xR = function (a) {
    _.JJ.call(this, a, vR);
    wR(a);
  };
  wR = (a) => {
    _.YI(a, vR) ||
      (_.XI(
        a,
        vR,
        { entity: 0, qn: 1 },
        [
          "div",
          ,
          1,
          0,
          [
            " ",
            [
              "div",
              ,
              1,
              1,
              [" ", ["div", 576, 1, 2, "Dutch Cheese Cakes"], " "],
            ],
            " ",
            [
              "div",
              ,
              1,
              3,
              [
                " ",
                ["span", 576, 1, 4, "Central Station"],
                " ",
                ["div", , 1, 5],
                " ",
              ],
            ],
            " ",
          ],
        ],
        [],
        rTa(),
      ),
      _.YI(a, "t-ZGhYQtxECIs") ||
        _.XI(
          a,
          "t-ZGhYQtxECIs",
          {},
          ["jsl", , 1, 0, " Station is accessible "],
          [],
          [["$t", "t-ZGhYQtxECIs"]],
        ));
  };
  sTa = (a) => a.wj;
  tTa = (a) => a.Ml;
  uTa = () => _.wI("t-ZGhYQtxECIs", {});
  rTa = () => [
      ["$t", "t-t0weeym2tCw", "$a", [7, , , , , "transit-container"]],
      [
        "display",
        (a) => !_.zI(a.entity, (b) => _.aw(b.Og, 19)),
      ],
      [
        "var",
        (a) => (a.wj = _.xI(a.entity, "", (b) => b.getTitle())),
        "$dc",
        [sTa, !1],
        "$a",
        [7, , , , , "gm-title"],
        "$a",
        [7, , , , , "gm-full-width"],
        "$c",
        [, , sTa],
      ],
      [
        "display",
        (a) => _.zI(a.entity, (b) => _.aw(b.Og, 19)),
        "$a",
        [7, , , , , "transit-title", , 1],
      ],
      [
        "var",
        (a) => (a.Ml = _.xI(
            a.entity,
            "",
            (b) => _.lk(b.Og, 19, yR),
            (b) => b.getName(),
          )),
        "$dc",
        [tTa, !1],
        "$c",
        [, , tTa],
      ],
      [
        "display",
        (a) => (
            _.xI(
              a.entity,
              0,
              (b) => _.lk(b.Og, 19, yR),
              (b) => _.Qf(b, 18),
            ) == 2
          ),
        "$a",
        [7, , , , , "transit-wheelchair-icon", , 1],
        "$uae",
        ["aria-label", uTa],
        "$uae",
        ["title", uTa],
        "$a",
        [0, , , , "img", "role", , 1],
      ],
    ];
  vTa = (a) => _.xI(a.icon, "", (b) => _.F(b, 4));
  zR = (a) => a.wj;
  wTa = (a) => a.oj
      ? _.vI(
          "background-color",
          _.xI(
            a.component,
            "",
            (b) => b.Hm(),
            (b) => b.dl(),
          ),
        )
      : _.xI(
          a.component,
          "",
          (b) => b.Hm(),
          (b) => b.dl(),
        );
  xTa = (a) => _.xI(
      a.component,
      !1,
      (b) => b.Hm(),
      (b) => _.sv(b, 2),
    );
  yTa = (a) => a.Ml;
  ATa = () => [
      ["$t", "t-DjbQQShy8a0", "$a", [7, , , , , "transit-container"]],
      [
        "$a",
        [
          5,
          ,
          ,
          ,
          (a) => a.oj
              ? _.vI("display", _.xI(a.qn, !1, (b) => _.sv(b, 2)) ? "none" : "")
              : _.xI(a.qn, !1, (b) => _.sv(b, 2))
                ? "none"
                : "",
          "display",
          ,
          ,
          1,
        ],
        "$up",
        [
          "t-t0weeym2tCw",
          {
            entity: (a) => a.entity,
            qn: (a) => a.qn,
          },
        ],
      ],
      [
        "for",
        [
          (a, b) => (a.Un = b),
          (a, b) => (a.DJ = b),
          (a, b) => (a.EP = b),
          (a) => _.xI(
              a.entity,
              [],
              (b) => _.lk(b.Og, 19, yR),
              (b) => _.Hf(b, zTa, 17),
            ),
        ],
        "display",
        (a) => _.zI(a.entity, (b) => _.aw(b.Og, 19)),
        "$a",
        [7, , , , , "transit-line-group"],
        "$a",
        [
          7,
          ,
          ,
          (a) => a.DJ != 0,
          ,
          "transit-line-group-separator",
        ],
      ],
      [
        "for",
        [
          (a, b) => (a.icon = b),
          (a, b) => (a.uP = b),
          (a, b) => (a.vP = b),
          (a) => _.xI(a.Un, [], (b) => _.Hf(b, AR, 2)),
        ],
        "$a",
        [0, , , , vTa, "alt", , , 1],
        "$a",
        [
          8,
          2,
          ,
          ,
          (a) => _.xI(
              a.icon,
              "",
              (b) => _.Hf(b, BR, 5),
              (b) => b[0],
              (b) => b.getUrl(),
            ),
          "src",
          ,
          ,
          1,
        ],
        "$a",
        [0, , , , vTa, "title", , , 1],
        "$a",
        [0, , , , "15", "height", , 1],
        "$a",
        [0, , , , "15", "width", , 1],
      ],
      [
        "var",
        (a) => (a.YA =
            _.xI(a.Un, 0, (b) => _.Qf(b, 5)) == 0
              ? 15
              : _.xI(a.Un, 0, (b) => _.Qf(b, 5)) == 1
                ? 12
                : 6),
        "var",
        (a) => (a.nM = _.yI(a.Un, (b) => _.Hf(b, CR, 3)) > a.YA),
        "$a",
        [7, , , , , "transit-line-group-content", , 1],
      ],
      [
        "for",
        [
          (a, b) => (a.line = b),
          (a, b) => (a.i = b),
          (a, b) => (a.DP = b),
          (a) => _.xI(a.Un, [], (b) => _.Hf(b, CR, 3)),
        ],
        "display",
        (a) => a.i < a.YA,
        "$up",
        [
          "t-WxTvepIiu_w",
          {
            Un: (a) => a.Un,
            line: (a) => a.line,
          },
        ],
      ],
      [
        "display",
        (a) => a.nM,
        "var",
        (a) => (a.RK = _.yI(a.Un, (b) => _.Hf(b, CR, 3)) - a.YA),
        "$a",
        [7, , , , , "transit-nlines-more-msg", , 1],
      ],
      [
        "var",
        (a) => (a.wj = String(a.RK)),
        "$dc",
        [zR, !1],
        "$c",
        [, , zR],
      ],
      ["$a", [7, , , , , "transit-line-group-vehicle-icons", , 1]],
      ["$a", [7, , , , , "transit-clear-lines", , 1]],
    ];
  CTa = () => [
      [
        "$t",
        "t-WxTvepIiu_w",
        "display",
        (a) => _.yI(a.line, (b) => _.Hf(b, BTa, 6)) > 0,
        "var",
        (a) => (a.TA = _.zI(a.Un, (b) => _.Mf(b, 5) != null)
            ? _.xI(a.Un, 0, (b) => _.Qf(b, 5))
            : 2),
        "$a",
        [7, , , , , "transit-div-line-name"],
      ],
      [
        "$a",
        [
          7,
          ,
          ,
          (a) => a.TA == 2,
          ,
          "gm-transit-long",
        ],
        "$a",
        [
          7,
          ,
          ,
          (a) => a.TA == 1,
          ,
          "gm-transit-medium",
        ],
        "$a",
        [
          7,
          ,
          ,
          (a) => a.TA == 0,
          ,
          "gm-transit-short",
        ],
        "$a",
        [0, , , , "list", "role"],
      ],
      [
        "for",
        [
          (a, b) => (a.component = b),
          (a, b) => (a.cP = b),
          (a, b) => (a.dP = b),
          (a) => _.xI(a.line, [], (b) => _.Hf(b, BTa, 6)),
        ],
        "$up",
        [
          "t-LWeJzkXvAA0",
          {
            component: (a) => a.component,
          },
        ],
      ],
    ];
  DTa = () => [
      ["$t", "t-LWeJzkXvAA0", "$a", [0, , , , "listitem", "role"]],
      [
        "display",
        (a) => (
            _.zI(a.component, (b) => b.Lo()) &&
            _.zI(
              a.component,
              (b) => b.getIcon(),
              (b) => _.Hf(b, BR, 5),
              (b) => b[0],
              (b) => b.jl(),
            )
          ),
        "$a",
        [7, , , , , "renderable-component-icon", , 1],
        "$a",
        [
          0,
          ,
          ,
          ,
          (a) => _.xI(
              a.component,
              "",
              (b) => b.getIcon(),
              (b) => _.F(b, 4),
            ),
          "alt",
          ,
          ,
          1,
        ],
        "$a",
        [
          8,
          2,
          ,
          ,
          (a) => _.xI(
              a.component,
              "",
              (b) => b.getIcon(),
              (b) => _.Hf(b, BR, 5),
              (b) => b[0],
              (b) => b.getUrl(),
            ),
          "src",
          ,
          ,
          1,
        ],
        "$a",
        [0, , , , "15", "height", , 1],
        "$a",
        [0, , , , "15", "width", , 1],
      ],
      [
        "display",
        (a) => _.zI(a.component, (b) => b.wA()),
        "var",
        (a) => (a.yP = _.xI(a.component, 0, (b) => b.getType()) == 5),
        "var",
        (a) => (a.jK =
            _.xI(
              a.component,
              "",
              (b) => b.Hm(),
              (b) => b.dl(),
            ) == "#ffffff"),
        "var",
        (a) => (a.OA = _.zI(
            a.component,
            (b) => b.Hm(),
            (b) => b.qv(),
          )),
      ],
      [
        "display",
        (a) => (
            !_.zI(
              a.component,
              (b) => b.Hm(),
              (b) => b.Aj(),
            ) && a.OA
          ),
        "$a",
        [7, , , , , "renderable-component-color-box", , 1],
        "$a",
        [5, 5, , , wTa, "background-color", , , 1],
      ],
      [
        "display",
        (a) => (
            _.zI(
              a.component,
              (b) => b.Hm(),
              (b) => b.Aj(),
            ) && a.OA
          ),
        "$a",
        [7, , , , , "renderable-component-text-box"],
        "$a",
        [7, , , xTa, , "renderable-component-bold"],
        "$a",
        [
          7,
          ,
          ,
          (a) => a.jK,
          ,
          "renderable-component-text-box-white",
        ],
        "$a",
        [5, 5, , , wTa, "background-color", , , 1],
        "$a",
        [
          5,
          5,
          ,
          ,
          (a) => a.oj
              ? _.vI(
                  "color",
                  _.xI(
                    a.component,
                    "",
                    (b) => b.Hm(),
                    (b) => b.Fj(),
                  ),
                )
              : _.xI(
                  a.component,
                  "",
                  (b) => b.Hm(),
                  (b) => b.Fj(),
                ),
          "color",
          ,
          ,
          1,
        ],
      ],
      [
        "var",
        (a) => (a.wj = _.xI(
            a.component,
            "",
            (b) => b.Hm(),
            (b) => b.Qh(),
          )),
        "$dc",
        [zR, !1],
        "$a",
        [7, , , , , "renderable-component-text-box-content"],
        "$c",
        [, , zR],
      ],
      [
        "display",
        (a) => (
            _.zI(
              a.component,
              (b) => b.Hm(),
              (b) => b.Aj(),
            ) && !a.OA
          ),
        "var",
        (a) => (a.Ml = _.xI(
            a.component,
            "",
            (b) => b.Hm(),
            (b) => b.Qh(),
          )),
        "$dc",
        [yTa, !1],
        "$a",
        [7, , , , , "renderable-component-text"],
        "$a",
        [7, , , xTa, , "renderable-component-bold"],
        "$c",
        [, , yTa],
      ],
    ];
  FTa = (a, b) => {
    a = _.Ry({ sh: a.x, th: a.y, Ah: b });
    if (!a) return null;
    var c = 2147483648 / (1 << b);
    a = new _.On(a.sh * c, a.th * c);
    c = 1073741824;
    b = Math.min(31, _.vl(b, 31));
    DR.length = Math.floor(b);
    for (let d = 0; d < b; ++d)
      (DR[d] = ETa[(a.x & c ? 2 : 0) + (a.y & c ? 1 : 0)]), (c >>= 1);
    return DR.join("");
  };
  GTa = (a) => a.charAt(1);
  JTa = (a) => {
    let b = a.search(HTa);
    if (b !== -1) {
      for (; a.charCodeAt(b) !== 124; ++b);
      return a.slice(0, b).replace(ITa, GTa);
    }
    return a.replace(ITa, GTa);
  };
  _.KTa = (a, b) => {
    let c = 0;
    b.forEach((d, e) => {
      (d.zIndex || 0) <= (a.zIndex || 0) && (c = e + 1);
    });
    b.insertAt(c, a);
  };
  LTa = (a, b, c) => {
    b.data.remove(c);
    c.tiles.remove(b);
    c.tiles.getSize() || (a.data.remove(c), (c.yp = null), (c.tiles = null));
  };
  NTa = (a, b, c, d, e, f, g) => {
    const h = "ofeatureMapTiles_" + b;
    _.Fm(c, "insert_at", () => {
      a && a[h] && (a[h] = {});
    });
    _.Fm(c, "remove_at", () => {
      a && a[h] && (c.getLength() || (a[h] = {}));
    });
    new MTa(c, d, e, f, (l, n) => {
      a && a[h] && (a[h][`${l.coord.x}-${l.coord.y}-${l.zoom}`] = l.hasData);
      g && g(l, n);
    });
  };
  PTa = (a, b, c) => {
    const d = (a.Eg[c.id] = a.Eg[c.id] || {}),
      e = b.toString();
    if (!d[e] && !b.freeze) {
      var f = new OTa([b].concat(b.Fg || []), [c]),
        g = b.wy;
      (b.Fg || []).forEach((n) => {
        g = g || n.wy;
      });
      var h = g && a.Fg ? a.Fg : a.Gg,
        l = h.load(f, (n) => {
          delete d[e];
          let p = b.layerId;
          p = JTa(p);
          if ((n = n && n[c.hy] && n[c.hy][p]))
            (n.yp = b),
              n.tiles || (n.tiles = new _.hq()),
              _.iq(n.tiles, c),
              _.iq(b.data, n),
              _.iq(c.data, n);
          n = { coord: c.si, zoom: c.zoom, hasData: !!n };
          a.ai && a.ai(n, b);
        });
      l &&
        (d[e] = () => {
          h.cancel(l);
        });
    }
  };
  RTa = (a, b) => {
    const c = a.Eg[b.id];
    for (const d in c) d && QTa(a, b, d);
    delete a.Eg[b.id];
  };
  STa = (a, b) => {
    a.tiles.forEach((c) => {
      c.id != null && PTa(a, b, c);
    });
  };
  QTa = (a, b, c) => {
    if ((a = a.Eg[b.id])) if ((b = a[c])) b(), delete a[c];
  };
  FR = function (a, b, c) {
    this.Fg = a;
    this.Eg = b;
    this.Ig = ER(this, 1);
    this.Gg = ER(this, 3);
    this.Hg = c;
  };
  GR = (a, b) => a.Fg.charCodeAt(b) - 63;
  ER = (a, b) => (GR(a, b) << 6) | GR(a, b + 1);
  HR = (a, b) => (GR(a, b) << 12) | (GR(a, b + 1) << 6) | GR(a, b + 2);
  XTa = (a, b, c = !1) => (d, e) => {
      function f(h) {
        const l = {};
        for (let G = 0, L = _.nl(h); G < L; ++G) {
          var n = h[G],
            p = n.layer;
          if (p !== "") {
            p = JTa(p);
            var r = n.id;
            l[r] || (l[r] = {});
            r = l[r];
            a: {
              if (!n) {
                n = null;
                break a;
              }
              const K = n.features;
              var u = n.base;
              delete n.base;
              const A = (1 << n.id.length) / 8388608;
              var w = n.id,
                x = 0,
                y = 0,
                C = 1073741824;
              for (let W = 0, ma = w.length; W < ma; ++W) {
                const sa = TTa[w.charAt(W)];
                if (sa == 2 || sa == 3) x += C;
                if (sa == 1 || sa == 3) y += C;
                C >>= 1;
              }
              w = x;
              if (K && K.length) {
                x = n.epoch;
                x = typeof x === "number" && n.layer ? { [n.layer]: x } : null;
                for (const W of K)
                  if ((C = W.a))
                    (C[0] += u[0]),
                      (C[1] += u[1]),
                      (C[0] -= w),
                      (C[1] -= y),
                      (C[0] *= A),
                      (C[1] *= A);
                u = [new UTa(K, x)];
                n.raster && u.push(new FR(n.raster, K, x));
                n = new VTa(K, u);
              } else n = null;
            }
            r[p] = n ? new WTa(n) : null;
          }
        }
        e(l);
      }
      const g = a[(0, _.ss)(d) % a.length];
      b || c
        ? ((d = c
            ? new _.Vw(g + d).toString()
            : (0, _.rs)(new _.Vw(g).setQuery(d, !0).toString())),
          _.gBa(d, { ai: f, en: f, lD: !0 }))
        : _.zz(_.ss, g, _.rs, d, f, f);
    };
  YTa = (a, b, c, d, e) => {
    let f, g;
    a.Eg &&
      a.rh.forEach((h) => {
        if (h.Hg && b[h.Pn()] && h.clickable !== !1) {
          h = h.Pn();
          var l = b[h][0];
          l.bb && ((f = h), (g = l));
        }
      });
    g ||
      a.rh.forEach((h) => {
        b[h.Pn()] && h.clickable !== !1 && ((f = h.Pn()), (g = b[f][0]));
      });
    if (!f || !g || !g.id) return null;
    a = new _.On(0, 0);
    e = 1 << e;
    g.a
      ? ((a.x = (c.x + g.a[0]) / e), (a.y = (c.y + g.a[1]) / e))
      : ((a.x = (c.x + d.x) / e), (a.y = (c.y + d.y) / e));
    c = new _.Qn(0, 0);
    d = g.bb;
    e = g.io;
    if (d && d.length >= 4 && d.length % 4 === 0) {
      e = e ? _.vo(d[0], d[1], d[2], d[3]) : null;
      let h = null;
      for (let l = d.length - 4; l >= 0; l -= 4) {
        const n = _.vo(d[l], d[l + 1], d[l + 2], d[l + 3]);
        n.equals(e) || (h ? h.extendByBounds(n) : (h = n));
      }
      e
        ? (c.height = -e.getSize().height)
        : h &&
          ((c.width = h.minX + h.getSize().width / 2), (c.height = h.minY));
    } else e && ((c.width = e[0] || 0), (c.height = e[1] || 0));
    return { feature: g, layerId: f, anchorPoint: a, anchorOffset: c };
  };
  ZTa = (a, b) => {
    const c = {};
    a.forEach((d) => {
      var e = d.yp;
      e.clickable !== !1 &&
        ((e = e.Pn()),
        d.get(b.x, b.y, (c[e] = [])),
        c[e].length || delete c[e]);
    });
    return c;
  };
  $Ta = (a, b) => a.Eg[b] && a.Eg[b][0];
  bUa = (a, b) => {
    b.sort((d, e) => d.rw.tiles[0].id < e.rw.tiles[0].id ? -1 : 1);
    const c = 25 / b[0].rw.rh.length;
    while (b.length) {
      const d = b.splice(0, c),
        e = d.map((f) => f.rw.tiles[0]);
      a.Gg.load(new OTa(d[0].rw.rh, e), aUa.bind(null, d));
    }
  };
  aUa = (a, b) => {
    for (let c = 0; c < a.length; ++c) a[c].ai(b);
  };
  IR = (a, b, c, d = !1) => _.SJ(
      new _.nDa(
        new cUa(
          new dUa(XTa(a, c, d), () => {
            const e = {};
            b.get("tilt") &&
              !b.Tr &&
              ((e.uF = "o"), (e.deg = String(b.get("heading") || 0)));
            var f = b.get("style");
            f && (e.style = f);
            b.get("mapTypeId") === "roadmap" && (e.QM = !0);
            if ((f = b.get("apistyle"))) e.nD = f;
            f = b.get("authUser");
            f != null && (e.xo = f);
            if ((f = b.get("mapIdPaintOptions"))) e.Cp = f;
            return e;
          }),
        ),
      ),
    );
  jUa = (a, b, c, d) => {
    function e() {
      const y = d ? 0 : f.get("tilt"),
        C = d ? 0 : a.get("heading"),
        G = a.get("authUser");
      return new eUa(g, l, b.getArray(), y, C, G, r);
    }
    const f = a.__gm,
      g = f.ih || (f.ih = new _.hq());
    var h = new fUa(d);
    d || (h.bindTo("tilt", f), h.bindTo("heading", a));
    h.bindTo("authUser", a);
    const l = _.Py(),
      n = sR(l),
      p = sR(l, !0);
    NTa(a, "onion", b, g, IR(n, h, !1, tR(n)), IR(p, h, !1, tR(p)));
    let r = void 0,
      u = e();
    h = u.Eg();
    const w = _.fo(h);
    _.eL(a, w, "overlayLayer", 20, {
      qF(y) {
        function C() {
          u = e();
          y.hM(u);
        }
        b.addListener("insert_at", C);
        b.addListener("remove_at", C);
        b.addListener("set_at", C);
      },
      gL() {
        _.O(u, "oniontilesloaded");
      },
    });
    const x = new gUa(b, _.sq[15]);
    f.Fg.then((y) => {
      const C = new hUa(b, g, x, f, w, y.Zg.uj);
      f.Jg.register(C);
      iUa(C, c, a);
      const G = ["mouseover", "mouseout", "mousemove"];
      for (const L of G)
        _.Fm(C, L, (K) => {
          var A = L;
          const W = $Ta(c, K.layerId);
          if (W) {
            var ma = a.get("projection").fromPointToLatLng(K.anchorPoint),
              sa = null;
            K.feature.c && (sa = JSON.parse(K.feature.c));
            _.O(W, A, K.feature.id, ma, K.anchorOffset, sa, W.layerId);
          }
        });
      _.qw(y.rr, (L) => {
        L && r !== L.Ch && ((r = L.Ch), (u = e()), w.set(u.Eg()));
      });
    });
  };
  _.JR = (a) => {
    const b = a.__gm;
    if (!b.Yg) {
      const c = (b.Yg = new _.Ao()),
        d = new kUa(c);
      b.Gg.then((e) => {
        jUa(a, c, d, e);
      });
    }
    return b.Yg;
  };
  _.lUa = (a, b) => {
    b = _.JR(b);
    let c = -1;
    b.forEach((d, e) => {
      d === a && (c = e);
    });
    return c >= 0 ? (b.removeAt(c), !0) : !1;
  };
  iUa = (a, b, c) => {
    let d = void 0;
    _.Fm(a, "click", (e) => {
      d = window.setTimeout(() => {
        const f = $Ta(b, e.layerId);
        if (f) {
          var g = c.get("projection").fromPointToLatLng(e.anchorPoint),
            h = f.Gg;
          h
            ? h(
                new _.mUa(f.layerId, e.feature.id, f.parameters),
                _.O.bind(_.pt, f, "click", e.feature.id, g, e.anchorOffset),
              )
            : ((h = null),
              e.feature.c && (h = JSON.parse(e.feature.c)),
              _.O(
                f,
                "click",
                e.feature.id,
                g,
                e.anchorOffset,
                null,
                h,
                f.layerId,
              ));
        }
      }, 300);
    });
    _.Fm(a, "dblclick", () => {
      window.clearTimeout(d);
      d = void 0;
    });
  };
  LR = function (a) {
    _.JJ.call(this, a, KR);
    _.YI(a, KR) ||
      (_.XI(
        a,
        KR,
        { entity: 0, qn: 1 },
        [
          "div",
          ,
          1,
          0,
          [
            "",
            " ",
            [
              "div",
              ,
              1,
              1,
              [
                " ",
                ["div", , 1, 2, "Dutch Cheese Cakes"],
                " ",
                [
                  "div",
                  ,
                  ,
                  6,
                  [" ", ["div", 576, 1, 3, "29/43-45 E Canal Rd"], " "],
                ],
                " ",
              ],
            ],
            "",
            " ",
            ["div", , 1, 4, "transit info"],
            " ",
            [
              "div",
              ,
              ,
              7,
              [
                " ",
                [
                  "a",
                  ,
                  1,
                  5,
                  [" ", ["span", , , , " View on Google Maps "], " "],
                ],
                " ",
              ],
            ],
            " ",
          ],
        ],
        [],
        nUa(),
      ),
      wR(a),
      _.YI(a, "t-DjbQQShy8a0") ||
        (_.XI(
          a,
          "t-DjbQQShy8a0",
          { entity: 0, qn: 1 },
          [
            "div",
            ,
            1,
            0,
            [
              "",
              " ",
              ["div", , 1, 1, "transit info"],
              " ",
              [
                "div",
                576,
                1,
                2,
                [
                  " ",
                  ["div", , , 8, [" ", ["img", 8, 1, 3], " "]],
                  " ",
                  [
                    "div",
                    ,
                    1,
                    4,
                    [
                      " ",
                      ["div", , 1, 5, "Blue Mountains Line"],
                      " ",
                      ["div", , , 9],
                      " ",
                      [
                        "div",
                        ,
                        1,
                        6,
                        ["", " and ", ["span", 576, 1, 7, "5"], "&nbsp;more. "],
                      ],
                      " ",
                    ],
                  ],
                  " ",
                ],
              ],
              " ",
            ],
          ],
          [],
          ATa(),
        ),
        wR(a),
        _.YI(a, "t-WxTvepIiu_w") ||
          (_.XI(
            a,
            "t-WxTvepIiu_w",
            { Un: 0, line: 1 },
            [
              "div",
              ,
              1,
              0,
              [
                " ",
                ["div", 576, 1, 1, [" ", ["span", , 1, 2, "T1"], " "]],
                " ",
              ],
            ],
            [],
            CTa(),
          ),
          _.YI(a, "t-LWeJzkXvAA0") ||
            _.XI(
              a,
              "t-LWeJzkXvAA0",
              { component: 0 },
              [
                "span",
                ,
                1,
                0,
                [
                  ["img", 8, 1, 1],
                  "",
                  [
                    "span",
                    ,
                    1,
                    2,
                    [
                      "",
                      ["div", , 1, 3],
                      "",
                      ["span", 576, 1, 4, [["span", 576, 1, 5, "U1"]]],
                      "",
                      ["span", 576, 1, 6, "Northern"],
                    ],
                  ],
                  "",
                ],
              ],
              [],
              DTa(),
            ))));
  };
  oUa = (a) => a.entity;
  pUa = (a) => a.qn;
  qUa = (a) => a.wj;
  nUa = () => [
      [
        "$t",
        "t-Wtla7339NDI",
        "$a",
        [7, , , , , "poi-info-window"],
        "$a",
        [7, , , , , "gm-style"],
      ],
      [
        "display",
        (a) => !_.zI(a.entity, (b) => _.aw(b.Og, 19)),
      ],
      [
        "$a",
        [
          5,
          ,
          ,
          ,
          (a) => a.oj
              ? _.vI("display", _.xI(a.qn, !1, (b) => _.sv(b, 2)) ? "none" : "")
              : _.xI(a.qn, !1, (b) => _.sv(b, 2))
                ? "none"
                : "",
          "display",
          ,
          ,
          1,
        ],
        "$up",
        ["t-t0weeym2tCw", { entity: oUa, qn: pUa }],
      ],
      [
        "for",
        [
          (a, b) => (a.KH = b),
          (a, b) => (a.QO = b),
          (a, b) => (a.RO = b),
          (a) => _.xI(a.entity, [], (b) => b.qE()),
        ],
        "var",
        (a) => (a.wj = a.KH),
        "$dc",
        [qUa, !1],
        "$a",
        [7, , , , , "address-line"],
        "$a",
        [7, , , , , "full-width"],
        "$c",
        [, , qUa],
      ],
      [
        "display",
        (a) => _.zI(a.entity, (b) => _.aw(b.Og, 19)),
        "$up",
        ["t-DjbQQShy8a0", { entity: oUa, qn: pUa }],
      ],
      [
        "$a",
        [
          8,
          1,
          ,
          ,
          (a) => _.xI(a.qn, "", (b) => _.F(b, 1)),
          "href",
          ,
          ,
          1,
        ],
        "$a",
        [0, , , , "_blank", "target", , 1],
      ],
      ["$a", [7, , , , , "address", , 1]],
      ["$a", [7, , , , , "view-link", , 1]],
    ];
  tUa = (a) => {
    a = _.VBa(a);
    if (!a) return null;
    var b = new _.oL();
    b = _.cf(b, 1, _.vG(String(_.wd(_.ck(a.Fg))), 0));
    a = _.cf(b, 2, _.vG(String(_.wd(_.ck(a.Eg))), 0));
    b = new rUa();
    a = _.Jf(b, _.oL, 1, a);
    return _.cc(sUa(a), 4);
  };
  uUa = (a, b) => {
    b.substr(0, 2) == "0x"
      ? (_.ag(a, 1, b), _.cf(a, 4))
      : (_.ag(a, 4, b), _.cf(a, 1));
  };
  wUa = (a) => {
    let b;
    _.Fm(a.Fg, "click", (c, d) => {
      b = window.setTimeout(() => {
        _.ox(a.map, "smcf");
        _.hx(161530);
        vUa(a, c, d);
      }, 300);
    });
    _.Fm(a.Fg, "dblclick", () => {
      window.clearTimeout(b);
      b = void 0;
    });
  };
  NR = (a, b, c) => {
    a.Fg &&
      _.Fm(a.Fg, b, (d) => {
        (d = xUa(a, d)) &&
          d.Dr &&
          MR(a.map) &&
          yUa(a, c, d.Dr, d.ui, d.Dr.id || "");
      });
  };
  AUa = (a) => {
    ["ddsfeaturelayersclick", "ddsfeaturelayersmousemove"].forEach((b) => {
      _.Fm(a.Fg, b, (c, d, e) => {
        const f = new Map();
        for (const h of e) {
          e = (e = a.map.__gm.Eg.kv()) ? e.Hg() : [];
          e = _.UBa(h, e, a.map);
          if (!e) continue;
          var g = a.map;
          const l = g.__gm,
            n = e.featureType === "DATASET" ? e.datasetId : void 0;
          (g = _.Ap(g, { featureType: e.featureType, datasetId: n }).isAvailable
            ? e.featureType === "DATASET"
              ? n
                ? l.Kg.get(n) || null
                : null
              : l.Hg.get(e.featureType) || null
            : null) && (f.has(g) ? f.get(g)?.push(e) : f.set(g, [e]));
        }
        if (f.size > 0 && d.latLng && d.domEvent)
          for (const [h, l] of f) _.O(h, c, new zUa(d.latLng, d.domEvent, l));
      });
    });
  };
  BUa = (a) => {
    a.infoWindow && a.infoWindow.set("map", null);
  };
  CUa = (a) => {
    a.infoWindow ||
      (_.rBa(a.map.getDiv()),
      (a.infoWindow = new _.Ct({ wv: !0, logAsInternal: !0 })),
      a.infoWindow.addListener("map_changed", () => {
        a.infoWindow.get("map") || (a.Eg = null);
      }));
  };
  vUa = (a, b, c) => {
    MR(a.map) || CUa(a);
    const d = xUa(a, b);
    if (d && d.Dr) {
      var e = d.Dr.id;
      if (e)
        if (MR(a.map)) yUa(a, "smnoplaceclick", d.Dr, d.ui, e);
        else {
          let f = null,
            g;
          g = (f = /^0x[a-fA-F0-9]{16}:0x[a-fA-F0-9]{16}$/.test(e)
            ? tUa(e)
            : null)
            ? DUa(a, c, d, f)
            : void 0;
          a.Jg(e, _.uk.Eg(), (h) => {
            if (f) _.I(a.map, _.nk(h.Og, 28) === f ? 226501 : 226502);
            else {
              f = _.nk(h.Og, 28);
              g = DUa(a, c, d, f);
              try {
                if (e.split(":").length === 2) {
                  const l = tUa(e);
                  _.I(a.map, f === l ? 226501 : 226502);
                }
              } catch {}
            }
            (g && g.domEvent && _.nw(g.domEvent)) ||
              ((a.anchorOffset = d.anchorOffset || _.lo), (a.Eg = h), EUa(a));
          });
        }
    }
  };
  xUa = (a, b) => {
    const c = !_.sq[35];
    return a.Ig ? a.Ig(b, c) : b;
  };
  yUa = (a, b, c, d, e) => {
    d = a.map.get("projection").fromPointToLatLng(d);
    _.O(a.map, b, {
      featureId: e,
      latLng: d,
      queryString: c.query,
      aliasId: c.aliasId,
      tripIndex: c.tripIndex,
      adRef: c.adRef,
      featureIdFormat: c.featureIdFormat,
      incidentMetadata: c.incidentMetadata,
      hotelMetadata: c.hotelMetadata,
      loggedFeature: c.eF,
    });
  };
  DUa = (a, b, c, d) => {
    const e = a.map.get("projection");
    a.Gg = e && e.fromPointToLatLng(c.ui);
    let f;
    a.Gg &&
      b.domEvent &&
      ((f = new FUa(a.Gg, b.domEvent, d)), _.O(a.map, "click", f));
    return f;
  };
  EUa = (a) => {
    if (a.Eg) {
      var b = "",
        c = a.map.get("mapUrl");
      c && ((b = c), (c = mTa(a.Eg.Ko())) && (b += "&cid=" + c));
      c = new GUa();
      _.ag(c, 1, b);
      _.Wf(c, 2, !0);
      b = nTa(a.Eg.Ko());
      var d = a.Gg || new _.om(_.Nx(b), _.Px(b));
      a.layout.update([a.Eg, c], () => {
        const e = _.aw(a.Eg.Og, 19)
          ? _.mk(a.Eg.Og, 19, yR).getName()
          : a.Eg.getTitle();
        a.infoWindow.setOptions({ ariaLabel: e });
        a.infoWindow.setPosition(d);
        a.anchorOffset &&
          a.infoWindow.setOptions({ pixelOffset: a.anchorOffset });
        a.infoWindow.get("map") ||
          (a.infoWindow.setContent(a.layout.div), a.infoWindow.open(a.map));
      });
      a.Hg.update([a.Eg, c], () => {
        a.infoWindow.setHeaderContent(a.Hg.div);
      });
      _.aw(a.Eg.Og, 19) || a.infoWindow.setOptions({ minWidth: 228 });
    }
  };
  MR = (a) => _.sq[18] && (a.get("disableSIW") || a.get("disableSIWAndPDR"));
  LUa = (a, b, c) => {
    const d = new HUa(),
      e = _.pH(d.Og, 2, OR);
    pTa(e, b.Eg());
    qTa(e, b.Fg());
    _.rH(d.Og, 6, 1);
    uUa(oTa(_.pH(d.Og, 1, PR)), a);
    a = "pb=" + _.Kx(d, IUa);
    _.zz(
      _.ss,
      _.fC + "/maps/api/js/jsonp/ApplicationService.GetEntityDetails",
      _.rs,
      a,
      (f) => {
        f = new JUa(f);
        _.aw(f.Og, 2) && c(_.zk(f.Og, 2, KUa));
      },
    );
  };
  MUa = (a) => {
    let b = "" + a.getType();
    const c = _.qv(a, _.Vx, 2);
    for (let d = 0; d < c; ++d)
      b +=
        "|" +
        _.pv(a, 2, _.Vx, d).getKey() +
        ":" +
        _.pv(a, 2, _.Vx, d).getValue();
    return encodeURIComponent(b);
  };
  NUa = (a, b) => {
    var c = a.anchorPoint,
      d = a.feature,
      e = "";
    let f, g, h, l, n, p, r;
    let u = !1,
      w;
    if (d.c) {
      var x = JSON.parse(d.c);
      e =
        (x[31581606] && x[31581606].entity && x[31581606].entity.query) ||
        (x[1] && x[1].title) ||
        "";
      var y = document;
      e = e.indexOf("&") != -1 ? _.nxa(e, y) : e;
      f = x[15] && x[15].alias_id;
      p = x[16] && x[16].trip_index;
      y = x[29974456] && x[29974456].ad_ref;
      h =
        x[31581606] &&
        x[31581606].entity &&
        x[31581606].entity.feature_id_format;
      g = x[31581606] && x[31581606].entity;
      n = x[43538507];
      l = x[1] && x[1].hotel_data;
      u = (x[1] && x[1].is_transit_station) || !1;
      w = x[17] && x[17].omnimaps_data;
      r = x[28927125] && x[28927125].directions_request;
      x = x[40154408] && x[40154408].feature;
    }
    return {
      ui: c,
      Dr:
        d.id && d.id.indexOf("dti-") !== -1 && !b
          ? null
          : {
              id: d.id,
              query: e,
              aliasId: f,
              anchor: d.a,
              adRef: y,
              entity: g,
              tripIndex: p,
              featureIdFormat: h,
              incidentMetadata: n,
              hotelMetadata: l,
              isTransitStation: u,
              PP: w,
              BI: r,
              eF: x,
            },
      anchorOffset: a.anchorOffset || null,
    };
  };
  OUa = _.Ig(
    (a, b, c, d) => {
      if (a.Fg !== 1) return !1;
      _.Dw(b, c, d, _.mg(a.Eg));
      return !0;
    },
    _.Og,
    _.Xh,
  );
  PUa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  QUa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  uR = class extends _.H {
    constructor(a) {
      super(a);
    }
    Oj() {
      return _.F(this, 1);
    }
    getQuery() {
      return _.F(this, 2);
    }
    setQuery(a) {
      return _.ag(this, 2, a);
    }
    getLocation() {
      return _.Ef(this, _.kA, 3);
    }
  };
  PR = class extends _.H {
    constructor(a) {
      super(a);
    }
    Ko() {
      return _.Z(this, uR, 1);
    }
  };
  RUa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  OR = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  SUa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  TUa = [0, [0, _.T, -1, _.FL, _.T, -1, _.IA]];
  UUa = [
    0,
    [0, _.HA],
    _.R,
    [0, _.FL],
    -1,
    1,
    [
      0,
      _.V,
      _.S,
      -1,
      _.Xz,
      _.S,
      -1,
      _.Xz,
      _.V,
      _.Ns,
      [0, _.S, -1, _.U, [0, _.R]],
      [0, _.R, -1, 1, _.V, _.Ns, _.S],
      _.R,
      1,
      [0, _.Ns, _.R, _.HA],
      1,
      [0, _.V, _.R, _.V, _.R, _.V],
      _.V,
      _.S,
      -3,
    ],
    [0, _.U, _.HA],
  ];
  VUa = [0, _.T, -2];
  WUa = [0, [3, 7, 9], _.T, -1, _.Qz, _.S, _.V, -1, _.Qz, _.T, _.Zz, _.ZA];
  BR = class extends _.H {
    constructor(a) {
      super(a);
    }
    getUrl() {
      return _.F(this, 1);
    }
    setUrl(a) {
      return _.ag(this, 1, a);
    }
    jl() {
      return _.vv(this, 1);
    }
    getContext() {
      return _.Qf(this, 5);
    }
  };
  AR = class extends _.H {
    constructor(a) {
      super(a, 8);
    }
    getType() {
      return _.Qf(this, 1);
    }
    getId() {
      return _.F(this, 2);
    }
  };
  XUa = class extends _.H {
    constructor(a) {
      super(a);
    }
    Qh() {
      return _.F(this, 1);
    }
    Aj() {
      return _.vv(this, 1);
    }
    dl() {
      return _.F(this, 3);
    }
    qv() {
      return _.vv(this, 3);
    }
    Fj() {
      return _.F(this, 4);
    }
    getTime() {
      return _.Ef(this, QUa, 5);
    }
    zj() {
      return _.Ef(this, PUa, 7);
    }
  };
  BTa = class extends _.H {
    constructor(a) {
      super(a);
    }
    getType() {
      return _.Qf(this, 1);
    }
    Hm() {
      return _.Ef(this, XUa, 2);
    }
    wA() {
      return _.hv(this, XUa, 2);
    }
    getIcon() {
      return _.Ef(this, AR, 3);
    }
    setIcon(a) {
      return _.Jf(this, AR, 3, a);
    }
    Lo() {
      return _.hv(this, AR, 3);
    }
  };
  CR = class extends _.H {
    constructor(a) {
      super(a);
    }
    Oj() {
      return _.F(this, 5);
    }
  };
  zTa = class extends _.H {
    constructor(a) {
      super(a);
    }
    getName() {
      return _.F(this, 1);
    }
  };
  yR = class extends _.H {
    constructor(a) {
      super(a);
    }
    getName() {
      return _.F(this, 1);
    }
    Oj() {
      return _.F(this, 9);
    }
  };
  YUa = [
    -15,
    {},
    _.V,
    1,
    _.GCa,
    _.FCa,
    _.vCa,
    _.KCa,
    _.dM,
    _.HCa,
    _.ICa,
    _.eM,
    _.U,
    [0, _.U, _.WL, _.U, [0, _.R, -1], _.R, _.$z],
    _.xCa,
    _.ECa,
    _.dB,
  ];
  ZUa = [0, _.Sz, -1, _.V, -2, _.IA, _.V];
  $Ua = [0, _.T, -5, 4, _.T, -2, _.Xz, _.T, -2, 3, _.T, 4, _.T, -4, _.S];
  _.QR = class extends _.H {
    constructor(a) {
      super(a);
    }
    getKey() {
      return _.F(this, 1);
    }
    getValue() {
      return _.F(this, 2);
    }
  };
  _.aVa = [0, _.T, -1];
  _.qA[15256124] = [0, _.U, [0, _.U, _.yla, _.V]];
  _.qA[3514611] = $Ua;
  var HUa = class extends _.bt {
      constructor() {
        super();
      }
      Ko() {
        return _.mk(this.Og, 1, PR);
      }
    },
    IUa = [
      _.rL,
      _.eh(PR, TUa),
      PR,
      ,
      _.eh(OR, VUa),
      OR,
      _.uL,
      ,
      _.yL,
      1,
      _.rL,
      _.eh(RUa, UUa),
      RUa,
      _.uL,
      ,
      ,
      ,
      _.rL,
      _.eh(SUa, WUa),
      SUa,
      1,
      _.AL,
      1,
      ,
      ,
    ];
  _.qA[116304058] = YUa;
  _.pA[525e6] = ZUa;
  var KUa = class extends _.bt {
    constructor(a) {
      super(a);
    }
    Ko() {
      return _.mk(this.Og, 1, uR);
    }
    getTitle() {
      return _.nk(this.Og, 2);
    }
    setTitle(a) {
      _.sH(this.Og, 2, a);
    }
    qE() {
      return _.ax(this.Og, 3, _.jG);
    }
  };
  var JUa = class extends _.bt {
    constructor(a) {
      super(a);
    }
    getStatus() {
      return _.dw(this.Og, 1, -1);
    }
    ti() {
      return _.lk(this.Og, 5, _.JL);
    }
    Bk(a) {
      _.qH(this.Og, 5, a, _.JL);
    }
  };
  _.Ka(xR, _.MJ);
  xR.prototype.fill = function (a, b) {
    _.KJ(this, 0, a);
    _.KJ(this, 1, b);
  };
  var vR = "t-t0weeym2tCw";
  var ETa = ["t", "u", "v", "w"],
    DR = [];
  var ITa = /\*./g,
    HTa = /[^*](\*\*)*\|/;
  var OTa = class {
    constructor(a, b) {
      this.rh = a;
      this.tiles = b;
    }
    toString() {
      const a = this.tiles
        .map((b) => (b.pov ? `${b.id},${b.pov.toString()}` : b.id))
        .join(";");
      return this.rh.join(";") + "|" + a;
    }
  };
  var MTa = class {
    constructor(a, b, c, d, e) {
      this.rh = a;
      this.tiles = b;
      this.Gg = c;
      this.Fg = d;
      this.Eg = {};
      this.ai = e || null;
      _.Pm(b, "insert", this, this.Ig);
      _.Pm(b, "remove", this, this.Kg);
      _.Pm(a, "insert_at", this, this.Hg);
      _.Pm(a, "remove_at", this, this.Jg);
      _.Pm(a, "set_at", this, this.Lg);
    }
    Ig(a) {
      a.hy = FTa(a.si, a.zoom);
      a.hy != null &&
        ((a.id = a.hy + (a.lM || "")),
        this.rh.forEach((b) => {
          PTa(this, b, a);
        }));
    }
    Kg(a) {
      RTa(this, a);
      a.data.forEach((b) => {
        LTa(b.yp, a, b);
      });
    }
    Hg(a) {
      STa(this, this.rh.getAt(a));
    }
    Jg(a, b) {
      this.Cl(b);
    }
    Lg(a, b) {
      this.Cl(b);
      STa(this, this.rh.getAt(a));
    }
    Cl(a) {
      this.tiles.forEach((b) => {
        QTa(this, b, a.toString());
      });
      a.data.forEach((b) => {
        b.tiles &&
          b.tiles.forEach((c) => {
            LTa(a, c, b);
          });
      });
    }
  };
  var fUa = class extends _.Xm {
    constructor(a = !1) {
      super();
      this.Tr = a;
    }
  };
  _.mUa = class {
    constructor(a, b, c) {
      this.layerId = a;
      this.featureId = b;
      this.parameters = c ?? {};
    }
    toString() {
      return `${this.layerId}|${this.featureId}`;
    }
  };
  var WTa = class {
    constructor(a) {
      this.Eg = a;
      this.tiles = this.yp = null;
    }
    get(a, b, c) {
      return this.Eg.get(a, b, c);
    }
    cv() {
      return this.Eg.cv();
    }
    Fm() {
      return this.Eg.Fm();
    }
  };
  var UTa = class {
      constructor(a, b) {
        this.Eg = a;
        this.Gg = new bVa();
        this.Hg = new cVa();
        this.Fg = b;
      }
      cv() {
        return this.Eg;
      }
      get(a, b, c) {
        c = c || [];
        const d = this.Eg,
          e = this.Gg,
          f = this.Hg;
        f.x = a;
        f.y = b;
        for (let g = 0, h = d.length; g < h; ++g) {
          a = d[g];
          b = a.a;
          const l = a.bb;
          if (b && l)
            for (let n = 0, p = l.length / 4; n < p; ++n) {
              const r = n * 4;
              e.minX = b[0] + l[r];
              e.minY = b[1] + l[r + 1];
              e.maxX = b[0] + l[r + 2] + 1;
              e.maxY = b[1] + l[r + 3] + 1;
              if (e.containsPoint(f)) {
                c.push(a);
                break;
              }
            }
        }
        return c;
      }
      Fm() {
        return this.Fg;
      }
    },
    cVa = class {
      constructor() {
        this.y = this.x = 0;
      }
    },
    bVa = class {
      constructor() {
        this.minY = this.minX = Number.POSITIVE_INFINITY;
        this.maxY = this.maxX = Number.NEGATIVE_INFINITY;
      }
      containsPoint(a) {
        return (
          this.minX <= a.x &&
          a.x < this.maxX &&
          this.minY <= a.y &&
          a.y < this.maxY
        );
      }
    };
  var VTa = class {
    constructor(a, b) {
      this.Fg = a;
      this.Eg = b;
    }
    cv() {
      return this.Fg;
    }
    get(a, b, c) {
      c = c || [];
      for (let d = 0, e = this.Eg.length; d < e; d++) this.Eg[d].get(a, b, c);
      return c;
    }
    Fm() {
      var a = null;
      for (const b of this.Eg) {
        const c = b.Fm();
        if (a) c && _.mh(a, c);
        else if (c) {
          a = {};
          for (const d in c) a[d] = c[d];
        }
      }
      return a;
    }
  };
  _.B = FR.prototype;
  _.B.xj = 0;
  _.B.vr = 0;
  _.B.Go = {};
  _.B.cv = function () {
    return this.Eg;
  };
  _.B.get = function (a, b, c) {
    c = c || [];
    a = Math.round(a);
    b = Math.round(b);
    if (a < 0 || a >= this.Ig || b < 0 || b >= this.Gg) return c;
    const d = b == this.Gg - 1 ? this.Fg.length : HR(this, 5 + (b + 1) * 3);
    this.xj = HR(this, 5 + b * 3);
    this.vr = 0;
    for (this[8](); this.vr <= a && this.xj < d; ) this[GR(this, this.xj++)]();
    for (const e in this.Go) c.push(this.Eg[this.Go[e]]);
    return c;
  };
  _.B.Fm = function () {
    return this.Hg;
  };
  FR.prototype[1] = function () {
    ++this.vr;
  };
  FR.prototype[2] = function () {
    this.vr += GR(this, this.xj);
    ++this.xj;
  };
  FR.prototype[3] = function () {
    this.vr += ER(this, this.xj);
    this.xj += 2;
  };
  FR.prototype[5] = function () {
    const a = GR(this, this.xj);
    this.Go[a] = a;
    ++this.xj;
  };
  FR.prototype[6] = function () {
    const a = ER(this, this.xj);
    this.Go[a] = a;
    this.xj += 2;
  };
  FR.prototype[7] = function () {
    const a = HR(this, this.xj);
    this.Go[a] = a;
    this.xj += 3;
  };
  FR.prototype[8] = function () {
    for (const a in this.Go) delete this.Go[a];
  };
  FR.prototype[9] = function () {
    delete this.Go[GR(this, this.xj)];
    ++this.xj;
  };
  FR.prototype[10] = function () {
    delete this.Go[ER(this, this.xj)];
    this.xj += 2;
  };
  FR.prototype[11] = function () {
    delete this.Go[HR(this, this.xj)];
    this.xj += 3;
  };
  var TTa = { t: 0, u: 1, v: 2, w: 3 };
  var gUa = class {
    constructor(a, b) {
      this.rh = a;
      this.Eg = b;
    }
  };
  var dVa = [
      new _.On(-5, 0),
      new _.On(0, -5),
      new _.On(5, 0),
      new _.On(0, 5),
      new _.On(-5, -5),
      new _.On(-5, 5),
      new _.On(5, -5),
      new _.On(5, 5),
      new _.On(-10, 0),
      new _.On(0, -10),
      new _.On(10, 0),
      new _.On(0, 10),
    ],
    hUa = class {
      constructor(a, b, c, d, e, f) {
        this.rh = a;
        this.Ig = c;
        this.Gg = d;
        this.zIndex = 20;
        this.Eg = this.Fg = null;
        this.Hg = new _.DM(b.Fg, f, e);
      }
      ys(a) {
        return a !== "dragstart" && a !== "drag" && a !== "dragend";
      }
      Hs(a, b) {
        return (b ? dVa : [new _.On(0, 0)]).some(function (c) {
          c = _.dL(this.Hg, a.ui, c);
          if (!c) return !1;
          const d = c.xn.Ah,
            e = new _.On(c.nt.sh * 256, c.nt.th * 256),
            f = new _.On(c.xn.sh * 256, c.xn.th * 256),
            g = ZTa(c.gk.data, e);
          let h = !1;
          this.rh.forEach((l) => {
            g[l.Pn()] && (h = !0);
          });
          if (!h) return !1;
          c = YTa(this.Ig, g, f, e, d);
          if (!c) return !1;
          this.Fg = c;
          return !0;
        }, this)
          ? this.Fg.feature
          : null;
      }
      handleEvent(a, b) {
        let c;
        if (
          a === "click" ||
          a === "dblclick" ||
          a === "rightclick" ||
          a === "mouseover" ||
          (this.Eg && a === "mousemove")
        ) {
          if (((c = this.Fg), a === "mouseover" || a === "mousemove"))
            this.Gg.set("cursor", "pointer"), (this.Eg = c);
        } else if (a === "mouseout")
          (c = this.Eg), this.Gg.set("cursor", ""), (this.Eg = null);
        else return;
        a === "click" ? _.O(this, a, c, b) : _.O(this, a, c);
      }
    };
  var kUa = class {
    constructor(a) {
      this.rh = a;
      this.Eg = {};
      _.Fm(a, "insert_at", this.insertAt.bind(this));
      _.Fm(a, "remove_at", this.removeAt.bind(this));
      _.Fm(a, "set_at", this.setAt.bind(this));
    }
    insertAt(a) {
      a = this.rh.getAt(a);
      const b = a.Pn();
      this.Eg[b] || (this.Eg[b] = []);
      this.Eg[b].push(a);
    }
    removeAt(a, b) {
      a = b.Pn();
      this.Eg[a] && _.Al(this.Eg[a], b);
    }
    setAt(a, b) {
      this.removeAt(a, b);
      this.insertAt(a);
    }
  };
  var eUa = class extends _.bs {
    constructor(a, b, c, d, e, f, g = _.RB) {
      super();
      const h = lTa(c, (n) => !(!n || !n.wy)),
        l = new _.OB();
      _.Jy(l, b.Fg.Eg(), b.Fg.Fg());
      _.Nb(c, (n) => {
        n && l.Ni(n);
      });
      this.Fg = new eVa(
        a,
        new _.SB(
          _.Qy(b, !!h),
          null,
          !1,
          _.Ry,
          null,
          { Rm: l.request, xo: f },
          d ? e || 0 : void 0,
        ),
        g,
      );
    }
    Eg() {
      return this.Fg;
    }
  };
  eUa.prototype.maxZoom = 25;
  var eVa = class {
    constructor(a, b, c) {
      this.Eg = a;
      this.Fg = b;
      this.Ch = c;
      this.wl = 1;
    }
    Xk(a, b) {
      const c = this.Eg,
        d = {
          si: new _.On(a.sh, a.th),
          zoom: a.Ah,
          data: new _.hq(),
          lM: _.Ca(this),
        };
      a = this.Fg.Xk(a, {
        dj: () => {
          c.remove(d);
          b && b.dj && b.dj();
        },
      });
      d.div = a.Oi();
      _.iq(c, d);
      return a;
    }
  };
  var dUa = class {
    constructor(a, b) {
      this.Fg = a;
      this.Eg = b;
    }
    cancel() {}
    load(a, b) {
      const c = new _.OB();
      _.Jy(c, _.uk.Eg().Eg(), _.uk.Eg().Fg());
      _.Uia(c, 3);
      for (var d of a.rh)
        if (d.mapTypeId && d.Eg) {
          var e = d.mapTypeId,
            f = d.Eg;
          var g = _.kw();
          g = _.dw(g.Og, 16);
          _.Wia(c, e, f, g);
        }
      for (var h of a.rh) (h.mapTypeId && _.Gxa(h.mapTypeId)) || c.Ni(h);
      e = this.Eg();
      f = _.vH(e.deg);
      d = e.uF === "o" ? _.Uy(f) : _.Uy();
      for (const l of a.tiles)
        (h = d({ sh: l.si.x, th: l.si.y, Ah: l.zoom })) && _.Via(c, h);
      if (e.QM)
        for (const l of a.rh) l.roadmapStyler && _.My(c, l.roadmapStyler);
      for (const l of e.style || []) _.My(c, l);
      e.nD && _.ty(e.nD, _.Ay(_.Hy(c.request)));
      e.uF === "o" && (_.Yf(c.request, 13, f), _.Wf(c.request, 14, !0));
      e.Cp && _.Zia(c, e.Cp);
      a = `pb=${_.Sia(_.Kx(c.request, (0, _.NB)()))}`;
      e.xo != null && (a += `&authuser=${e.xo}`);
      this.Fg(a, b);
      return "";
    }
  };
  var cUa = class {
    constructor(a) {
      this.Gg = a;
      this.Eg = null;
      this.Fg = 0;
    }
    load(a, b) {
      this.Eg || ((this.Eg = {}), _.yH(this.Hg.bind(this)));
      var c = a.tiles[0];
      c = `${c.zoom},${c.pov}|${a.rh.join(";")}`;
      this.Eg[c] || (this.Eg[c] = []);
      this.Eg[c].push({ rw: a, ai: b });
      return `${++this.Fg}`;
    }
    cancel() {}
    Hg() {
      const a = this.Eg;
      if (a) {
        for (const b of Object.getOwnPropertyNames(a)) {
          const c = a[b];
          c && bUa(this, c);
        }
        this.Eg = null;
      }
    }
  };
  var zUa = class extends _.GB {
    constructor(a, b, c) {
      super(a, b);
      this.features = c;
    }
  };
  var FUa = class extends _.GB {
    constructor(a, b, c) {
      super(a, b);
      this.placeId = c || null;
    }
  };
  _.Ka(LR, _.MJ);
  LR.prototype.fill = function (a, b) {
    _.KJ(this, 0, a);
    _.KJ(this, 1, b);
  };
  var KR = "t-Wtla7339NDI";
  var GUa = class extends _.H {
    constructor(a) {
      super(a);
    }
  };
  var rUa = class extends _.H {
    constructor(a) {
      super(a, 100);
    }
    Oj() {
      return _.Ef(this, _.oL, 1);
    }
  };
  var RR = [0, _.zA, 1, _.T];
  var gVa = [0, () => fVa, _.T],
    fVa = [
      0,
      [1, 2, 3, 4, 5, 6, 7],
      _.Zz,
      RR,
      _.Zz,
      [0, [2, 3, 4], RR, _.Qz, OUa, _.Zz, _.BA, RR],
      _.Zz,
      () => gVa,
      _.Zz,
      [0, RR, -1, _.U, RR, _.BA],
      _.Zz,
      [0, RR, -1],
      _.Zz,
      [0, RR, _.R],
      _.Zz,
      [0, _.BA, _.Ms, RR],
    ];
  var sUa = _.fH([-100, {}, _.zA, _.T, _.FL, fVa, 94, _.T]);
  var hVa = class {
    constructor(a, b, c) {
      this.map = a;
      this.Fg = b;
      this.Ig = c;
      this.Gg = this.anchorOffset = this.Eg = this.infoWindow = null;
      this.Jg = LUa;
      this.layout = new _.lM(LR, { Oq: _.dC.Hj() });
      this.Hg = new _.lM(xR, { Oq: _.dC.Hj() });
      wUa(this);
      NR(this, "rightclick", "smnoplacerightclick");
      NR(this, "mouseover", "smnoplacemouseover");
      NR(this, "mouseout", "smnoplacemouseout");
      AUa(this);
    }
  };
  var iVa = class {
    constructor(a, b, c) {
      function d() {
        _.cq(w);
      }
      this.map = a;
      this.Fg = b;
      this.rh = c;
      this.Eg = null;
      const e = new _.hq(),
        f = new _.ina(e),
        g = a.__gm;
      var h = new fUa();
      h.bindTo("authUser", g);
      h.bindTo("tilt", g);
      h.bindTo("heading", a);
      h.bindTo("style", g);
      h.bindTo("apistyle", g);
      h.bindTo("mapTypeId", a);
      _.Cja(h, "mapIdPaintOptions", g.Cp);
      var l = _.Py();
      l = sR(l);
      const n = !new _.Vw(l[0]).Eg;
      h = IR(l, h, n, tR(l));
      let p = null,
        r = new _.UB(f, p || void 0);
      const u = _.fo(r),
        w = new _.bq(this.Gg, 0, this);
      d();
      _.Fm(a, "clickableicons_changed", d);
      _.Fm(g, "apistyle_changed", d);
      _.Fm(g, "authuser_changed", d);
      _.Fm(g, "basemaptype_changed", d);
      _.Fm(g, "style_changed", d);
      g.vk.addListener(d);
      b.ik().addListener(d);
      NTa(this.map, "smartmaps", c, e, h, null, (y, C) => {
        y = c.getAt(c.getLength() - 1);
        if (C === y) while (c.getLength() > 1) c.removeAt(0);
      });
      const x = new gUa(c, !1);
      a.__gm.Fg.then((y) => {
        const C = new hUa(c, e, x, g, u, y.Zg.uj);
        C.zIndex = 0;
        a.__gm.Jg.register(C);
        this.Eg = new hVa(a, C, NUa);
        _.qw(y.rr, (G) => {
          G &&
            !G.Ch.equals(p) &&
            ((p = G.Ch), (r = new _.UB(f, p)), u.set(r), d());
        });
      });
      _.eL(a, u, "mapPane", 0);
    }
    Gg() {
      let a = new _.ez();
      const b = this.rh;
      var c = this.map.__gm,
        d = c.get("baseMapType"),
        e = d && d.Tt;
      if (e && this.map.getClickableIcons() !== !1) {
        var f = c.get("zoom");
        if ((f = this.Fg.jA(f ? Math.round(f) : f))) {
          a.layerId = e.replace(/([mhr]@)\d+/, `$1${f}`);
          a.mapTypeId = d.mapTypeId;
          a.Eg = f;
          var g = (a.Fg = a.Fg || []);
          c.vk.get().forEach((h) => {
            g.push(h);
          });
          d = c.get("apistyle") || "";
          f = c.get("style") || [];
          e = _.ss;
          f = f.map(MUa).join(",");
          c = c.get("authUser");
          a.parameters.salt = e(`${d}+${f}${c}`);
          c = b.getAt(b.getLength() - 1);
          if (!c || c.toString() !== a.toString()) {
            c && (c.freeze = !0);
            c = b.getLength();
            for (d = 0; d < c; ++d)
              if (((e = b.getAt(d)), e.toString() === a.toString())) {
                b.removeAt(d);
                e.freeze = !1;
                a = e;
                break;
              }
            b.push(a);
          }
        }
      } else
        b.clear(),
          this.Eg && BUa(this.Eg),
          this.map.getClickableIcons() === !1 &&
            (_.Gn(this.map, "smd"), _.I(this.map, 148283));
    }
  };
  var jVa = class {
    YJ(a, b) {
      new iVa(a, b, a.__gm.Xg);
    }
    RH(a, b) {
      new hVa(a, b, null);
    }
  };
  _.dl("onion", new jVa());
});
