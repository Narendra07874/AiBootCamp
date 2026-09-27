import React, { useState } from 'react';
import { HookVariation } from '../types';

interface HooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: string;
  eventName: string;
  onSelectHook: (newHook: string) => void;
  onTriggerToast: (msg: string) => void;
}

export const HooksModal: React.FC<HooksModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  eventName,
  onSelectHook,
  onTriggerToast,
}) => {
  const [hooks, setHooks] = useState<HookVariation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && currentContent) {
      fetchHooks();
    }
  }, [isOpen]);

  const fetchHooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-hooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentContent,
          eventName,
          topic: 'Event Keynotes and Reflections',
        }),
      });
      const data = await res.json();
      if (data.hooks && Array.isArray(data.hooks)) {
        setHooks(data.hooks);
      }
    } catch (e) {
      console.error(e);
      onTriggerToast('Failed to fetch hooks. Using fallback options.');
      setHooks([
        {
          type: 'Question',
          text: `What if the biggest takeaway from ${eventName} isn't what everyone expected?`,
        },
        {
          type: 'Contrarian',
          text: `Most people think conferences are for collecting business cards. Here is the real reason I attended ${eventName}:`,
        },
        {
          type: 'Story',
          text: `Sitting in the keynote hall at ${eventName}, a speaker said one sentence that changed how I think about our industry:`,
        },
        {
          type: 'Bold Insight',
          text: `3 unfiltered realities every team needs to know after ${eventName}:`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">AI Hook Generator</h3>
              <p className="text-xs text-gray-500">Pick a high-converting opening line for your post</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-3 border-[#0a66c2] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-gray-600">
                Gemini is crafting 4 viral hook angles...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hooks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-gray-200 hover:border-[#0a66c2] hover:bg-blue-50/30 transition-all group flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0a66c2] uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {item.type}
                    </span>
                    <button
                      onClick={() => {
                        onSelectHook(item.text);
                        onClose();
                      }}
                      className="text-xs font-semibold text-[#0a66c2] group-hover:bg-[#0a66c2] group-hover:text-white px-2.5 py-1 rounded transition-colors"
                    >
                      Use Hook
                    </button>
                  </div>
                  <p className="text-xs text-gray-800 font-medium leading-relaxed">
                    "{item.text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={fetchHooks}
            disabled={isLoading}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Regenerate angles</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg bg-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
