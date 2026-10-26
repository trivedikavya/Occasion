"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

interface MicButtonProps {
  /** Called with the finalized transcript chunk to append to the target field. */
  onTranscript: (text: string) => void;
  className?: string;
  label?: string;
}

/**
 * Small mic button using the browser's built-in Web Speech API — feature
 * detected and rendered as nothing when unsupported (e.g. Firefox). This is
 * independent of, and does not replace, any external system-wide dictation
 * tool the user may already have running; it simply appends what it hears to
 * the target textarea, same as typing would.
 */
export function MicButton({ onTranscript, className, label = "Dictate" }: MicButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function start() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) transcript += result[0].transcript;
      }
      if (transcript.trim()) onTranscript(transcript.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : start())}
      aria-pressed={listening}
      aria-label={listening ? `Stop ${label.toLowerCase()}` : `Start ${label.toLowerCase()}`}
      title={listening ? "Listening... click to stop" : "Dictate with your microphone"}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
        listening
          ? "animate-pulse border-danger/40 bg-danger/10 text-danger"
          : "border-border text-muted hover:text-foreground",
        className
      )}
    >
      {listening ? <Square size={11} /> : <Mic size={14} />}
    </button>
  );
}
