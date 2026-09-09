/* Prepara la pantalla para la captura que muestra dónde está el RPE.
   La vista se elige con el hash: #pct (estimador) o #log (registrar). */
(function(){
  localStorage.removeItem(KEY);
  S = structuredClone(DEFAULT_STATE); LOADABLE = null; buildLoadable();
  S.maxes.bsq = [{d: today(), w: 167}];

  const set = (sel, v) => {
    const e = $(sel); if(!e) return;
    e.value = v; e.dispatchEvent(new Event("input", {bubbles:true}));
  };
  const vista = (location.hash || "#pct").slice(1);

  if(vista === "pct"){
    UI.pct = "bsq";
    go("pct");
    set("#e1w", 145); set("#e1r", 3); set("#e1rpe", 8);
    setTimeout(()=>{
      const card = $("#e1out").closest(".card");
      if(card) card.scrollIntoView({block:"center"});
    }, 120);
  } else {
    go("log");
    $("#lgLift").value = "bsq";
    set("#lgLift", "bsq");
    set("#lgW", 145); set("#lgR", 3); set("#lgS", 2); set("#lgRpe", 8);
  }
})();
