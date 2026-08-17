import React, { useState, useRef, useEffect } from "react";

/* Clavier v4 — retours du test réel :
   1. Camille RÉPOND (moteur séparé), avec un caractère réglable
      jusqu'à "très dure" : permet enfin de tester des échanges brutaux.
   2. Gradation de couleur selon la dureté du message (vert → rouge),
      portée par un filet discret, sans étiquette qui juge l'auteur.
   3. Icône globe supprimée (contrainte iOS réelle, mais illisible ici). */

const C = {
  bg: "#ECE5DD", ink: "#1A2421", soft: "#5E6B67", faint: "#7B8681",
  accent: "#2F6F5E", accentSoft: "#E4EFEA",
  line: "#DDE3E1", moi: "#DCF8C6", eux: "#FFFFFF", warn: "#8A4030",
};

/* Échelle de dureté : 1 très posé → 5 très dur */
const NIVEAUX = {
  1: { c: "#2F6F5E", f: "#E4EFEA", m: "posé" },
  2: { c: "#5B8C4A", f: "#E9F0E2", m: "plutôt posé" },
  3: { c: "#B8862B", f: "#F6EDD8", m: "tendu" },
  4: { c: "#C4622C", f: "#F8E7DA", m: "très tendu" },
  5: { c: "#B23B2E", f: "#F7E0DC", m: "brûlant" },
};

const CARACTERES = [
  { id: "conciliante", label: "Conciliante" },
  { id: "agacee", label: "Agacée" },
  { id: "dure", label: "Très dure" },
];

const SYS_RELECTURE = `Tu aides à réécrire un message en cours de rédaction pour qu'il ne desserve pas son auteur.

FORMAT DE RÉPONSE OBLIGATOIRE : commence par un chiffre de dureté de 1 à 5, puis une barre verticale, puis le contenu. Rien d'autre.
1 = posé · 2 = plutôt posé · 3 = tendu · 4 = très tendu · 5 = brûlant (insultes, mépris, rupture).

Contenu, au choix :
- OK  → si le message est déjà proportionné et ne dessert pas son auteur, y compris s'il est ferme, direct ou en net désaccord. Une personne a le droit d'être ferme.
- STOP_PRESSION  → menace, chantage, pression ou contrôle sur quelqu'un.
- STOP_DANGER  → violences ou détresse vitale.
- sinon, le message réécrit, seul, sans guillemets ni commentaire.

Réécriture : intervention minimale, ne touche que ce qui dessert l'auteur (attaque, jugement, "jamais"/"toujours", agressivité). Garde ses mots, sa voix, son niveau de langue, son tu/vous. Longueur proche de l'original. Naturel, jamais lisse.
Principes jamais nommés : un fait précis plutôt qu'un jugement ; parler de soi ; une demande à laquelle on peut dire oui ; s'en prendre au problème, pas à la personne.
N'emploie jamais : coaching, médiation, communication non violente, bienveillance, thérapie, émotion.

Exemples de forme : "1|OK" · "4|Je suis déçu qu'on n'ait pas pu se voir." · "5|STOP_PRESSION"`;

const sysCamille = (car) => `Tu joues Camille, une amie proche, dans un échange de messages. Tu réponds UNIQUEMENT par son message, court (1 à 2 phrases), naturel, en français parlé, comme un vrai SMS. Jamais de guillemets, jamais de narration, jamais de commentaire.

Caractère en ce moment : ${
  car === "conciliante" ? "tu es apaisée et prête à renouer, tu cherches la solution."
  : car === "agacee" ? "tu es agacée, un peu sèche, tu ne lâches pas facilement."
  : "tu es très dure : reproches directs, ton cassant, tu envisages de couper court. Tu restes crédible et humaine, jamais insultante gratuitement."
}

Tu réagis à ce que la personne vient d'écrire. Si elle fait un vrai pas vers toi, tu peux t'adoucir progressivement — mais sans céder d'un coup.`;

export default function App() {
  const [msgs, setMsgs] = useState([
    { de: "eux", t: "Bon du coup tu viens ce week-end ou pas ? ça fait 3 fois que je demande" },
    { de: "moi", t: "Je sais, désolé, c'est un peu la course en ce moment" },
    { de: "eux", t: "Comme d'habitude quoi. Laisse tomber, je m'organise autrement." },
  ]);
  const [caractere, setCaractere] = useState("agacee");
  const [input, setInput] = useState("");
  const [etat, setEtat] = useState("vide");
  const [flux, setFlux] = useState("");
  const [niv, setNiv] = useState(null);
  const [ms, setMs] = useState(null);
  const [ecrit, setEcrit] = useState(false);
  const [vh, setVh] = useState(null);
  const reqId = useRef(0); const dernier = useRef(""); const msgsRef = useRef(msgs);
  const filRef = useRef(null);

  useEffect(() => { msgsRef.current = msgs; }, [msgs]);
  useEffect(() => {
    const vv = window.visualViewport; if (!vv) return;
    const maj = () => setVh(vv.height); maj();
    vv.addEventListener("resize", maj); vv.addEventListener("scroll", maj);
    return () => { vv.removeEventListener("resize", maj); vv.removeEventListener("scroll", maj); };
  }, []);
  useEffect(() => { if (filRef.current) filRef.current.scrollTop = filRef.current.scrollHeight; }, [msgs, ecrit]);

  useEffect(() => {
    const t = input.trim();
    if (t.length < 8) { setEtat("vide"); setFlux(""); setNiv(null); dernier.current = ""; return; }
    if (t === dernier.current) return;
    const timer = setTimeout(() => relire(t), 550);
    return () => clearTimeout(timer);
  }, [input]);

  async function relire(t) {
    const id = ++reqId.current;
    setEtat("attente"); setFlux(""); setNiv(null);
    const t0 = performance.now();
    const ctl = new AbortController();
    const expire = setTimeout(() => ctl.abort(), 20000);
    try {
      const ctx = msgsRef.current.slice(-4).map(m => (m.de === "moi" ? "Moi" : "Camille") + " : " + m.t).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 400, stream: true, system: SYS_RELECTURE,
          messages: [{ role: "user", content: `Contexte :\n${ctx}\n\nMessage en cours :\n"""${t}"""` }] }),
      });
      const reader = res.body.getReader(); const dec = new TextDecoder();
      let tampon = "", acc = "", niveau = null, premier = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (id !== reqId.current) { reader.cancel(); return; }
        tampon += dec.decode(value, { stream: true });
        const lignes = tampon.split("\n"); tampon = lignes.pop() || "";
        for (const l of lignes) {
          if (!l.startsWith("data:")) continue;
          const brut = l.slice(5).trim();
          if (!brut || brut === "[DONE]") continue;
          let ev; try { ev = JSON.parse(brut); } catch { continue; }
          const bout = ev?.delta?.text; if (!bout) continue;
          acc += bout;

          if (niveau === null) {
            const i = acc.indexOf("|");
            if (i === -1) continue;
            const n = parseInt(acc.slice(0, i).trim(), 10);
            niveau = n >= 1 && n <= 5 ? n : 3;
            setNiv(niveau);
          }
          const corps = acc.slice(acc.indexOf("|") + 1).trim();
          if (!corps) continue;
          if (corps.startsWith("OK")) { setEtat("ok"); setMs(Math.round(performance.now() - t0)); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (corps.startsWith("STOP_PRESSION")) { setEtat("pression"); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (corps.startsWith("STOP_DANGER")) { setEtat("danger"); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (!"STOP_".startsWith(corps.slice(0, Math.min(5, corps.length)).toUpperCase()) && !"OK".startsWith(corps.slice(0, 1).toUpperCase() + "K")) {
            if (premier) { setEtat("flux"); setMs(Math.round(performance.now() - t0)); premier = false; }
            setFlux(corps);
          }
        }
      }
      if (id !== reqId.current) return;
      const corps = acc.includes("|") ? acc.slice(acc.indexOf("|") + 1).trim() : acc.trim();
      dernier.current = t;
      if (!corps || corps === "OK") setEtat("ok");
      else { setFlux(corps); setEtat("prop"); }
    } catch { if (id === reqId.current) setEtat("erreur"); }
    finally { clearTimeout(expire); }
  }

  async function repondreCamille(suite) {
    setEcrit(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 200, system: sysCamille(caractere),
          messages: [{ role: "user", content: suite.map(m => (m.de === "moi" ? "La personne" : "Toi (Camille)") + " : " + m.t).join("\n") + "\n\nTa réponse :" }] }),
      });
      const data = await res.json();
      const txt = data.content.filter(b => b.type === "text").map(b => b.text).join(" ").trim().replace(/^["«»\s]+|["«»\s]+$/g, "");
      if (txt) setMsgs(m => [...m, { de: "eux", t: txt }]);
    } catch { /* silence : la simulation continue */ }
    finally { setEcrit(false); }
  }

  function adopter() {
    if (!flux) return;
    setInput(flux); dernier.current = flux.trim(); setEtat("ok"); setFlux("");
  }
  function envoyer() {
    const t = input.trim(); if (!t) return;
    const suite = [...msgsRef.current, { de: "moi", t }];
    setMsgs(suite); setInput(""); setFlux(""); setNiv(null); setEtat("vide"); dernier.current = "";
    repondreCamille(suite);
  }

  const hauteur = vh ? `${vh}px` : "100svh";
  const N = niv ? NIVEAUX[niv] : null;

  return (
    <div style={{ height: hauteur, maxHeight: hauteur, overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column",
      fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes pop { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce){ .an{animation:none!important} }
      `}</style>

      {/* Réglage du caractère de Camille */}
      <div style={{ flexShrink: 0, background: "#1A2421", color: "#fff", padding: "7px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, opacity: .65, flexShrink: 0 }}>Camille :</span>
        {CARACTERES.map(c => {
          const on = caractere === c.id;
          return <button key={c.id} onClick={() => setCaractere(c.id)}
            style={{ border: on ? "1px solid #fff" : "1px solid rgba(255,255,255,.25)", background: on ? "#fff" : "transparent",
              color: on ? "#1A2421" : "rgba(255,255,255,.8)", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {c.label}</button>;
        })}
      </div>

      {/* Fil */}
      <div ref={filRef} style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 7 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.de === "moi" ? "flex-end" : "flex-start", maxWidth: "84%",
            background: m.de === "moi" ? C.moi : C.eux, borderRadius: 13,
            borderBottomRightRadius: m.de === "moi" ? 4 : 13, borderBottomLeftRadius: m.de === "moi" ? 13 : 4,
            padding: "8px 11px", fontSize: 14.5, lineHeight: 1.45, boxShadow: "0 1px 1px rgba(0,0,0,.06)" }}>{m.t}</div>
        ))}
        {ecrit && <div className="an" style={{ alignSelf: "flex-start", background: C.eux, borderRadius: 13, borderBottomLeftRadius: 4,
          padding: "9px 13px", fontSize: 13, color: C.faint, animation: "pulse 1.1s infinite" }}>Camille écrit…</div>}
      </div>

      {/* ===== BARRE — filet de couleur selon la dureté ===== */}
      <div style={{ flexShrink: 0, background: "#E8EAE9", borderTop: "1px solid #CFD6D3", padding: "6px 8px" }} aria-live="polite">
        <div style={{ background: "#fff", borderRadius: 9, minHeight: 44, padding: "7px 9px 7px 0", display: "flex", alignItems: "stretch", gap: 0, overflow: "hidden" }}>
          {/* Filet de dureté */}
          <div style={{ width: 4, flexShrink: 0, background: N ? N.c : "#E3E7E5", transition: "background .35s ease" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, paddingLeft: 9 }}>
            <Logo teinte={N?.c} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {etat === "vide" && <span style={{ fontSize: 12.5, color: C.faint }}>Je relis au fil de l'eau.</span>}
              {etat === "attente" && <span className="an" style={{ fontSize: 12.5, color: C.faint, animation: "pulse 1s infinite" }}>je relis…</span>}
              {etat === "ok" && <span style={{ fontSize: 12.5, color: N ? N.c : C.accent, fontWeight: 600 }}>✓ Rien à signaler — envoyable tel quel.</span>}
              {etat === "pression" && <span style={{ fontSize: 12, color: C.warn, lineHeight: 1.35 }}>Message non réécrit : il fait pression sur quelqu'un.</span>}
              {etat === "danger" && <span style={{ fontSize: 12, color: C.warn, lineHeight: 1.35 }}>Cela dépasse une question de formulation — 3919 · 3114 · 17</span>}
              {etat === "erreur" && <span style={{ fontSize: 12, color: C.warn }}>Relecture indisponible — modifiez un mot pour réessayer.</span>}
              {(etat === "flux" || etat === "prop") && (
                <button onClick={adopter} disabled={etat === "flux"} className="an"
                  style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: N ? N.f : C.accentSoft, color: C.ink,
                    borderRadius: 6, padding: "7px 9px", fontSize: 13.5, lineHeight: 1.4, fontFamily: "inherit",
                    cursor: etat === "prop" ? "pointer" : "default", animation: "pop .18s ease both" }}>
                  {flux}{etat === "flux" && <span style={{ opacity: .45 }}>▌</span>}
                  <span style={{ display: "block", fontSize: 10, color: N ? N.c : C.accent, fontWeight: 600, marginTop: 2 }}>
                    {etat === "prop" ? "Toucher pour remplacer" : "…"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saisie */}
      <div style={{ flexShrink: 0, background: "#F6F6F6", borderTop: `1px solid ${C.line}`, padding: "7px 9px 9px" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={1} placeholder="Répondez à Camille, à chaud…"
            style={{ flex: 1, resize: "none", height: 38, maxHeight: 90, background: "#fff", border: `1px solid ${C.line}`,
              borderRadius: 19, padding: "9px 13px", fontSize: 15, lineHeight: 1.3, fontFamily: "inherit", color: C.ink }} />
          <button onClick={envoyer} disabled={!input.trim()}
            style={{ width: 38, height: 38, flexShrink: 0, border: "none", borderRadius: 999, background: input.trim() ? "#25D366" : "#C8D2CF", color: "#fff", fontSize: 16, cursor: input.trim() ? "pointer" : "default" }}>↑</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 9.5, color: C.faint, marginTop: 5 }}>
          Simulation · réponses générées{ms ? ` · relecture ${(ms / 1000).toFixed(1)} s` : ""}
        </div>
      </div>
    </div>
  );
}

function Logo({ teinte }) {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx="39" cy="50" r="21" fill={teinte || "#C45642"} opacity="0.55" />
      <circle cx="61" cy="50" r="21" fill={teinte || "#1F6E5A"} opacity="0.85" />
    </svg>
  );
}
