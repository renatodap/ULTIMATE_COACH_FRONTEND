"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, MessageCircle, ArrowRight, Check, ArrowLeft } from "lucide-react";

/**
 * AI Consultation - Iron Design
 *
 * Flow:
 * 1. Key entry (sharp, minimal)
 * 2. Validating (loading state)
 * 3. Chat interface (mobile-first)
 * 4. Generating program (animated)
 * 5. Complete (redirect to dashboard)
 */

type ConsultationState = "key_entry" | "validating" | "chat" | "generating_program" | "complete" | "error";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ConsultationPage() {
  const router = useRouter();
  const [state, setState] = useState<ConsultationState>("key_entry");
  const [consultationKey, setConsultationKey] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState("Training Background");
  const [programId, setProgramId] = useState<string | null>(null);

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

  const handleCompleteConsultation = async () => {
    if (!sessionId) return;

    setState("generating_program");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/consultation/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success && data.program_generated) {
        setProgramId(data.program_id);
        setState("complete");

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000);
      } else {
        setErrorMessage(data.message || "Failed to complete consultation");
        setState("chat");
      }
    } catch (error) {
      console.error("Error completing consultation:", error);
      setErrorMessage("Failed to complete consultation. Please try again.");
      setState("chat");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-iron-black">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md w-full"
            >
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-iron-orange">
                  <Sparkles className="w-4 h-4 text-iron-black" />
                  <span className="text-xs font-bold uppercase tracking-widest text-iron-black">
                    AI Consultation
                  </span>
                </div>
              </div>

              {/* Main Card */}
              <div className="card-glass border-2 border-iron-gray p-6">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-iron-dark-gray border-2 border-iron-gray">
                    <Lock className="w-8 h-8 text-iron-orange" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-center mb-2 text-iron-white uppercase tracking-wider">
                  Get Your 2-Week Program
                </h1>

                <p className="text-iron-gray text-center mb-4 text-sm">
                  Enter your consultation key to receive a personalized program.
                </p>

                {/* Benefits */}
                <div className="mb-6 p-4 bg-iron-dark-gray border border-iron-gray">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-iron-orange mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-iron-gray space-y-1">
                      <p className="font-bold uppercase tracking-wider text-iron-white">What You Get:</p>
                      <p>✓ 2-week periodized training plan</p>
                      <p>✓ Daily meal plans with recipes</p>
                      <p>✓ Tailored to your schedule & equipment</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-iron-gray mb-2">
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
                      className="input font-mono"
                      autoFocus
                    />
                  </div>

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-900/20 border border-red-500 text-red-400 text-xs"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  <button
                    onClick={handleStartConsultation}
                    disabled={!consultationKey.trim()}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 tap-target active-press"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-iron-gray">
                  <p className="text-xs text-iron-gray text-center">
                    Don&apos;t have a key?{" "}
                    <a
                      href="mailto:persimmonautomation@gmail.com?subject=SHARPENED%20Consultation%20Key%20Request&body=Hi%2C%0A%0AI%20would%20like%20to%20request%20access%20to%20the%20SHARPENED%20AI%20Consultation%20feature.%0A%0AName%3A%20%0AEmail%3A%20%0AReason%20for%20request%3A%20%0A%0AThank%20you!"
                      className="text-iron-orange hover:underline"
                    >
                      Request access
                    </a>
                  </p>
                </div>
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
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block p-4 bg-iron-dark-gray border-2 border-iron-orange mb-6"
              >
                <Sparkles className="w-12 h-12 text-iron-orange" />
              </motion.div>
              <h2 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-2">
                Validating Key
              </h2>
              <p className="text-iron-gray text-sm">
                Preparing your consultation...
              </p>
            </div>
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
            <div className="max-w-md w-full card-glass border-2 border-red-500 p-6 text-center">
              <div className="inline-block p-4 bg-red-900/20 border-2 border-red-500 mb-4">
                <Lock className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-iron-white uppercase tracking-wider mb-2">
                Invalid Key
              </h2>
              <p className="text-iron-gray mb-4 text-sm">{errorMessage}</p>
              <p className="text-xs text-iron-gray">
                Returning to key entry...
              </p>
            </div>
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
            <div className="border-b-2 border-iron-gray bg-iron-black">
              <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="p-2 bg-iron-dark-gray border border-iron-gray hover:bg-iron-gray transition-colors tap-target"
                      aria-label="Back to dashboard"
                    >
                      <ArrowLeft className="w-5 h-5 text-iron-white" />
                    </button>
                    <div className="p-2 bg-iron-orange">
                      <MessageCircle className="w-5 h-5 text-iron-black" />
                    </div>
                    <div>
                      <h2 className="font-bold text-iron-white uppercase tracking-wider text-sm">
                        AI Coach
                      </h2>
                      <p className="text-xs text-iron-gray uppercase tracking-wide">{currentSection}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-iron-white">
                      {progress}%
                    </div>
                    <div className="text-xs text-iron-gray uppercase tracking-wide">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-iron-dark-gray">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-iron-orange"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-6">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-4 border ${
                          message.role === "user"
                            ? "bg-iron-orange text-iron-black border-iron-orange"
                            : "card-glass border-iron-gray text-iron-white"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 uppercase tracking-wider ${
                            message.role === "user"
                              ? "text-iron-black/70"
                              : "text-iron-gray"
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
                    className="flex justify-start mb-4"
                  >
                    <div className="card-glass border border-iron-gray p-4">
                      <div className="flex gap-2">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: 0,
                          }}
                          className="w-2 h-2 bg-iron-orange"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-iron-orange"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-iron-orange"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t-2 border-iron-gray bg-iron-black safe-bottom">
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
                    className="input flex-1"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="btn btn-primary px-6 tap-target active-press"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-900/20 border border-red-500 text-red-400 text-xs"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Generating Program State */}
        {state === "generating_program" && (
          <motion.div
            key="generating-program"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full text-center">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="inline-block p-6 bg-iron-dark-gray border-2 border-iron-orange mb-6"
              >
                <Sparkles className="w-16 h-16 text-iron-orange" />
              </motion.div>
              <h2 className="text-2xl font-bold text-iron-white uppercase tracking-wider mb-3">
                Generating Program
              </h2>
              <p className="text-iron-gray mb-6 text-sm">
                Creating your personalized 2-week plan...
              </p>
              <div className="space-y-2 text-xs text-iron-gray uppercase tracking-wide">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-iron-orange" />
                  <span>Analyzing consultation data</span>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-iron-orange" />
                  <span>Building training plan</span>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-iron-orange" />
                  <span>Creating meal plans</span>
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Complete State */}
        {state === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="max-w-md w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block p-6 bg-iron-dark-gray border-2 border-iron-orange mb-6"
              >
                <Check className="w-16 h-16 text-iron-orange" />
              </motion.div>
              <h2 className="text-2xl font-bold text-iron-white uppercase tracking-wider mb-3">
                Program Ready
              </h2>
              <p className="text-iron-gray mb-2 text-sm">
                Your 2-week program has been generated.
              </p>
              <p className="text-xs text-iron-gray uppercase tracking-wide mb-8">
                Redirecting to dashboard...
              </p>

              <div className="card-glass border border-iron-gray p-6">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-3 bg-iron-orange">
                    <Check className="w-6 h-6 text-iron-black" />
                  </div>
                  <div className="text-sm">
                    <p className="text-iron-white font-bold uppercase tracking-wider">Ready to Start</p>
                    <p className="text-iron-gray text-xs">
                      Your program is on your dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
