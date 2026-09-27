import React from 'react';
import { EVENT_PRESETS } from '../data/presets';
import { EventPreset } from '../types';

interface PresetsModalProps {
  onSelectPreset: (preset: EventPreset) => void;
  onOpenStudio: () => void;
}

export const TemplatesView: React.FC<PresetsModalProps> = ({
  onSelectPreset,
  onOpenStudio,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0a66c2] text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 mb-3">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>1-Click Event Templates</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Choose an Event Template to Get Started
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Select any conference or meetup format below. All fields in the studio will auto-populate with realistic notes so you can generate an AI post instantly.
        </p>
      </div>

      {/* Grid of presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {EVENT_PRESETS.map((preset) => (
          <div
            key={preset.id}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-[#0a66c2]/60 transition-all p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0a66c2] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{preset.icon}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      {preset.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base group-hover:text-[#0a66c2] transition-colors">
                      {preset.title}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {preset.defaultRole}
                </span>
              </div>

              <p className="text-xs font-medium text-gray-700 mb-2">
                <strong>Focus:</strong> {preset.theme}
              </p>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3">
                <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                  Sample Raw Notes:
                </span>
                <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-line leading-relaxed">
                  {preset.highlights}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {preset.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] text-[#0a66c2] bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 capitalize">
                Tone: <span className="font-medium text-gray-700">{preset.suggestedTone.replace('_', ' ')}</span>
              </span>
              <button
                onClick={() => {
                  onSelectPreset(preset);
                  onOpenStudio();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Use Template</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
