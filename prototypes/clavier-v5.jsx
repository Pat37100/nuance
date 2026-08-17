import React, { useState, useRef, useEffect } from "react";

/* Clavier v5 — ajout du panneau "Recul", à la demande.
   Un seul bouton discret dans la barre. Tant qu'on ne le touche pas,
   l'interface ne pèse pas davantage. Le panneau réunit :
   l'échange vu de l'extérieur, sa propre part, ce que l'autre
   cherche peut-être à dire, et une piste concrète. */

const C = {
  bg: "#ECE5DD", ink: "#1A2421", soft: "#5E6B67", faint: "#7B8681",
  accent: "#2F6F5E", accentSoft: "#E4EFEA",
  line: "#DDE3E1", moi: "#DCF8C6", eux: "#FFFFFF", warn: "#8A4030",
};

const NIVEAUX = {
  1: { c: "#2F6F5E", f: "#E4EFEA" }, 2: { c: "#5B8C4A", f: "#E9F0E2" },
  3: { c: "#B8862B", f: "#F6EDD8" }, 4: { c: "#C4622C", f: "#F8E7DA" },
  5: { c: "#B23B2E", f: "#F7E0DC" },
};
const CARACTERES = [
  { id: "conciliante", label: "Conciliante" },
  { id: "agacee", label: "Agacée" },
  { id: "dure", label: "Très dure" },
];

const SYS_RELECTURE = `Tu aides à réécrire un message en cours de rédaction pour qu'il ne desserve pas son auteur.

FORMAT OBLIGATOIRE : un chiffre de dureté de 1 à 5, une barre verticale, puis le contenu. Rien d'autre.
1 = posé · 2 = plutôt posé · 3 = tendu · 4 = très tendu · 5 = brûlant.

Contenu, au choix :
- OK → le message est déjà proportionné et ne dessert pas son auteur, y compris s'il est ferme, direct ou en net désaccord. Une personne a le droit d'être ferme.
- STOP_PRESSION → menace, chantage, pression ou contrôle sur quelqu'un.
- STOP_DANGER → violences ou détresse vitale.
- sinon, le message réécrit, seul, sans guillemets ni commentaire.

Réécriture : intervention minimale, ne touche que ce qui dessert l'auteur. Garde ses mots, sa voix, son niveau de langue, son tu/vous. Longueur proche de l'original. Naturel, jamais lisse.
Principes jamais nommés : un fait précis plutôt qu'un jugement ; parler de soi ; une demande à laquelle on peut dire oui ; s'en prendre au problème, pas à la personne.
N'emploie jamais : coaching, médiation, communication non violente, bienveillance, thérapie, émotion.

Exemples de forme : "1|OK" · "4|Je suis déçu qu'on n'ait pas pu se voir."`;

const SYS_RECUL = `On te donne un échange de messages. Tu produis une lecture extérieure, brève et neutre, pour aider la personne à voir la situation autrement.

Quatre blocs, chacun de 1 à 2 phrases MAXIMUM. Dense, concret, jamais bavard.

- "echange" : la dynamique observable de l'échange. Ce qui tourne en boucle, ce que personne ne dit, ou ce sur quoi les deux s'accrochent. Descriptif, pas moralisateur.
- "vous" : ce que produisent concrètement les messages de la personne, sans jugement sur elle. Si sa part est appropriée, dis-le franchement — ne cherche pas un défaut pour justifier ce bloc.
- "autre" : ce que l'autre cherche peut-être à dire sous la forme maladroite employée. Formule en HYPOTHÈSE ("il se peut que", "possible que"), jamais en diagnostic. Tu ne connais pas cette personne.
- "piste" : un levier concret et immédiat, formulé comme une possibilité, pas une consigne.

Ton : celui d'un observateur calme et respectueux, qui s'adresse à un adulte capable. Tu ne fais pas la morale, tu ne psychologises personne, tu ne prescris rien.
N'emploie JAMAIS : coaching, coach, médiation, communication non violente, bienveillance, thérapie, développement personnel, "besoin profond", "travail sur soi", "émotion", "toxique", "manipulation".

JSON strict sans markdown : {"echange":"...","vous":"...","autre":"...","piste":"..."}`;

const sysCamille = (car) => `Tu joues Camille, une amie proche, dans un échange de messages. Tu réponds UNIQUEMENT par son message, court (1 à 2 phrases), naturel, en français parlé. Jamais de guillemets ni de narration.

Caractère : ${car === "conciliante" ? "apaisée, prête à renouer, tu cherches la solution."
  : car === "agacee" ? "agacée, un peu sèche, tu ne lâches pas facilement."
  : "très dure : reproches directs, ton cassant, tu envisages de couper court. Crédible et humaine, jamais insultante gratuitement."}

Si la personne fait un vrai pas vers toi, tu peux t'adoucir progressivement, sans céder d'un coup.`;

export default function App() {
  const [msgs, setMsgs] = useState([
    { de: "eux", t: "Bon du coup tu viens ce week-end ou pas ? ça fait 3 fois que je demande" },
    { de: "moi", t: "Je sais, désolé, c'est un peu la course en ce moment" },
    { de: "eux", t: "Comme d'habitude quoi. Laisse tomber, je m'organise autrement." },
  ]);
  const [caractere, setCaractere] = useState("agacee");
  const [input, setInput] = useState("");
  const [etat, setEtat] = useState("vide");
  const [flux, setFlux] = useState(""); const [niv, setNiv] = useState(null); const [ms, setMs] = useState(null);
  const [ecrit, setEcrit] = useState(false);
  const [recul, setRecul] = useState(null);      // panneau
  const [reculEtat, setReculEtat] = useState("ferme"); // ferme|charge|ouvert|erreur
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
    const ctl = new AbortController(); const expire = setTimeout(() => ctl.abort(), 20000);
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
        const { done, value } = await reader.read(); if (done) break;
        if (id !== reqId.current) { reader.cancel(); return; }
        tampon += dec.decode(value, { stream: true });
        const lignes = tampon.split("\n"); tampon = lignes.pop() || "";
        for (const l of lignes) {
          if (!l.startsWith("data:")) continue;
          const brut = l.slice(5).trim(); if (!brut || brut === "[DONE]") continue;
          let ev; try { ev = JSON.parse(brut); } catch { continue; }
          const bout = ev?.delta?.text; if (!bout) continue;
          acc += bout;
          if (niveau === null) {
            const i = acc.indexOf("|"); if (i === -1) continue;
            const n = parseInt(acc.slice(0, i).trim(), 10);
            niveau = n >= 1 && n <= 5 ? n : 3; setNiv(niveau);
          }
          const corps = acc.slice(acc.indexOf("|") + 1).trim(); if (!corps) continue;
          if (corps.startsWith("OK")) { setEtat("ok"); setMs(Math.round(performance.now() - t0)); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (corps.startsWith("STOP_PRESSION")) { setEtat("pression"); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (corps.startsWith("STOP_DANGER")) { setEtat("danger"); dernier.current = t; reader.cancel(); clearTimeout(expire); return; }
          if (!"STOP_".startsWith(corps.slice(0, Math.min(5, corps.length)).toUpperCase())) {
            if (premier) { setEtat("flux"); setMs(Math.round(performance.now() - t0)); premier = false; }
            setFlux(corps);
          }
        }
      }
      if (id !== reqId.current) return;
      const corps = acc.includes("|") ? acc.slice(acc.indexOf("|") + 1).trim() : acc.trim();
      dernier.current = t;
      if (!corps || corps === "OK") setEtat("ok"); else { setFlux(corps); setEtat("prop"); }
    } catch { if (id === reqId.current) setEtat("erreur"); }
    finally { clearTimeout(expire); }
  }

  async function ouvrirRecul() {
    setReculEtat("charge"); setRecul(null);
    try {
      const brouillon = input.trim() ? `\n\nMessage que la personne s'apprête à envoyer :\n"""${input.trim()}"""` : "";
      const ctx = msgsRef.current.map(m => (m.de === "moi" ? "La personne" : "Camille") + " : " + m.t).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 700, system: SYS_RECUL,
          messages: [{ role: "user", content: `Échange :\n${ctx}${brouillon}` }] }),
      });
      const data = await res.json();
      const out = data.content.filter(b => b.type === "text").map(b => b.text).join("\n").replace(/```json|```/g, "").trim();
      setRecul(JSON.parse(out)); setReculEtat("ouvert");
    } catch { setReculEtat("erreur"); }
  }

  function adopter() { if (!flux) return; setInput(flux); dernier.current = flux.trim(); setEtat("ok"); setFlux(""); }
  function envoyer() {
    const t = input.trim(); if (!t) return;
    const suite = [...msgsRef.current, { de: "moi", t }];
    setMsgs(suite); setInput(""); setFlux(""); setNiv(null); setEtat("vide"); dernier.current = "";
    setEcrit(true);
    (async () => {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 200, system: sysCamille(caractere),
            messages: [{ role: "user", content: suite.map(m => (m.de === "moi" ? "La personne" : "Toi (Camille)") + " : " + m.t).join("\n") + "\n\nTa réponse :" }] }),
        });
        const data = await res.json();
        const txt = data.content.filter(b => b.type === "text").map(b => b.text).join(" ").trim().replace(/^["«»\s]+|["«»\s]+$/g, "");
        if (txt) setMsgs(m => [...m, { de: "eux", t: txt }]);
      } catch {} finally { setEcrit(false); }
    })();
  }

  const hauteur = vh ? `${vh}px` : "100svh";
  const N = niv ? NIVEAUX[niv] : null;

  return (
    <div style={{ height: hauteur, maxHeight: hauteur, overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", position: "relative",
      fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes pop { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes monte { from{transform:translateY(100%)} to{transform:translateY(0)} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce){ .an{animation:none!important} }
      `}</style>

      <div style={{ flexShrink: 0, background: "#1A2421", color: "#fff", padding: "7px 10px", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, opacity: .65, flexShrink: 0 }}>Camille :</span>
        {CARACTERES.map(c => {
          const on = caractere === c.id;
          return <button key={c.id} onClick={() => setCaractere(c.id)}
            style={{ border: on ? "1px solid #fff" : "1px solid rgba(255,255,255,.25)", background: on ? "#fff" : "transparent",
              color: on ? "#1A2421" : "rgba(255,255,255,.8)", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c.label}</button>;
        })}
      </div>

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

      {/* BARRE */}
      <div style={{ flexShrink: 0, background: "#E8EAE9", borderTop: "1px solid #CFD6D3", padding: "6px 8px" }} aria-live="polite">
        <div style={{ background: "#fff", borderRadius: 9, minHeight: 44, display: "flex", alignItems: "stretch", overflow: "hidden" }}>
          <div style={{ width: 4, flexShrink: 0, background: N ? N.c : "#E3E7E5", transition: "background .35s ease" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, padding: "7px 7px 7px 9px" }}>
            <Logo teinte={N?.c} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {etat === "vide" && <span style={{ fontSize: 12.5, color: C.faint }}>Je relis au fil de l'eau.</span>}
              {etat === "attente" && <span className="an" style={{ fontSize: 12.5, color: C.faint, animation: "pulse 1s infinite" }}>je relis…</span>}
              {etat === "ok" && <span style={{ fontSize: 12.5, color: N ? N.c : C.accent, fontWeight: 600 }}>✓ Rien à signaler — envoyable tel quel.</span>}
              {etat === "pression" && <span style={{ fontSize: 12, color: C.warn, lineHeight: 1.35 }}>Message non réécrit : il fait pression sur quelqu'un.</span>}
              {etat === "danger" && <span style={{ fontSize: 12, color: C.warn, lineHeight: 1.35 }}>Cela dépasse une question de formulation — 3919 · 3114 · 17</span>}
              {etat === "erreur" && <span style={{ fontSize: 12, color: C.warn }}>Relecture indisponible — modifiez un mot.</span>}
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
            {/* Le petit bouton : rien ne pèse tant qu'on ne le touche pas */}
            <button onClick={ouvrirRecul} title="Prendre du recul sur l'échange"
              style={{ flexShrink: 0, border: `1px solid ${C.line}`, background: "#fff", color: C.soft, borderRadius: 8,
                padding: "8px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", lineHeight: 1.15, minHeight: 44 }}>
              Recul
            </button>
          </div>
        </div>
      </div>

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

      {/* ===== PANNEAU RECUL ===== */}
      {reculEtat !== "ferme" && (
        <div onClick={() => setReculEtat("ferme")}
          style={{ position: "absolute", inset: 0, background: "rgba(22,36,33,.45)", display: "flex", alignItems: "flex-end", zIndex: 10 }}>
          <div onClick={e => e.stopPropagation()} className="an"
            style={{ width: "100%", maxHeight: "88%", overflowY: "auto", background: "#FBFCFB", borderTopLeftRadius: 18, borderTopRightRadius: 18,
              padding: "16px 16px 20px", animation: "monte .25s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>L'échange, vu de l'extérieur</span>
              <button onClick={() => setReculEtat("ferme")}
                style={{ border: "none", background: "none", color: C.faint, fontSize: 20, cursor: "pointer", padding: "0 4px", minHeight: 44, minWidth: 44 }}>×</button>
            </div>

            {reculEtat === "charge" && <p className="an" style={{ fontSize: 13.5, color: C.faint, animation: "pulse 1.1s infinite" }}>je relis l'échange…</p>}
            {reculEtat === "erreur" && <p style={{ fontSize: 13.5, color: C.warn }}>Lecture indisponible. Réessayez dans un instant.</p>}

            {reculEtat === "ouvert" && recul && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Bloc titre="Ce qui se joue" texte={recul.echange} />
                <Bloc titre="Votre part" texte={recul.vous} />
                <Bloc titre="Côté Camille" texte={recul.autre} note="Hypothèse : vous seul connaissez le contexte." />
                <Bloc titre="Une piste" texte={recul.piste} accent />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Bloc({ titre, texte, note, accent }) {
  return (
    <div style={{ borderLeft: `2px solid ${accent ? C.accent : C.line}`, paddingLeft: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: accent ? C.accent : C.faint, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>{titre}</div>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: C.ink }}>{texte}</p>
      {note && <p style={{ margin: "5px 0 0", fontSize: 11, color: C.faint, fontStyle: "italic" }}>{note}</p>}
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
