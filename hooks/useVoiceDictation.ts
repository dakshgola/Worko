"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";

export function useVoiceDictation(editor: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const startVoiceRecording = async () => {
    try {
      const response = await fetch("/api/assemblyai/token", { method: "POST" });
      if (!response.ok) throw new Error("AssemblyAI handshake failed");
      const { token } = await response.json();

      const wsUrl = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioCtx({ sampleRate: 16000 });
          audioContextRef.current = audioContext;

          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
            }
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ audio_data: Buffer.from(pcmData.buffer).toString("base64") }));
            }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);
          setIsRecording(true);
        } catch (err: any) {
          console.error("Recording setup failed:", err);
          let message = "Please grant microphone permissions to use voice transcription.";
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            try {
              const permissionStatus = await navigator.permissions.query({ name: "microphone" as any });
              if (permissionStatus.state === "denied") {
                message = "Microphone access is blocked. Please enable microphone access in your browser's site settings to use voice transcription.";
              }
            } catch (pe) {
              console.error("Permissions query error:", pe);
            }
          }
          toast.error(message);
          stopVoiceRecording();
        }
      };

      socket.onmessage = (message) => {
        const res = JSON.parse(message.data);
        if (res.text) {
          setTranscript(res.text);
          if (editor) {
            editor.chain().focus().insertContent(res.text + " ").run();
          }
        }
      };

      socket.onerror = (e) => console.error("AssemblyAI streaming error:", e);
      socket.onclose = () => stopVoiceRecording();

    } catch (err: any) {
      console.error("Recording start failed:", err);
      toast.error(err.message || "Failed to initialize microphone dictation session.");
      stopVoiceRecording();
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setTranscript("");

    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((track) => track.stop());
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  return {
    isRecording,
    transcript,
    startVoiceRecording,
    stopVoiceRecording,
  };
}
