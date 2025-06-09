google.maps.__gjsload__("search_impl", (_) => {
  var twb = (a, b) => {
      _.ag(a, 1, b);
    },
    uwb = (a, b) => {
      _.ag(a, 3, b);
    },
    wwb = (a) => {
      if (_.sq[15]) {
        var b = a.Hg;
        const c = (a.Hg = a.getMap());
        b &&
          a.Eg &&
          (a.Gg
            ? ((b = b.__gm.vk), b.set(b.get().ao(a.Eg)))
            : a.Eg &&
              _.lUa(a.Eg, b) &&
              ((a.Fg || []).forEach(_.Hm), (a.Fg = null)));
        if (c) {
          b = new _.ez();
          const d = a.get("layerId").split("|");
          b.layerId = d[0];
          for (let e = 1; e < d.length; ++e) {
            const [f, ...g] = d[e].split(":");
            b.parameters[f] = g.join(":");
          }
          a.get("spotlightDescription") &&
            (b.spotlightDescription = new _.wy(a.get("spotlightDescription")));
          a.get("paintExperimentIds") &&
            (b.paintExperimentIds = a.get("paintExperimentIds").slice(0));
          a.get("styler") && (b.styler = new _.sy(a.get("styler")));
          a.get("roadmapStyler") &&
            (b.roadmapStyler = new _.sy(a.get("roadmapStyler")));
          a.get("travelMapRequest") &&
            (b.travelMapRequest = new _.bB(a.get("travelMapRequest")));
          a.get("mapsApiLayer") &&
            (b.mapsApiLayer = new _.xy(a.get("mapsApiLayer")));
          a.get("mapFeatures") && (b.mapFeatures = a.get("mapFeatures"));
          a.get("clickableCities") &&
            (b.clickableCities = a.get("clickableCities"));
          a.get("searchPipeMetadata") &&
            (b.searchPipeMetadata = new _.JA(a.get("searchPipeMetadata")));
          a.get("gmmContextPipeMetadata") &&
            (b.gmmContextPipeMetadata = new _.NA(
              a.get("gmmContextPipeMetadata"),
            ));
          a.get("overlayLayer") &&
            (b.overlayLayer = new _.yy(a.get("overlayLayer")));
          a.get("caseExperimentIds") &&
            (b.caseExperimentIds = a.get("caseExperimentIds").slice(0));
          a.get("boostMapExperimentIds") &&
            (b.boostMapExperimentIds = a.get("boostMapExperimentIds").slice(0));
          a.get("airQualityPipeMetadata") &&
            (b.airQualityPipeMetadata = new _.aB(
              a.get("airQualityPipeMetadata"),
            ));
          a.get("directionsPipeParameters") &&
            (b.directionsPipeParameters = new _.$A(
              a.get("directionsPipeParameters"),
            ));
          a.get("clientSignalPipeMetadata") &&
            (b.clientSignalPipeMetadata = new _.nA(
              a.get("clientSignalPipeMetadata"),
            ));
          b.darkLaunch = !!a.get("darkLaunch");
          a.Eg = b;
          a.Gg = a.get("renderOnBaseMap");
          a.Gg ? ((a = c.__gm.vk), a.set(_.xw(a.get(), b))) : vwb(a, c, b);
          _.Gn(c, "Lg");
          _.I(c, 148282);
        }
      }
    },
    vwb = (a, b, c) => {
      var d = new xwb();
      d = _.SJ(d);
      c.Gg = d.load.bind(d);
      c.clickable = a.get("clickable") !== !1;
      _.KTa(c, _.JR(b));
      b = [];
      b.push(_.Fm(c, "click", ywb.bind(null, a)));
      for (const e of ["mouseover", "mouseout", "mousemove"])
        b.push(_.Fm(c, e, zwb.bind(null, a, e)));
      b.push(
        _.Fm(a, "clickable_changed", () => {
          a.Eg.clickable = a.get("clickable") !== !1;
        }),
      );
      a.Fg = b;
    },
    ywb = (a, b, c, d, e) => {
      let f = null;
      if (e && ((f = { status: e.getStatus() }), e.getStatus() === 0)) {
        f.location = _.hv(e, _.kA, 2)
          ? new _.om(_.Nx(_.Z(e, _.kA, 2)), _.Px(_.Z(e, _.kA, 2)))
          : null;
        const g = {};
        f.fields = g;
        const h = _.qv(e, _.QR, 3);
        for (let l = 0; l < h; ++l) {
          const n = _.pv(e, 3, _.QR, l);
          g[n.getKey()] = n.getValue();
        }
      }
      _.O(a, "click", b, c, d, f);
    },
    zwb = (a, b, c, d, e, f, g) => {
      let h = null;
      f && (h = { title: f[1].title, snippet: f[1].snippet });
      _.O(a, b, c, d, e, h, g);
    },
    Awb = class extends _.H {
      constructor(a) {
        super(a);
      }
      Oj() {
        return _.F(this, 2);
      }
    },
    Bwb = _.eh(Awb, [0, _.T, -2, _.U, _.aVa]),
    Cwb = class extends _.H {
      constructor(a) {
        super(a);
      }
      getStatus() {
        return _.Qf(this, 1, -1);
      }
      getLocation() {
        return _.Ef(this, _.kA, 2);
      }
    },
    Dwb = class {};
  var xwb = class {
    constructor() {
      var a = _.ss,
        b = _.rs;
      this.Eg = _.uk;
      this.fetch = _.zz.bind(
        Dwb,
        a,
        _.AB + "/maps/api/js/LayersService.GetFeature",
        b,
      );
    }
    load(a, b) {
      function c(e) {
        b(new Cwb(e && e));
      }
      const d = new Awb();
      twb(d, a.layerId.split("|")[0]);
      _.ag(d, 2, a.featureId);
      uwb(d, this.Eg.Eg().Eg());
      for (const e in a.parameters) {
        const f = _.Lf(d, 4, _.QR);
        _.ag(f, 1, e);
        _.ag(f, 2, a.parameters[e]);
      }
      a = _.sr(d, Bwb());
      this.fetch(a, c, c);
      return a;
    }
    cancel() {
      throw Error("Not implemented");
    }
  };
  _.dl(
    "search_impl",
    new (class {
      constructor() {
        this.Eg = wwb;
      }
    })(),
  );
});
