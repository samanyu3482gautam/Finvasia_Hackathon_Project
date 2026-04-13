"use client";
import React, { useState, useEffect } from "react";

export default function FutureVisionModal({ isOpen, onClose, children }) {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Analyzing millions of possible futures…");

  useEffect(() => {
    if (!isOpen) {
      setLoading(true);
      return;
    }
    
    const interval = setInterval(() => {
      setLoadingText(prev => 
        prev === "Analyzing millions of possible futures…" 
          ? "Checking what could happen next…" 
          : "Analyzing millions of possible futures…"
      );
    }, 2000);

    const timeout = setTimeout(() => {
      setLoading(false);
      clearInterval(interval);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0b0c10] border border-cyan-800/40 rounded-2xl w-full max-w-5xl shadow-[0_0_40px_rgba(34,211,238,0.15)] overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col relative">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-[#181f31] to-[#0b0c10]">
          <h2 className="text-xl flex items-center gap-2 text-cyan-400">
            <span className="font-extrabold tracking-wide">Monte Carlo AI:</span> 
            <span className="font-medium text-gray-300">Simulating Thousands of Futures</span>
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-cyan-900/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <div className="w-14 h-14 border-4 border-purple-900/30 border-b-purple-400 rounded-full animate-spin absolute inset-3" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="text-2xl font-medium text-cyan-200 animate-pulse text-center px-4 tracking-wide">
                {loadingText}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700 w-full flex justify-center">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
