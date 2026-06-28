import { useState, useRef, useEffect } from "react";
import { useHospitals } from "@/lib/hospitals";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
};

export function GeminiChat() {
  const { t } = useLanguage();
  const hospitals = useHospitals();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "ai",
      text: t(
        "Hello 🙏 I'm here to help you find the right hospital fast. Please describe the medical emergency and I'll recommend the best available option nearby.",
      ),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const userMsgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("Missing Gemini API Key");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an emergency medical triage assistant for BedFinder India. Here is current hospital data: ${JSON.stringify(hospitals)}. When someone describes their emergency: 1) Identify bed type needed 2) Recommend best 1-2 hospitals with available beds 3) Give hospital name, bed count, distance, contact number 4) Keep response under 100 words, calm and clear 5) Always end with "Call [number] now" 6) Never make up hospital names. User message: ${text}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gemini API call failed");
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error("Empty candidate reply");
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "ai", text: reply }]);
    } catch (error) {
      console.error("Gemini Chatbot Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: t("AI assistant unavailable. Please call 108 or browse hospitals above."),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 z-40 select-none font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-[#E8341C] hover:bg-[#c92614] text-white flex items-center justify-center text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-[#E8341C]/25"
          aria-label="Open AI Triage Assistant"
        >
          🏥
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-[#E8ECF2] flex flex-col overflow-hidden fade-up">
          {/* Header */}
          <div className="bg-[#0A1628] text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
              </span>
              <span className="font-display font-semibold text-sm tracking-tight">
                {t("AI Triage Assistant")}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white text-base font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Amber Disclaimer */}
          <div className="bg-[#D97706]/10 text-[#92400e] border-b border-[#D97706]/20 px-4 py-2 text-[11px] leading-snug">
            {t("For life-threatening emergencies call 108 first")}
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#0A1628] text-white self-end rounded-br-none"
                    : "bg-[#F4F6F9] text-[#0A1628] border border-[#E8ECF2] self-start rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-1 items-center px-4 py-3 bg-[#F4F6F9] border border-[#E8ECF2] rounded-2xl rounded-bl-none max-w-[80px] self-start mt-2">
                <span
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[#E8ECF2] flex gap-2 bg-white">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder={t("Describe the emergency…")}
              className="flex-1 px-3 py-2 bg-[#F4F6F9] border border-[#E8ECF2] rounded-xl text-sm outline-none focus:border-[#E8341C] text-[#0A1628]"
            />
            <button
              onClick={handleSend}
              className="bg-[#E8341C] hover:bg-[#c92614] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer shrink-0"
            >
              {t("Search Beds")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
