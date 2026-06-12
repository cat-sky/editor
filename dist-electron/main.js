var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promises } from "node:fs";
var LIB;
(() => {
  var t = { 975: (t2) => {
    function e2(t3) {
      if ("string" != typeof t3) throw new TypeError("Path must be a string. Received " + JSON.stringify(t3));
    }
    function r2(t3, e3) {
      for (var r3, n3 = "", i2 = 0, o2 = -1, s2 = 0, h2 = 0; h2 <= t3.length; ++h2) {
        if (h2 < t3.length) r3 = t3.charCodeAt(h2);
        else {
          if (47 === r3) break;
          r3 = 47;
        }
        if (47 === r3) {
          if (o2 === h2 - 1 || 1 === s2) ;
          else if (o2 !== h2 - 1 && 2 === s2) {
            if (n3.length < 2 || 2 !== i2 || 46 !== n3.charCodeAt(n3.length - 1) || 46 !== n3.charCodeAt(n3.length - 2)) {
              if (n3.length > 2) {
                var a2 = n3.lastIndexOf("/");
                if (a2 !== n3.length - 1) {
                  -1 === a2 ? (n3 = "", i2 = 0) : i2 = (n3 = n3.slice(0, a2)).length - 1 - n3.lastIndexOf("/"), o2 = h2, s2 = 0;
                  continue;
                }
              } else if (2 === n3.length || 1 === n3.length) {
                n3 = "", i2 = 0, o2 = h2, s2 = 0;
                continue;
              }
            }
            e3 && (n3.length > 0 ? n3 += "/.." : n3 = "..", i2 = 2);
          } else n3.length > 0 ? n3 += "/" + t3.slice(o2 + 1, h2) : n3 = t3.slice(o2 + 1, h2), i2 = h2 - o2 - 1;
          o2 = h2, s2 = 0;
        } else 46 === r3 && -1 !== s2 ? ++s2 : s2 = -1;
      }
      return n3;
    }
    var n2 = { resolve: function() {
      for (var t3, n3 = "", i2 = false, o2 = arguments.length - 1; o2 >= -1 && !i2; o2--) {
        var s2;
        o2 >= 0 ? s2 = arguments[o2] : (void 0 === t3 && (t3 = process.cwd()), s2 = t3), e2(s2), 0 !== s2.length && (n3 = s2 + "/" + n3, i2 = 47 === s2.charCodeAt(0));
      }
      return n3 = r2(n3, !i2), i2 ? n3.length > 0 ? "/" + n3 : "/" : n3.length > 0 ? n3 : ".";
    }, normalize: function(t3) {
      if (e2(t3), 0 === t3.length) return ".";
      var n3 = 47 === t3.charCodeAt(0), i2 = 47 === t3.charCodeAt(t3.length - 1);
      return 0 !== (t3 = r2(t3, !n3)).length || n3 || (t3 = "."), t3.length > 0 && i2 && (t3 += "/"), n3 ? "/" + t3 : t3;
    }, isAbsolute: function(t3) {
      return e2(t3), t3.length > 0 && 47 === t3.charCodeAt(0);
    }, join: function() {
      if (0 === arguments.length) return ".";
      for (var t3, r3 = 0; r3 < arguments.length; ++r3) {
        var i2 = arguments[r3];
        e2(i2), i2.length > 0 && (void 0 === t3 ? t3 = i2 : t3 += "/" + i2);
      }
      return void 0 === t3 ? "." : n2.normalize(t3);
    }, relative: function(t3, r3) {
      if (e2(t3), e2(r3), t3 === r3) return "";
      if ((t3 = n2.resolve(t3)) === (r3 = n2.resolve(r3))) return "";
      for (var i2 = 1; i2 < t3.length && 47 === t3.charCodeAt(i2); ++i2) ;
      for (var o2 = t3.length, s2 = o2 - i2, h2 = 1; h2 < r3.length && 47 === r3.charCodeAt(h2); ++h2) ;
      for (var a2 = r3.length - h2, c2 = s2 < a2 ? s2 : a2, f2 = -1, u2 = 0; u2 <= c2; ++u2) {
        if (u2 === c2) {
          if (a2 > c2) {
            if (47 === r3.charCodeAt(h2 + u2)) return r3.slice(h2 + u2 + 1);
            if (0 === u2) return r3.slice(h2 + u2);
          } else s2 > c2 && (47 === t3.charCodeAt(i2 + u2) ? f2 = u2 : 0 === u2 && (f2 = 0));
          break;
        }
        var l2 = t3.charCodeAt(i2 + u2);
        if (l2 !== r3.charCodeAt(h2 + u2)) break;
        47 === l2 && (f2 = u2);
      }
      var g2 = "";
      for (u2 = i2 + f2 + 1; u2 <= o2; ++u2) u2 !== o2 && 47 !== t3.charCodeAt(u2) || (0 === g2.length ? g2 += ".." : g2 += "/..");
      return g2.length > 0 ? g2 + r3.slice(h2 + f2) : (h2 += f2, 47 === r3.charCodeAt(h2) && ++h2, r3.slice(h2));
    }, _makeLong: function(t3) {
      return t3;
    }, dirname: function(t3) {
      if (e2(t3), 0 === t3.length) return ".";
      for (var r3 = t3.charCodeAt(0), n3 = 47 === r3, i2 = -1, o2 = true, s2 = t3.length - 1; s2 >= 1; --s2) if (47 === (r3 = t3.charCodeAt(s2))) {
        if (!o2) {
          i2 = s2;
          break;
        }
      } else o2 = false;
      return -1 === i2 ? n3 ? "/" : "." : n3 && 1 === i2 ? "//" : t3.slice(0, i2);
    }, basename: function(t3, r3) {
      if (void 0 !== r3 && "string" != typeof r3) throw new TypeError('"ext" argument must be a string');
      e2(t3);
      var n3, i2 = 0, o2 = -1, s2 = true;
      if (void 0 !== r3 && r3.length > 0 && r3.length <= t3.length) {
        if (r3.length === t3.length && r3 === t3) return "";
        var h2 = r3.length - 1, a2 = -1;
        for (n3 = t3.length - 1; n3 >= 0; --n3) {
          var c2 = t3.charCodeAt(n3);
          if (47 === c2) {
            if (!s2) {
              i2 = n3 + 1;
              break;
            }
          } else -1 === a2 && (s2 = false, a2 = n3 + 1), h2 >= 0 && (c2 === r3.charCodeAt(h2) ? -1 == --h2 && (o2 = n3) : (h2 = -1, o2 = a2));
        }
        return i2 === o2 ? o2 = a2 : -1 === o2 && (o2 = t3.length), t3.slice(i2, o2);
      }
      for (n3 = t3.length - 1; n3 >= 0; --n3) if (47 === t3.charCodeAt(n3)) {
        if (!s2) {
          i2 = n3 + 1;
          break;
        }
      } else -1 === o2 && (s2 = false, o2 = n3 + 1);
      return -1 === o2 ? "" : t3.slice(i2, o2);
    }, extname: function(t3) {
      e2(t3);
      for (var r3 = -1, n3 = 0, i2 = -1, o2 = true, s2 = 0, h2 = t3.length - 1; h2 >= 0; --h2) {
        var a2 = t3.charCodeAt(h2);
        if (47 !== a2) -1 === i2 && (o2 = false, i2 = h2 + 1), 46 === a2 ? -1 === r3 ? r3 = h2 : 1 !== s2 && (s2 = 1) : -1 !== r3 && (s2 = -1);
        else if (!o2) {
          n3 = h2 + 1;
          break;
        }
      }
      return -1 === r3 || -1 === i2 || 0 === s2 || 1 === s2 && r3 === i2 - 1 && r3 === n3 + 1 ? "" : t3.slice(r3, i2);
    }, format: function(t3) {
      if (null === t3 || "object" != typeof t3) throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof t3);
      return function(t4, e3) {
        var r3 = e3.dir || e3.root, n3 = e3.base || (e3.name || "") + (e3.ext || "");
        return r3 ? r3 === e3.root ? r3 + n3 : r3 + "/" + n3 : n3;
      }(0, t3);
    }, parse: function(t3) {
      e2(t3);
      var r3 = { root: "", dir: "", base: "", ext: "", name: "" };
      if (0 === t3.length) return r3;
      var n3, i2 = t3.charCodeAt(0), o2 = 47 === i2;
      o2 ? (r3.root = "/", n3 = 1) : n3 = 0;
      for (var s2 = -1, h2 = 0, a2 = -1, c2 = true, f2 = t3.length - 1, u2 = 0; f2 >= n3; --f2) if (47 !== (i2 = t3.charCodeAt(f2))) -1 === a2 && (c2 = false, a2 = f2 + 1), 46 === i2 ? -1 === s2 ? s2 = f2 : 1 !== u2 && (u2 = 1) : -1 !== s2 && (u2 = -1);
      else if (!c2) {
        h2 = f2 + 1;
        break;
      }
      return -1 === s2 || -1 === a2 || 0 === u2 || 1 === u2 && s2 === a2 - 1 && s2 === h2 + 1 ? -1 !== a2 && (r3.base = r3.name = 0 === h2 && o2 ? t3.slice(1, a2) : t3.slice(h2, a2)) : (0 === h2 && o2 ? (r3.name = t3.slice(1, s2), r3.base = t3.slice(1, a2)) : (r3.name = t3.slice(h2, s2), r3.base = t3.slice(h2, a2)), r3.ext = t3.slice(s2, a2)), h2 > 0 ? r3.dir = t3.slice(0, h2 - 1) : o2 && (r3.dir = "/"), r3;
    }, sep: "/", delimiter: ":", win32: null, posix: null };
    n2.posix = n2, t2.exports = n2;
  } }, e = {};
  function r(n2) {
    var i2 = e[n2];
    if (void 0 !== i2) return i2.exports;
    var o2 = e[n2] = { exports: {} };
    return t[n2](o2, o2.exports, r), o2.exports;
  }
  r.d = (t2, e2) => {
    for (var n2 in e2) r.o(e2, n2) && !r.o(t2, n2) && Object.defineProperty(t2, n2, { enumerable: true, get: e2[n2] });
  }, r.o = (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2), r.r = (t2) => {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t2, "__esModule", { value: true });
  };
  var n = {};
  let i;
  if (r.r(n), r.d(n, { URI: () => l, Utils: () => I }), "object" == typeof process) i = "win32" === process.platform;
  else if ("object" == typeof navigator) {
    let t2 = navigator.userAgent;
    i = t2.indexOf("Windows") >= 0;
  }
  const o = /^\w[\w\d+.-]*$/, s = /^\//, h = /^\/\//;
  function a(t2, e2) {
    if (!t2.scheme && e2) throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${t2.authority}", path: "${t2.path}", query: "${t2.query}", fragment: "${t2.fragment}"}`);
    if (t2.scheme && !o.test(t2.scheme)) throw new Error("[UriError]: Scheme contains illegal characters.");
    if (t2.path) {
      if (t2.authority) {
        if (!s.test(t2.path)) throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
      } else if (h.test(t2.path)) throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
    }
  }
  const c = "", f = "/", u = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  class l {
    constructor(t2, e2, r2, n2, i2, o2 = false) {
      __publicField(this, "scheme");
      __publicField(this, "authority");
      __publicField(this, "path");
      __publicField(this, "query");
      __publicField(this, "fragment");
      "object" == typeof t2 ? (this.scheme = t2.scheme || c, this.authority = t2.authority || c, this.path = t2.path || c, this.query = t2.query || c, this.fragment = t2.fragment || c) : (this.scheme = /* @__PURE__ */ function(t3, e3) {
        return t3 || e3 ? t3 : "file";
      }(t2, o2), this.authority = e2 || c, this.path = function(t3, e3) {
        switch (t3) {
          case "https":
          case "http":
          case "file":
            e3 ? e3[0] !== f && (e3 = f + e3) : e3 = f;
        }
        return e3;
      }(this.scheme, r2 || c), this.query = n2 || c, this.fragment = i2 || c, a(this, o2));
    }
    static isUri(t2) {
      return t2 instanceof l || !!t2 && "string" == typeof t2.authority && "string" == typeof t2.fragment && "string" == typeof t2.path && "string" == typeof t2.query && "string" == typeof t2.scheme && "string" == typeof t2.fsPath && "function" == typeof t2.with && "function" == typeof t2.toString;
    }
    get fsPath() {
      return v(this);
    }
    with(t2) {
      if (!t2) return this;
      let { scheme: e2, authority: r2, path: n2, query: i2, fragment: o2 } = t2;
      return void 0 === e2 ? e2 = this.scheme : null === e2 && (e2 = c), void 0 === r2 ? r2 = this.authority : null === r2 && (r2 = c), void 0 === n2 ? n2 = this.path : null === n2 && (n2 = c), void 0 === i2 ? i2 = this.query : null === i2 && (i2 = c), void 0 === o2 ? o2 = this.fragment : null === o2 && (o2 = c), e2 === this.scheme && r2 === this.authority && n2 === this.path && i2 === this.query && o2 === this.fragment ? this : new d(e2, r2, n2, i2, o2);
    }
    static parse(t2, e2 = false) {
      const r2 = u.exec(t2);
      return r2 ? new d(r2[2] || c, w(r2[4] || c), w(r2[5] || c), w(r2[7] || c), w(r2[9] || c), e2) : new d(c, c, c, c, c);
    }
    static file(t2) {
      let e2 = c;
      if (i && (t2 = t2.replace(/\\/g, f)), t2[0] === f && t2[1] === f) {
        const r2 = t2.indexOf(f, 2);
        -1 === r2 ? (e2 = t2.substring(2), t2 = f) : (e2 = t2.substring(2, r2), t2 = t2.substring(r2) || f);
      }
      return new d("file", e2, t2, c, c);
    }
    static from(t2) {
      const e2 = new d(t2.scheme, t2.authority, t2.path, t2.query, t2.fragment);
      return a(e2, true), e2;
    }
    toString(t2 = false) {
      return b(this, t2);
    }
    toJSON() {
      return this;
    }
    static revive(t2) {
      if (t2) {
        if (t2 instanceof l) return t2;
        {
          const e2 = new d(t2);
          return e2._formatted = t2.external, e2._fsPath = t2._sep === g ? t2.fsPath : null, e2;
        }
      }
      return t2;
    }
  }
  const g = i ? 1 : void 0;
  class d extends l {
    constructor() {
      super(...arguments);
      __publicField(this, "_formatted", null);
      __publicField(this, "_fsPath", null);
    }
    get fsPath() {
      return this._fsPath || (this._fsPath = v(this)), this._fsPath;
    }
    toString(t2 = false) {
      return t2 ? b(this, true) : (this._formatted || (this._formatted = b(this, false)), this._formatted);
    }
    toJSON() {
      const t2 = { $mid: 1 };
      return this._fsPath && (t2.fsPath = this._fsPath, t2._sep = g), this._formatted && (t2.external = this._formatted), this.path && (t2.path = this.path), this.scheme && (t2.scheme = this.scheme), this.authority && (t2.authority = this.authority), this.query && (t2.query = this.query), this.fragment && (t2.fragment = this.fragment), t2;
    }
  }
  const p = { 58: "%3A", 47: "%2F", 63: "%3F", 35: "%23", 91: "%5B", 93: "%5D", 64: "%40", 33: "%21", 36: "%24", 38: "%26", 39: "%27", 40: "%28", 41: "%29", 42: "%2A", 43: "%2B", 44: "%2C", 59: "%3B", 61: "%3D", 32: "%20" };
  function m(t2, e2, r2) {
    let n2, i2 = -1;
    for (let o2 = 0; o2 < t2.length; o2++) {
      const s2 = t2.charCodeAt(o2);
      if (s2 >= 97 && s2 <= 122 || s2 >= 65 && s2 <= 90 || s2 >= 48 && s2 <= 57 || 45 === s2 || 46 === s2 || 95 === s2 || 126 === s2 || e2 && 47 === s2 || r2 && 91 === s2 || r2 && 93 === s2 || r2 && 58 === s2) -1 !== i2 && (n2 += encodeURIComponent(t2.substring(i2, o2)), i2 = -1), void 0 !== n2 && (n2 += t2.charAt(o2));
      else {
        void 0 === n2 && (n2 = t2.substr(0, o2));
        const e3 = p[s2];
        void 0 !== e3 ? (-1 !== i2 && (n2 += encodeURIComponent(t2.substring(i2, o2)), i2 = -1), n2 += e3) : -1 === i2 && (i2 = o2);
      }
    }
    return -1 !== i2 && (n2 += encodeURIComponent(t2.substring(i2))), void 0 !== n2 ? n2 : t2;
  }
  function y(t2) {
    let e2;
    for (let r2 = 0; r2 < t2.length; r2++) {
      const n2 = t2.charCodeAt(r2);
      35 === n2 || 63 === n2 ? (void 0 === e2 && (e2 = t2.substr(0, r2)), e2 += p[n2]) : void 0 !== e2 && (e2 += t2[r2]);
    }
    return void 0 !== e2 ? e2 : t2;
  }
  function v(t2, e2) {
    let r2;
    return r2 = t2.authority && t2.path.length > 1 && "file" === t2.scheme ? `//${t2.authority}${t2.path}` : 47 === t2.path.charCodeAt(0) && (t2.path.charCodeAt(1) >= 65 && t2.path.charCodeAt(1) <= 90 || t2.path.charCodeAt(1) >= 97 && t2.path.charCodeAt(1) <= 122) && 58 === t2.path.charCodeAt(2) ? t2.path[1].toLowerCase() + t2.path.substr(2) : t2.path, i && (r2 = r2.replace(/\//g, "\\")), r2;
  }
  function b(t2, e2) {
    const r2 = e2 ? y : m;
    let n2 = "", { scheme: i2, authority: o2, path: s2, query: h2, fragment: a2 } = t2;
    if (i2 && (n2 += i2, n2 += ":"), (o2 || "file" === i2) && (n2 += f, n2 += f), o2) {
      let t3 = o2.indexOf("@");
      if (-1 !== t3) {
        const e3 = o2.substr(0, t3);
        o2 = o2.substr(t3 + 1), t3 = e3.lastIndexOf(":"), -1 === t3 ? n2 += r2(e3, false, false) : (n2 += r2(e3.substr(0, t3), false, false), n2 += ":", n2 += r2(e3.substr(t3 + 1), false, true)), n2 += "@";
      }
      o2 = o2.toLowerCase(), t3 = o2.lastIndexOf(":"), -1 === t3 ? n2 += r2(o2, false, true) : (n2 += r2(o2.substr(0, t3), false, true), n2 += o2.substr(t3));
    }
    if (s2) {
      if (s2.length >= 3 && 47 === s2.charCodeAt(0) && 58 === s2.charCodeAt(2)) {
        const t3 = s2.charCodeAt(1);
        t3 >= 65 && t3 <= 90 && (s2 = `/${String.fromCharCode(t3 + 32)}:${s2.substr(3)}`);
      } else if (s2.length >= 2 && 58 === s2.charCodeAt(1)) {
        const t3 = s2.charCodeAt(0);
        t3 >= 65 && t3 <= 90 && (s2 = `${String.fromCharCode(t3 + 32)}:${s2.substr(2)}`);
      }
      n2 += r2(s2, true, false);
    }
    return h2 && (n2 += "?", n2 += r2(h2, false, false)), a2 && (n2 += "#", n2 += e2 ? a2 : m(a2, false, false)), n2;
  }
  function C(t2) {
    try {
      return decodeURIComponent(t2);
    } catch {
      return t2.length > 3 ? t2.substr(0, 3) + C(t2.substr(3)) : t2;
    }
  }
  const A = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
  function w(t2) {
    return t2.match(A) ? t2.replace(A, (t3) => C(t3)) : t2;
  }
  var x = r(975);
  const P = x.posix || x, _ = "/";
  var I;
  !function(t2) {
    t2.joinPath = function(t3, ...e2) {
      return t3.with({ path: P.join(t3.path, ...e2) });
    }, t2.resolvePath = function(t3, ...e2) {
      let r2 = t3.path, n2 = false;
      r2[0] !== _ && (r2 = _ + r2, n2 = true);
      let i2 = P.resolve(r2, ...e2);
      return n2 && i2[0] === _ && !t3.authority && (i2 = i2.substring(1)), t3.with({ path: i2 });
    }, t2.dirname = function(t3) {
      if (0 === t3.path.length || t3.path === _) return t3;
      let e2 = P.dirname(t3.path);
      return 1 === e2.length && 46 === e2.charCodeAt(0) && (e2 = ""), t3.with({ path: e2 });
    }, t2.basename = function(t3) {
      return P.basename(t3.path);
    }, t2.extname = function(t3) {
      return P.extname(t3.path);
    };
  }(I || (I = {})), LIB = n;
})();
const { URI, Utils } = LIB;
const IPC_CHANNELS = {
  /** 文件系统操作通道 */
  FILE_SYSTEM: {
    STAT: "fs:stat",
    EXISTS: "fs:exists",
    READ_FILE: "fs:readFile",
    READ_FILE_STRING: "fs:readFileString",
    WRITE_FILE: "fs:writeFile",
    READ_DIRECTORY: "fs:readDirectory",
    CREATE_DIRECTORY: "fs:createDirectory",
    DELETE: "fs:delete",
    RENAME: "fs:rename",
    COPY: "fs:copy"
  }
};
var FileType = /* @__PURE__ */ ((FileType2) => {
  FileType2[FileType2["Unknown"] = 0] = "Unknown";
  FileType2[FileType2["File"] = 1] = "File";
  FileType2[FileType2["Directory"] = 2] = "Directory";
  FileType2[FileType2["SymbolicLink"] = 64] = "SymbolicLink";
  return FileType2;
})(FileType || {});
function uriToPath(uri) {
  return URI.parse(uri).fsPath;
}
function mapFileType(stats) {
  if (stats.isSymbolicLink()) return FileType.SymbolicLink;
  if (stats.isDirectory()) return FileType.Directory;
  if (stats.isFile()) return FileType.File;
  return FileType.Unknown;
}
function statsToResponse(uri, stats) {
  return {
    uri,
    type: mapFileType(stats),
    size: stats.size,
    ctime: stats.ctimeMs,
    mtime: stats.mtimeMs
  };
}
const handleStat = async (_event, request) => {
  const stats = await promises.stat(uriToPath(request.uri));
  return statsToResponse(request.uri, stats);
};
const handleExists = async (_event, request) => {
  try {
    await promises.access(uriToPath(request.uri));
    return true;
  } catch {
    return false;
  }
};
const handleReadFile = async (_event, request) => {
  const buffer = await promises.readFile(uriToPath(request.uri));
  return buffer.toString("base64");
};
const handleReadFileString = async (_event, request) => {
  const buffer = await promises.readFile(uriToPath(request.uri));
  return buffer.toString("utf-8");
};
const handleWriteFile = async (_event, request) => {
  const filePath = uriToPath(request.uri);
  await promises.mkdir(path.dirname(filePath), { recursive: true });
  if (request.isBinary) {
    const buffer = Buffer.from(request.content, "base64");
    await promises.writeFile(filePath, buffer);
  } else {
    await promises.writeFile(filePath, request.content, "utf-8");
  }
};
const handleReadDirectory = async (_event, request) => {
  const dirPath = uriToPath(request.uri);
  const names = await promises.readdir(dirPath);
  const entries = [];
  for (const name of names) {
    try {
      const childPath = path.join(dirPath, name);
      const stats = await promises.stat(childPath);
      entries.push({ name, type: mapFileType(stats) });
    } catch {
      entries.push({ name, type: FileType.Unknown });
    }
  }
  return entries;
};
const handleCreateDirectory = async (_event, request) => {
  await promises.mkdir(uriToPath(request.uri), { recursive: true });
};
const handleDelete = async (_event, request, options) => {
  await promises.rm(uriToPath(request.uri), { recursive: (options == null ? void 0 : options.recursive) ?? false, force: true });
};
const handleRename = async (_event, request, options) => {
  const sourcePath = uriToPath(request.source);
  const targetPath = uriToPath(request.target);
  if (options == null ? void 0 : options.overwrite) {
    try {
      await promises.rename(sourcePath, targetPath);
    } catch (err) {
      if (err.code === "EEXIST") {
        await promises.rm(targetPath, { force: true });
        await promises.rename(sourcePath, targetPath);
      } else {
        throw err;
      }
    }
  } else {
    await promises.rename(sourcePath, targetPath);
  }
};
const handleCopy = async (_event, request, options) => {
  await promises.cp(uriToPath(request.source), uriToPath(request.target), {
    recursive: true,
    force: (options == null ? void 0 : options.overwrite) ?? false,
    errorOnExist: !(options == null ? void 0 : options.overwrite)
  });
};
function registerFileSystemHandlers() {
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.STAT, handleStat);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.EXISTS, handleExists);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_FILE, handleReadFile);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_FILE_STRING, handleReadFileString);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.WRITE_FILE, handleWriteFile);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_DIRECTORY, handleReadDirectory);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.CREATE_DIRECTORY, handleCreateDirectory);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.DELETE, handleDelete);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.RENAME, handleRename);
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.COPY, handleCopy);
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  registerFileSystemHandlers();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
