import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  Phone,
  RotateCcw,
  Check,
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Product, StoreSettings } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface AssalAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings | null;
  onOpenProduct: (product: Product) => void;
  onNavigateToTrack: () => void;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
}

const QUICK_PROMPTS = [
  'أفضل أطقم العرائس للموسم الجديد 👰',
  'أريد ملايات قطن مصري 100% 🛏️',
  'اقتراح لحاف شتوي ناعم ودافئ ❄️',
  'ما هي فروعكم ومواعيد العمل؟ 📍',
  'طرق الدفع والشحن المتاحة 🚚',
  'كيف أتتبع طلبي؟ 📦'
];

export const AssalAiAssistant: React.FC<AssalAiAssistantProps> = ({
  isOpen,
  onClose,
  settings,
  onOpenProduct,
  onNavigateToTrack,
}) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: settings?.aiWelcomeMessage ||
        'أهلاً بك في سنتر العسال للمفروشات! 🛏️✨ أنا ASSAL AI، مستشارك الذكي. يمكنني ترشيح أرقى أطقم الملايات، وشرح الخامات والمقاسات، ومساعدتك في اختيار ما يناسب غرفتك وميزانيتك.',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.sendAiMessage(text, messages);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: response.suggestedProducts,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'أهلاً بك! يمكنك دائماً الاتصال بنا مباشرة أو مراسلتنا عبر الواتساب على 01277714100 وسيقوم فريق المبيعات بخدمتك على الفور.',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartFromAi = (product: Product) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    showToast(`تمت إضافة "${product.name}" إلى السلة!`, 'success');
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-50 flex flex-col w-full sm:w-[420px] h-full sm:h-[620px] bg-white sm:rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 text-right">
      {/* Assistant Header */}
      <div className="bg-gradient-to-r from-[#F0F9FF] via-[#FAF9F5] to-[#E0F2FE] border-b border-sky-200/70 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-800 text-sm">ASSAL AI</h3>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                سنتر العسال
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>المساعد الذكي للمفروشات</span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="text-emerald-600 font-semibold">متصل الآن</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFCF9]/60">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-sky-600 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="flex flex-col gap-1 max-w-[82%]">
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tl-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tr-xs shadow-xs'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>

              {/* In-chat Suggested Product Cards */}
              {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                <div className="mt-2 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    منتجات مقترحة من المعرض:
                  </span>
                  {msg.suggestedProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-sky-100 shadow-xs hover:border-sky-300 transition-colors"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 cursor-pointer"
                        onClick={() => onOpenProduct(prod)}
                      />
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenProduct(prod)}>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{prod.name}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-sky-700 font-bold">
                          <span>{prod.price.toLocaleString('ar-EG')} ج.م</span>
                          {prod.originalPrice && (
                            <span className="text-slate-400 line-through text-[10px]">
                              {prod.originalPrice.toLocaleString('ar-EG')} ج.م
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCartFromAi(prod)}
                        className={`p-2 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                          addedIds[prod.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white'
                        }`}
                        title="أضف للسلة"
                      >
                        {addedIds[prod.id] ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[9px] text-slate-400 px-1 self-start">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
              <span>جاري التفكير وتجهيز أفضل النصائح...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="p-2 border-t border-slate-100 bg-white/90 overflow-x-auto scrollbar-none flex gap-1.5">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="text-[11px] bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="اسألني عن أي ملاية، بطانية، لحاف، أو أسعار..."
            disabled={loading}
            className="flex-1 bg-[#FAF9F5] text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-sky-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
