import React, { useState } from 'react';
import { Library } from '../types';
import { Bot, Send, Sparkles, BookOpen, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface AiAssistantProps {
  libraries: Library[];
  onOpenDetails: (library: Library) => void;
  onHighlightLibraries: (ids: string[]) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedIds?: string[];
  timestamp: string;
}

const PRESET_PROMPTS = [
  '大宮周辺でWi-Fiと自習室があって夜遅くまで開いている図書館は？',
  '子どもと一緒に絵本をゆったり読めるキッズスペース付き図書館',
  '埼玉県の郷土歴史やビジネス資料が豊富な専門図書館',
  '埼玉県立久喜図書館と熊谷図書館の特徴の違いは？',
  '川越や所沢周辺で駐車場がある静かな図書館'
];

export const AiAssistant: React.FC<AiAssistantProps> = ({
  libraries,
  onOpenDetails,
  onHighlightLibraries,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'こんにちは！埼玉県図書館コンシェルジュAIです。埼玉県内の全主要図書館の開館時間、設備（Wi-Fi・自習室・駐車場・キッズエリア等）、アクセス、蔵書の特徴を把握しています。\n\n「夜20時以降も開いている大宮近くの図書館は？」「子ども連れでおすすめの場所は？」など、気軽にご質問ください！',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);
    setErrorMsg(null);

    try {
      // Send simplified libraries context to server endpoint
      const librariesContext = libraries.map((lib) => ({
        id: lib.id,
        name: lib.name,
        type: lib.type,
        municipality: lib.municipality,
        address: lib.address,
        openingHours: lib.openingHours,
        closedDays: lib.closedDays,
        nearestStation: lib.nearestStation,
        hasWifi: lib.hasWifi,
        hasStudySeats: lib.hasStudySeats,
        hasParking: lib.hasParking,
        hasKidsArea: lib.hasKidsArea,
        isOpenNight: lib.isOpenNight,
        bookCount: lib.bookCount,
        features: lib.features,
        description: lib.description,
      }));

      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userQuery: textToSend,
          librariesContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'AI応答の取得に失敗しました');
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer || '回答を作成できませんでした。',
        recommendedIds: data.recommendedLibraryIds || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (data.recommendedLibraryIds && data.recommendedLibraryIds.length > 0) {
        onHighlightLibraries(data.recommendedLibraryIds);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
          <Bot className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
            AI図書館コンシェルジュ
            <span className="bg-emerald-800/80 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-semibold">
              Gemini 2.5 Flash
            </span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            目的や利用時間・希望環境に応じた最適な埼玉県内図書館をご案内します
          </p>
        </div>
      </div>

      {/* Preset Prompt Pills */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> よくある質問例:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(prompt)}
              disabled={loading}
              className="text-xs bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 font-medium transition-all shadow-2xs hover:border-emerald-300 text-left cursor-pointer"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 min-h-[350px] max-h-[500px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const recommendedLibs = libraries.filter((l) =>
            msg.recommendedIds?.includes(l.id)
          );

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-xs font-bold text-xs ${
                  isAi ? 'bg-emerald-600' : 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : '私'}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 leading-relaxed shadow-2xs ${
                  isAi
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700'
                    : 'bg-emerald-600 text-white font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Recommended Library Cards Attachment */}
                {isAi && recommendedLibs.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> ピックアップおすすめ図書館:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recommendedLibs.map((lib) => (
                        <div
                          key={lib.id}
                          className="bg-emerald-50/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200 dark:border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                              {lib.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              📍 {lib.municipality} ({lib.nearestStation})
                            </span>
                          </div>
                          <button
                            onClick={() => onOpenDetails(lib)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shrink-0 cursor-pointer"
                          >
                            詳細
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={`text-[10px] block text-right mt-1 opacity-60 ${
                    isAi ? 'text-slate-400' : 'text-emerald-100'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-slate-800 rounded-xl w-fit animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>埼玉県図書館データを分析して回答を生成中...</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="例: 静かに勉強できてコンセントがある図書館は？"
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm bg-transparent border-none text-slate-900 dark:text-slate-100 focus:outline-hidden placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>質問送信</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
