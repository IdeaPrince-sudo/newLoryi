import React, { useState } from 'react';
import { Activity, Bug, CloudSun, ImagePlus, Leaf, LoaderCircle, MessageSquare, Mic, MicOff, Send, Sprout, Volume2, Wheat, X } from 'lucide-react';
import ToolLauncher from './ToolLauncher';

const promptGroups = [
  { label: 'Crop guides', icon: Sprout, prompts: ['When should I plant maize in northern Ghana?', 'How do I plan a crop rotation for the coming season?'] },
  { label: 'Soil', icon: Leaf, prompts: ['How can I improve soil organic matter?', 'What does a soil pH of 5.5 mean for my crops?'] },
  { label: 'Pests & disease', icon: Bug, prompts: ['How do I manage aphids using integrated pest management?', 'What signs of crop disease should I look for after heavy rain?'] },
  { label: 'Weather', icon: CloudSun, prompts: ['How should I prepare my farm for a dry spell?', 'When is it safer to apply a crop treatment before rain?'] },
  { label: 'Markets', icon: Wheat, prompts: ['How can I use current Ghana market prices when planning a sale?', 'What should I check before storing maize for market?'] },
];

export default function ChatPanel({
  messages,
  hasConversationStarted,
  draft,
  setDraft,
  attachmentPreview,
  onRemoveAttachment,
  busy,
  error,
  listening,
  onToggleVoice,
  onChooseImage,
  onSend,
  inputRef,
  fileRef,
  messagesEndRef,
  canAccessModule,
  onOpenTool,
}) {
  const [activePromptGroup, setActivePromptGroup] = useState(promptGroups[0].label);
  const [speakingMessageId, setSpeakingMessageId] = useState('');
  const activeGroup = promptGroups.find((group) => group.label === activePromptGroup) || promptGroups[0];

  const toggleSpeech = (message) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId('');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => /^en-(GH|NG|ZA)/i.test(item.lang)) || voices.find((item) => /^en/i.test(item.lang));
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeakingMessageId('');
    utterance.onerror = () => setSpeakingMessageId('');
    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3"><img src="/assets/logo.png" alt="" className="h-9 w-9 rounded-md object-contain" /><div><h1 className="font-semibold text-gray-900">Terra Q</h1><p className="text-xs text-gray-500">Agricultural guidance assistant</p></div></div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> AI connected</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {!hasConversationStarted && (
          <div className="mx-auto max-w-3xl py-4 sm:py-10">
            <div className="mb-7 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-700 text-white"><Leaf size={24} /></div><h2 className="text-2xl font-semibold text-gray-900">What are you working on today?</h2><p className="mt-2 text-sm text-gray-600">Ask Terra Q for practical farming guidance.</p></div>
            <div className="mb-4 flex flex-wrap justify-center gap-2">{promptGroups.map(({ label, icon: Icon }) => <button key={label} type="button" onClick={() => setActivePromptGroup(label)} className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${activePromptGroup === label ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}><Icon size={15} />{label}</button>)}</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{activeGroup.prompts.map((prompt) => <button key={prompt} type="button" onClick={() => onSend(prompt)} className="rounded-md border border-gray-200 bg-white p-3 text-left text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50">{prompt}</button>)}</div>
            <ToolLauncher canAccessModule={canAccessModule} onOpen={onOpenTool} />
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((message) => <article key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-lg px-4 py-3 ${message.role === 'user' ? 'bg-emerald-700 text-white' : 'border border-gray-200 bg-gray-50 text-gray-800'}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>{message.imageDataUrl && <img src={message.imageDataUrl} alt="Attached for Terra Q" className="mt-3 max-h-60 rounded-md object-contain" />}{message.role === 'assistant' && message.id !== 'greeting' && <button type="button" onClick={() => toggleSpeech(message)} aria-label={speakingMessageId === message.id ? 'Stop reading' : 'Read response aloud'} className="mt-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-white hover:text-gray-800"><Volume2 size={14} />{speakingMessageId === message.id ? 'Stop' : 'Read aloud'}</button>}</div></article>)}
          {busy && <div className="flex items-center gap-2 text-sm text-gray-500"><LoaderCircle size={16} className="animate-spin" />Terra Q is thinking…</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6"><div className="mx-auto max-w-3xl">
        {error && <p role="alert" className="mb-2 text-sm text-red-700">{error}</p>}
        {attachmentPreview && <div className="mb-3 inline-flex items-start gap-2 rounded-md border border-gray-200 p-2"><img src={attachmentPreview} alt="Selected upload" className="h-16 w-16 rounded object-cover" /><button type="button" onClick={onRemoveAttachment} aria-label="Remove image" className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={16} /></button></div>}
        <form onSubmit={(event) => { event.preventDefault(); onSend(); }} className="rounded-lg border border-gray-300 bg-white shadow-sm focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
          <textarea ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSend(); } }} rows={2} placeholder="Ask Terra Q about your farm…" className="max-h-40 min-h-14 w-full resize-y border-0 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none focus:ring-0" />
          <div className="flex items-center justify-between border-t border-gray-100 px-2 py-2"><div className="flex items-center gap-1"><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onChooseImage} className="hidden" /><button type="button" onClick={() => fileRef.current?.click()} title="Attach crop image" className="rounded-md p-2 text-gray-500 hover:bg-gray-100"><ImagePlus size={18} /></button><button type="button" onClick={onToggleVoice} title={listening ? 'Stop voice input' : 'Start voice input'} className={`rounded-md p-2 ${listening ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-100'}`}>{listening ? <MicOff size={18} /> : <Mic size={18} />}</button>{listening && <span className="text-xs text-red-700">Listening…</span>}</div><button type="submit" disabled={busy || (!draft.trim() && !attachmentPreview)} aria-label="Send message" className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Send size={15} />Send</button></div>
        </form>
        <p className="mt-2 text-center text-[11px] text-gray-500">Terra Q can make mistakes. Confirm critical crop, treatment, and financial decisions with a qualified local expert.</p>
      </div></footer>
    </main>
  );
}
