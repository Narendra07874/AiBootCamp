import React from 'react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSample: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center text-sm font-bold">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Quick Start Guide</h3>
              <p className="text-xs text-gray-500">3 simple steps to create high-performing event posts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold shrink-0">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Add Your Event Notes</h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Enter the event name and jot down 2-3 rough takeaways, quotes, or thoughts. Or pick a ready-made template from the <strong>Templates</strong> tab.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold shrink-0">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Select Tone & Generate with AI</h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Choose a voice (e.g. <em>Thought Leader</em>, <em>Storyteller</em>, or <em>Key Takeaways</em>). Gemini AI writes a scroll-stopping post formatted for the LinkedIn mobile algorithm.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-xs font-bold shrink-0">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Polish, Preview & Publish</h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Check the realistic LinkedIn feed preview. Use <strong>Viral Hooks</strong> or <strong>Shorten Fluff</strong> to fine-tune. Click <strong>Share to LinkedIn</strong> to post instantly!
              </p>
            </div>
          </div>

          {/* Golden Rules Box */}
          <div className="p-3.5 rounded-xl bg-[#e8f4fc]/60 border border-[#b8ddf7] text-[#004182]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0a66c2] mb-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>LinkedIn Virality Rule of Thumb</span>
            </div>
            <ul className="text-xs space-y-1 text-gray-700 list-disc list-inside">
              <li>Keep sentences short with whitespace — 80% of readers are on mobile devices.</li>
              <li>First 2 lines determine whether users click <em>"...see more"</em>.</li>
              <li>Always end with a specific open-ended question to spark discussion in comments.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
          <button
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>Load sample & try now</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Got it, Let's Build
          </button>
        </div>
      </div>
    </div>
  );
};
