import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bot, Send, X, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const stripMarkdown = (text: string): string => {
  if (!text) return "";
  text = text.replace(/^#+\s+/gm, "");
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/\_(.*?)\_/g, "$1");
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/`(.*?)`/g, "$1");
  text = text.replace(/^\s*[\-\*]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  text = text.replace(/^\>\s+/gm, "");
  text = text.replace(/^\-\-\-$/gm, "");
  return text;
};

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const askAgent = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    setError("");

    try {
      const agentId = "ag:0b154a30:20251006:untitled-agent:91cf9ede";
      const apiUrl = "https://api.mistral.ai/v1/agents/completions";
      const apiKey = "Vk96EjSB3mm4nXwPFoZQnhoGqHMi5Yre";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `API Error: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data = await res.json();
      const plainTextResponse = stripMarkdown(
        data.choices?.[0]?.message?.content || "No response received."
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: plainTextResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAgent();
    }
  };

  if (!mounted) return null;

  const content = (
    <div style={{ 
      position: "fixed", 
      bottom: "24px", 
      right: "24px", 
      zIndex: 9999,
      pointerEvents: "none"
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
          50% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.8); }
        }
        
        .ai-assistant-animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .ai-assistant-animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .ai-assistant-animate-typing {
          animation: typing 1.4s ease-in-out infinite;
        }
        
        .ai-assistant-animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        
        .ai-assistant-bg-gradient {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }
        
        .ai-assistant-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .ai-assistant-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        
        .ai-assistant-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        
        .ai-assistant-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>

      {/* Chat Window */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          right: "0",
          width: "380px",
          height: "600px",
          transition: "all 0.3s ease-out",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(32px)",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div
          className="ai-assistant-animate-scale-in"
          style={{
            position: "relative",
            height: "100%",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="ai-assistant-bg-gradient"
            style={{
              position: "relative",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)",
              }}
            />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={20} color="white" />
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    width: "12px",
                    height: "12px",
                    background: "#4ade80",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: "white", fontSize: "18px", margin: 0 }}>
                  Caffeine AI
                </h3>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                  Always here to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: "relative",
                padding: "8px",
                background: "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Close chat"
            >
              <X size={20} color="white" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="ai-assistant-scroll"
            style={{
              height: "calc(100% - 180px)",
              overflowY: "auto",
              padding: "16px",
              scrollBehavior: "smooth",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "16px",
                }}
              >
                <div
                  className="ai-assistant-bg-gradient ai-assistant-animate-pulse-glow"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Bot size={32} color="white" />
                </div>
                <h4 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937", marginBottom: "8px" }}>
                  Welcome to Caffeine AI
                </h4>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  Ask me anything and I'll help you with intelligent responses!
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className="ai-assistant-animate-fade-in"
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "16px",
                }}
              >
                {message.role === "assistant" && (
                  <div
                    className="ai-assistant-bg-gradient"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "4px",
                    }}
                  >
                    <Bot size={16} color="white" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "75%",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    background: message.role === "user" 
                      ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" 
                      : "#f3f4f6",
                    color: message.role === "user" ? "white" : "#1f2937",
                    borderBottomRightRadius: message.role === "user" ? "4px" : "16px",
                    borderBottomLeftRadius: message.role === "assistant" ? "4px" : "16px",
                  }}
                >
                  <p style={{ fontSize: "14px", lineHeight: "1.5", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "4px",
                      background: "#e5e7eb",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb" }}>You</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-assistant-animate-fade-in" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <div
                  className="ai-assistant-bg-gradient"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={16} color="white" />
                </div>
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "16px",
                    borderBottomLeftRadius: "4px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ display: "flex", gap: "4px" }}>
                    <div
                      className="ai-assistant-animate-typing"
                      style={{ width: "8px", height: "8px", background: "#2563eb", borderRadius: "50%" }}
                    />
                    <div
                      className="ai-assistant-animate-typing"
                      style={{ width: "8px", height: "8px", background: "#2563eb", borderRadius: "50%", animationDelay: "0.2s" }}
                    />
                    <div
                      className="ai-assistant-animate-typing"
                      style={{ width: "8px", height: "8px", background: "#2563eb", borderRadius: "50%", animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                className="ai-assistant-animate-fade-in"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ fontSize: "14px", color: "#dc2626", margin: 0 }}>{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(4px)",
              borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "#f3f4f6",
                  border: "1px solid transparent",
                  outline: "none",
                  fontSize: "14px",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563eb";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
                disabled={loading}
              />
              <button
                onClick={askAgent}
                disabled={loading || !prompt.trim()}
                className="ai-assistant-bg-gradient"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  color: "white",
                  fontWeight: 500,
                  border: "none",
                  cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  opacity: loading || !prompt.trim() ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading && prompt.trim()) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ai-assistant-bg-gradient ai-assistant-animate-pulse-glow"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s",
          transform: isOpen ? "rotate(0) scale(0.95)" : "rotate(0) scale(1)",
          pointerEvents: "auto",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>
    </div>
  );

  return createPortal(content, document.body);
};

export default AiAssistant;