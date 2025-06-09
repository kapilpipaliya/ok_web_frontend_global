google.maps.__gjsload__("geometry", (_) => {
  var Lna = (a, b) => Math.abs(_.rl(b - a, -180, 180)),
    Mna = (a, b, c, d, e) => {
      if (!d) {
        c = Lna(a.lng(), c) / Lna(a.lng(), b.lng());
        if (!e)
          return (
            (e = Math.sin(_.Hk(a.lat()))),
            (e = Math.log((1 + e) / (1 - e)) / 2),
            (b = Math.sin(_.Hk(b.lat()))),
            _.Ik(
              2 *
                Math.atan(
                  Math.exp(e + c * (Math.log((1 + b) / (1 - b)) / 2 - e)),
                ) -
                Math.PI / 2,
            )
          );
        a = e.fromLatLngToPoint(a);
        b = e.fromLatLngToPoint(b);
        return e
          .fromPointToLatLng(
            new _.On(a.x + c * (b.x - a.x), a.y + c * (b.y - a.y)),
          )
          .lat();
      }
      e = _.Hk(a.lat());
      a = _.Hk(a.lng());
      d = _.Hk(b.lat());
      b = _.Hk(b.lng());
      c = _.Hk(c);
      return _.rl(
        _.Ik(
          Math.atan2(
            Math.sin(e) * Math.cos(d) * Math.sin(c - b) -
              Math.sin(d) * Math.cos(e) * Math.sin(c - a),
            Math.cos(e) * Math.cos(d) * Math.sin(a - b),
          ),
        ),
        -90,
        90,
      );
    },
    Nna = (a, b) => {
      a = new _.om(a, !1);
      b = new _.om(b, !1);
      return a.equals(b);
    },
    Ona = (a, b, c) => {
      a = _.um(a);
      c = c || 1e-9;
      const d = _.rl(a.lng(), -180, 180),
        e = b instanceof _.Gu,
        f = !!b.get("geodesic"),
        g = b.get("latLngs");
      b = b.get("map");
      b = !f && b ? b.getProjection() : null;
      for (let r = 0, u = g.getLength(); r < u; ++r) {
        const w = g.getAt(r),
          x = w.getLength(),
          y = e ? x : x - 1;
        for (let C = 0; C < y; ++C) {
          var h = w.getAt(C);
          const G = w.getAt((C + 1) % x);
          if (Nna(h, a) || Nna(G, a)) return !0;
          var l = _.rl(h.lng(), -180, 180),
            n = _.rl(G.lng(), -180, 180);
          const L = Math.max(l, n),
            K = Math.min(l, n);
          if (
            (l =
              Math.abs(_.rl(l - n, -180, 180)) <= 1e-9 &&
              (Math.abs(_.rl(l - d, -180, 180)) <= c ||
                Math.abs(_.rl(n - d, -180, 180)) <= c))
          ) {
            l = a.lat();
            n = Math.min(h.lat(), G.lat()) - c;
            var p = Math.max(h.lat(), G.lat()) + c;
            l = l >= n && l <= p;
          }
          if (l) return !0;
          if (L - K > 180 ? d + c >= L || d - c <= K : d + c >= K && d - c <= L)
            if (((h = Mna(h, G, d, f, b)), Math.abs(h - a.lat()) < c))
              return !0;
        }
      }
      return !1;
    },
    Qna = (a, b) => {
      const c = [];
      let d = [0, 0],
        e;
      for (let f = 0, g = _.nl(a); f < g; ++f)
        (e = b ? b(a[f]) : [a[f].lat(), a[f].lng()]),
          Pna(e[0] - d[0], c),
          Pna(e[1] - d[1], c),
          (d = e);
      return c.join("");
    },
    Pna = (a, b) => {
      for (a = a < 0 ? ~(a << 1) : a << 1; a >= 32; )
        b.push(String.fromCharCode((32 | (a & 31)) + 63)), (a >>= 5);
      b.push(String.fromCharCode(a + 63));
    },
    LC = class {};
  LC.isLocationOnEdge = Ona;
  LC.containsLocation = (a, b) => {
    a = _.um(a);
    const c = _.rl(a.lng(), -180, 180),
      d = !!b.get("geodesic"),
      e = b.get("latLngs");
    var f = b.get("map");
    f = !d && f ? f.getProjection() : null;
    let g = !1;
    for (let l = 0, n = e.getLength(); l < n; ++l) {
      const p = e.getAt(l);
      for (let r = 0, u = p.getLength(); r < u; ++r) {
        const w = p.getAt(r),
          x = p.getAt((r + 1) % u);
        var h = _.rl(w.lng(), -180, 180);
        const y = _.rl(x.lng(), -180, 180),
          C = Math.max(h, y);
        h = Math.min(h, y);
        (C - h > 180 ? c >= C || c < h : c < C && c >= h) &&
          Mna(w, x, c, d, f) < a.lat() &&
          (g = !g);
      }
    }
    return g || Ona(a, b);
  };
  var MC = class {};
  MC.encodePath = (a) => {
    a instanceof _.Ao && (a = a.getArray());
    a = (0, _.pp)(a);
    return Qna(a, (b) => [Math.round(b.lat() * 1e5), Math.round(b.lng() * 1e5)]);
  };
  MC.decodePath = (a) => {
    const b = _.nl(a),
      c = Array(Math.floor(a.length / 2));
    let d = 0,
      e = 0,
      f = 0,
      g;
    for (g = 0; d < b; ++g) {
      let h = 1,
        l = 0,
        n;
      do (n = a.charCodeAt(d++) - 63 - 1), (h += n << l), (l += 5);
      while (n >= 31);
      e += h & 1 ? ~(h >> 1) : h >> 1;
      h = 1;
      l = 0;
      do (n = a.charCodeAt(d++) - 63 - 1), (h += n << l), (l += 5);
      while (n >= 31);
      f += h & 1 ? ~(h >> 1) : h >> 1;
      c[g] = new _.om(e * 1e-5, f * 1e-5, !0);
    }
    c.length = g;
    return c;
  };
  var Rna = { encoding: MC, spherical: _.su, poly: LC };
  _.ta.google.maps.geometry = Rna;
  _.dl("geometry", Rna);
});
