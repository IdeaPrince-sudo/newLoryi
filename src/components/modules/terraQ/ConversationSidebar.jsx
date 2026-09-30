import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function ConversationSidebar({ conversations, activeConversationId, onNewConversation, onSelectConversation, onDeleteConversation }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50 lg:flex">
      <div className="border-b border-gray-200 p-4">
        <button type="button" onClick={onNewConversation} className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
          <Plus size={16} />New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase text-gray-500">Recent conversations</p>
        {conversations.length ? (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <div className={`group flex items-center gap-2 rounded-md px-2 py-2 ${activeConversationId === conversation.id ? 'bg-emerald-100 text-emerald-950' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <button type="button" onClick={() => onSelectConversation(conversation.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm">
                    <MessageSquare size={15} className="shrink-0" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                  <button type="button" aria-label={`Delete ${conversation.title}`} onClick={() => onDeleteConversation(conversation.id)} className="hidden rounded p-1 text-gray-400 hover:bg-white hover:text-red-700 group-hover:inline-flex">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="px-2 py-3 text-xs text-gray-500">Your saved conversations will appear here.</p>}
      </div>
      <div className="border-t border-gray-200 p-4 text-xs text-gray-500">Advice is AI-generated. Verify important decisions with local agricultural extension services.</div>
    </aside>
  );
}
