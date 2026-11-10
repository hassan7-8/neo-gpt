"use client";

import { useEffect, useRef, useState, type FC } from "react";
import { useComposerRuntime, useMessage } from "@assistant-ui/react";
import { MicIcon, Volume2Icon, SquareIcon } from "lucide-react";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};
type RecCtor = new () => SpeechRec;

const LANGS = [
  { code: "en-US", label: "EN", name: "English" },
  { code: "ur-PK", label: "اردو", name: "Urdu" },
  { code: "hi-IN", label: "हिं", name: "Hindi (also understands spoken Urdu)" },
] as const;

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone is blocked. Click the lock icon next to the web address, allow Microphone, then try again.",
  "service-not-allowed": "This browser blocked voice typing. Try Chrome or Edge.",
  "no-speech": "I didn't hear anything. Tap the mic and speak again.",
  "audio-capture": "No microphone was found on this device.",
  network: "Voice typing needs an internet connection. Check it and try again.",
  "language-not-supported": "This browser can't do voice typing in that language. Try Chrome, or switch the language button.",
};

/** Speak instead of typing. Works in browsers that support speech recognition (Chrome, Edge, Android). */
export const MicButton: FC = () => {
  const composer = useComposerRuntime();
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState<(typeof LANGS)[number]["code"]>("en-US");
  const [problem, setProblem] = useState("");
  const rec = useRef<SpeechRec | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
    setSupported(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    return () => rec.current?.stop();
  }, []);

  if (!supported) return null;

  function toggle() {
    if (listening) return rec.current?.stop();
    setProblem("");
    const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
    const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as RecCtor;
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = false;
    r.continuous = false;
    const base = composer.getState().text;
    r.onresult = (e) => {
      const text = Array.from(e.results).map((x) => x[0].transcript).join(" ").trim();
      composer.setText(base ? `${base} ${text}` : text);
    };
    r.onend = () => setListening(false);
    r.onerror = (e) => {
      setListening(false);
      setProblem(ERRORS[e.error ?? ""] ?? "Voice typing didn't work. Please try again.");
    };
    rec.current = r;
    setListening(true);
    r.start();
  }

  const next = () => {
    const i = LANGS.findIndex((l) => l.code === lang);
    return LANGS[(i + 1) % LANGS.length].code;
  };

  return (
    <>
    <span className="my-2.5 mr-1 inline-flex items-center gap-1">
      <button
        type="button"
        aria-pressed={listening}
        onClick={toggle}
        title={listening ? "Listening… tap to stop" : "Speak your message"}
        className={`press inline-flex size-9 items-center justify-center rounded-xl ring-1 transition-colors ${
          listening ? "bg-mint text-ink ring-gold-deep/40 anim-ring" : "bg-paper text-ink/70 ring-ink/10 hover:text-ink"
        }`}
      >
        <MicIcon className="size-4" />
        <span className="sr-only">Voice input</span>
      </button>
      <button
        type="button"
        onClick={() => setLang(next())}
        title={`Voice language: ${LANGS.find((l) => l.code === lang)?.name}. Tap to change.`}
        className="press text-ink/60 hover:text-ink h-9 rounded-lg px-1.5 text-xs font-semibold"
      >
        {LANGS.find((l) => l.code === lang)?.label}
      </button>
    </span>
    {problem && (
      <span role="alert" className="basis-full px-2 pb-2 text-xs text-red-600">
        {problem}
      </span>
    )}
    </>
  );
};

/** Reads an assistant reply out loud (Urdu is detected automatically). */
export const SpeakButton: FC = () => {
  const text = useMessage((m) =>
    m.content
      .map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
      .join(" ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/[*#`>_~]/g, "")
      .trim(),
  );
  const [speaking, setSpeaking] = useState(false);
  const [ok, setOk] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setOk("speechSynthesis" in window);
    window.speechSynthesis?.getVoices(); // starts loading the voice list
    return () => window.speechSynthesis?.cancel();
  }, []);

  if (!ok || !text) return null;
  return (
    <>
    <button
      type="button"
      title={speaking ? "Stop" : "Read aloud"}
      onClick={() => {
        const synth = window.speechSynthesis;
        if (speaking) {
          synth.cancel();
          return setSpeaking(false);
        }
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const lang = /[\u0600-\u06FF]/.test(text) ? "ur-PK" : "en-US";
        const voices = synth.getVoices();
        const voice =
          voices.find((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase()) ??
          voices.find((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
        if (lang === "ur-PK" && !voice) {
          setNote("No Urdu voice on this device. Windows: Settings > Time & language > Speech > Add voices > Urdu. Edge also has free Urdu voices.");
          setTimeout(() => setNote(""), 8000);
          return;
        }
        setNote("");
        if (voice) u.voice = voice;
        u.lang = voice?.lang ?? lang;
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        synth.speak(u);
      }}
      className="hover:bg-muted inline-flex size-6 items-center justify-center rounded-md p-1"
    >
      {speaking ? <SquareIcon className="size-4" /> : <Volume2Icon className="size-4" />}
      <span className="sr-only">Read aloud</span>
    </button>
    {note && <span role="alert" className="text-coral ml-2 max-w-xs text-xs">{note}</span>}
    </>
  );
};
