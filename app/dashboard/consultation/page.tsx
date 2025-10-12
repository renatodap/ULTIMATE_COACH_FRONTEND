"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, MessageCircle, ArrowRight, Check } from "lucide-react";

/**
 * Premium Cinematic Consultation Experience
 *
 * Flow:
 * 1. Key entry screen (cinematic reveal)
 * 2. Validating animation (premium loading)
 * 3. Chat interface (flowing, premium feel)
 */

type ConsultationState = "key_entry" | "validating" | "chat" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ConsultationPage() {
  const [state, setState] = useState<ConsultationState>("key_entry");
  const [consultationKey, setConsultationKey] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("Training Background");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat starts
  useEffect(() => {
    if (state === "chat") {
      inputRef.current?.focus();
    }
  }, [state]);

  const handleStartConsultation = async () => {
    if (!consultationKey.trim()) {
      setErrorMessage("Please enter a consultation key");
      return;
    }

    setState("validating");
    setErrorMessage("");

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/consultation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultation_key: consultationKey.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.session_id);
        setMessages([
          {
            id: "initial",
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
        setState("chat");
      } else {
        setErrorMessage(data.message || "Invalid consultation key");
        setState("error");
        setTimeout(() => setState("key_entry"), 3000);
      }
    } catch (error) {
      console.error("Error starting consultation:", error);
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
      setTimeout(() => setState("key_entry"), 3000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/consultation/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: inputMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: Date.now().toString() + "-assistant",
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setProgress(data.progress || 0);
        setCurrentSection(formatSection(data.current_section));
      } else {
        setErrorMessage(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSection = (section: string): string => {
    const sections: Record<string, string> = {
      training_modalities: "Training Background",
      exercise_familiarity: "Exercise Experience",
      training_schedule: "Training Schedule",
      meal_timing: "Meal Timing",
      typical_foods: "Eating Habits",
      goals_events: "Goals & Events",
      challenges: "Challenges & Constraints",
    };
    return sections[section] || section;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatePresence mode="wait">
        {/* Key Entry Screen */}
        {state === "key_entry" && (
          <motion.div
            key="key-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="max-w-md w-full"
            >
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-200">
                    Premium Consultation
                  </span>
                </div>
              </motion.div>

              {/* Main Card */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
                      <Lock className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    AI-Powered Consultation
                  </h1>

                  <p className="text-slate-400 text-center mb-8">
                    Enter your consultation key to unlock a personalized fitness
                    and nutrition plan built just for you.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Consultation Key
                      </label>
                      <input
                        type="text"
                        value={consultationKey}
                        onChange={(e) =>
                          setConsultationKey(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleStartConsultation();
                        }}
                        placeholder="SHARP-2025-XXXXXXXXX"
                        className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono tracking-wider"
                        autoFocus
                      />
                    </div>

                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                      >
                        {errorMessage}
                      </motion.div>
                    )}

                    <button
                      onClick={handleStartConsultation}
                      disabled={!consultationKey.trim()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                      <span>Start Consultation</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <p className="text-xs text-slate-500 text-center">
                      Don&apos;t have a key?{" "}
                      <a
                        href="mailto:persimmonautomation@gmail.com?subject=Consultation%20Key%20Request"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Contact us to request access
                      </a>
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Validating State */}
        {state === "validating" && (
          <motion.div
            key="validating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 mb-6"
              >
                <Sparkles className="w-12 h-12 text-blue-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Validating Key
              </h2>
              <p className="text-slate-400">
                Preparing your personalized consultation...
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Error State */}
        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center"
            >
              <div className="inline-block p-4 bg-red-500/10 rounded-full mb-4">
                <Lock className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Invalid Key
              </h2>
              <p className="text-slate-400 mb-4">{errorMessage}</p>
              <p className="text-sm text-slate-500">
                Returning to key entry...
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Chat Interface */}
        {state === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl"
            >
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">
                        AI Coach Consultation
                      </h2>
                      <p className="text-xs text-slate-400">{currentSection}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {progress}%
                    </div>
                    <div className="text-xs text-slate-400">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-8">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`mb-6 flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-slate-800/50 backdrop-blur-xl border border-slate-700 text-slate-100"
                        } rounded-2xl px-6 py-4 shadow-lg`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-6"
                  >
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl px-6 py-4">
                      <div className="flex gap-2">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl"
            >
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your response..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
