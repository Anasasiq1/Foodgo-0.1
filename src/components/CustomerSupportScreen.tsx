import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Send,
  User,
  Mic,
  Headphones,
  ShoppingBag,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { AudioMessageBubble } from './AudioMessageBubble';
import { VoiceRecorder } from './VoiceRecorder';

export const CustomerSupportScreen: React.FC = () => {
  const {
    goBack,
    messages,
    sendTextMessage,
    sendVoiceMessage,
    markSupportAsRead,
    fetchSupportMessages,
    user,
    lastPlacedOrder,
    orders,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [selectedOrderRef, setSelectedOrderRef] = useState<string | null>(
    lastPlacedOrder?.orderNumber || (orders[0]?.orderNumber ?? null)
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mark messages as read and trigger initial fetch
  useEffect(() => {
    markSupportAsRead();
    fetchSupportMessages();

    // Fast polling while on screen
    const interval = setInterval(() => {
      fetchSupportMessages();
    }, 2500);

    return () => clearInterval(interval);
  }, [markSupportAsRead, fetchSupportMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecordingMode]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendTextMessage(
      inputText.trim(),
      selectedOrderRef ? `order-${selectedOrderRef}` : undefined,
      selectedOrderRef || undefined
    );
    setInputText('');
  };

  const handleVoiceSend = (audioBase64: string, duration: number) => {
    sendVoiceMessage(
      audioBase64,
      duration,
      selectedOrderRef ? `order-${selectedOrderRef}` : undefined,
      selectedOrderRef || undefined
    );
    setIsRecordingMode(false);
  };

  const quickPrompts = [
    '🍔 Where is my order right now?',
    '⏱️ How long will delivery take?',
    '🧀 Can I customize with extra cheese?',
    '💳 Question about my payment',
  ];

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] flex flex-col justify-between">
      {/* Top Header */}
      <div className="px-5 pt-6 pb-3.5 bg-white border-b border-gray-100/80 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#322A2E] hover:bg-gray-100 transition-colors active:scale-95 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-[#EF2A39] flex items-center justify-center text-white shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black text-[#322A2E] leading-tight">
                    Foodgo Support
                  </h2>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-red-50 text-[#EF2A39] rounded-md">
                    Live
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Kitchen & Staff online</span>
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Avatar Link */}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Order Reference Badge if applicable */}
        {selectedOrderRef && (
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-500 font-medium">
              <ShoppingBag className="w-3.5 h-3.5 text-[#EF2A39]" />
              <span>
                Referencing Order:{' '}
                <strong className="text-[#322A2E] font-bold">{selectedOrderRef}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedOrderRef(null)}
              className="text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3.5">
        {/* Support welcome notice */}
        <div className="p-3 bg-red-50/70 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-[#322A2E] mb-2">
          <Sparkles className="w-4 h-4 text-[#EF2A39] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[#EF2A39]">Official Customer Care: </span>
            You can send typed messages or instant <strong>voice notes</strong> to our live kitchen & delivery staff.
          </div>
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isAudio = msg.messageType === 'audio' || !!msg.audioUrl;

          return (
            <div
              key={msg.id || index}
              className={`flex items-end gap-2 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Agent Avatar on Left */}
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#322A2E] flex items-center justify-center text-white shrink-0 shadow-xs mb-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
              )}

              <div
                className={`flex flex-col ${
                  isUser ? 'items-end' : 'items-start'
                } max-w-[82%]`}
              >
                {/* Message Content (Audio or Text) */}
                {isAudio ? (
                  <AudioMessageBubble
                    audioUrl={msg.audioUrl}
                    duration={msg.audioDuration}
                    isSender={isUser}
                    theme={isUser ? 'user' : 'agent'}
                  />
                ) : (
                  <div
                    className={`p-3.5 text-xs font-semibold leading-relaxed rounded-2xl ${
                      isUser
                        ? 'bg-[#EF2A39] text-white rounded-br-xs shadow-[0_4px_14px_rgba(239,42,57,0.22)]'
                        : 'bg-[#F4F5F7] text-[#322A2E] border border-gray-100 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Timestamp & Read Indicator */}
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400 font-semibold">
                  <span>{msg.time}</span>
                  {isUser && (
                    <CheckCheck className="w-3 h-3 text-[#EF2A39] stroke-[2.5]" />
                  )}
                </div>
              </div>

              {/* User Avatar on Right */}
              {isUser && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-red-200 shrink-0 shadow-xs mb-0.5">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      {messages.length < 5 && !isRecordingMode && (
        <div className="px-4 py-2 bg-white/90 border-t border-gray-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                sendTextMessage(
                  prompt.replace(/^[^\w\s]+\s*/, ''),
                  selectedOrderRef ? `order-${selectedOrderRef}` : undefined,
                  selectedOrderRef || undefined
                );
              }}
              className="px-3 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-red-50 hover:text-[#EF2A39] text-[11px] font-bold text-[#322A2E] whitespace-nowrap transition-colors border border-gray-200/60 shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Message Input Area */}
      <div className="p-3.5 bg-white border-t border-gray-100 sticky bottom-0 z-20">
        {isRecordingMode ? (
          <VoiceRecorder
            onSendVoice={handleVoiceSend}
            onCancel={() => setIsRecordingMode(false)}
            primaryColor="#EF2A39"
            theme="customer"
          />
        ) : (
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-[#F4F5F7] rounded-2xl p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-200/70 focus-within:border-[#EF2A39]/50 focus-within:bg-white transition-all"
          >
            {/* Microphone Button (Trigger Voice Recording) */}
            <button
              type="button"
              onClick={() => setIsRecordingMode(true)}
              className="w-10 h-10 rounded-xl bg-white hover:bg-red-50 text-[#EF2A39] border border-gray-200/70 flex items-center justify-center transition-transform active:scale-95 shadow-xs shrink-0 cursor-pointer"
              title="Record Voice Message"
              aria-label="Record voice message"
            >
              <Mic className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Text Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message or press 🎤 for voice note..."
              className="flex-1 bg-transparent px-2.5 py-2 text-xs font-semibold text-[#322A2E] placeholder-[#9CA3AF] outline-none"
            />

            {/* Send / Mic Action Button */}
            {inputText.trim() ? (
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#EF2A39] hover:bg-[#D81C2B] text-white flex items-center justify-center transition-all shadow-[0_4px_12px_rgba(239,42,57,0.3)] active:scale-95 shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingMode(true)}
                className="w-10 h-10 rounded-xl bg-[#322A2E] hover:bg-[#201A1D] text-white flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
                title="Hold or click to record voice note"
                aria-label="Start voice note"
              >
                <Mic className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
