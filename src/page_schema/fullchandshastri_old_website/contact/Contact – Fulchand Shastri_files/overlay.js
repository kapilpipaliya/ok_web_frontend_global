google.maps.__gjsload__("overlay", (_) => {
  var lwa = () => {},
    hG = (a) => {
      a.oB = a.oB || new lwa();
      return a.oB;
    },
    mwa = function (a) {
      this.Eg = new _.bq(() => {
        const b = a.oB;
        if (a.getPanes()) {
          if (a.getProjection()) {
            if (!b.Gg && a.onAdd) a.onAdd();
            b.Gg = !0;
            a.draw();
          }
        } else {
          if (b.Gg)
            if (a.onRemove) a.onRemove();
            else a.remove();
          b.Gg = !1;
        }
      }, 0);
    },
    owa = (a, b) => {
      const c = hG(a);
      let d = c.Fg;
      d || (d = c.Fg = new mwa(a));
      _.Nb(c.Eg || [], _.Hm);
      var e = (c.Hg = c.Hg || new _.Jna());
      const f = b.__gm;
      e.bindTo("zoom", f);
      e.bindTo("offset", f);
      e.bindTo("center", f, "projectionCenterQ");
      e.bindTo("projection", b);
      e.bindTo("projectionTopLeft", f);
      e = c.Jg = c.Jg || new nwa(e);
      e.bindTo("zoom", f);
      e.bindTo("offset", f);
      e.bindTo("projection", b);
      e.bindTo("projectionTopLeft", f);
      a.bindTo("projection", e, "outProjection");
      a.bindTo("panes", f);
      e = () => _.cq(d.Eg);
      c.Eg = [
        _.Fm(a, "panes_changed", e),
        _.Fm(f, "zoom_changed", e),
        _.Fm(f, "offset_changed", e),
        _.Fm(b, "projection_changed", e),
        _.Fm(f, "projectioncenterq_changed", e),
      ];
      _.cq(d.Eg);
      b instanceof _.nn
        ? (_.Gn(b, "Ox"), _.I(b, 148440))
        : b instanceof _.go && (_.Gn(b, "Oxs"), _.I(b, 181451));
    },
    pwa = (a) => {
      const b = hG(a);
      var c = b.Hg;
      c && c.unbindAll();
      (c = b.Jg) && c.unbindAll();
      a.unbindAll();
      a.set("panes", null);
      a.set("projection", null);
      b.Eg &&
        b.Eg.forEach((d) => {
          _.Hm(d);
        });
      b.Eg = null;
      b.Fg && (_.dq(b.Fg.Eg), (b.Fg = null));
    },
    uwa = (a) => {
      if (a) {
        var b = a.getMap();
        if (qwa(a) !== b && b && b instanceof _.nn) {
          const c = b.__gm;
          c.overlayLayer
            ? (a.__gmop = new rwa(b, a, c.overlayLayer))
            : c.Fg.then(({ Zg: d }) => {
                const e = new swa(b, d);
                d.Ni(e);
                c.overlayLayer = e;
                twa(a);
                uwa(a);
              });
        }
      }
    },
    twa = (a) => {
      if (a) {
        var b = a.__gmop;
        b &&
          ((a.__gmop = null),
          b.overlay.unbindAll(),
          b.overlay.set("panes", null),
          b.overlay.set("projection", null),
          b.overlayLayer.Zn(b),
          b.Eg &&
            ((b.Eg = !1),
            b.overlay.onRemove ? b.overlay.onRemove() : b.overlay.remove()));
      }
    },
    qwa = (a) => (a = a.__gmop) ? a.map : null,
    vwa = (a, b) => {
      a.overlay.get("projection") !== b &&
        (a.overlay.bindTo("panes", a.map.__gm), a.overlay.set("projection", b));
    },
    nwa = class extends _.Xm {
      constructor(a) {
        super();
        this.projection = a;
      }
      changed(a) {
        a !== "outProjection" &&
          ((a = !!(
            this.get("offset") &&
            this.get("projectionTopLeft") &&
            this.get("projection") &&
            _.tl(this.get("zoom"))
          )),
          a === !this.get("outProjection") &&
            this.set("outProjection", a ? this.projection : null));
      }
    };
  _.Ka(mwa, _.Xm);
  var rwa = class {
      constructor(a, b, c) {
        this.map = a;
        this.overlay = b;
        this.overlayLayer = c;
        this.Eg = !1;
        _.Gn(this.map, "Ox");
        _.I(this.map, 148440);
        c.Bn(this);
      }
      draw() {
        this.Eg || ((this.Eg = !0), this.overlay.onAdd && this.overlay.onAdd());
        this.overlay.draw && this.overlay.draw();
      }
    },
    swa = class {
      constructor(a, b) {
        this.map = a;
        this.Zg = b;
        this.Eg = null;
        this.Fg = [];
      }
      dispose() {}
      Nh(a, b, c, d, e, f, g, h) {
        const l = (this.Eg = this.Eg || new _.EB(this.map, this.Zg, () => {}));
        l.Nh(a, b, c, d, e, f, g, h);
        for (const n of this.Fg) vwa(n, l), n.draw();
      }
      Bn(a) {
        this.Fg.push(a);
        this.Eg && vwa(a, this.Eg);
        this.Zg.refresh();
      }
      Zn(a) {
        _.Vb(this.Fg, a);
      }
    };
  _.dl("overlay", {
    hD: (a) => {
      if (a) {
        pwa(a);
        delete hG(a).Ig;
        twa(a);
        var b = a.getMap();
        b &&
          (b instanceof _.nn
            ? uwa(a)
            : a &&
              ((b = a.getMap()),
              (hG(a).Ig || null) !== b && (b && owa(a, b), (hG(a).Ig = b))));
      }
    },
    preventMapHitsFrom: (a) => {
      _.ry(a, {
        Vl: ({ event: b }) => {
          _.lx(b.Eg);
        },
        Ak: (b) => {
          _.cy(b);
        },
        Gq: (b) => {
          _.dy(b);
        },
        zl: (b) => {
          _.dy(b);
        },
        Lk: (b) => {
          _.ey(b);
        },
      }).Rq(!0);
    },
    preventMapHitsAndGesturesFrom: (a) => {
      a.addEventListener("click", _.Dm);
      a.addEventListener("contextmenu", _.Dm);
      a.addEventListener("dblclick", _.Dm);
      a.addEventListener("mousedown", _.Dm);
      a.addEventListener("mousemove", _.Dm);
      a.addEventListener("MSPointerDown", _.Dm);
      a.addEventListener("pointerdown", _.Dm);
      a.addEventListener("touchstart", _.Dm);
      a.addEventListener("wheel", _.Dm);
    },
  });
});
