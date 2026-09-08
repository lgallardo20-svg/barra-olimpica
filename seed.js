/* Carga datos de ejemplo para revisar el diseño (no se publica). */
(function(){
  const iso = back => {
    const d = new Date(Date.parse("2026-09-08T12:00:00") - back*86400000);
    return d.toISOString().slice(0,10);
  };
  localStorage.removeItem(KEY);
  S = structuredClone(DEFAULT_STATE);
  LOADABLE = null; buildLoadable();

  S.maxes = {
    snatch: [{d:iso(120), w:88}, {d:iso(70), w:92}, {d:iso(24), w:95}],
    cj:     [{d:iso(120), w:110},{d:iso(70), w:116},{d:iso(24), w:120}],
    clean:  [{d:iso(30), w:124}],
    jerk:   [{d:iso(30), w:120}],
    fsq:    [{d:iso(40), w:132}],
    bsq:    [{d:iso(40), w:155}]
  };

  const plan = [
    {back:2,  sets:[["snatch",80,2,3,7.5],["snatch",85,1,3,8.5],["cj",100,1,3,8],["fsq",110,3,4,8]], note:"Buen día. El arranque salió alto y estable."},
    {back:4,  sets:[["psnatch",70,3,3,7],["clean",105,2,4,8],["bsq",130,5,3,8.5]], note:"Sentadilla pesada, rodilla bien."},
    {back:7,  sets:[["snatch",82,2,4,8],["jerk",105,2,3,8],["spull",100,3,3,7]], note:""},
    {back:9,  sets:[["hclean",95,3,3,7.5],["fsq",115,3,3,8.5],["press",55,5,3,8]], note:"Envión desde bloques la próxima."},
    {back:11, sets:[["snatch",78,3,4,7],["cj",95,2,4,7.5],["bsq",125,5,4,8]], note:""},
    {back:14, sets:[["snatch",90,1,3,9],["cj",112,1,2,9],["fsq",120,2,3,9]], note:"Semana de test. Casi 95 en arranque."},
    {back:18, sets:[["pclean",90,3,3,7.5],["ppress",75,4,3,8],["cpull",110,3,4,7]], note:""},
    {back:21, sets:[["snatch",75,3,5,7],["clean",100,3,3,8],["bsq",120,6,3,8]], note:"Volumen. Espalda cansada."},
    {back:28, sets:[["snatch",84,2,4,8],["cj",104,2,3,8],["ohsq",70,5,3,7]], note:""},
    {back:35, sets:[["snatch",80,2,4,7.5],["jerk",100,3,3,8],["fsq",112,4,3,8]], note:""}
  ];
  S.sessions = plan.map((p,i)=>({
    id: "seed"+i,
    d: iso(p.back),
    note: p.note,
    sets: p.sets.flatMap(([l,w,r,n,rpe]) =>
      Array.from({length:n}, () => ({l, w, r, rpe})))
  }));
  save();

  UI.pct = "snatch"; UI.prog = "snatch";
  const v = (location.hash || "#home").slice(1);
  go(v);
})();
