/* Tema claro/oscuro. Portable: no depende de nada más.
   Cárgalo en el <head>, sin defer, para que el tema quede fijado antes del primer pintado.
   Por defecto sigue al sistema; la elección manual se guarda y pone data-theme="light|dark" en <html>.
   API: Theme.mode() -> "auto" | "light" | "dark";  Theme.isDark();  Theme.set(modo);
        Theme.cycle() pasa auto -> claro -> oscuro -> auto;  Theme.onChange(fn(modo, esOscuro)). */
(function () {
  "use strict";
  var KEY = "taridepaco-theme", root = document.documentElement, subs = [];
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var mode = "auto";
  try { var v = localStorage.getItem(KEY); if (v === "light" || v === "dark") mode = v; } catch (e) { /* sin almacenamiento */ }

  function apply() { if (mode === "auto") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", mode); }
  function isDark() { return mode === "auto" ? !!(mq && mq.matches) : mode === "dark"; }
  function emit() { subs.forEach(function (f) { f(mode, isDark()); }); }
  function set(m) {
    mode = (m === "light" || m === "dark") ? m : "auto";
    try { if (mode === "auto") localStorage.removeItem(KEY); else localStorage.setItem(KEY, mode); } catch (e) { /* sin almacenamiento */ }
    apply(); emit();
  }
  apply();
  if (mq) { if (mq.addEventListener) mq.addEventListener("change", emit); else if (mq.addListener) mq.addListener(emit); }

  window.Theme = {
    mode: function () { return mode; },
    isDark: isDark,
    set: set,
    cycle: function () { set(mode === "auto" ? "light" : mode === "light" ? "dark" : "auto"); },
    onChange: function (f) { subs.push(f); }
  };
})();
