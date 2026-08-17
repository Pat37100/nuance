import React, { useState, useRef, useEffect } from "react";

/* Clavier v3 — deux corrections issues du test réel :
   1. LENTEUR : la réponse arrive maintenant en flux continu (streaming).
      Les premiers mots s'affichent dès qu'ils sont produits, au lieu
      d'attendre la fin. Délai de déclenchement ramené à 550 ms,
      consigne et sortie raccourcies au minimum.
   2. SILENCE AMBIGU : la barre affiche TOUJOURS un état explicite.
      "Rien à signaler" est dit, jamais sous-entendu. */

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

/* Sortie en texte brut (pas de JSON) : indispensable pour afficher en flux. */
const SYSTEME = `Tu aides à réécrire un message en cours de rédaction, pour qu'il ne desserve pas son auteur.

Réponds par UNE SEULE de ces trois formes, sans rien ajouter :

1. Si le message est déjà proportionné et ne dessert pas son auteur — y compris s'il est ferme, direct ou en net désaccord — réponds exactement : OK
   Une personne a le droit d'être ferme. Ne réécris pas pour justifier ton existence.

2. Si le message contient une menace, un chantage, une pression ou du contrôle sur quelqu'un, réponds exactement : STOP_PRESSION
   S'il évoque des violences ou une détresse vitale, réponds exactement : STOP_DANGER

3. Sinon, réponds UNIQUEMENT par le message réécrit, sans guillemets ni commentaire.
   Intervention minimale : ne touche que ce qui dessert l'auteur (attaque, jugement, "jamais"/"toujours", agressivité). Garde ses mots, sa voix, son niveau de langue, son tu/vous. Longueur proche de l'original. Naturel, jamais lisse.
   Principes, à ne jamais nommer : un fait précis plutôt qu'un jugement ; parler de soi plutôt que de l'autre ; une demande à laquelle on peut dire oui ; s'en prendre au problème, pas à la personne.

N'emploie jamais les mots : coaching, médiation, communication non violente, bienveillance, thérapie, émotion.`;

export default function App() {
  const [msgs, setMsgs] = useState(CONVERSATION);
  const [input, setInput] = useState("");
  const [etat, setEtat] = useState("vide");   // vide|attente|flux|prop|ok|pression|danger|erreur
  const [flux, setFlux] = useState("");        // texte en cours de réception
  const [gestes, setGestes] = useState(0);
  const [ms, setMs] = useState(null);
  const [vh, setVh] = useState(null);
  const reqId = useRef(0); const dernier = useRef(""); const msgsRef = useRef(msgs);
  const filRef = useRef(null);

  useEffect(() => { msgsRef.current = msgs; }, [msgs]);

  useEffect(() => {
    const vv = window.visualViewport; if (!vv) return;
    const maj = () => setVh(vv.height);
    maj(); vv.addEventListener("resize", maj); vv.addEventListener("scroll", maj);
    return () => { vv.removeEventListener("resize", maj); vv.removeEventListener("scroll", maj); };
  }, []);

  useEffect(() => { if (filRef.current) filRef.current.scrollTop = filRef.current.scrollHeight; }, [msgs]);

  useEffect(() => {
    const t = input.trim();
    if (t.length < 8) { setEtat("vide"); setFlux(""); dernier.current = ""; return; }
    if (t === dernier.current) return;
    const timer = setTimeout(() => lancer(t), 550);
    return () => clearTimeout(timer);
  }, [input]);

  async function lancer(t) {
    const id = ++reqId.current;
    setEtat("attente"); setFlux("");
    const t0 = performance.now();
    const ctl = new AbortController();
    const expire = setTimeout(() => ctl.abort(), 20000);
    try {
      const contexte = msgsRef.current.slice(-3).map(m => (m.de === "moi" ? "Moi" : "L'autre") + " : " + m.t).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 400, stream: true, system: SYSTEME,
          messages: [{ role: "user", content: `Contexte :\n${contexte}\n\nMessage en cours :\n"""${t}"""` }],
        }),
      });

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let tampon = "", acc = "", premier = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (id !== reqId.current) { reader.cancel(); return; }
        tampon += dec.decode(value, { stream: true });
        const lignes = tampon.split("\n");
        tampon = lignes.pop() || "";
        for (const l of lignes) {
          if (!l.startsWith("data:")) continue;
          const brut = l.slice(5).trim();
          if (!brut || brut === "[DONE]") continue;
          let ev; try { ev = JSON.parse(brut); } catch { continue; }
          const bout = ev?.delta?.text;
          if (!bout) continue;
          acc += bout;
          const net = acc.trim();

          // Détection des réponses courtes dès les premiers caractères
          if (net.startsWith("OK")) { setEtat("ok"); setMs(Math.round(performance.now() - t0)); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (net.startsWith("STOP_PRESSION")) { setEtat("pression"); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (net.startsWith("STOP_DANGER")) { setEtat("danger"); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (net.length && !"OKSTOP_".startsWith(net.slice(0, Math.min(3, net.length)).toUpperCase())) {
            if (premier) { setEtat("flux"); setMs(Math.round(performance.now() - t0)); premier = false; }
            setFlux(net);
          }
        }
      }
      if (id !== reqId.current) return;
      const fin = acc.trim();
      dernier.current = t;
      if (!fin || fin === "OK") setEtat("ok");
      else { setFlux(fin); setEtat("prop"); }
    } catch {
      if (id === reqId.current) setEtat("erreur");   // dernier.current inchangé → reprise possible
    } finally { clearTimeout(expire); }
  }

  function adopter() {
    if (!flux) return;
    setInput(flux); dernier.current = flux.trim(); setEtat("ok"); setFlux("");
    setGestes(g => g + 1);
  }
  function envoyer() {
    const t = input.trim(); if (!t) return;
    setMsgs(m => [...m, { de: "moi", t }]);
    setInput(""); setFlux(""); setEtat("vide"); dernier.current = "";
  }

  const hauteur = vh ? `${vh}px` : "100svh";

  return (
    <div style={{ height: hauteur, maxHeight: hauteur, overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column",
      fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes pop { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce){ .an{animation:none!important} }
      `}</style>

      <div style={{ flexShrink: 0, background: "#1A2421", color: "#fff", padding: "8px 12px", fontSize: 11.5, display: "flex", justifyContent: "space-between" }}>
        <span style={{ opacity: .75 }}>Simulation · Camille</span>
        <span style={{ opacity: .55 }}>{gestes ? `${gestes} adoption${gestes > 1 ? "s" : ""}` : ""}{ms ? ` · ${(ms / 1000).toFixed(1)} s` : ""}</span>
      </div>

      <div ref={filRef} style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 7 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.de === "moi" ? "flex-end" : "flex-start", maxWidth: "84%",
            background: m.de === "moi" ? C.moi : C.eux, borderRadius: 13,
            borderBottomRightRadius: m.de === "moi" ? 4 : 13, borderBottomLeftRadius: m.de === "moi" ? 13 : 4,
            padding: "8px 11px", fontSize: 14.5, lineHeight: 1.45, boxShadow: "0 1px 1px rgba(0,0,0,.06)" }}>{m.t}</div>
        ))}
      </div>

      {/* ===== BARRE — un état explicite en permanence ===== */}
      <div style={{ flexShrink: 0, background: "#E8EAE9", borderTop: "1px solid #CFD6D3", padding: "6px 8px" }} aria-live="polite">
        <div style={{ background: "#fff", borderRadius: 9, minHeight: 44, padding: "7px 9px", display: "flex", alignItems: "center", gap: 8 }}>
          <Logo />
          <div style={{ flex: 1, minWidth: 0 }}>
            {etat === "vide" && <Etat texte="Je relis au fil de l'eau." couleur={C.faint} />}
            {etat === "attente" && <span className="an" style={{ fontSize: 12.5, color: C.faint, animation: "pulse 1s infinite" }}>je relis…</span>}
            {etat === "ok" && <Etat texte="✓  Rien à signaler — c'est envoyable tel quel." couleur={C.accent} gras />}
            {etat === "pression" && <Etat texte="Message non réécrit : il fait pression sur quelqu'un." couleur={C.warn} />}
            {etat === "danger" && <Etat texte="Cela dépasse une question de formulation — 3919 · 3114 · 17" couleur={C.warn} />}
            {etat === "erreur" && <Etat texte="Relecture indisponible — modifiez un mot pour réessayer." couleur={C.warn} />}
            {(etat === "flux" || etat === "prop") && (
              <button onClick={adopter} disabled={etat === "flux"} className="an"
                style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: C.accentSoft, color: C.ink,
                  borderRadius: 6, padding: "7px 9px", fontSize: 13.5, lineHeight: 1.4, fontFamily: "inherit",
                  cursor: etat === "prop" ? "pointer" : "default", animation: "pop .18s ease both" }}>
                {flux}{etat === "flux" && <span style={{ opacity: .45 }}>▌</span>}
                <span style={{ display: "block", fontSize: 10, color: C.accent, fontWeight: 600, marginTop: 2 }}>
                  {etat === "prop" ? "Toucher pour remplacer" : "…"}
                </span>
              </button>
            )}
          </div>
          <span style={{ fontSize: 14, color: C.faint, flexShrink: 0 }}>🌐</span>
        </div>
      </div>

      <div style={{ flexShrink: 0, background: "#F6F6F6", borderTop: `1px solid ${C.line}`, padding: "7px 9px 9px" }}>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={1}
            placeholder="Répondez à Camille, à chaud…"
            style={{ flex: 1, resize: "none", height: 38, maxHeight: 90, background: "#fff", border: `1px solid ${C.line}`,
              borderRadius: 19, padding: "9px 13px", fontSize: 15, lineHeight: 1.3, fontFamily: "inherit", color: C.ink }} />
          <button onClick={envoyer} disabled={!input.trim()}
            style={{ width: 38, height: 38, flexShrink: 0, border: "none", borderRadius: 999, background: input.trim() ? "#25D366" : "#C8D2CF", color: "#fff", fontSize: 16, cursor: input.trim() ? "pointer" : "default" }}>↑</button>
        </div>
      </div>
    </div>
  );
}

function Etat({ texte, couleur, gras }) {
  return <span style={{ fontSize: 12.5, color: couleur, fontWeight: gras ? 600 : 400, lineHeight: 1.35 }}>{texte}</span>;
}
function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 100 100" style={{ flexShrink: 0 }} aria-hidden="true">
      <circle cx="39" cy="50" r="21" fill="#C45642" opacity="0.88" />
      <circle cx="61" cy="50" r="21" fill="#1F6E5A" opacity="0.88" />
    </svg>
  );
}
