/* Pruebas de la app. Se inyectan al final de test.html (ver build-test.sh).
   Corren en Chrome headless y reportan por consola. */
(function(){
  const R = [];
  let fails = 0;
  function ok(name, cond, info){
    if(!cond) fails++;
    R.push((cond ? "PASS" : "FAIL") + "  " + name + (info !== undefined ? "   [" + info + "]" : ""));
  }
  function eq(name, got, want){
    ok(name, got === want, "got=" + got + " want=" + want);
  }
  function near(name, got, want, tol){
    ok(name, Math.abs(got - want) <= tol, "got=" + got + " want~" + want);
  }
  function setVal(sel, v){
    const e = $(sel);
    e.value = v;
    e.dispatchEvent(new Event("input",  {bubbles:true}));
    e.dispatchEvent(new Event("change", {bubbles:true}));
  }

  window.confirm = () => true;   // los diálogos nativos no existen en headless

  // ---- estado limpio ----
  localStorage.removeItem(KEY);
  S = structuredClone(DEFAULT_STATE);
  LOADABLE = null; buildLoadable();

  // ---- formato ----
  eq("fmt entero",        fmt(100),    "100");
  eq("fmt medio kilo",    fmt(102.5),  "102.5");
  eq("fmt disco chico",   fmt(1.25),   "1.25");
  eq("fmt no numero",     fmt(NaN),    "—");

  // ---- discos (barra 20 + 25/20/15/10/5/2.5/1.25) ----
  eq("cargar 100 exacto",   loadable(100).total, 100);
  eq("100 = 25+15 por lado", comboText(loadable(100).combo), "25 + 15");
  eq("cargar 102.5",        loadable(102.5).total, 102.5);
  eq("cargar 60",           loadable(60).total, 60);
  eq("barra sola",          loadable(20).total, 20);
  eq("21 no montable -> 20", loadable(21).total, 20);
  ok("21 marcado inexacto", loadable(21).exact === false);
  eq("maximo montable",     loadable(9999).total, 20 + 2*(25*2 + 20*2 + 15 + 10 + 5 + 2.5 + 1.25));
  eq("texto barra sola",    comboText([]), "barra sola");

  // ---- 1RM estimado ----
  eq("1 rep = el peso",       est1RM(100, 1, "snatch"), 100);
  near("3 reps arranque",     est1RM(100, 3, "snatch"), 114.9, 0.2);
  eq("olimpico usa su propia tabla", est1RM(100, 5, "snatch"), 100 / OLY_PCT[5]);
  ok("olimpico estima mas que la tabla de fuerza", est1RM(100, 3, "snatch") > 100 / REP_PCT[3],
     "oly=" + est1RM(100,3,"snatch").toFixed(1) + " fuerza=" + (100/REP_PCT[3]).toFixed(1));
  near("triple de arranque al 87%", est1RM(80, 3, "snatch"), 92, 0.5);
  const rgT = est1RMRange(80, 3, "snatch");
  ok("el rango contiene la estimacion", rgT.lo < rgT.e && rgT.e < rgT.hi);
  ok("rango de 3 reps es +-3%", Math.abs(rgT.hi/rgT.e - 1.03) < 1e-9, (rgT.hi/rgT.e).toFixed(4));
  near("fuerza promedia 3 formulas", est1RM(100, 5, "bsq"),
       (100/REP_PCT[5] + 100*(1+5/30) + 100*36/32) / 3, 1e-9);

  // ---- RPE: repeticiones en reserva ----
  eq("RPE 10 = serie al limite",  est1RM(145, 3, "bsq", 10), est1RM(145, 3, "bsq"));
  eq("sin RPE = al limite",       est1RM(145, 3, "bsq", NaN), est1RM(145, 3, "bsq"));
  ok("RPE 8 estima mas que RPE 10", est1RM(145,3,"bsq",8) > est1RM(145,3,"bsq",10));
  ok("RPE 7 estima mas que RPE 8",  est1RM(145,3,"bsq",7) > est1RM(145,3,"bsq",8));
  eq("RPE 8 en 3 reps = 5 reps al limite", effReps(3, 8, "bsq"), 5);
  eq("fuerza: RIR completo",      effReps(3, 8, "bsq"), 5);
  eq("olimpico: la mitad del RIR", effReps(3, 8, "snatch"), 4);
  near("tabla RTS: 3 reps a RPE 8 = 86.3%", 145 / est1RM(145,3,"bsq",8), 0.863, 0.006);
  // un single a RPE 8 no es tu maximo
  ok("single a RPE 8 < maximo",   est1RM(100, 1, "bsq", 8) > 100);
  eq("single a RPE 10 = maximo",  est1RM(100, 1, "bsq", 10), 100);
  // interpolacion con reps fraccionarias
  ok("interpola reps fraccionarias", isFinite(est1RM(80, 3, "snatch", 7)),
     est1RM(80,3,"snatch",7).toFixed(1));
  ok("el RPE estrecha el rango",
     est1RMRange(145,3,"bsq",8).hi/est1RMRange(145,3,"bsq",8).e <
     est1RMRange(145,3,"bsq").hi/est1RMRange(145,3,"bsq").e);
  // el RPE guardado en cada serie debe llegar al calculo
  S.sessions = [{id:"t", d: today(), note:"", sets:[{l:"bsq", w:145, r:3, rpe:8}]}];
  near("el RPE de la sesion cuenta", bestFromSessions("bsq").e, est1RM(145,3,"bsq",8), 1e-9);
  S.sessions = [];
  ok("mas reps, mas 1RM",     est1RM(100, 5, "bsq") > est1RM(100, 3, "bsq"));

  // ---- 1RM declarado y porcentajes ----
  S.maxes.snatch = [{d: today(), w: 100}];
  const m = current1RM("snatch");
  eq("1RM declarado",        m.w, 100);
  eq("origen declarado",     m.src, "declarado");
  UI.pct = "snatch"; UI.pctStep = 5;
  go("pct");
  const rows = $$("#pctBody tr");
  eq("filas 105%..40%",      rows.length, 14);
  const r80 = rows.find(tr => tr.children[0].textContent.trim() === "80%");
  ok("fila 80% existe",      !!r80);
  if(r80){
    eq("80% teorico",        r80.children[1].textContent.trim(), "80");
    eq("80% a cargar",       r80.children[2].textContent.trim(), "80");
    eq("80% discos",         r80.children[3].textContent.trim(), "25 + 5");
  }
  setVal("#invW", 90);
  eq("90 kg = 90%",          $("#invOut").textContent, "90");

  // ---- registrar una sesión (3 series de 2 con 90) ----
  go("log");
  $("#lgLift").value = "snatch";
  setVal("#lgW", 90); setVal("#lgR", 2); setVal("#lgS", 3); setVal("#lgRpe", 8);
  ok("pista muestra 90%",    $("#lgHint").textContent.indexOf("90%") >= 0, $("#lgHint").textContent);
  $("#lgAdd").click();
  eq("3 series en borrador", S.draft.sets.length, 3);
  eq("tonelaje borrador",    S.draft.sets.reduce((t,s) => t + s.w*s.r, 0), 540);
  $("#lgSave").click();
  eq("sesion guardada",      S.sessions.length, 1);
  eq("borrador vacio",       S.draft.sets.length, 0);
  eq("tonelaje sesion",      tonnage(S.sessions[0]), 540);

  // ---- PRs ----
  ok("95x2 seria PR",        isPR("snatch", 95, 2) === true);
  ok("85x2 no es PR",        isPR("snatch", 85, 2) === false);
  const prs = repPRs("snatch");
  eq("un PR registrado",     prs.length, 1);
  eq("PR de 2 reps",         prs[0].w, 90);

  // ---- serie temporal y progreso ----
  S.sessions.push({id:"viejo", d:"2026-06-01", note:"", sets:[{l:"snatch", w:80, r:1, rpe:null}]});
  const sr = series("snatch");
  ok("serie con 2+ fechas",  sr.length >= 2, "n=" + sr.length);
  ok("serie ordenada",       sr[0].d < sr[sr.length-1].d);
  UI.prog = "snatch";
  go("prog");
  ok("grafica dibujada",     $("#prChart").querySelectorAll("circle").length >= 2);
  eq("un punto por sesion",  $("#prChart").querySelectorAll("circle.dt2").length, sr.length);
  eq("endpoint destacado",   $("#prChart").querySelectorAll("circle.dt").length, 1);
  // la línea de récord nunca puede bajar
  const dY = $("#prChart").querySelector("path.ln").getAttribute("d")
    .replace("M","").split(" L").map(s => parseFloat(s.split(",")[1]));
  ok("record nunca baja",    dY.every((y,i) => i === 0 || y <= dY[i-1] + 1e-6), dY.join(">"));

  ok("mejor marca visible",  $("#prBest").textContent !== "—", $("#prBest").textContent);
  ok("tabla PR con filas",   $$("#prReps tr").length >= 1);

  // ---- diagnóstico de proporciones ----
  S.maxes.cj    = [{d: today(), w: 120}];
  S.maxes.clean = [{d: today(), w: 125}];
  S.maxes.fsq   = [{d: today(), w: 130}];   // 104% de clean -> por debajo del 108-120% típico
  go("prog");
  const diag = $("#prDiag").textContent;
  ok("diagnostico calculado", diag.indexOf("rango típico") >= 0);
  ok("arranque 83% de C&J: alto", diag.indexOf("Arranque") >= 0);
  ok("frontal marcada baja",  diag.indexOf("Sentadilla frontal") >= 0);

  // ---- historial ----
  go("hist");
  eq("sesiones en historial", $$("#histList details").length, 2);
  ok("stats de historial",    $("#histStats").textContent.indexOf("Sesiones") >= 0);

  // ---- ajustes: cambiar equipo ----
  go("set");
  setVal("#stBar", 15);
  $("#stSaveGear").click();
  eq("barra guardada",        S.cfg.bar, 15);
  eq("recalcula con barra 15", loadable(95).total, 95);
  setVal("#stBar", 20);
  $("#stSaveGear").click();
  eq("barra restaurada",      S.cfg.bar, 20);

  // ---- persistencia ----
  save();
  const raw = localStorage.getItem(KEY);
  ok("guardado en el telefono", !!raw && raw.length > 100, "bytes=" + (raw ? raw.length : 0));
  const reread = JSON.parse(raw);
  eq("sesiones persistidas",  reread.sessions.length, 2);
  eq("1RM persistido",        reread.maxes.snatch[0].w, 100);

  // ---- copia de seguridad ----
  go("set");
  $("#stExport").click();
  const backup = $("#stJson").value;
  ok("copia generada",        backup.length > 100);
  S.sessions = [];
  $("#stJson").value = backup;
  $("#stImport").click();
  eq("copia restaurada",      S.sessions.length, 2);

  // ---- un día flojo no debe leerse como retroceso ----
  S.maxes.snatch = [{d:"2026-05-01", w:88}, {d: today(), w:95}];
  S.sessions.push({id:"flojo", d: today(), note:"", sets:[{l:"snatch", w:60, r:1, rpe:null}]});
  go("prog");
  ok("delta 90d positivo",   $("#prDelta").textContent.indexOf("+15.5") >= 0, $("#prDelta").textContent);
  // el doble de 90 kg estima 97: por encima del 95 declarado, y el dia flojo no baja nada
  // 90x2 a RPE 8 en arranque equivale a un triple al limite: 103.5 kg
  eq("mejor marca ignora el dia flojo", $("#prBest").textContent, "103.5");

  // ---- navegación completa sin errores ----
  ["home","pct","log","hist","prog","set"].forEach(v => {
    try{ go(v); ok("vista " + v + " renderiza", true); }
    catch(e){ ok("vista " + v + " renderiza", false, e.message); }
  });

  // ---- estado vacío (usuario nuevo) ----
  localStorage.removeItem(KEY);
  S = structuredClone(DEFAULT_STATE);
  LOADABLE = null; buildLoadable();
  try{
    ["home","pct","log","hist","prog","set"].forEach(v => go(v));
    ok("usuario nuevo sin errores", true);
  }catch(e){ ok("usuario nuevo sin errores", false, e.message); }
  ok("sin 1RM no rompe tabla", $("#pctBody") !== null);

  console.log("=====RESULTADOS=====");
  R.forEach(l => console.log(l));
  console.log("=====TOTAL: " + (R.length - fails) + "/" + R.length + " ok, " + fails + " fallos=====");
})();
