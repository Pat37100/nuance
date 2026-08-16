import React, { useState, useRef, useEffect } from "react";

/* v6 — corrections audit n°2
   R1  interface neutralisée (une seule couleur d'accent, pas de badge de tension)
   2   alternatives par mot au toucher
   10  peut répondre "votre message est adapté tel quel"
   6   six techniques spécifiées dans le moteur
   3   curseur 3 crans remplacé par : proposition + "Aller plus loin" (2 postures) */

const C = {
  bg: "#F2F4F3", ink: "#1A2421", soft: "#5E6B67", faint: "#8A9591",
  accent: "#2F6F5E", accentSoft: "#E4EFEA", accentLine: "#A9CFC1",
  surface: "#FFFFFF", line: "#DDE3E1", lineStrong: "#C8D2CF",
  warn: "#8A4030", warnSoft: "#F7EBE7",
};

const TECHNIQUES = `TECHNIQUES DE REFORMULATION (à appliquer, jamais à nommer dans tes sorties) :
1. Fait précis plutôt que jugement : "tu es irrespectueux" → "tu n'as pas répondu à mes deux messages".
2. Parler de soi plutôt que de l'autre : retirer l'accusation sans retirer le fond.
3. Demande claire et négociable : remplacer le reproche implicite par une demande à laquelle on peut dire oui.
4. Chercher ce qui marche déjà : ouvrir sur une exception ou une issue concrète quand c'est pertinent.
5. Recadrage temporel : supprimer "jamais"/"toujours" au profit d'une période précise.
6. S'en prendre au problème, pas à la personne.

INTERDICTION LEXICALE ABSOLUE dans tes sorties : coaching, coach, médiation, médiateur, CNV, communication non violente, bienveillance, thérapie, développement personnel, "besoin profond", "travail sur soi", "émotion". Tu es un outil d'écriture, pas un accompagnement.`;

const GARDE_FOUS = `GARDE-FOUS PRIORITAIRES (priment sur tout) :
- COERCITION : menace, chantage, pression, humiliation, contrôle d'une personne (surveiller, isoler, punir, faire peur) → tu ne reformules pas. Renvoie {"blocage":"coercition"}.
- DANGER : violences, détresse vitale, idées suicidaires, menace physique → tu ne reformules pas. Renvoie {"blocage":"danger"}.`;

const SP_ECRIRE = `Tu es un assistant d'écriture pour messages délicats.
${TECHNIQUES}
${GARDE_FOUS}

MESSAGE DÉJÀ ADAPTÉ : si le message est déjà proportionné et n'a rien qui desserve son auteur — y compris s'il est ferme, direct ou exprime un désaccord net — tu ne l'adoucis PAS. Une personne a le droit d'être ferme. Renvoie "adapte":true avec une phrase de "note" expliquant pourquoi il fonctionne tel quel. N'invente pas de retouche pour justifier ton existence.

Sinon "adapte":false et :
- "proche" : intervention MINIMALE, en segments consécutifs qui concaténés reforment EXACTEMENT le texte retouché. Sur chaque segment modifié ("c":true), fournis "alt" : 2 variantes d'intensité différente pour ce seul passage (une plus douce, une plus directe), qui s'insèrent grammaticalement à la place du segment. Sur les segments inchangés, "c":false et pas de "alt".
- "ouvert" : version qui ouvre le dialogue.
- "limite" : version qui pose clairement une limite, ferme et respectueuse.
- "note" : UNE phrase factuelle sur l'ajustement fait ("Le reproche général devient un fait daté"). Concret, jamais moralisateur.

Garde la voix, le niveau de langue et le registre (tu/vous) de l'auteur. Reste naturel, jamais lisse ni corporate. N'invente aucun fait.
JSON strict sans markdown : {"blocage":null,"adapte":false,"proche":[{"t":"...","c":false}],"ouvert":"...","limite":"...","note":"..."}`;

const SP_RECEVOIR = `Tu es un assistant d'écriture pour messages délicats.
${TECHNIQUES}
${GARDE_FOUS}
On te donne un message REÇU. Tu produis :
- "reponse_ouverte" : projet de réponse qui ouvre le dialogue.
- "reponse_limite" : projet de réponse qui pose une limite, ferme et respectueux.
- "lecture" : 2 phrases maximum sur ce que l'expéditeur cherche peut-être à dire. Formulé en HYPOTHÈSE ("il se peut que"), jamais en diagnostic, sans vocabulaire psychologisant.
- "angle_mort" : une phrase sur ce qui pourrait envenimer la réponse.
Respecte tu/vous. N'invente aucun fait.
JSON strict sans markdown : {"blocage":null,"reponse_ouverte":"...","reponse_limite":"...","lecture":"...","angle_mort":"..."}`;

async function callAPI(system, content) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1400, system, messages: [{ role: "user", content }] }),
  });
  const data = await res.json();
  const out = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").replace(/```json|```/g, "").trim();
  return JSON.parse(out);
}

export default function App() {
  const [mode, setMode] = useState("ecrire");
  const [detail, setDetail] = useState(false);

  const [rawE, setRawE] = useState(""); const [resE, setResE] = useState(null); const [stE, setStE] = useState("idle");
  const [segs, setSegs] = useState([]);          // segments éditables (alternatives par mot)
  const [open, setOpen] = useState(null);        // index du segment ouvert
  const [plus, setPlus] = useState(null);        // "ouvert" | "limite" | null
  const idE = useRef(0); const keyE = useRef("");

  const [rawR, setRawR] = useState(""); const [resR, setResR] = useState(null); const [stR, setStR] = useState("idle");
  const [ton, setTon] = useState("reponse_ouverte"); const [voirLecture, setVoirLecture] = useState(false);
  const idR = useRef(0); const keyR = useRef("");

  const [copied, setCopied] = useState("");

  useEffect(() => {
    const t = rawE.trim();
    if (t.length < 12 || t === keyE.current) return;
    const timer = setTimeout(async () => {
      keyE.current = t; const id = ++idE.current; setStE("loading");
      try {
        const p = await callAPI(SP_ECRIRE, `"""${t}"""`);
        if (id !== idE.current) return;
        setResE(p); setStE("done"); setPlus(null); setOpen(null);
        setSegs(p.proche ? p.proche.map((s) => ({ ...s, orig: s.t })) : []);
      } catch { if (id === idE.current) setStE("error"); }
    }, 1400);
    return () => clearTimeout(timer);
  }, [rawE]);

  useEffect(() => {
    const t = rawR.trim();
    if (t.length < 12 || t === keyR.current) return;
    const timer = setTimeout(async () => {
      keyR.current = t; const id = ++idR.current; setStR("loading"); setVoirLecture(false);
      try { const p = await callAPI(SP_RECEVOIR, `Message reçu :\n"""${t}"""`); if (id === idR.current) { setResR(p); setStR("done"); } }
      catch { if (id === idR.current) setStR("error"); }
    }, 1400);
    return () => clearTimeout(timer);
  }, [rawR]);

  function choisir(i, texte) {
    setSegs((prev) => prev.map((s, k) => (k === i ? { ...s, t: texte } : s)));
    setOpen(null); setCopied("");
  }
  function copy(text, key) { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1800); }

  const texteProche = segs.map((s) => s.t).join("");
  const texteFinal = plus ? resE?.[plus] : texteProche;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        textarea::placeholder { color: ${C.faint}; }
        @media (prefers-reduced-motion: reduce){ .rise,.dot{animation:none!important} }
      `}</style>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 20px 60px" }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', ui-serif, Georgia, serif", fontWeight: 500, fontSize: 27, letterSpacing: "-0.01em", margin: 0, color: C.ink }}>Nuance</h1>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.soft }}>Dire les choses avec justesse.</p>
          </div>
          <button onClick={() => setDetail((v) => !v)} aria-pressed={detail}
            style={{ border: `1px solid ${detail ? C.accent : C.line}`, background: detail ? C.accentSoft : "transparent", color: detail ? C.accent : C.soft, borderRadius: 8, padding: "6px 11px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Détails
          </button>
        </header>

        <div style={{ display: "flex", borderBottom: `1px solid ${C.line}`, marginBottom: 18 }}>
          {[{ id: "ecrire", label: "J'écris" }, { id: "recevoir", label: "Je reçois" }].map((m) => {
            const on = mode === m.id;
            return <button key={m.id} onClick={() => setMode(m.id)}
              style={{ flex: 1, border: "none", background: "none", padding: "10px 0 11px", color: on ? C.ink : C.faint, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                borderBottom: on ? `2px solid ${C.accent}` : "2px solid transparent", marginBottom: -1 }}>{m.label}</button>;
          })}
        </div>

        {/* ============ J'ÉCRIS ============ */}
        {mode === "ecrire" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.soft }}>Votre message</label>
              {stE === "loading" && <span className="dot" style={{ fontSize: 11.5, color: C.faint, animation: "pulse 1.2s infinite" }}>relecture…</span>}
            </div>
            <textarea value={rawE} onChange={(e) => setRawE(e.target.value)} rows={3} placeholder="Écrivez-le tel qu'il vient."
              style={{ width: "100%", resize: "vertical", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 14px", fontSize: 15.5, lineHeight: 1.5, color: C.ink, fontFamily: "inherit" }} />

            <div style={{ height: 18 }} />

            {resE?.blocage ? <Blocage type={resE.blocage} />
            : resE?.adapte ? (
              /* Constat 10 : le message est déjà adapté, on ne touche à rien */
              <div className="rise" style={{ background: C.surface, border: `1px solid ${C.accentLine}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 10, padding: "16px", animation: "rise .35s ease both" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.accent }}>Votre message est adapté tel quel.</p>
                <p style={{ margin: "7px 0 0", fontSize: 14, lineHeight: 1.55, color: C.soft }}>{resE.note}</p>
                <button onClick={() => copy(rawE.trim(), "adapte")}
                  style={{ width: "100%", marginTop: 14, border: `1px solid ${C.lineStrong}`, borderRadius: 8, background: "transparent", color: C.ink, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {copied === "adapte" ? "Copié ✓" : "Copier mon message"}
                </button>
              </div>
            ) : resE ? (
              <div className="rise" style={{ animation: "rise .35s ease both" }}>
                <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.soft, marginBottom: 10 }}>
                    {plus === "ouvert" ? "Version qui ouvre" : plus === "limite" ? "Version qui pose une limite" : "Proposition"}
                  </div>

                  <p style={{ margin: 0, fontFamily: "'Fraunces', ui-serif, Georgia, serif", fontSize: 17.5, lineHeight: 1.65 }}>
                    {plus ? resE[plus] : segs.map((s, i) =>
                      s.c ? (
                        <button key={i} onClick={() => setOpen(open === i ? null : i)}
                          style={{ border: "none", background: open === i ? C.accent : C.accentSoft, color: open === i ? "#fff" : C.accent,
                            font: "inherit", padding: "1px 3px", borderRadius: 4, cursor: "pointer",
                            borderBottom: open === i ? "none" : `1.5px solid ${C.accentLine}` }}>
                          {s.t}
                        </button>
                      ) : <span key={i}>{s.t}</span>
                    )}
                  </p>

                  {/* Alternatives du passage touché */}
                  {!plus && open !== null && segs[open]?.alt && (
                    <div className="rise" style={{ marginTop: 12, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px", animation: "rise .2s ease both" }}>
                      <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 7 }}>Autres formulations pour ce passage</div>
                      {[segs[open].orig, ...segs[open].alt].map((a, k) => (
                        <button key={k} onClick={() => choisir(open, a)}
                          style={{ display: "block", width: "100%", textAlign: "left", border: `1px solid ${a === segs[open].t ? C.accent : C.line}`,
                            background: a === segs[open].t ? C.accentSoft : C.surface, color: C.ink, borderRadius: 6, padding: "9px 11px",
                            fontSize: 14.5, marginBottom: 6, cursor: "pointer", fontFamily: "'Fraunces', ui-serif, Georgia, serif", lineHeight: 1.4 }}>
                          {a}
                        </button>
                      ))}
                    </div>
                  )}

                  {!plus && <p style={{ margin: "11px 0 0", fontSize: 11.5, color: C.faint }}>Touchez un passage surligné pour le doser autrement.</p>}
                  {detail && resE.note && !plus && <div style={{ marginTop: 11, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{resE.note}</div>}

                  <button onClick={() => copy(texteFinal, "e")}
                    style={{ width: "100%", marginTop: 14, border: "none", borderRadius: 8, background: C.accent, color: "#fff", padding: "12px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {copied === "e" ? "Copié ✓" : "Copier"}
                  </button>
                </div>

                {/* Aller plus loin : deux postures, replié par défaut */}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {[{ id: "ouvert", label: "Ouvrir davantage" }, { id: "limite", label: "Poser une limite" }].map((v) => {
                    const on = plus === v.id;
                    return <button key={v.id} onClick={() => { setPlus(on ? null : v.id); setCopied(""); setOpen(null); }}
                      style={{ flex: 1, border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 8, background: on ? C.accentSoft : "transparent",
                        color: on ? C.accent : C.soft, padding: "10px 6px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {v.label}
                    </button>;
                  })}
                </div>
                {plus && <button onClick={() => { setPlus(null); setCopied(""); }}
                  style={{ width: "100%", marginTop: 8, border: "none", background: "none", color: C.faint, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "6px" }}>
                  ← Revenir à la proposition
                </button>}
              </div>
            ) : <Vide text={stE === "error" ? "La relecture n'a pas abouti. Continuez d'écrire." : "La proposition apparaîtra ici."} />}
          </>
        )}

        {/* ============ JE REÇOIS ============ */}
        {mode === "recevoir" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.soft }}>Message reçu</label>
              {stR === "loading" && <span className="dot" style={{ fontSize: 11.5, color: C.faint, animation: "pulse 1.2s infinite" }}>préparation…</span>}
            </div>
            <textarea value={rawR} onChange={(e) => setRawR(e.target.value)} rows={3} placeholder="Collez le message que vous avez reçu."
              style={{ width: "100%", resize: "vertical", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 14px", fontSize: 15.5, lineHeight: 1.5, color: C.ink, fontFamily: "inherit" }} />

            <div style={{ height: 18 }} />

            {resR?.blocage ? <Blocage type={resR.blocage} />
            : resR ? (
              <div className="rise" style={{ animation: "rise .35s ease both" }}>
                <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.soft, marginBottom: 10 }}>Réponse possible</div>
                  <p style={{ margin: 0, fontFamily: "'Fraunces', ui-serif, Georgia, serif", fontSize: 17.5, lineHeight: 1.65 }}>{resR[ton]}</p>
                  {detail && resR.angle_mort && <div style={{ marginTop: 11, paddingTop: 10, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{resR.angle_mort}</div>}
                  <button onClick={() => copy(resR[ton], "r")}
                    style={{ width: "100%", marginTop: 14, border: "none", borderRadius: 8, background: C.accent, color: "#fff", padding: "12px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    {copied === "r" ? "Copié ✓" : "Copier"}
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {[{ id: "reponse_ouverte", label: "Ouvrir" }, { id: "reponse_limite", label: "Poser une limite" }].map((v) => {
                    const on = ton === v.id;
                    return <button key={v.id} onClick={() => { setTon(v.id); setCopied(""); }}
                      style={{ flex: 1, border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 8, background: on ? C.accentSoft : "transparent",
                        color: on ? C.accent : C.soft, padding: "10px 6px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{v.label}</button>;
                  })}
                </div>

                <button onClick={() => setVoirLecture((v) => !v)}
                  style={{ width: "100%", marginTop: 10, border: "none", background: "none", color: C.faint, padding: "9px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {voirLecture ? "Masquer l'autre côté" : "L'autre côté →"}
                </button>
                {voirLecture && (
                  <div className="rise" style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px", animation: "rise .25s ease both" }}>
                    <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{resR.lecture}</p>
                    <p style={{ margin: "9px 0 0", fontSize: 11, color: C.faint, fontStyle: "italic" }}>Hypothèse à partir d'un seul message. Vous seul connaissez le contexte.</p>
                  </div>
                )}
              </div>
            ) : <Vide text={stR === "error" ? "La préparation n'a pas abouti. Réessayez." : "Une réponse possible apparaîtra ici."} />}
          </>
        )}

        <p style={{ marginTop: 30, fontSize: 11, color: C.faint, textAlign: "center" }}>Prototype · rien n'est enregistré</p>
      </div>
    </div>
  );
}

function Blocage({ type }) {
  const danger = type === "danger";
  return (
    <div style={{ background: C.warnSoft, border: `1px solid #E5CDC5`, borderLeft: `3px solid ${C.warn}`, borderRadius: 10, padding: "16px" }}>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, fontWeight: 600, color: C.warn }}>
        {danger ? "Ce message évoque une situation qui dépasse une question de formulation."
                : "Nuance ne reformule pas ce type de message."}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55, color: C.soft }}>
        {danger
          ? "Des personnes sont là pour en parler, gratuitement et à toute heure : 3919 (violences), 3114 (souffrance psychique), 17 en cas d'urgence."
          : "Rendre plus présentable un message qui fait pression sur quelqu'un ne réglerait rien."}
      </p>
    </div>
  );
}
function Vide({ text }) {
  return <div style={{ border: `1px dashed ${C.line}`, borderRadius: 10, padding: "22px 16px", textAlign: "center", color: C.faint, fontSize: 13.5 }}>{text}</div>;
}
