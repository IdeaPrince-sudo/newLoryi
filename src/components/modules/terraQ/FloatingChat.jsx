import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import MicrophoneIcon from '@heroicons/react/24/solid/MicrophoneIcon';
import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon';

import './terraQ.css';
import terraLogo from './terra.svg';

function FloatingChat() {
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! I'm Terra Q, your farming assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
 

  const suggestions = [
    "When should I plant corn?",
    "How to identify plant diseases?",
    "Best practices for crop rotation",
    "How to improve soil fertility?",
    "Managing drought conditions",
    "Organic pest control methods"
  ];

  const knowledgeBase = {
    "plant corn": "Corn should be planted when soil temperature is at least 60°F (16°C).",
    "identify plant diseases": "Use DiagnoX AI-powered crop disease & pest identification, Scan & Diagnose Crop Disease Upload an image of your affected crop for AI-powered disease identification and treatment recommendations. For best results, take close-up photos in good lighting. Make sure the affected area is clearly visible and centered in the frame.",
    "crop rotation": "Rotate crops yearly to prevent soil depletion and pest buildup.",
    "improve soil fertility": "Apply compost, manure, and use cover crops to enrich soil.",
    "drought conditions": "Use drip irrigation, mulch, and drought-tolerant varieties.",
    "organic pest control": "Neem oil, beneficial insects, and farm hygiene help control pests.",
    "store maize": "Dry maize to below 13% moisture and store in airtight bags.",
    "fertilizer for rice": "Use NPK 15:15:15 and Urea following soil test recommendations.",
    "prevent soil erosion": "Plant cover crops, build terraces, and avoid overgrazing.",
    "increase tomato yield": "Stake plants, use hybrid seeds, and maintain proper watering."
  };

  const getFarmingResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    for (const key in knowledgeBase) {
      if (lowerQuery.includes(key)) {
        return knowledgeBase[key];
      }
    }
    return "Sorry, I don't have info on that topic yet.";
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
  }

  const handleSend = () => {
    if (input.trim() === '') return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsPending(true);
    setShowSuggestions(false);

    setTimeout(() => {
      const response = getFarmingResponse(input);
      setMessages(prev => [...prev, { sender: 'assistant', text: response }]);
      setIsPending(false);

      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();

        // Preferred African female voice locales or names
        const africanVoicesPriority = [
          'en-ZA', // South African English
          'en-GH', // Ghana (may or may not exist)
          'en-NG', // Nigeria (may or may not exist)
          'en-GB', // UK fallback
          'en-US', // US fallback
        ];

        // Find voice matching African locale and female
        let voice = voices.find(v =>
          africanVoicesPriority.some(code => v.lang.toLowerCase().startsWith(code.toLowerCase())) &&
          /female/i.test(v.name)
        );

        // fallback: first female English voice
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith('en') && /female/i.test(v.name));
        }

        // fallback: first English voice
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith('en'));
        }

        const utterance = new SpeechSynthesisUtterance(response);
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => handleSend(), 100);
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognition.start();
      setIsListening(true);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) setUnreadCount(0);
  };

  useEffect(() => {
    if (!isChatOpen && messages[messages.length - 1]?.sender === 'assistant') {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  // Debug: list voices in console once (optional)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices);
    }
  }, []);

  return (
    <div className="floating-chat-container">
      {!isChatOpen && (
        <button onClick={toggleChat} aria-label="Open chat" className="floating-chat-button">
          <img src={terraLogo} alt="Terra Q" className="w-8 h-8" />
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
      )}

      <div className={`floating-chat-window ${isChatOpen ? 'open' : 'closed'}`}>
        <div className="floating-chat-header">
          <div className="flex items-center space-x-3">
            <img src={terraLogo} alt="Terra Q" className="w-8 h-8" />
            <div>
              <h3 className="font-semibold text-sm leading-tight">Terra Q</h3>
              <p className="text-xs opacity-90">Farm Guidance Assistant</p>
            </div>
          </div>
          <button onClick={toggleChat} title="Close chat" className="p-1 rounded hover:bg-green-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="floating-chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm text-sm whitespace-pre-wrap ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-white border border-gray-200 rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex justify-start mb-2">
              <div className="bg-white border border-gray-200 px-3 py-2 rounded-bl-none shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {isListening && (
            <div className="flex justify-start mb-2">
              <div className="bg-green-50 border border-green-200 px-3 py-2 shadow-sm flex items-center text-green-700 text-sm">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                Listening...
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="mt-3">
              <p className="text-gray-500 text-sm mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-green-700 bg-white border border-green-300 rounded-full px-3 py-1 text-sm hover:bg-green-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="floating-chat-input">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <MicrophoneIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Terra Q about farming..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white p-2 rounded-lg"
          >
            <PaperAirplaneIcon className="h-5 w-5 rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingChat;
