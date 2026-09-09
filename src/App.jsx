import React, { useState, useRef, useCallback, useEffect } from "react";
import { Plus, X, Camera, Mic, Square, Check, PawPrint, Volume2, Loader2 } from "lucide-react";
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

  .gs-eye {
    position: absolute;
    width: 15%;
    aspect-ratio: 1/1;
    background: white;
    border-radius: 50%;
    border: 1.5px solid rgba(0,0,0,0.3);
    transform: translate(-50%, -50%);
    display: flex; align-items: center; justify-content: center;
    animation: gsBlink 4s infinite;
  }
  .gs-eye::after {
    content: "";
    width: 45%; height: 45%;
    background: #1b1b1b;
    border-radius: 50%;
  }
  @keyframes gsBlink {
    0%, 92%, 100% { transform: translate(-50%, -50%) scaleY(1); }
    95% { transform: translate(-50%, -50%) scaleY(0.1); }
  }

  .gs-mouth {
    position: absolute;
    width: 22%;
    height: 7%;
    background: #3a1414;
    border-radius: 50%;
    transform: translate(-50%, -50%) scaleY(1);
    transition: transform 0.12s ease;
  }
  .gs-mouth.talking { animation: gsFlap 0.28s ease-in-out infinite; }
  @keyframes gsFlap {
    0%, 100% { transform: translate(-50%, -50%) scaleY(1); }
    50% { transform: translate(-50%, -50%) scaleY(3.2); }
  }

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
    max-width: 400px;
    max-height: 88vh;
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
  }
  .gs-step-title {
    font-size: 19px;
    font-weight: 800;
    color: var(--moss-deep);
    margin: 0 0 4px;
  }
  .gs-step-desc {
    font-size: 13.5px;
    color: var(--soil);
    margin: 0 0 16px;
    line-height: 1.4;
  }
  .gs-upload-box {
    border: 2px dashed var(--moss-mid);
    border-radius: 16px;
    padding: 30px 16px;
    text-align: center;
    cursor: pointer;
    color: var(--moss-deep);
    background: var(--moss-light);
  }
  .gs-upload-box input { display: none; }

  .gs-tap-photo {
    position: relative;
    width: 100%;
    aspect-ratio: 1/1;
    border-radius: 14px;
    overflow: hidden;
    cursor: crosshair;
    background: var(--moss-mid);
  }
  .gs-tap-photo img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .gs-marker {
    position: absolute;
    width: 22px; height: 22px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    border: 2.5px solid white;
    box-shadow: 0 0 0 1.5px var(--ink);
  }
  .gs-marker.eyes { background: var(--sun); }
  .gs-marker.mouth { background: var(--coral); }

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
`;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function getDeviceId() {
  try {
    let id = localStorage.getItem("gs_device_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("gs_device_id", id);
    }
    return id;
  } catch (e) {
    // localStorage non disponibile (es. anteprima in ambiente sandbox):
    // usa un id in memoria valido solo per la sessione corrente.
    if (!window.__gsDeviceId) window.__gsDeviceId = crypto.randomUUID();
    return window.__gsDeviceId;
  }
}

async function urlToBlob(url) {
  const res = await fetch(url);
  return res.blob();
}

async function uploadToStorage(path, blob) {
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function AnimalSprite({ animal, onTap }) {
  const [talking, setTalking] = useState(false);
  const audioRef = useRef(null);

  const handleTap = (e) => {
    e.stopPropagation();
    setTalking(true);
    onTap && onTap();
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
            <div className="gs-eye" style={{ left: `${animal.eyes.x - 7}%`, top: `${animal.eyes.y}%` }} />
            <div className="gs-eye" style={{ left: `${animal.eyes.x + 7}%`, top: `${animal.eyes.y}%` }} />
            <div
              className={`gs-mouth${talking ? " talking" : ""}`}
              style={{ left: `${animal.mouth.x}%`, top: `${animal.mouth.y}%` }}
            />
          </div>
        </div>
      </div>
      <div className="gs-sprite-shadow" />
      <span className="gs-sprite-name" style={{ transform: `scaleX(${animal.facing})` }}>
        {animal.name}
      </span>
    </button>
  );
}

export default function GiardinoSelvatico() {
  const deviceId = useRef(getDeviceId()).current;
  const configured = isSupabaseConfigured();

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState("photo");
  const [pointStage, setPointStage] = useState("eyes");
  const [draftPhotoFile, setDraftPhotoFile] = useState(null);
  const [draftPhotoPreview, setDraftPhotoPreview] = useState(null);
  const [draftEyes, setDraftEyes] = useState(null);
  const [draftMouth, setDraftMouth] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftAudioBlob, setDraftAudioBlob] = useState(null);
  const [draftAudioPreviewUrl, setDraftAudioPreviewUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [micUnsupported, setMicUnsupported] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Carica gli animali salvati per questo dispositivo/utente
  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: true });
      if (error) {
        setLoadError(true);
      } else {
        setAnimals(
          (data || []).map((row) => ({
            id: row.id,
            name: row.name,
            photo: row.photo_url,
            eyes: { x: Number(row.eyes_x), y: Number(row.eyes_y) },
            mouth: { x: Number(row.mouth_x), y: Number(row.mouth_y) },
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
  }, [configured, deviceId]);

  // Movimento autonomo (solo visuale, non salvato)
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

  const resetDraft = () => {
    setStep("photo");
    setPointStage("eyes");
    setDraftPhotoFile(null);
    setDraftPhotoPreview(null);
    setDraftEyes(null);
    setDraftMouth(null);
    setDraftName("");
    setDraftAudioBlob(null);
    setDraftAudioPreviewUrl(null);
    setRecording(false);
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
    setDraftPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setDraftPhotoPreview(reader.result);
      setStep("points");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoTap = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (pointStage === "eyes") {
        setDraftEyes({ x, y });
        setPointStage("mouth");
      } else {
        setDraftMouth({ x, y });
      }
    },
    [pointStage]
  );

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

  const addAnimal = async () => {
    if (!draftPhotoFile || !draftEyes || !draftMouth) return;
    setSaving(true);
    try {
      const id = crypto.randomUUID();
      const photoUrl = await uploadToStorage(`${deviceId}/${id}-photo.jpg`, draftPhotoFile);

      let audioUrl = null;
      if (draftAudioBlob) {
        audioUrl = await uploadToStorage(`${deviceId}/${id}-audio.webm`, draftAudioBlob);
      }

      const row = {
        id,
        device_id: deviceId,
        name: draftName.trim() || "Senza nome",
        photo_url: photoUrl,
        eyes_x: draftEyes.x,
        eyes_y: draftEyes.y,
        mouth_x: draftMouth.x,
        mouth_y: draftMouth.y,
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
          eyes: draftEyes,
          mouth: draftMouth,
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
        <button className="gs-add-btn" onClick={openModal} disabled={!configured}>
          <Plus size={18} /> Aggiungi animale
        </button>
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
                  <div style={{ fontWeight: 700 }}>Tocca per scegliere una foto</div>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFile} />
                </label>
              </>
            )}

            {step === "points" && draftPhotoPreview && (
              <>
                <span className="gs-badge">{pointStage === "eyes" ? "Passo 1 di 2" : "Passo 2 di 2"}</span>
                <h2 className="gs-step-title gs-heading">
                  {pointStage === "eyes" ? "Dove sono gli occhi?" : "Dove è la bocca?"}
                </h2>
                <p className="gs-step-desc">
                  {pointStage === "eyes"
                    ? "Tocca la foto nel punto tra i due occhi."
                    : "Ora tocca il punto della bocca. Più è grottesco, meglio è."}
                </p>
                <div className="gs-tap-photo" onClick={handlePhotoTap}>
                  <img src={draftPhotoPreview} alt="anteprima" />
                  {draftEyes && (
                    <div className="gs-marker eyes" style={{ left: `${draftEyes.x}%`, top: `${draftEyes.y}%` }} />
                  )}
                  {draftMouth && (
                    <div className="gs-marker mouth" style={{ left: `${draftMouth.x}%`, top: `${draftMouth.y}%` }} />
                  )}
                </div>
                {draftEyes && draftMouth && (
                  <button className="gs-primary-btn" style={{ marginTop: 16 }} onClick={() => setStep("details")}>
                    <Check size={17} /> Continua
                  </button>
                )}
              </>
            )}

            {step === "details" && (
              <>
                <h2 className="gs-step-title gs-heading">Nome e verso</h2>
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
                <button className="gs-secondary-btn" onClick={() => setStep("points")} disabled={saving}>
                  Torna indietro
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}