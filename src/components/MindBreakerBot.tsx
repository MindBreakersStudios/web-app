import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../i18n';

const DISCORD_URL = 'https://discord.gg/gzzFP2SeXg';

interface Message {
  text: string;
  isBot: boolean;
}

function pickRandom(arr: string[] | null | undefined): string {
  if (!arr || arr.length === 0) {
    return 'Hello! How can I help you?';
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

export const MindBreakerBot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Hide bot on WatchParty page to avoid overlapping with chat
  const isWatchParty = location.pathname === '/watchparty' || location.pathname.startsWith('/watchparty/');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useTranslation();
  const { locale } = useLanguage();

  // Initialize with greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greetings = getTranslation(locale, 'chatbot.greetings') as string[] | null;
      setMessages([{ text: pickRandom(greetings), isBot: true }]);
    }
  }, [isOpen, locale]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { text, isBot: true }]);
  };

  const detectKeyword = (input: string): string => {
    const lower = input.toLowerCase();

    if (/discord/.test(lower)) {
      return t('chatbot.discord');
    }
    if (/server|servidor/.test(lower)) {
      return t('chatbot.servers');
    }
    if (/uni[rt]|join|equipo|team/.test(lower)) {
      return t('chatbot.team');
    }
    if (/hola|hello|hey|buenas|hi\b/.test(lower)) {
      const greetings = getTranslation(locale, 'chatbot.greetings') as string[] | null;
      return pickRandom(greetings);
    }

    const defaults = getTranslation(locale, 'chatbot.default') as string[] | null;
    return pickRandom(defaults);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { text: trimmed, isBot: false }]);
    setInput('');

    setTimeout(() => {
      addBotMessage(detectKeyword(trimmed));
    }, 400);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'discord':
        addBotMessage(t('chatbot.discord'));
        setTimeout(() => window.open(DISCORD_URL, '_blank'), 600);
        break;
      case 'servers': {
        addBotMessage(t('chatbot.servers'));
        const el = document.getElementById('servers');
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 600);
        }
        break;
      }
      case 'team':
        addBotMessage(t('chatbot.team'));
        setTimeout(() => window.open(DISCORD_URL, '_blank'), 600);
        break;
      case 'random': {
        const randoms = getTranslation(locale, 'chatbot.random') as string[] | null;
        addBotMessage(pickRandom(randoms));
        break;
      }
    }
  };

  if (isWatchParty) return null;

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-6 w-80 sm:w-96 z-50 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[28rem]">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <img
                src="/images/logos/Face-18.png"
                alt="MindBot"
                className="h-7 w-7 object-contain"
              />
              <div>
                <span className="font-bold text-sm text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  MindBot
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-lime-400 inline-block" />
                  <span className="text-xs text-gray-400">{t('chatbot.status')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[10rem]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.isBot
                      ? 'bg-gray-800 text-gray-200 border border-gray-700'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {(['discord', 'servers', 'team', 'random'] as const).map(action => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-300 hover:border-lime-400 hover:text-lime-400 transition"
              >
                {t(`chatbot.buttons.${action}`)}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 transition"
              />
              <button
                onClick={handleSend}
                className="bg-lime-400 hover:bg-lime-500 text-gray-900 p-2 rounded-lg transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gray-800 border border-gray-700 hover:border-lime-400 rounded-full p-3 transition-all duration-300 group ${
          isOpen ? 'rotate-0' : ''
        }`}
        aria-label="Chat with MindBot"
      >
        {isOpen ? (
          <MessageCircle className="h-8 w-8 text-lime-400" />
        ) : (
          <img
            src="/images/logos/Face-18.png"
            alt="MindBot"
            className="h-8 w-8 object-contain group-hover:scale-110 transition-transform"
          />
        )}
      </button>
    </>
  );
};
