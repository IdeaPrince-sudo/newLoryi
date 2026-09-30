import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';
import ConversationSidebar from './ConversationSidebar';
import ChatPanel from './ChatPanel';

const greeting = {
  id: 'greeting',
  role: 'assistant',
  content: "Hello! I'm Terra Q, your agricultural assistant. Ask me about crops, soil, pest management, weather, farm operations, or market decisions.",
  createdAt: new Date().toISOString(),
};

function storageKey(userId) {
  return `terraQ-conversations-${userId || 'guest'}`;
}

function loadConversations(userId) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

const TerraQ = () => {
  const { currentUser, canAccessModule } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(() => loadConversations(currentUser?.id));
  const [activeConversationId, setActiveConversationId] = useState(() => loadConversations(currentUser?.id)[0]?.id || 'current');
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const ownedConversations = loadConversations(currentUser?.id);
    setConversations(ownedConversations);
    setActiveConversationId(ownedConversations[0]?.id || 'current');
  }, [currentUser?.id]);

  useEffect(() => {
    localStorage.setItem(storageKey(currentUser?.id), JSON.stringify(conversations));
  }, [conversations, currentUser?.id]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
  const messages = activeConversation?.messages || [greeting];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  const startNewConversation = () => {
    setActiveConversationId('current');
    setDraft('');
    setError('');
    setAttachment(null);
    setAttachmentPreview('');
  };

  const removeConversation = (conversationId) => {
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
    setConversations(remaining);
    if (activeConversationId === conversationId) setActiveConversationId(remaining[0]?.id || 'current');
  };

  const chooseImage = (event) => {
    const [image] = event.target.files || [];
    event.target.value = '';
    if (!image) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (image.size > 1024 * 1024) {
      setError('Chat image attachments must be 1MB or smaller.');
      return;
    }
    setError('');
    setAttachment(image);
    const reader = new FileReader();
    reader.onload = () => setAttachmentPreview(String(reader.result || ''));
    reader.readAsDataURL(image);
  };

  const sendMessage = async (text = draft) => {
    const content = String(text || '').trim();
    if ((!content && !attachment) || busy) return;
    setBusy(true);
    setError('');
    try {
      let imageDataUrl = '';
      if (attachment) imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(attachment);
      });

      const currentMessages = activeConversation?.messages || [greeting];
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content || 'Please assess this agricultural image.',
        ...(imageDataUrl ? { imageDataUrl } : {}),
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...currentMessages, userMessage];
      const apiMessages = nextMessages.filter((message) => message.id !== 'greeting').slice(-12).map((message) => ({
        role: message.role,
        content: message.content,
        ...(message.imageDataUrl ? { imageDataUrl: message.imageDataUrl } : {}),
      }));
      const response = await api.terraQChat(apiMessages);
      const assistantMessage = { id: crypto.randomUUID(), role: 'assistant', content: response.reply, createdAt: new Date().toISOString() };
      const updatedMessages = [...nextMessages, assistantMessage];
      const conversation = activeConversation || {
        id: crypto.randomUUID(),
        title: content.slice(0, 50) || 'Image question',
        createdAt: new Date().toISOString(),
      };
      const updatedConversation = { ...conversation, messages: updatedMessages, updatedAt: new Date().toISOString() };
      setConversations((current) => [updatedConversation, ...current.filter((item) => item.id !== updatedConversation.id)].slice(0, 30));
      setActiveConversationId(updatedConversation.id);
      setDraft('');
      setAttachment(null);
      setAttachmentPreview('');
    } catch (requestError) {
      setError(requestError.message || 'Terra Q could not answer. Please try again.');
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const toggleVoiceInput = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GH';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => setDraft(Array.from(event.results).map((result) => result[0].transcript).join(''));
    recognition.onerror = () => { setListening(false); setError('Voice input stopped. You can type your question instead.'); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError('');
    setListening(true);
    recognition.start();
  };

  return (
    <div className="min-h-[calc(100vh-9rem)] overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex min-h-[calc(100vh-9rem)]">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewConversation={startNewConversation}
          onSelectConversation={(id) => { setActiveConversationId(id); setError(''); }}
          onDeleteConversation={removeConversation}
        />
        <ChatPanel
          messages={messages}
          hasConversationStarted={messages.length > 1}
          draft={draft}
          setDraft={setDraft}
          attachmentPreview={attachmentPreview}
          onRemoveAttachment={() => { setAttachment(null); setAttachmentPreview(''); }}
          busy={busy}
          error={error}
          listening={listening}
          onToggleVoice={toggleVoiceInput}
          onChooseImage={chooseImage}
          onSend={sendMessage}
          inputRef={inputRef}
          fileRef={fileRef}
          messagesEndRef={messagesEndRef}
          canAccessModule={canAccessModule}
          onOpenTool={navigate}
        />
      </div>
    </div>
  );
};

export default TerraQ;
