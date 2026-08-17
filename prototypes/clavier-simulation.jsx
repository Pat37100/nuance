import React, { useState, useRef, useEffect } from "react";

/* Simulation du clavier Nuance dans une conversation.
   But : juger l'ergonomie (nombre de gestes, latence, sensation de pause)
   AVANT d'investir dans le développement natif.
   La barre Nuance est placée SOUS le champ de saisie, exactement où elle
   apparaîtrait dans un vrai clavier iOS (au-dessus des touches). */

const C = {
  bg: "#ECE5DD", ink: "#1A2421", soft: "#5E6B67", faint: "#8A9591",
  accent: "#2F6F5E", accentSoft: "#E4EFEA", accentLine: "#A9CFC1",
  surface: "#FFFFFF", line: "#DDE3E1",
  moi: "#DCF8C6", eux: "#FFFFFF",
  kb: "#D1D5DB",
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
- "adapte" : true si le message est déjà proportionné et ne dessert pas son auteur — y compris s'il est ferme ou en net désaccord. Une personne a le droit d'être ferme. Dans ce cas "texte" vaut null.
- sinon "adapte": false et "texte" : la reformulation, avec une intervention MINIMALE. Ne touche que ce qui dessert l'auteur, garde sa voix, son niveau de langue et son registre (tu/vous). Longueur proche de l'original. Naturel, jamais lisse ni corporate.
- "blocage" : "coercition" si menace/chantage/pression/contrôle ; "danger" si violences ou détresse vitale ; sinon null. Si blocage, "texte" vaut null.

JSON strict sans markdown : {"blocage":null,"adapte":false,"texte":"..."}`;

export default function App() {
  const [msgs, setMsgs] = useState(CONVERSATION);
  const [input, setInput] = useState("");
  const [prop, setProp] = useState(null);      // {texte, adapte, blocage}
  const [statut, setStatut] = useState("idle"); // idle|loading|done|error
  const [pause, setPause] = useState(true);     // pause volontaire d'1s
  const [gestes, setGestes] = useState(0);
  const [ms, setMs] = useState(null);
  const reqId = useRef(0); const dernier = useRef("");
  const finRef = useRef(null);

  useEffect(() => { finRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    const t = input.trim();
    if (t.length < 10 || t === dernier.current) { if (t.length < 10) setProp(null); return; }
    const delai = pause ? 1000 : 350;
    const timer = setTimeout(async () => {
      dernier.current = t; const id = ++reqId.current; setStatut("loading");
      const t0 = performance.now();
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 700, system: SYSTEM,
            messages: [{ role: "user", content: `Conversation en cours :\n${msgs.map(m => (m.de === "moi" ? "Moi" : "L'autre") + " : " + m.t).join("\n")}\n\nMessage en cours de rédaction :\n"""${t}"""` }] }),
        });
        const data = await res.json();
        const out = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").replace(/```json|```/g, "").trim();
        if (id !== reqId.current) return;
        setProp(JSON.parse(out)); setMs(Math.round(performance.now() - t0)); setStatut("done");
      } catch { if (id === reqId.current) setStatut("error"); }
    }, delai);
    return () => clearTimeout(timer);
  }, [input, pause]);

  function adopter() {
    if (!prop?.texte) return;
    setInput(prop.texte); setProp(null); dernier.current = prop.texte;
    setGestes(g => g + 1);
  }
  function envoyer() {
    const t = input.trim(); if (!t) return;
    setMsgs(m => [...m, { de: "moi", t }]); setInput(""); setProp(null); dernier.current = "";
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif", color: C.ink, display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes slide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce){ .an{animation:none!important} }
      `}</style>

      {/* Bandeau de simulation */}
      <div style={{ background: "#1A2421", color: "#fff", padding: "9px 14px", fontSize: 11.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={{ opacity: .75 }}>Simulation · messagerie fictive</span>
        <button onClick={() => setPause(p => !p)}
          style={{ border: "1px solid rgba(255,255,255,.3)", background: "transparent", color: "#fff", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          {pause ? "Avec pause (1 s)" : "Le plus rapide"}
        </button>
      </div>

      {/* En-tête conversation */}
      <div style={{ background: "#F6F6F6", borderBottom: `1px solid ${C.line}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, background: "#C9B8A8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#fff" }}>C</div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>Camille</div>
          <div style={{ fontSize: 11.5, color: C.faint }}>en ligne</div>
        </div>
      </div>

      {/* Fil */}
      <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8, minHeight: 220 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.de === "moi" ? "flex-end" : "flex-start", maxWidth: "82%", background: m.de === "moi" ? C.moi : C.eux,
            borderRadius: 14, borderBottomRightRadius: m.de === "moi" ? 4 : 14, borderBottomLeftRadius: m.de === "moi" ? 14 : 4,
            padding: "9px 12px", fontSize: 15, lineHeight: 1.45, boxShadow: "0 1px 1px rgba(0,0,0,.06)" }}>
            {m.t}
          </div>
        ))}
        <div ref={finRef} />
      </div>

      {/* Zone de saisie */}
      <div style={{ background: "#F6F6F6", borderTop: `1px solid ${C.line}`, padding: "9px 10px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={1}
            placeholder="Répondez à Camille, à chaud…"
            style={{ flex: 1, resize: "none", minHeight: 40, maxHeight: 110, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: "10px 14px", fontSize: 15.5, lineHeight: 1.4, fontFamily: "inherit", color: C.ink }} />
          <button onClick={envoyer} disabled={!input.trim()}
            style={{ width: 40, height: 40, flexShrink: 0, border: "none", borderRadius: 999, background: input.trim() ? "#25D366" : "#C8D2CF", color: "#fff", fontSize: 17, cursor: input.trim() ? "pointer" : "default" }}>↑</button>
        </div>
      </div>

      {/* ===== LA BARRE NUANCE — emplacement exact dans un vrai clavier iOS ===== */}
      <div style={{ background: C.kb, borderTop: "1px solid #B9C0C7", padding: "7px 8px 9px" }}>
        <div style={{ background: "#fff", borderRadius: 10, minHeight: 52, padding: "8px 10px", display: "flex", alignItems: "center", gap: 9 }}>
          <Logo />
          <div style={{ flex: 1, minWidth: 0 }}>
            {statut === "loading" ? (
              <span className="an" style={{ fontSize: 13, color: C.faint, animation: "pulse 1.2s infinite" }}>je relis…</span>
            ) : prop?.blocage ? (
              <span style={{ fontSize: 12.5, color: "#8A4030", lineHeight: 1.4 }}>
                {prop.blocage === "danger"
                  ? "Situation qui dépasse la formulation — 3919 · 3114 · 17"
                  : "Ce message ne sera pas reformulé."}
              </span>
            ) : prop?.adapte ? (
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Votre message est adapté tel quel.</span>
            ) : prop?.texte ? (
              <button onClick={adopter} className="an"
                style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: C.accentSoft, color: C.ink,
                  borderRadius: 7, padding: "8px 10px", fontSize: 14, lineHeight: 1.4, cursor: "pointer", fontFamily: "inherit", animation: "slide .25s ease both" }}>
                {prop.texte}
                <span style={{ display: "block", fontSize: 10.5, color: C.accent, fontWeight: 600, marginTop: 3 }}>Toucher pour remplacer</span>
              </button>
            ) : statut === "error" ? (
              <span style={{ fontSize: 12.5, color: "#8A4030" }}>Relecture indisponible. Continuez d'écrire.</span>
            ) : (
              <span style={{ fontSize: 12.5, color: C.faint }}>Écrivez : la proposition apparaît ici.</span>
            )}
          </div>
          <span style={{ fontSize: 15, color: C.faint, flexShrink: 0 }}>🌐</span>
        </div>
        <div style={{ textAlign: "center", fontSize: 10, color: "#6B7280", marginTop: 6 }}>
          zone du clavier · {gestes} adoption{gestes > 1 ? "s" : ""}{ms ? ` · dernière relecture ${(ms / 1000).toFixed(1)} s` : ""}
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 100 100" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx="39" cy="50" r="21" fill="#C45642" opacity="0.88" />
      <circle cx="61" cy="50" r="21" fill="#1F6E5A" opacity="0.88" />
    </svg>
  );
}
