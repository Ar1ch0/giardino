import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, X, Camera, Mic, Square, Check, PawPrint, Volume2, Loader2, LogOut, ArrowLeft, ZoomIn } from "lucide-react";
import { supabase, MEDIA_BUCKET, isSupabaseConfigured } from "./supabaseClient";

const STYLE = `
  .gs-root {
    --moss-light: #EAF2DE;
    --moss-mid: #B9D6A3;
    --moss-deep: #33502F;
    --sun: #F4B93E;
    --coral: #E8613C;
    --soil: #5C4030;
    --ink: #213021;
    --paper: #FFFDF6;
    background: var(--moss-light);
    background-image:
      radial-gradient(circle at 10% 20%, rgba(185,214,163,0.5) 0, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(244,185,62,0.25) 0, transparent 45%);
    min-height: 100%;
    width: 100%;
    color: var(--ink);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 28px 20px 60px;
    box-sizing: border-box;
  }
  .gs-heading {
    font-family: "Arial Rounded MT Bold", "Helvetica Rounded", -apple-system, sans-serif;
  }
  .gs-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
    flex-wrap: wrap;
  }
  .gs-title {
    font-size: 34px;
    font-weight: 800;
    color: var(--moss-deep);
    margin: 0;
    letter-spacing: -0.5px;
  }
  .gs-sub {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--soil);
    max-width: 380px;
    line-height: 1.4;
  }
  .gs-add-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--coral);
    color: white;
    border: none;
    border-radius: 999px;
    padding: 12px 20px 12px 16px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 0 #b74225;
    transition: transform 0.08s ease;
  }
  .gs-add-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 #b74225; }
  .gs-add-btn:disabled { background: #d9c9bd; box-shadow: none; cursor: not-allowed; }

  .gs-garden {
    position: relative;
    width: 100%;
    min-height: 440px;
    border-radius: 26px;
    overflow: hidden;
    background:
      radial-gradient(circle at 20% 15%, rgba(255,255,255,0.35) 0, transparent 30%),
      linear-gradient(180deg, #C7E3A6 0%, #A9D186 55%, #93C56F 100%);
    box-shadow: inset 0 0 0 2px rgba(51,80,47,0.12), 0 8px 20px rgba(33,48,33,0.15);
  }
  .gs-garden::before, .gs-garden::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    background: rgba(51,80,47,0.10);
  }
  .gs-garden::before { width: 130px; height: 30px; left: -20px; bottom: 40px; }
  .gs-garden::after { width: 180px; height: 36px; right: -30px; bottom: 90px; }

  .gs-tuft {
    position: absolute;
    width: 26px;
    height: 14px;
    background: rgba(51,80,47,0.16);
    border-radius: 50% 50% 0 0;
  }

  .gs-empty-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--moss-deep);
    text-align: center;
    padding: 20px;
  }
  .gs-empty-inner svg { opacity: 0.55; }
  .gs-empty-inner p { margin: 10px 0 0; font-size: 14.5px; max-width: 220px; }

  .gs-sprite {
    position: absolute;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transform: translate(-50%, -50%);
    transition: left 2.4s cubic-bezier(.45,.05,.55,.95), top 2.4s cubic-bezier(.45,.05,.55,.95);
    width: 84px;
  }
  .gs-sprite-flip { transition: transform 0.25s ease; }
  .gs-sprite-shadow {
    width: 56px;
    height: 12px;
    background: rgba(33,48,33,0.28);
    border-radius: 50%;
    margin: 0 auto;
    filter: blur(1px);
  }
  .gs-sprite-body {
    position: relative;
    width: 84px;
    height: 84px;
    margin-bottom: 2px;
  }
  .gs-sprite-body.walking { animation: gsBob 0.42s ease-in-out infinite; }
  .gs-sprite-body.idle { animation: gsBreatheCirc 3.6s ease-in-out infinite; }
  @keyframes gsBob {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-7px) rotate(-2deg); }
  }
  @keyframes gsBreatheCirc {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.035); }
  }

  .gs-photo-circle {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid var(--paper);
    box-shadow: 0 4px 10px rgba(33,48,33,0.3);
    background: var(--moss-mid);
  }
  .gs-photo-circle img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .gs-sprite-name {
    text-align: center;
    font-size: 11.5px;
    font-weight: 800;
    color: var(--moss-deep);
    background: rgba(255,253,246,0.85);
    border-radius: 999px;
    padding: 2px 9px;
    white-space: nowrap;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 auto;
    display: block;
    width: fit-content;
  }

  .gs-overlay {
    position: fixed; inset: 0;
    background: rgba(33,48,33,0.55);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    z-index: 50;
  }
  .gs-modal {
    background: var(--paper);
    border-radius: 20px;
    padding: 24px;
    width: 100%;
    max-width: 420px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }
  .gs-modal-close {
    position: absolute; top: 14px; right: 14px;
    background: var(--moss-light);
    border: none; border-radius: 50%;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--moss-deep);
    z-index: 2;
  }
  .gs-step-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .gs-back-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px;
    border-radius: 50%;
    border: none;
    background: var(--moss-light);
    color: var(--moss-deep);
    cursor: pointer;
    flex-shrink: 0;
  }
  .gs-step-title {
    font-size: 19px;
    font-weight: 800;
    color: var(--moss-deep);
    margin: 0;
  }
  .gs-step-desc {
    font-size: 13.5px;
    color: var(--soil);
    margin: 6px 0 16px;
    line-height: 1.4;
  }
  .gs-upload-box {
    position: relative;
    display: flex;
    flex-direction: column;
    align-content: center;
    align-items: center;
    border: 2px dashed var(--moss-mid);
    border-radius: 16px;
    padding: 30px 16px;
    text-align: center;
    cursor: pointer;
    color: var(--moss-deep);
    background: var(--moss-light);
  }
  .gs-upload-box input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .gs-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--moss-light);
    color: var(--moss-deep);
    font-size: 12.5px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 999px;
    margin-bottom: 14px;
  }

  .gs-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1.5px solid var(--moss-mid);
    font-size: 15px;
    margin-bottom: 14px;
    background: white;
    color: var(--ink);
  }
  .gs-input:focus { outline: 2px solid var(--coral); }

  .gs-record-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .gs-mic-btn {
    display: flex; align-items: center; gap: 8px;
    border: none;
    border-radius: 999px;
    padding: 10px 16px;
    font-weight: 700;
    font-size: 13.5px;
    cursor: pointer;
    color: white;
    background: var(--moss-deep);
  }
  .gs-mic-btn.recording { background: var(--coral); }
  .gs-mini-note { font-size: 12px; color: var(--soil); }

  .gs-primary-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--coral);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 13px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    margin-top: 4px;
  }
  .gs-primary-btn:disabled { background: #d9c9bd; cursor: not-allowed; }
  .gs-secondary-btn {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--soil);
    font-size: 13.5px;
    padding: 10px;
    cursor: pointer;
    text-decoration: underline;
  }

  .gs-config-banner {
    background: #FFF3CD;
    border: 1px solid #F0D48A;
    color: #6B5A1E;
    font-size: 12.5px;
    padding: 10px 14px;
    border-radius: 12px;
    margin-bottom: 16px;
    line-height: 1.4;
  }
  .gs-saving-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 26px;
    z-index: 5;
  }
  .gs-spin { animation: gsSpin 0.8s linear infinite; }
  @keyframes gsSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .gs-login-wrap {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .gs-login-card {
    background: var(--paper);
    border-radius: 20px;
    padding: 32px 26px;
    max-width: 340px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 8px 20px rgba(33,48,33,0.15);
  }

  .gs-logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: none;
    background: var(--paper);
    color: var(--soil);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(33,48,33,0.15);
  }

  /* --- Ritaglio foto --- */
  .gs-crop-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    overflow: hidden;
    background: #1c2a1a;
    touch-action: none;
    cursor: grab;
    user-select: none;
  }
  .gs-crop-frame img {
    position: absolute;
    left: 0;
    top: 0;
    max-width: none;
    pointer-events: none;
  }
  .gs-crop-zoom-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 14px 0 18px;
    color: var(--moss-deep);
  }
  .gs-crop-zoom-row input[type="range"] {
    flex: 1;
    accent-color: var(--coral);
  }

  /* --- Vassoio decorazioni (drag & drop) --- */
  .gs-decorate-photo {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 16px;
    overflow: hidden;
    background: var(--moss-mid);
    touch-action: none;
  }
  .gs-decorate-photo img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
  .gs-tray-section { margin-top: 16px; }
  .gs-tray-label {
    font-size: 12px;
    font-weight: 800;
    color: var(--moss-deep);
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .gs-tray {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .gs-tray-item {
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: var(--moss-light);
    border: 1.5px solid var(--moss-mid);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    touch-action: none;
  }
  .gs-tray-item-shape-eye { width: 26px; height: 26px; }
  .gs-tray-item-shape-mouth { width: 26px; height: 13px; }

  .gs-decor-wrapper {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }
  .gs-decor-wrapper.gs-decor-eye-wrapper { width: 15%; aspect-ratio: 1/1; }
  .gs-decor-wrapper.gs-decor-mouth-wrapper { width: 22%; aspect-ratio: 3/1; }

  .gs-decor-eye {
    position: relative;
    width: 100%; height: 100%;
    background: white;
    border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    box-sizing: border-box;
    animation: gsBlink 4s infinite;
  }
  .gs-decor-eye-pupil { width: 45%; height: 45%; background: #1b1b1b; border-radius: 50%; }
  @keyframes gsBlink {
    0%, 92%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  .gs-decor-eye-sonno { border-radius: 50% / 35%; }
  .gs-decor-eye-sonno .gs-decor-eye-pupil { width: 55%; height: 30%; border-radius: 50%; }
  .gs-decor-eye-stella .gs-decor-eye-pupil {
    background: #1b1b1b;
    width: 68%; height: 68%; border-radius: 0;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  }
  .gs-decor-eye-matto .gs-decor-eye-pupil {
    width: 30%; height: 30%;
    margin-left: 28%; margin-top: -18%;
    background: #c0392b;
  }

  .gs-decor-mouth {
    width: 100%; height: 100%;
    background: #3a1414;
    border-radius: 50%;
    transition: transform 0.12s ease;
  }
  .gs-decor-mouth.talking { animation: gsFlap 0.28s ease-in-out infinite; }
  @keyframes gsFlap {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(3.2); }
  }
  .gs-decor-mouth-sorriso {
    border-radius: 0 0 100% 100% / 0 0 100% 100%;
    height: 65%;
    margin-top: 17%;
  }
  .gs-decor-mouth-becco {
    background: var(--coral);
    border-radius: 0;
    clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
  }
  .gs-decor-mouth-zanne {
    position: relative;
    border-radius: 50%;
  }
  .gs-decor-mouth-zanne::before, .gs-decor-mouth-zanne::after {
    content: "";
    position: absolute;
    top: -35%;
    width: 22%; height: 55%;
    background: white;
    clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
  }
  .gs-decor-mouth-zanne::before { left: 14%; }
  .gs-decor-mouth-zanne::after { right: 14%; }

  .gs-decor-ghost {
    position: fixed;
    width: 46px; height: 46px;
    pointer-events: none;
    z-index: 200;
    opacity: 0.9;
    transform: translate(-50%, -50%);
  }

  .gs-remove-hint {
    font-size: 11.5px;
    color: var(--soil);
    text-align: center;
    margin-top: 8px;
  }
`;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// In produzione si può fotografare solo dal vivo (fotocamera forzata).
// In sviluppo si può anche scegliere una foto già salvata, per testare comodamente.
//   VITE_DEV_MODE=true   -> permette di scegliere dalla libreria (per i test)
//   assente o "false"    -> forza la fotocamera (comportamento di gioco reale)
const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

const EYE_STYLES = [
  { id: "tondo", label: "Tondo" },
  { id: "sonno", label: "Assonnato" },
  { id: "stella", label: "A stella" },
  { id: "matto", label: "Pazzo" },
];
const MOUTH_STYLES = [
  { id: "ovale", label: "Ovale" },
  { id: "sorriso", label: "Sorriso" },
  { id: "becco", label: "Becco" },
  { id: "zanne", label: "Zanne" },
];

const CROP_SIZE = 320;
const OUTPUT_SIZE = 900;

async function uploadToStorage(path, blob) {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function DecorShape({ kind, style, talking }) {
  if (kind === "eye") {
    return (
      <div className={`gs-decor-eye gs-decor-eye-${style}`}>
        <div className="gs-decor-eye-pupil" />
      </div>
    );
  }
  return <div className={`gs-decor-mouth gs-decor-mouth-${style}${talking ? " talking" : ""}`} />;
}

function LoginScreen() {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signupDone, setSignupDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else if (!data.session) {
        setSignupDone(true);
      }
    }
  };

  return (
    <div className="gs-login-wrap">
      <div className="gs-login-card">
        <PawPrint size={34} style={{ color: "var(--moss-deep)" }} />
        <h1 className="gs-title gs-heading" style={{ fontSize: 26, marginTop: 10 }}>
          Giardino Selvatico
        </h1>

        {signupDone ? (
          <p className="gs-step-desc" style={{ textAlign: "center" }}>
            Account creato. Il progetto richiede ancora la conferma via email: controlla
            la posta, poi torna qui e accedi con email e password.
          </p>
        ) : (
          <>
            <p className="gs-step-desc" style={{ textAlign: "center" }}>
              {mode === "signin" ? "Accedi al tuo giardino." : "Crea un account nuovo."}
            </p>
            <form onSubmit={submit} style={{ width: "100%" }}>
              <input
                className="gs-input"
                type="email"
                required
                placeholder="tuaemail@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                className="gs-input"
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              <button className="gs-primary-btn" type="submit" disabled={loading}>
                <Check size={17} />
                {loading ? "Un attimo…" : mode === "signin" ? "Accedi" : "Registrati"}
              </button>
            </form>
            {error && (
              <p className="gs-mini-note" style={{ color: "var(--coral)", marginTop: 8 }}>
                {error}
              </p>
            )}
            <button
              className="gs-secondary-btn"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
            >
              {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AnimalSprite({ animal }) {
  const [talking, setTalking] = useState(false);
  const audioRef = useRef(null);

  const handleTap = (e) => {
    e.stopPropagation();
    setTalking(true);
    if (animal.audioUrl) {
      if (!audioRef.current) audioRef.current = new Audio(animal.audioUrl);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      audioRef.current.onended = () => setTalking(false);
    } else {
      setTimeout(() => setTalking(false), 1300);
    }
  };

  return (
    <button
      className="gs-sprite"
      style={{ left: `${animal.x}%`, top: `${animal.y}%` }}
      onClick={handleTap}
    >
      <div className="gs-sprite-flip" style={{ transform: `scaleX(${animal.facing})` }}>
        <div className={`gs-sprite-body ${animal.walking ? "walking" : "idle"}`}>
          <div className="gs-photo-circle">
            <img src={animal.photo} alt={animal.name} />
            {(animal.decorations || []).map((d) => (
              <div
                key={d.id}
                className={`gs-decor-wrapper gs-decor-${d.kind}-wrapper`}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                <DecorShape kind={d.kind} style={d.style} talking={d.kind === "mouth" && talking} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="gs-sprite-shadow" />
      <span className="gs-sprite-name">{animal.name}</span>
    </button>
  );
}

export default function GiardinoSelvatico() {
  const configured = isSupabaseConfigured();

  const [session, setSession] = useState(undefined);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState("photo"); // photo | crop | decorate | details
  const [draftPhotoFile, setDraftPhotoFile] = useState(null);
  const [draftPhotoPreview, setDraftPhotoPreview] = useState(null);
  const [draftDecorations, setDraftDecorations] = useState([]);
  const [draftName, setDraftName] = useState("");
  const [draftAudioBlob, setDraftAudioBlob] = useState(null);
  const [draftAudioPreviewUrl, setDraftAudioPreviewUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [micUnsupported, setMicUnsupported] = useState(false);

  // ritaglio
  const [cropNatural, setCropNatural] = useState({ w: 0, h: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const cropImgRef = useRef(null);
  const cropDragRef = useRef(null);

  // trascinamento decorazioni
  const [dragging, setDragging] = useState(null); // { kind, style, x, y }
  const decoratePhotoRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!configured || !session?.user) {
      if (!session) setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });
      if (error) {
        setLoadError(true);
      } else {
        setAnimals(
          (data || []).map((row) => ({
            id: row.id,
            name: row.name,
            photo: row.photo_url,
            decorations: row.decorations || [],
            audioUrl: row.audio_url,
            x: 15 + Math.random() * 65,
            y: 25 + Math.random() * 45,
            facing: Math.random() > 0.5 ? 1 : -1,
            walking: false,
          }))
        );
      }
      setLoading(false);
    })();
  }, [configured, session]);

  useEffect(() => {
    const WALK_DURATION = 2400;
    const interval = setInterval(() => {
      setAnimals((prev) =>
        prev.map((a) => {
          if (a.walking) return a;
          if (Math.random() < 0.4) {
            const dx = Math.random() * 46 - 23;
            const dy = Math.random() * 30 - 15;
            const newX = clamp(a.x + dx, 10, 88);
            const newY = clamp(a.y + dy, 18, 82);
            const facing = dx < -1 ? -1 : dx > 1 ? 1 : a.facing;
            const id = a.id;
            setTimeout(() => {
              setAnimals((p2) => p2.map((b) => (b.id === id ? { ...b, walking: false } : b)));
            }, WALK_DURATION);
            return { ...a, x: newX, y: newY, facing, walking: true };
          }
          return a;
        })
      );
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // --- trascinamento decorazioni dal vassoio alla foto ---
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const p = e.touches ? e.touches[0] : e;
      setDragging((d) => d && { ...d, x: p.clientX, y: p.clientY });
    };
    const onUp = (e) => {
      const p = e.changedTouches ? e.changedTouches[0] : e;
      const rect = decoratePhotoRef.current?.getBoundingClientRect();
      if (rect && p.clientX >= rect.left && p.clientX <= rect.right && p.clientY >= rect.top && p.clientY <= rect.bottom) {
        const xPct = ((p.clientX - rect.left) / rect.width) * 100;
        const yPct = ((p.clientY - rect.top) / rect.height) * 100;
        setDraftDecorations((prev) => [
          ...prev,
          { id: crypto.randomUUID(), kind: dragging.kind, style: dragging.style, x: xPct, y: yPct },
        ]);
      }
      setDragging(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging]);

  const startDrag = (kind, style, e) => {
    e.preventDefault();
    setDragging({ kind, style, x: e.clientX, y: e.clientY });
  };

  const removeDecoration = (id) => {
    setDraftDecorations((prev) => prev.filter((d) => d.id !== id));
  };

  const resetDraft = () => {
    setStep("photo");
    setDraftPhotoFile(null);
    setDraftPhotoPreview(null);
    setDraftDecorations([]);
    setDraftName("");
    setDraftAudioBlob(null);
    setDraftAudioPreviewUrl(null);
    setRecording(false);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropNatural({ w: 0, h: 0 });
  };

  const openModal = () => {
    resetDraft();
    setModalOpen(true);
  };
  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    resetDraft();
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDraftPhotoPreview(reader.result);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setStep("crop");
    };
    reader.readAsDataURL(file);
  };

  // --- logica di ritaglio ---
  const baseScale = () => {
    const { w, h } = cropNatural;
    if (!w || !h) return 1;
    return Math.max(CROP_SIZE / w, CROP_SIZE / h);
  };

  const clampCropOffset = (offset, totalScale) => {
    const displayW = cropNatural.w * totalScale;
    const displayH = cropNatural.h * totalScale;
    const minX = CROP_SIZE - displayW;
    const minY = CROP_SIZE - displayH;
    return { x: clamp(offset.x, minX, 0), y: clamp(offset.y, minY, 0) };
  };

  const onCropImgLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setCropNatural({ w, h });
    const scale = Math.max(CROP_SIZE / w, CROP_SIZE / h);
    setCropOffset({ x: (CROP_SIZE - w * scale) / 2, y: (CROP_SIZE - h * scale) / 2 });
  };

  const onCropZoomChange = (val) => {
    const zoom = Number(val);
    setCropZoom(zoom);
    const totalScale = baseScale() * zoom;
    setCropOffset((prev) => clampCropOffset(prev, totalScale));
  };

  const onCropPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    cropDragRef.current = { startX: e.clientX, startY: e.clientY, startOffset: cropOffset };
  };
  const onCropPointerMove = (e) => {
    if (!cropDragRef.current) return;
    const dx = e.clientX - cropDragRef.current.startX;
    const dy = e.clientY - cropDragRef.current.startY;
    const totalScale = baseScale() * cropZoom;
    const next = clampCropOffset(
      { x: cropDragRef.current.startOffset.x + dx, y: cropDragRef.current.startOffset.y + dy },
      totalScale
    );
    setCropOffset(next);
  };
  const onCropPointerUp = () => {
    cropDragRef.current = null;
  };

  const confirmCrop = () => {
    const totalScale = baseScale() * cropZoom;
    const sx = -cropOffset.x / totalScale;
    const sy = -cropOffset.y / totalScale;
    const sSize = CROP_SIZE / totalScale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(cropImgRef.current, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "foto.jpg", { type: "image/jpeg" });
        setDraftPhotoFile(file);
        setDraftPhotoPreview(canvas.toDataURL("image/jpeg", 0.9));
        setStep("decorate");
      },
      "image/jpeg",
      0.9
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setDraftAudioBlob(blob);
        setDraftAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setMicUnsupported(true);
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
    setRecording(false);
  };
  const handleAudioFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setDraftAudioBlob(file);
    setDraftAudioPreviewUrl(URL.createObjectURL(file));
  };

  const hasEye = draftDecorations.some((d) => d.kind === "eye");
  const hasMouth = draftDecorations.some((d) => d.kind === "mouth");

  const addAnimal = async () => {
    if (!draftPhotoFile || !hasEye || !hasMouth || !session?.user) return;
    setSaving(true);
    try {
      const userId = session.user.id;
      const id = crypto.randomUUID();
      const photoUrl = await uploadToStorage(`${userId}/${id}-photo.jpg`, draftPhotoFile);

      let audioUrl = null;
      if (draftAudioBlob) {
        audioUrl = await uploadToStorage(`${userId}/${id}-audio.webm`, draftAudioBlob);
      }

      const decorations = draftDecorations.map(({ kind, style, x, y }) => ({ kind, style, x, y }));

      const row = {
        id,
        user_id: userId,
        name: draftName.trim() || "Senza nome",
        photo_url: photoUrl,
        decorations,
        audio_url: audioUrl,
      };

      const { error } = await supabase.from("animals").insert(row);
      if (error) throw error;

      setAnimals((prev) => [
        ...prev,
        {
          id,
          name: row.name,
          photo: photoUrl,
          decorations,
          audioUrl,
          x: 15 + Math.random() * 65,
          y: 25 + Math.random() * 45,
          facing: Math.random() > 0.5 ? 1 : -1,
          walking: false,
        },
      ]);
      setModalOpen(false);
      resetDraft();
    } catch (err) {
      alert("Errore nel salvataggio: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (configured && session === undefined) {
    return (
      <div className="gs-root">
        <style>{STYLE}</style>
        <div className="gs-empty-inner" style={{ position: "static", padding: "80px 0" }}>
          <Loader2 size={30} className="gs-spin" />
        </div>
      </div>
    );
  }

  if (configured && !session) {
    return (
      <div className="gs-root">
        <style>{STYLE}</style>
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="gs-root">
      <style>{STYLE}</style>

      <div className="gs-header">
        <div>
          <h1 className="gs-title gs-heading">Giardino Selvatico</h1>
          <p className="gs-sub">
            Fotografa un animale, dagli vita e un verso tutto suo. Resterà nel tuo
            giardino anche se chiudi la pagina.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="gs-add-btn" onClick={openModal} disabled={!configured}>
            <Plus size={18} /> Aggiungi animale
          </button>
          {configured && session?.user && (
            <button
              className="gs-logout-btn"
              onClick={() => supabase.auth.signOut()}
              title={session.user.email}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      {!configured && (
        <div className="gs-config-banner">
          Supabase non è ancora configurato: crea un file <code>.env</code> con
          <code> VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> per
          attivare il salvataggio. Fino ad allora il giardino resta vuoto.
        </div>
      )}
      {loadError && (
        <div className="gs-config-banner">
          Non riesco a leggere i dati salvati: controlla la configurazione di Supabase.
        </div>
      )}

      <div className="gs-garden">
        <div className="gs-tuft" style={{ left: "6%", bottom: "10%" }} />
        <div className="gs-tuft" style={{ left: "18%", bottom: "6%" }} />
        <div className="gs-tuft" style={{ right: "10%", bottom: "14%" }} />
        <div className="gs-tuft" style={{ right: "22%", bottom: "5%" }} />

        {loading && (
          <div className="gs-empty-inner">
            <Loader2 size={30} className="gs-spin" />
            <p>Carico il tuo giardino…</p>
          </div>
        )}

        {!loading && animals.length === 0 && (
          <div className="gs-empty-inner">
            <PawPrint size={40} strokeWidth={1.5} />
            <p>Il giardino è vuoto. Aggiungi il tuo primo animale e guardalo girare!</p>
          </div>
        )}

        {animals.map((a) => (
          <AnimalSprite key={a.id} animal={a} />
        ))}
      </div>

      {modalOpen && (
        <div className="gs-overlay" onClick={closeModal}>
          <div className="gs-modal" onClick={(e) => e.stopPropagation()}>
            {saving && (
              <div className="gs-saving-overlay">
                <Loader2 size={26} className="gs-spin" />
              </div>
            )}
            <button className="gs-modal-close" onClick={closeModal}>
              <X size={16} />
            </button>

            {step === "photo" && (
              <>
                <h2 className="gs-step-title gs-heading">Scatta o carica</h2>
                <p className="gs-step-desc">
                  Scegli la foto dell'animale che vuoi portare nel giardino.
                </p>
                <label className="gs-upload-box">
                  <Camera size={26} style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 700 }}>
                    {DEV_MODE ? "Tocca per scegliere una foto" : "Tocca per scattare una foto"}
                  </div>
                  {DEV_MODE ? (
                    <input type="file" accept="image/*" onChange={handleFile} />
                  ) : (
                    <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
                  )}
                </label>
                {DEV_MODE && (
                  <p className="gs-mini-note" style={{ marginTop: 8 }}>
                    Modalità sviluppo attiva: puoi scegliere anche dalla libreria foto.
                  </p>
                )}
              </>
            )}

            {step === "crop" && draftPhotoPreview && (
              <>
                <div className="gs-step-head">
                  <button className="gs-back-btn" onClick={() => setStep("photo")}>
                    <ArrowLeft size={16} />
                  </button>
                  <h2 className="gs-step-title gs-heading">Ritaglia la foto</h2>
                </div>
                <p className="gs-step-desc">
                  Trascina per spostare, usa lo slider per ingrandire. L'animale userà
                  questa inquadratura quadrata.
                </p>
                <div
                  className="gs-crop-frame"
                  onPointerDown={onCropPointerDown}
                  onPointerMove={onCropPointerMove}
                  onPointerUp={onCropPointerUp}
                >
                  <img
                    ref={cropImgRef}
                    src={draftPhotoPreview}
                    alt="da ritagliare"
                    crossOrigin="anonymous"
                    onLoad={onCropImgLoad}
                    style={{
                      width: cropNatural.w ? `${cropNatural.w * baseScale() * cropZoom}px` : "auto",
                      height: cropNatural.h ? `${cropNatural.h * baseScale() * cropZoom}px` : "auto",
                      transform: `translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                    }}
                  />
                </div>
                <div className="gs-crop-zoom-row">
                  <ZoomIn size={18} />
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.01"
                    value={cropZoom}
                    onChange={(e) => onCropZoomChange(e.target.value)}
                  />
                </div>
                <button className="gs-primary-btn" onClick={confirmCrop}>
                  <Check size={17} /> Continua
                </button>
              </>
            )}

            {step === "decorate" && draftPhotoPreview && (
              <>
                <div className="gs-step-head">
                  <button className="gs-back-btn" onClick={() => setStep("crop")}>
                    <ArrowLeft size={16} />
                  </button>
                  <h2 className="gs-step-title gs-heading">Occhi e bocca</h2>
                </div>
                <p className="gs-step-desc">
                  Trascina occhi e bocca sulla foto, uno alla volta, dove vuoi tu. Tocca
                  un elemento già posizionato per toglierlo.
                </p>

                <div className="gs-decorate-photo" ref={decoratePhotoRef}>
                  <img src={draftPhotoPreview} alt="anteprima" />
                  {draftDecorations.map((d) => (
                    <div
                      key={d.id}
                      className={`gs-decor-wrapper gs-decor-${d.kind}-wrapper`}
                      style={{ left: `${d.x}%`, top: `${d.y}%` }}
                      onClick={() => removeDecoration(d.id)}
                      title="Tocca per rimuovere"
                    >
                      <DecorShape kind={d.kind} style={d.style} />
                    </div>
                  ))}
                </div>

                <div className="gs-tray-section">
                  <p className="gs-tray-label">Occhi</p>
                  <div className="gs-tray">
                    {EYE_STYLES.map((s) => (
                      <div
                        key={s.id}
                        className="gs-tray-item"
                        onPointerDown={(e) => startDrag("eye", s.id, e)}
                        title={s.label}
                      >
                        <div className="gs-tray-item-shape-eye" style={{ width: "100%", height: "100%" }}>
                          <DecorShape kind="eye" style={s.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="gs-tray-section">
                  <p className="gs-tray-label">Bocca</p>
                  <div className="gs-tray">
                    {MOUTH_STYLES.map((s) => (
                      <div
                        key={s.id}
                        className="gs-tray-item"
                        onPointerDown={(e) => startDrag("mouth", s.id, e)}
                        title={s.label}
                      >
                        <div style={{ width: "70%", height: "45%" }}>
                          <DecorShape kind="mouth" style={s.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="gs-primary-btn"
                  style={{ marginTop: 18 }}
                  onClick={() => setStep("details")}
                  disabled={!hasEye || !hasMouth}
                >
                  <Check size={17} /> Continua
                </button>
                {(!hasEye || !hasMouth) && (
                  <p className="gs-remove-hint">Aggiungi almeno un occhio e una bocca per continuare.</p>
                )}
              </>
            )}

            {step === "details" && (
              <>
                <div className="gs-step-head">
                  <button className="gs-back-btn" onClick={() => setStep("decorate")}>
                    <ArrowLeft size={16} />
                  </button>
                  <h2 className="gs-step-title gs-heading">Nome e verso</h2>
                </div>
                <p className="gs-step-desc">Dagli un nome e, se vuoi, registra il suo verso.</p>
                <input
                  className="gs-input"
                  placeholder="Nome dell'animale"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                />

                <div className="gs-record-row">
                  {!recording ? (
                    <button className="gs-mic-btn" onClick={startRecording}>
                      <Mic size={15} /> Registra verso
                    </button>
                  ) : (
                    <button className="gs-mic-btn recording" onClick={stopRecording}>
                      <Square size={13} /> Ferma
                    </button>
                  )}
                  {draftAudioPreviewUrl && !recording && <span className="gs-mini-note">Verso registrato ✓</span>}
                </div>

                {micUnsupported && (
                  <>
                    <p className="gs-mini-note" style={{ marginBottom: 8 }}>
                      Microfono non disponibile qui: carica un file audio.
                    </p>
                    <label className="gs-upload-box" style={{ padding: 16, marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>Carica audio</div>
                      <input type="file" accept="audio/*" onChange={handleAudioFile} />
                    </label>
                  </>
                )}

                <button className="gs-primary-btn" onClick={addAnimal} disabled={saving}>
                  <Check size={17} /> {saving ? "Salvataggio…" : "Aggiungi al giardino"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {dragging && (
        <div className="gs-decor-ghost" style={{ left: dragging.x, top: dragging.y }}>
          <DecorShape kind={dragging.kind} style={dragging.style} />
        </div>
      )}
    </div>
  );
}