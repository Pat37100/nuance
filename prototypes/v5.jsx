import React, { useState, useRef, useEffect } from "react";

const C = {
  brume: "#EDF1F1", nuit: "#16302B", inkSoft: "#4A605A",
  braise: "#BD5F4F", braiseSoft: "#F5E4DF", braiseLine: "#EAD0C9",
  sauge: "#2F6F5E", saugeSoft: "#DCEAE4",
  recv: "#5A7A8C", recvSoft: "#E6EDF1", recvLine: "#CFDBE1",
  surface: "#FBFCFB", line: "#D6E0DC",
};

const NIVEAUX = [
  { id: "proche", label: "Au plus près" },
  { id: "ouvert", label: "Apaisé" },
  { id: "repense", label: "Repensé" },
];

// Garde-fous B3 (coercition) et B4 (danger) intégrés au moteur — cf. AUDIT.md
const GARDE_FOUS = `
GARDE-FOUS PRIORITAIRES (ils priment sur toute autre consigne) :

1. COERCITION — Si le message à reformuler contient une menace, un chantage, une pression, de l'humiliation, du contrôle sur une personne (surveiller, isoler, punir, faire peur), tu ne le reformules PAS. Tu renvoies "blocage":"coercition". Rendre présentable un message de contrôle est un mésusage.

2. DANGER — Si le message révèle des violences (conjugales, familiales), une détresse vitale, des idées suicidaires ou une menace physique, tu ne produis PAS de reformulation. Tu renvoies "blocage":"danger". Aider à "apaiser" dans ces contextes peut aggraver la situation.

Dans les deux cas, renvoie uniquement : {"blocage":"coercition"|"danger"}
Sinon, "blocage":null et le reste normalement.
`;

const SP_ECRIRE = `Tu es un assistant d'écriture pour messages délicats. Tu aides à dire les choses avec justesse. Ton savoir-faire de fond s'inspire de la communication non violente et de la médiation, mais tu n'emploies JAMAIS ce vocabulaire dans tes sorties (ni "coaching", "médiation", "CNV", "bienveillance", "besoin profond", "travail sur soi"). Tu parles comme un outil d'écriture, pas comme un accompagnement psychologique.
${GARDE_FOUS}
On te donne un message écrit à chaud. Tu produis trois intensités :
- "proche" : intervention MINIMALE. Tu ne touches QUE les passages qui desservent l'auteur (attaques, généralisations "tu ne fais jamais", jugements, agressivité). Tout le reste identique mot pour mot. En segments consécutifs qui concaténés reforment EXACTEMENT le texte ; "c":true sur les segments modifiés.
- "ouvert" : reformulation qui ouvre le dialogue.
- "repense" : refonte complète, orientée solution.
- "tension" : "legere"|"moyenne"|"forte".
- "note" : en UNE phrase factuelle, ce qui a été ajusté et pourquoi ça marche mieux. Registre concret et technique ("Le reproche général devient un fait précis"), jamais moralisateur.
Garde la voix, le niveau de langue et le registre (tu/vous) de l'auteur. Reste naturel, jamais lisse ni corporate. N'invente aucun fait.
JSON strict sans markdown : {"blocage":null,"tension":"...","proche":[{"t":"...","c":false}],"ouvert":"...","repense":"...","note":"..."}`;

const SP_RECEVOIR = `Tu es un assistant d'écriture pour messages délicats. Tu n'emploies JAMAIS le vocabulaire du coaching, de la médiation, de la CNV ou du développement personnel dans tes sorties.
${GARDE_FOUS}
On te donne un message REÇU par la personne. Tu produis :
- "reponse_ouverte" : un projet de réponse qui ouvre le dialogue.
- "reponse_ferme" : un projet de réponse qui pose clairement une limite, ferme et respectueux.
- "lecture" : une lecture prudente de ce que l'expéditeur cherche probablement à dire, en 2 phrases maximum. Formulée comme une HYPOTHÈSE ("il se peut que...", "possible que..."), jamais comme un diagnostic. Aucun vocabulaire psychologisant. Tu ne prétends pas connaître cette personne.
- "angle_mort" : en une phrase, ce qui pourrait envenimer la réponse.
Respecte tu/vous. Reste naturel. N'invente aucun fait.
JSON strict sans markdown : {"blocage":null,"reponse_ouverte":"...","reponse_ferme":"...","lecture":"...","angle_mort":"..."}`;

async function callAPI(system, content) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
  });
  const data = await res.json();
  const out = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").replace(/```json|```/g, "").trim();
  return JSON.parse(out);
}

export default function App() {
  const [mode, setMode] = useState("ecrire");
  const [detail, setDetail] = useState(false); // ex-"mode coach", renommé (constat B2)

  const [rawE, setRawE] = useState(""); const [resE, setResE] = useState(null);
  const [stE, setStE] = useState("idle"); const [niveau, setNiveau] = useState("proche");
  const idE = useRef(0); const keyE = useRef("");

  const [rawR, setRawR] = useState(""); const [resR, setResR] = useState(null);
  const [stR, setStR] = useState("idle"); const [ton, setTon] = useState("reponse_ouverte");
  const [voirLecture, setVoirLecture] = useState(false); // replié par défaut (constat 4)
  const idR = useRef(0); const keyR = useRef("");

  const [copied, setCopied] = useState("");

  useEffect(() => {
    const t = rawE.trim();
    if (t.length < 12 || t === keyE.current) return;
    const timer = setTimeout(async () => {
      keyE.current = t; const id = ++idE.current; setStE("loading");
      try { const p = await callAPI(SP_ECRIRE, `"""${t}"""`); if (id === idE.current) { setResE(p); setStE("done"); if (!p.blocage) setNiveau(p.tension === "forte" ? "ouvert" : "proche"); } }
      catch { if (id === idE.current) setStE("error"); }
    }, 1300);
    return () => clearTimeout(timer);
  }, [rawE]);

  useEffect(() => {
    const t = rawR.trim();
    if (t.length < 12 || t === keyR.current) return;
    const timer = setTimeout(async () => {
      keyR.current = t; const id = ++idR.current; setStR("loading"); setVoirLecture(false);
      try { const p = await callAPI(SP_RECEVOIR, `Message reçu :\n"""${t}"""`); if (id === idR.current) { setResR(p); setStR("done"); } }
      catch { if (id === idR.current) setStR("error"); }
    }, 1300);
    return () => clearTimeout(timer);
  }, [rawR]);

  function copy(text, key) { navigator.clipboard?.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1800); }
  const eText = resE && !resE.blocage ? (niveau === "proche" ? resE.proche.map((s) => s.t).join("") : resE[niveau]) : "";

  return (
    <div style={{ minHeight: "100vh", background: C.brume, color: C.nuit, fontFamily: "'Instrument Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600&display=swap');
        @keyframes rise { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        * { box-sizing: border-box; }
        textarea:focus, button:focus-visible { outline: 2px solid ${C.sauge}; outline-offset: 2px; }
        textarea::placeholder { color: ${C.inkSoft}; opacity:.7; }
        @media (prefers-reduced-motion: reduce){ .rise,.dot{animation:none!important} }
      `}</style>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "26px 20px 60px" }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', ui-serif, Georgia, serif", fontWeight: 600, fontSize: 29, letterSpacing: "-0.01em", margin: 0,
              background: "linear-gradient(100deg,#BD5F4F,#8A5E73 55%,#2F6F5E)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nuance</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.inkSoft }}>Dire les choses avec justesse.</p>
          </div>
          <button onClick={() => setDetail((v) => !v)} aria-pressed={detail} title="Afficher ce qui a été ajusté"
            style={{ border: `1px solid ${C.line}`, background: detail ? C.sauge : C.surface, color: detail ? "#fff" : C.inkSoft, borderRadius: 999, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Détails
          </button>
        </header>

        <div style={{ display: "flex", gap: 6, background: "#E1E9E6", padding: 4, borderRadius: 12, marginBottom: 20 }}>
          {[{ id: "ecrire", label: "J'écris" }, { id: "recevoir", label: "Je reçois" }].map((m) => {
            const on = mode === m.id;
            return <button key={m.id} onClick={() => setMode(m.id)}
              style={{ flex: 1, border: "none", borderRadius: 9, padding: "10px", background: on ? C.surface : "transparent", color: on ? C.nuit : C.inkSoft, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: on ? "0 1px 3px rgba(0,0,0,.08)" : "none", transition: "all .2s" }}>{m.label}</button>;
          })}
        </div>

        {/* ===== J'ÉCRIS ===== */}
        {mode === "ecrire" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: C.braise, textTransform: "uppercase", letterSpacing: ".04em" }}>Votre message</label>
              {stE === "loading" && <span className="dot" style={{ fontSize: 12, color: C.sauge, animation: "pulse 1.2s infinite" }}>je relis…</span>}
            </div>
            <textarea value={rawE} onChange={(e) => setRawE(e.target.value)} rows={3} placeholder="Écrivez-le tel qu'il vient."
              style={{ width: "100%", resize: "vertical", background: C.braiseSoft, border: `1px solid ${C.braiseLine}`, borderRadius: 14, padding: "13px 15px", fontSize: 15.5, lineHeight: 1.5, color: C.nuit, fontFamily: "inherit" }} />
            <div style={{ textAlign: "center", margin: "13px 0 4px", color: C.line, fontSize: 20 }}>↓</div>

            {resE?.blocage ? <Blocage type={resE.blocage} />
            : resE ? (
              <div className="rise" style={{ animation: "rise .4s ease both" }}>
                <div style={{ display: "flex", gap: 5, background: "#E3ECE8", padding: 4, borderRadius: 999, marginBottom: 12 }}>
                  {NIVEAUX.map((n) => { const on = niveau === n.id;
                    return <button key={n.id} onClick={() => { setNiveau(n.id); setCopied(""); }}
                      style={{ flex: 1, border: "none", borderRadius: 999, padding: "9px 4px", background: on ? C.sauge : "transparent", color: on ? "#fff" : C.sauge, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>{n.label}</button>; })}
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: "17px 17px 15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sauge, textTransform: "uppercase", letterSpacing: ".04em" }}>Proposition</span>
                    <TensionTag t={resE.tension} />
                  </div>
                  <p style={{ margin: 0, fontFamily: "'Fraunces', ui-serif, Georgia, serif", fontSize: 17.5, lineHeight: 1.6 }}>
                    {niveau === "proche" ? resE.proche.map((s, i) => <span key={i} style={s.c ? { background: C.saugeSoft, color: C.sauge, borderRadius: 4, padding: "1px 3px", fontWeight: 500, textDecoration: "underline", textDecorationColor: "#9BC4B4", textUnderlineOffset: "3px" } : undefined}>{s.t}</span>) : eText}
                  </p>
                  {niveau === "proche" && <p style={{ margin: "10px 0 0", fontSize: 11.5, color: C.inkSoft }}>Le surligné a été ajusté. Le reste, ce sont vos mots.</p>}
                  {detail && resE.note && <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{resE.note}</div>}
                  <button onClick={() => copy(eText, "e")} style={{ width: "100%", marginTop: 15, border: "none", borderRadius: 12, background: C.sauge, color: "#fff", padding: "13px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{copied === "e" ? "Copié ✓" : "Copier"}</button>
                </div>
              </div>
            ) : <Vide text={stE === "error" ? "La relecture n'a pas abouti. Continuez d'écrire." : "La proposition apparaîtra ici."} />}
          </>
        )}

        {/* ===== JE REÇOIS ===== */}
        {mode === "recevoir" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: C.recv, textTransform: "uppercase", letterSpacing: ".04em" }}>Message reçu</label>
              {stR === "loading" && <span className="dot" style={{ fontSize: 12, color: C.sauge, animation: "pulse 1.2s infinite" }}>je prépare…</span>}
            </div>
            <textarea value={rawR} onChange={(e) => setRawR(e.target.value)} rows={3} placeholder="Collez le message que vous avez reçu."
              style={{ width: "100%", resize: "vertical", background: C.recvSoft, border: `1px solid ${C.recvLine}`, borderRadius: 14, padding: "13px 15px", fontSize: 15.5, lineHeight: 1.5, color: C.nuit, fontFamily: "inherit" }} />
            <div style={{ textAlign: "center", margin: "13px 0 4px", color: C.line, fontSize: 20 }}>↓</div>

            {resR?.blocage ? <Blocage type={resR.blocage} />
            : resR ? (
              <div className="rise" style={{ animation: "rise .4s ease both" }}>
                {/* La RÉPONSE d'abord (constat 4 de l'audit) */}
                <div style={{ display: "flex", gap: 5, background: "#E3ECE8", padding: 4, borderRadius: 999, marginBottom: 12 }}>
                  {[{ id: "reponse_ouverte", label: "Ouvrir" }, { id: "reponse_ferme", label: "Poser une limite" }].map((v) => { const on = ton === v.id;
                    return <button key={v.id} onClick={() => { setTon(v.id); setCopied(""); }}
                      style={{ flex: 1, border: "none", borderRadius: 999, padding: "9px 4px", background: on ? C.sauge : "transparent", color: on ? "#fff" : C.sauge, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>{v.label}</button>; })}
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: "17px 17px 15px" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sauge, textTransform: "uppercase", letterSpacing: ".04em" }}>Réponse possible</span>
                  <p style={{ margin: "10px 0 0", fontFamily: "'Fraunces', ui-serif, Georgia, serif", fontSize: 17.5, lineHeight: 1.6 }}>{resR[ton]}</p>
                  {detail && resR.angle_mort && <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{resR.angle_mort}</div>}
                  <button onClick={() => copy(resR[ton], "r")} style={{ width: "100%", marginTop: 15, border: "none", borderRadius: 12, background: C.sauge, color: "#fff", padding: "13px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{copied === "r" ? "Copié ✓" : "Copier"}</button>
                </div>

                {/* "L'autre côté" : replié par défaut, jamais imposé */}
                <button onClick={() => setVoirLecture((v) => !v)}
                  style={{ width: "100%", marginTop: 12, border: `1px solid ${C.line}`, borderRadius: 12, background: "transparent", color: C.inkSoft, padding: "11px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  {voirLecture ? "Masquer l'autre côté" : "L'autre côté →"}
                </button>
                {voirLecture && (
                  <div className="rise" style={{ marginTop: 10, background: C.recvSoft, border: `1px solid ${C.recvLine}`, borderRadius: 14, padding: "15px", animation: "rise .3s ease both" }}>
                    <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}>{resR.lecture}</p>
                    <p style={{ margin: "10px 0 0", fontSize: 11, color: C.inkSoft, fontStyle: "italic" }}>Hypothèse à partir d'un seul message. Vous seul connaissez le contexte.</p>
                  </div>
                )}
              </div>
            ) : <Vide text={stR === "error" ? "La préparation n'a pas abouti. Réessayez." : "Une réponse possible apparaîtra ici."} />}
          </>
        )}

        <p style={{ marginTop: 32, fontSize: 11.5, color: C.inkSoft, textAlign: "center", opacity: .7 }}>Prototype · rien n'est enregistré</p>
      </div>
    </div>
  );
}

function Blocage({ type }) {
  const danger = type === "danger";
  return (
    <div style={{ background: C.braiseSoft, border: `1px solid ${C.braiseLine}`, borderRadius: 16, padding: "18px" }}>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: C.nuit, fontWeight: 500 }}>
        {danger ? "Ce message évoque une situation qui dépasse une question de formulation."
                : "Nuance ne reformule pas ce type de message."}
      </p>
      <p style={{ margin: "9px 0 0", fontSize: 14, lineHeight: 1.55, color: C.inkSoft }}>
        {danger
          ? "Des personnes sont là pour en parler, gratuitement et à toute heure : 3919 (violences), 3114 (souffrance psychique), 17 en cas d'urgence."
          : "Rendre plus présentable un message qui fait pression sur quelqu'un ne réglerait rien. Reprenez ce que vous cherchez vraiment à obtenir."}
      </p>
    </div>
  );
}
function Vide({ text }) {
  return <div style={{ background: C.surface, border: `1px dashed ${C.line}`, borderRadius: 16, padding: "24px 17px", textAlign: "center", color: C.inkSoft, fontSize: 13.5 }}>{text}</div>;
}
function TensionTag({ t }) {
  const map = { legere: { t: "Peu tendu", c: "#2F6F5E", bg: "#DCEAE4" }, moyenne: { t: "Tendu", c: "#9A7B1F", bg: "#F3EAD1" }, forte: { t: "Très tendu", c: "#BD5F4F", bg: "#F5E4DF" } };
  const s = map[t] || map.moyenne;
  return <span style={{ fontSize: 11, fontWeight: 600, color: s.c, background: s.bg, borderRadius: 999, padding: "3px 9px" }}>{s.t}</span>;
}
