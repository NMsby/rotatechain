import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

interface MistralWidgetProps {}

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const WidgetButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.1);
  }
`;

const WidgetPopup = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 15px;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Response = styled.div`
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f9f9f9;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

// Function to strip Markdown formatting
const stripMarkdown = (text: string): string => {
  if (!text) return "";
  // Remove headers (e.g., #, ##, ###)
  text = text.replace(/^#+\s+/gm, '');
  // Remove bold/italics (e.g., **bold**, *italics*)
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/\_(.*?)\_/g, '$1');
  // Remove links (e.g., [text](url))
  text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Remove code blocks (e.g., ```code```)
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`(.*?)`/g, '$1');
  // Remove lists (e.g., - item, 1. item)
  text = text.replace(/^\s*[\-\*]\s+/gm, '');
  text = text.replace(/^\s*\d+\.\s+/gm, '');
  // Remove blockquotes (e.g., > quote)
  text = text.replace(/^\>\s+/gm, '');
  // Remove horizontal rules (e.g., ---)
  text = text.replace(/^\-\-\-$/gm, '');
  return text;
};

const AiAssistant: React.FC<MistralWidgetProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const askAgent = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const agentId = "ag:0b154a30:20251006:untitled-agent:91cf9ede";
      const apiUrl = "https://api.mistral.ai/v1/agents/completions"; 
      const apiKey = "Vk96EjSB3mm4nXwPFoZQnhoGqHMi5Yre"; 

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`API Error: ${res.status} ${res.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await res.json();
      console.log("API Response:", data); // Log the full response for debugging

      // Adjust this line based on the actual response structure
      const plainTextResponse = stripMarkdown(data.choices?.[0]?.message?.content || "No response received.");
      setResponse(plainTextResponse);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setResponse("");
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <WidgetContainer ref={widgetRef}>
      <WidgetButton onClick={() => setIsOpen(!isOpen)}>
        🤖
      </WidgetButton>
      <WidgetPopup isOpen={isOpen}>
        <h4>Ask Mistral</h4>
        <Input
          type="text"
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
          placeholder="Ask the agent..."
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === "Enter") askAgent();
          }}
        />
        <button
          onClick={askAgent}
          disabled={loading}
          style={{
            padding: "6px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Ask"}
        </button>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        <Response ref={responseRef}>{response}</Response>
      </WidgetPopup>
    </WidgetContainer>
  );
};

export default AiAssistant;
