"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import useUser from "@/lib/authClient";
import { VoicePoweredOrb } from "./VoicePoweredOrb";

const Chatbot = ({ selectedFund }) => {
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  
  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Speech Recognition Setup ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN";
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
        sendMessage(transcript);
      };

      rec.onend = () => setIsRecording(false);
      rec.onerror = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      stopAudio();
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // ── Text to Speech Logic ──────────────────────────────────────────────────
  const speakText = async (text) => {
    if (!isVoiceEnabled || !text) return;
    
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: "en" })
      });
      
      if (!res.ok) throw new Error("TTS failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      }
    } catch (err) {
      console.error("Audio error:", err);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, loading, isOpen]);

  const sendMessage = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setAgentStatus("Analyzing query...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          userId: user?.sub,
          lang: "en" 
        }),
      });

      if (!response.ok) throw new Error("Agent failed to respond.");

      const data = await response.json();
      const botMessage = { role: "assistant", content: data.content };
      
      setMessages((prev) => [...prev, botMessage]);
      
      if (isVoiceEnabled) {
        speakText(data.content);
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: "We encountered a technical issue. Please try your request again shortly."
      }]);
    } finally {
      setLoading(false);
      setAgentStatus("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button - Minimalist */}
      <div className="fixed bottom-10 right-10 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 bg-slate-800 text-slate-300 rounded-2xl border border-slate-700 shadow-xl hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center ${isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      {/* Immersive 80% Modal - Formal Slate Theme */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#020408]/80 backdrop-blur-sm cursor-pointer" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="relative w-full h-full max-w-[85vw] max-h-[85vh] bg-[#0a0c10] rounded-[1rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <audio ref={audioRef} style={{ display: "none" }} />

            {/* Header / Orb Section */}
            <div className="relative h-[35%] flex flex-col items-center justify-center border-b border-slate-900 bg-[#0d1117]">
              {/* Top Controls */}
              <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`p-2 rounded-lg border transition-all ${isVoiceEnabled ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-transparent border-slate-800 text-slate-600'}`}
                >
                  {isVoiceEnabled ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636L5.636 5.636M15.536 15.536L8.464 8.464" /></svg>
                  )}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-transparent border border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Minimalist Orb Container */}
              <div className="w-48 h-48 relative mb-4">
                <VoicePoweredOrb 
                  enableVoiceControl={isRecording || isSpeaking}
                  voiceSensitivity={1.8}
                  maxRotationSpeed={0.8}
                />
              </div>
              
              <div className="text-center">
                <h2 className="text-sm font-semibold text-slate-400 tracking-[0.3em] uppercase">AI Systems Agent</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">System Status: Ready</span>
                </div>
              </div>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 overflow-y-auto px-6 md:px-32 py-10 scrollbar-hide space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto">
                  <h3 className="text-2xl font-light text-slate-200 mb-10 tracking-tight">System Initialization Complete.<br/><span className="text-slate-500 text-lg">How can I assist your financial analysis?</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {[
                      { text: "Portfolio Performance Summary", q: "What's in my portfolio?" },
                      { text: "Detailed Stock Analysis", q: "Analyze TATAMOTORS.NS" },
                      { text: "Sandbox Trading Status", q: "How is my sandbox doing?" },
                      { text: "Market Trends Briefing", q: "Explain current Indian market trends" }
                    ].map((hint, i) => (
                      <button 
                        key={i}
                        onClick={() => sendMessage(hint.q)}
                        className="p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg text-left hover:bg-slate-800 transition-all group"
                      >
                        <p className="text-xs text-slate-400 group-hover:text-slate-100 font-medium">{hint.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-5 rounded-xl text-md font-normal leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-slate-800 text-slate-100 border border-slate-700 shadow-sm" 
                        : "bg-transparent text-slate-300 border border-slate-800/50"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="px-6 py-4 rounded-xl border border-slate-800/50 flex items-center gap-4">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-slate-600 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-slate-600 rounded-full animate-pulse [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-slate-600 rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">{agentStatus}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section - Minimalist */}
            <div className="p-6 md:p-8 bg-[#0d1117] border-t border-slate-900">
              <div className="max-w-3xl mx-auto flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isRecording ? "Listening..." : "Enter query or use voice input..."}
                    className="w-full bg-[#0a0c10] text-slate-200 text-sm rounded-lg py-4 px-6 border border-slate-800 focus:border-slate-600 focus:outline-none transition-all placeholder:text-slate-700"
                  />
                  <button
                    onClick={toggleRecording}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                      isRecording ? 'text-red-500 animate-pulse' : 'text-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4 m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </button>
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="px-6 py-4 bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white disabled:opacity-20 transition-all"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;