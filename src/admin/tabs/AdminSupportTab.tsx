import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
  Mic,
  Headphones,
  ShoppingBag,
  Circle,
  Phone,
} from 'lucide-react';
import { SupportConversation } from '../types';
import { adminFetch } from '../adminApi';
import { AudioMessageBubble } from '../../components/AudioMessageBubble';
import { VoiceRecorder } from '../../components/VoiceRecorder';

interface AdminSupportTabProps {
  conversations: SupportConversation[];
  onRefresh: () => void;
}

export const AdminSupportTab: React.FC<AdminSupportTabProps> = ({
  conversations,
  onRefresh,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Resolved' | 'Unread'>('All');
  const [isSending, setIsSending] = useState(false);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages, isRecordingMode]);

  // Mark conversation as read for admin
  useEffect(() => {
    if (selectedConv?.id) {
      adminFetch('/api/support/read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConv.id, role: 'admin' }),
      }).catch(() => {});
    }
  }, [selectedConv?.id]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setIsSending(true);
    try {
      const res = await adminFetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          messageType: 'text',
          text: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reply');
      }

      setReplyText('');
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error sending reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendVoiceReply = async (audioBase64: string, duration: number) => {
    if (!selectedConv) return;
    setIsSending(true);
    try {
      const res = await adminFetch('/api/admin/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          messageType: 'audio',
          audioUrl: audioBase64,
          audioDuration: duration,
          text: 'Staff voice message',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send voice reply');
      }

      setIsRecordingMode(false);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Error sending voice reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedConv) return;
    const newStatus = selectedConv.status === 'Resolved' ? 'Open' : 'Resolved';
    try {
      await adminFetch(`/api/admin/support/${selectedConv.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.orderNumber && c.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'Open') return c.status === 'Open';
    if (filterStatus === 'Resolved') return c.status === 'Resolved';
    if (filterStatus === 'Unread') return (c.unreadCountAdmin || 0) > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#322A2E]">
            Customer Support & Live Dispatch
          </h2>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Real-time chat, voice message dispatch, and order assistance console.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Chats</span>
          </button>
        </div>
      </div>

      {/* Support Chat Interface Container */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
        {/* Left Column: Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r border-gray-100 flex flex-col bg-white">
          {/* Search Box & Filters */}
          <div className="p-3.5 border-b border-gray-100 space-y-2.5">
            <div className="flex items-center bg-[#F4F5F7] rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer or order..."
                className="w-full text-xs font-semibold text-[#322A2E] bg-transparent outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              {(['All', 'Unread', 'Open', 'Resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-colors cursor-pointer ${
                    filterStatus === tab
                      ? 'bg-[#322A2E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredConversations.length === 0 ? (
              <p className="p-8 text-center text-xs text-gray-400 font-bold">
                No support tickets found
              </p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                const hasUnread = (conv.unreadCountAdmin || 0) > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-red-50/70 border-l-4 border-[#EF2A39]'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {conv.customerAvatar ? (
                          <img
                            src={conv.customerAvatar}
                            alt={conv.customerName}
                            className="w-10 h-10 rounded-2xl object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-[#EF2A39]/10 text-[#EF2A39] flex items-center justify-center font-bold">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EF2A39] rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-black text-[#322A2E] truncate">
                            {conv.customerName}
                          </h4>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                              conv.status === 'Resolved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {conv.status}
                          </span>
                        </div>

                        {conv.orderNumber && (
                          <span className="inline-block text-[10px] font-bold text-[#EF2A39] mb-0.5">
                            Order {conv.orderNumber}
                          </span>
                        )}

                        <p className="text-[11px] text-[#8E8E93] truncate font-medium">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between bg-[#F8F9FA]">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-gray-200">
                    <img
                      src={selectedConv.customerAvatar}
                      alt={selectedConv.customerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-[#322A2E]">
                        {selectedConv.customerName}
                      </h3>
                      {selectedConv.orderNumber && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                          Ref: {selectedConv.orderNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {selectedConv.customerEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleStatus}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedConv.status === 'Resolved'
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {selectedConv.status === 'Resolved' ? 'Mark Open' : 'Mark Resolved'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {selectedConv.messages.map((msg, i) => {
                  const isAdmin = msg.sender === 'agent';
                  const isAudio = msg.messageType === 'audio' || !!msg.audioUrl;

                  return (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col ${
                        isAdmin ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-gray-400">
                          {isAdmin
                            ? 'Foodgo Staff (You)'
                            : selectedConv.customerName}
                        </span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="text-[9px] text-gray-400">{msg.time}</span>
                      </div>

                      {isAudio ? (
                        <AudioMessageBubble
                          audioUrl={msg.audioUrl}
                          duration={msg.audioDuration}
                          isSender={isAdmin}
                          theme={isAdmin ? 'agent' : 'admin-customer'}
                        />
                      ) : (
                        <div
                          className={`max-w-[78%] p-3 text-xs font-semibold leading-relaxed rounded-2xl ${
                            isAdmin
                              ? 'bg-[#322A2E] text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-[#322A2E] border border-gray-200/80 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Field (Text + Voice Recording) */}
              <div className="p-3.5 bg-white border-t border-gray-100">
                {isRecordingMode ? (
                  <VoiceRecorder
                    onSendVoice={handleSendVoiceReply}
                    onCancel={() => setIsRecordingMode(false)}
                    primaryColor="#322A2E"
                    theme="admin"
                  />
                ) : (
                  <form
                    onSubmit={handleSendReply}
                    className="flex items-center gap-2 bg-[#F4F5F7] rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-[#322A2E]/30"
                  >
                    <button
                      type="button"
                      onClick={() => setIsRecordingMode(true)}
                      className="w-9 h-9 rounded-xl bg-white hover:bg-red-50 text-[#EF2A39] border border-gray-200/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title="Record Voice Reply"
                      aria-label="Record voice reply"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${selectedConv.customerName} (or click 🎤 for voice note)...`}
                      className="flex-1 bg-transparent px-3 py-2 text-xs font-semibold text-[#322A2E] outline-none"
                    />

                    <button
                      type="submit"
                      disabled={isSending || !replyText.trim()}
                      className="w-9 h-9 rounded-xl bg-[#322A2E] hover:bg-[#201A1D] text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
                      aria-label="Send reply"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-gray-400 text-xs font-bold">
              Select a conversation to inspect and reply.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
