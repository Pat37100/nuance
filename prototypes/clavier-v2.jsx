import React, { useState, useRef, useEffect } from "react";

/* Simulation de l'expérience clavier Nuance — version corrigée.
   Défaut fatal de la version précédente : la barre était le dernier élément
   d'une colonne en 100vh, donc recouverte par le clavier système de l'iPhone
   au moment précis où on en avait besoin. Elle est maintenant placée
   AU-DESSUS du champ de saisie, dans le flux, et le champ est ancré en bas
   via visualViewport. Ajouts : délai d'expiration, reprise après erreur,
   contexte de conversation à jour. */

const C = {
  bg: "#ECE5DD", ink: "#1A2421", soft: "#5E6B67", faint: "#7B8681",
  accent: "#2F6F5E", accentSoft: "#E4EFEA",
  surface: "#FFFFFF", line: "#DDE3E1",
  moi: "#DCF8C6", eux: "#FFFFFF", warn: "#8A4030",
};

const CONVERSATION = [
  { de: "eux", t: "Bon du coup tu viens ce week-end ou pas ? ça fait 3 fois que je demande" },
  { de: "moi", t: "Je sais, désolé, c'est un peu la course en ce moment" },
  { de: "eux", t: "Comme d'habitude quoi. Laisse tomber, je m'organise autrement." },
];

const SYSTEM = `Tu es le moteur d'un clavier d'aide à l'écriture pour messages délicats.

Techniques à appliquer sans jamais les nommer : un fait précis plutôt qu'un jugement ; parler de soi plutôt que de l'autre ; une demande claire à laquelle on peut dire oui ; supprimer "jamais"/"toujours" au profit d'une période précise ; s'en prendre au problème, pas à la personne.

N'emploie JAMAIS les mots : coaching, médiation, communication non violente, bienveillance, thérapie, développement personnel, émotion.

On te donne un message en cours de rédaction. Tu renvoies :
- "adapte" : true si le message est déjà proportionné et ne dessert pas son auteur — y compris s'il est ferme ou en net désaccord. Une personne a le droit d'être ferme. "texte" vaut alors null.
- sinon "adapte": false et "texte" : la reformulation, intervention MINIMALE. Ne touche que ce qui dessert l'auteur, garde sa voix, son niveau de langue, son registre (tu/vous). Longueur proche de l'original. Naturel, jamais lisse.
- "blocage" : "coercition" si menace/chantage/pression/contrôle ; "danger" si violences ou détresse vitale ; sinon null. Si blocage, "texte" vaut null.

JSON strict sans markdown : {"blocage":null,"adapte":false,"texte":"..."}`;

export default function App() {
  const [msgs, setMsgs] = useState(CONVERSATION);
  const [input, setInput] = useState("");
  const [prop, setProp] = useState(null);
  const [statut, setStatut] = useState("idle");
  const [pause, setPause] = useState(true);
  const [gestes, setGestes] = useState(0);
  const [ms, setMs] = useState(null);
  const [vh, setVh] = useState(null);           // hauteur visible réelle
  const reqId = useRef(0);
  const dernier = useRef("");
  const msgsRef = useRef(msgs);
  const filRef = useRef(null);

  useEffect(() => { msgsRef.current = msgs; }, [msgs]);

  /* Ancrage : on suit la hauteur réellement visible pour que la barre et le
     champ restent au-dessus du clavier système. */
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const maj = () => setVh(vv.height);
    maj();
    vv.addEventListener("resize", maj);
    vv.addEventListener("scroll", maj);
    return () => { vv.removeEventListener("resize", maj); vv.removeEventListener("scroll", maj); };
  }, []);

  useEffect(() => {
    if (filRef.current) filRef.current.scrollTop = filRef.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    const t = input.trim();
    if (t.length < 10) { setProp(null); dernier.current = ""; setStatut("idle"); return; }
    if (t === dernier.current) return;
    const delai = pause ? 1000 : 350;
    const timer = setTimeout(async () => {
      const id = ++reqId.current;
      setStatut("loading");
      const t0 = performance.now();
      const ctl = new AbortController();
      const expire = setTimeout(() => ctl.abort(), 20000);
      try {
        const contexte = msgsRef.current.map(m => (m.de === "moi" ? "Moi" : "L'autre") + " : " + m.t).join("\n");
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
          body: JSON.stringify({
            model: "claude-sonnet-4-6", max_tokens: 700, system: SYSTEM,
            messages: [{ role: "user", content: `Conversation en cours :\n${contexte}\n\nMessage en cours de rédaction :\n"""${t}"""` }],
          }),
        });
        const data = await res.json();
        const out = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(out);
        if (id !== reqId.current) return;
        dernier.current = t;                       // marqué SEULEMENT en cas de succès
        setProp(parsed); setMs(Math.round(performance.now() - t0)); setStatut("done");
      } catch {
        if (id === reqId.current) setStatut("error"); // dernier.current inchangé → reprise possible
      } finally { clearTimeout(expire); }
    }, delai);
    return () => clearTimeout(timer);
  }, [input, pause]);

  function adopter() {
    if (!prop?.texte) return;
    setInput(prop.texte); dernier.current = prop.texte.trim(); setProp(null);
    setGestes(g => g + 1);
  }
  function envoyer() {
    const t = input.trim(); if (!t) return;
    setMsgs(m => [...m, { de: "moi", t }]);
    setInput(""); setProp(null); dernier.current = ""; setStatut("idle");
  }

  const hauteur = vh ? `${vh}px` : "100svh";

  return (
    <div style={{ height: hauteur, maxHeight: hauteur, overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column",
      fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes slide { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce){ .an{animation:none!important} }
      `}</style>

      {/* Bandeau */}
      <div style={{ flexShrink: 0, background: "#1A2421", color: "#fff", padding: "8px 12px", fontSize: 11.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ opacity: .75 }}>Simulation · Camille</span>
        <button onClick={() => setPause(p => !p)}
          style={{ border: "1px solid rgba(255,255,255,.3)", background: "transparent", color: "#fff", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {pause ? "Avec pause (1 s)" : "Le plus rapide"}
        </button>
      </div>

      {/* Fil — seule zone qui défile */}
      <div ref={filRef} style={{ flex: 1, overflowY: "auto", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.de === "moi" ? "flex-end" : "flex-start", maxWidth: "84%",
            background: m.de === "moi" ? C.moi : C.eux, borderRadius: 13,
            borderBottomRightRadius: m.de === "moi" ? 4 : 13, borderBottomLeftRadius: m.de === "moi" ? 13 : 4,
            padding: "8px 11px", fontSize: 14.5, lineHeight: 1.45, boxShadow: "0 1px 1px rgba(0,0,0,.06)" }}>{m.t}</div>
        ))}
      </div>

      {/* ===== BARRE NUANCE — au-dessus du champ, donc toujours visible ===== */}
      <div style={{ flexShrink: 0, background: "#E8EAE9", borderTop: `1px solid #CFD6D3`, padding: "6px 8px" }}>
        <div style={{ background: "#fff", borderRadius: 9, minHeight: 44, padding: "7px 9px", display: "flex", alignItems: "center", gap: 8 }}>
          <Logo />
          <div style={{ flex: 1, minWidth: 0 }}>
            {statut === "loading" ? (
              <span className="an" style={{ fontSize: 12.5, color: C.faint, animation: "pulse 1.2s infinite" }}>je relis…</span>
            ) : statut === "error" ? (
              <span style={{ fontSize: 12, color: C.warn }}>Relecture indisponible — modifiez un mot pour réessayer.</span>
            ) : prop?.blocage ? (
              <span style={{ fontSize: 12, color: C.warn, lineHeight: 1.35 }}>
                {prop.blocage === "danger" ? "Situation qui dépasse la formulation — 3919 · 3114 · 17" : "Ce message ne sera pas reformulé."}
              </span>
            ) : prop?.adapte ? (
              <span style={{ fontSize: 12.5, color: C.accent, fontWeight: 600 }}>Votre message est adapté tel quel.</span>
            ) : prop?.texte ? (
              <button onClick={adopter} className="an"
                style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: C.accentSoft, color: C.ink,
                  borderRadius: 6, padding: "7px 9px", fontSize: 13.5, lineHeight: 1.4, cursor: "pointer", fontFamily: "inherit", animation: "slide .22s ease both" }}>
                {prop.texte}
                <span style={{ display: "block", fontSize: 10, color: C.accent, fontWeight: 600, marginTop: 2 }}>Toucher pour remplacer</span>
              </button>
            ) : (
              <span style={{ fontSize: 12, color: C.faint }}>Écrivez : la proposition apparaît ici.</span>
            )}
          </div>
          <span style={{ fontSize: 14, color: C.faint, flexShrink: 0 }}>🌐</span>
        </div>
      </div>

      {/* Champ de saisie */}
      <div style={{ flexShrink: 0, background: "#F6F6F6", borderTop: `1px solid ${C.line}`, padding: "7px 9px 9px" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={1}
            placeholder="Répondez à Camille, à chaud…"
            style={{ flex: 1, resize: "none", height: 38, maxHeight: 90, background: "#fff", border: `1px solid ${C.line}`,
              borderRadius: 19, padding: "9px 13px", fontSize: 15, lineHeight: 1.3, fontFamily: "inherit", color: C.ink }} />
          <button onClick={envoyer} disabled={!input.trim()}
            style={{ width: 38, height: 38, flexShrink: 0, border: "none", borderRadius: 999, background: input.trim() ? "#25D366" : "#C8D2CF", color: "#fff", fontSize: 16, cursor: input.trim() ? "pointer" : "default" }}>↑</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 9.5, color: C.faint, marginTop: 5 }}>
          {gestes} adoption{gestes > 1 ? "s" : ""}{ms ? ` · relecture ${(ms / 1000).toFixed(1)} s` : ""} · {pause ? "pause 1 s" : "rapide"}
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx="39" cy="50" r="21" fill="#C45642" opacity="0.88" />
      <circle cx="61" cy="50" r="21" fill="#1F6E5A" opacity="0.88" />
    </svg>
  );
}
