import React, { useState, useRef } from 'react';
import { PostGenerationParams, ToneOption, LengthOption, DiscoveredHashtags } from '../types';

interface PostGeneratorProps {
  params: PostGenerationParams;
  onChangeParams: (updater: (prev: PostGenerationParams) => PostGenerationParams) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onLoadPresetClick: () => void;
  onTriggerToast: (msg: string) => void;
  imageUrl?: string;
  hasImage: boolean;
  onSetImage: (url: string) => void;
  onRemoveImage: () => void;
}

const STOCK_EVENT_IMAGES = [
  {
    id: 'keynote',
    label: 'Keynote Stage',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    icon: 'podium',
  },
  {
    id: 'networking',
    label: 'Networking Crowd',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    icon: 'groups',
  },
  {
    id: 'expo',
    label: 'Tech Expo Booths',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    icon: 'storefront',
  },
  {
    id: 'workshop',
    label: 'Panel & Discussion',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    icon: 'forum',
  },
  {
    id: 'hackathon',
    label: 'Dev Hackathon',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    icon: 'terminal',
  },
  {
    id: 'arena',
    label: 'Conference Arena',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    icon: 'stadium',
  },
];

const TONES: { id: ToneOption; name: string; icon: string; desc: string }[] = [
  {
    id: 'thought_leader',
    name: 'Thought Leader',
    icon: 'psychology',
    desc: 'Authoritative, industry trend analysis & market vision',
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    icon: 'auto_stories',
    desc: 'Personal realization, narrative hook & relatable journey',
  },
  {
    id: 'bullet_takeaways',
    name: 'Key Takeaways',
    icon: 'format_list_bulleted',
    desc: 'Actionable bullet points with high bookmark/save rate',
  },
  {
    id: 'gratitude',
    name: 'Gratitude & Shoutout',
    icon: 'favorite',
    desc: 'Warm recognition of speakers, organizers & community',
  },
  {
    id: 'discussion_starter',
    name: 'Discussion Starter',
    icon: 'forum',
    desc: 'Contrarian question & high-comment engagement spark',
  },
];

const ROLES = ['Attendee', 'Speaker / Panelist', 'Organizer / Host', 'Sponsor / Exhibitor', 'VIP Guest'];

export const PostGenerator: React.FC<PostGeneratorProps> = ({
  params,
  onChangeParams,
  onGenerate,
  isGenerating,
  onLoadPresetClick,
  onTriggerToast,
  imageUrl,
  hasImage,
  onSetImage,
  onRemoveImage,
}) => {
  const [isAutoGeneratingNotes, setIsAutoGeneratingNotes] = useState(false);
  const [isRephrasingNotes, setIsRephrasingNotes] = useState(false);
  const [isDiscoveringHashtags, setIsDiscoveringHashtags] = useState(false);
  const [discoveredHashtags, setDiscoveredHashtags] = useState<DiscoveredHashtags | null>(null);

  // Image controls state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isStockGalleryOpen, setIsStockGalleryOpen] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onTriggerToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSetImage(reader.result);
        onTriggerToast('Photo uploaded and attached to LinkedIn post!');
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSetImage(reader.result);
          onTriggerToast('Photo attached to LinkedIn post!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // URL submit handler
  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    onSetImage(customUrlInput.trim());
    setIsUrlInputOpen(false);
    setCustomUrlInput('');
    onTriggerToast('Image URL applied to LinkedIn post!');
  };

  // Discover popular real-world trending hashtags from the internet
  const handleDiscoverTrendingHashtags = async () => {
    if (!params.eventName && !params.theme) {
      onTriggerToast('Please enter an event name or topic above first to discover trending hashtags.');
      return;
    }

    setIsDiscoveringHashtags(true);
    onTriggerToast('Searching live web & social media for trending event hashtags...');

    try {
      const res = await fetch('/api/discover-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: params.eventName,
          theme: params.theme,
          role: params.role,
        }),
      });

      if (!res.ok) throw new Error('Failed to discover hashtags');

      const data: DiscoveredHashtags = await res.json();
      setDiscoveredHashtags(data);
      onTriggerToast('Trending hashtags discovered from the web!');
    } catch (e) {
      console.error(e);
      const cleanEvent = params.eventName.replace(/[^a-zA-Z0-9]/g, '');
      setDiscoveredHashtags({
        officialEventTags: [`#${cleanEvent || 'TechEvent2026'}`],
        trendingTopicTags: ['#GenerativeAI', '#TechInnovation', '#Engineering'],
        highEngagementTags: ['#Leadership', '#ProfessionalNetworking', '#FutureOfTech'],
        explanation: 'Top trending hashtags on LinkedIn for technology and business conferences.',
      });
      onTriggerToast('Loaded popular hashtag recommendations.');
    } finally {
      setIsDiscoveringHashtags(false);
    }
  };

  // Toggle individual hashtag in customTags
  const handleToggleHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    const currentTags = params.customTags ? params.customTags.split(/\s+/).filter(Boolean) : [];
    const exists = currentTags.some((t) => t.toLowerCase() === cleanTag.toLowerCase());

    if (exists) {
      const filtered = currentTags.filter((t) => t.toLowerCase() !== cleanTag.toLowerCase()).join(' ');
      onChangeParams((prev) => ({ ...prev, customTags: filtered }));
      onTriggerToast(`Removed ${cleanTag}`);
    } else {
      const updated = [...currentTags, cleanTag].join(' ');
      onChangeParams((prev) => ({ ...prev, customTags: updated }));
      onTriggerToast(`Added ${cleanTag}`);
    }
  };

  // Add all discovered tags
  const handleAddAllDiscoveredTags = () => {
    if (!discoveredHashtags) return;
    const all = [
      ...discoveredHashtags.officialEventTags,
      ...discoveredHashtags.trendingTopicTags,
      ...discoveredHashtags.highEngagementTags,
    ];
    const currentTags = params.customTags ? params.customTags.split(/\s+/).filter(Boolean) : [];
    const merged = Array.from(new Set([...currentTags, ...all])).join(' ');
    onChangeParams((prev) => ({ ...prev, customTags: merged }));
    onTriggerToast('All trending hashtags added to post!');
  };

  // Auto-generate realistic notes & quotes based on event name, role, and topics
  const handleAutoGenerateNotes = async () => {
    if (!params.eventName || !params.eventName.trim()) {
      onTriggerToast('Please enter an event name above first.');
      return;
    }

    setIsAutoGeneratingNotes(true);
    onTriggerToast('Gemini is generating realistic notes & quotes for your event...');

    try {
      const res = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: params.eventName,
          role: params.role,
          theme: params.theme,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to auto-generate notes');
      }

      const data = await res.json();
      if (data.notes) {
        onChangeParams((prev) => ({
          ...prev,
          highlights: data.notes,
        }));
        onTriggerToast('Notes and quotes auto-generated based on your event!');
      }
    } catch (error) {
      console.error(error);
      // Smart client-side fallback if network error
      const fallback = `• Keynote quote: "The future belongs to operators who build robust feedback loops, not those chasing hype."
• Session takeaway: Real-world adoption of ${params.theme || 'new technologies'} demands strong reliability and low latency.
• Role perspective (${params.role}): Met with fellow leaders confronting similar scaling hurdles and exchanged actionable playbooks.
• Contrarian insight: Incremental workflow optimization frequently outperforms complete rebuilds.`;
      onChangeParams((prev) => ({ ...prev, highlights: fallback }));
      onTriggerToast('Loaded smart notes & quotes fallback.');
    } finally {
      setIsAutoGeneratingNotes(false);
    }
  };

  // Rephrase and polish user's raw notes
  const handleRephraseNotes = async () => {
    if (!params.highlights || !params.highlights.trim()) {
      onTriggerToast('Please write some notes or thoughts first to rephrase.');
      return;
    }

    setIsRephrasingNotes(true);
    onTriggerToast('Rephrasing and structuring your notes with AI...');

    try {
      const res = await fetch('/api/rephrase-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawNotes: params.highlights,
          eventName: params.eventName || 'Event',
          role: params.role,
          theme: params.theme,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to rephrase notes');
      }

      const data = await res.json();
      if (data.rephrasedNotes) {
        onChangeParams((prev) => ({
          ...prev,
          highlights: data.rephrasedNotes,
        }));
        onTriggerToast('Notes rephrased and polished with clear structure!');
      }
    } catch (error) {
      console.error(error);
      onTriggerToast('Could not rephrase notes. Please try again.');
    } finally {
      setIsRephrasingNotes(false);
    }
  };

  // Quick insertion helpers
  const handleInsertQuoteTemplate = () => {
    const quoteTemplate = `\n• Keynote quote: "Replace this with speaker's quote or insight"`;
    onChangeParams((prev) => ({
      ...prev,
      highlights: prev.highlights ? prev.highlights + quoteTemplate : quoteTemplate.trim(),
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-6 flex flex-col gap-5">
      {/* Top Title & Preset Trigger */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a66c2]"></span>
            Post Details & AI Voice
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Provide rough thoughts or auto-generate notes. Gemini will format it for LinkedIn.
          </p>
        </div>
        <button
          onClick={onLoadPresetClick}
          className="text-xs font-semibold text-[#0a66c2] hover:text-[#004182] hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">auto_stories</span>
          <span>Browse Templates</span>
        </button>
      </div>

      {/* Event Basics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={params.eventName}
            onChange={(e) =>
              onChangeParams((prev) => ({ ...prev, eventName: e.target.value }))
            }
            placeholder="e.g. Global AI Summit SF 2026"
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition-all placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Your Role at the Event
          </label>
          <select
            value={params.role}
            onChange={(e) =>
              onChangeParams((prev) => ({ ...prev, role: e.target.value }))
            }
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition-all bg-white"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Topic / Key Theme
        </label>
        <input
          type="text"
          value={params.theme}
          onChange={(e) =>
            onChangeParams((prev) => ({ ...prev, theme: e.target.value }))
          }
          placeholder="e.g. Autonomous AI Agents, Production Infrastructure, or Founder Scaling"
          className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Raw Takeaways, Notes & Quotes Section with AI Controls */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-gray-800">
              Notes, Quotes & Highlights <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400">(Your thoughts or AI-generated)</span>
          </div>

          {/* Action buttons for Notes */}
          <div className="flex items-center gap-1.5">
            {/* Auto-generate notes & quotes */}
            <button
              type="button"
              onClick={handleAutoGenerateNotes}
              disabled={isAutoGeneratingNotes || !params.eventName}
              title="Generate realistic event takeaways & keynote quotes based on event name, role and topics"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0a66c2] hover:text-white bg-[#e8f4fc] hover:bg-[#0a66c2] border border-[#bde0f7] px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              {isAutoGeneratingNotes ? (
                <div className="w-3 h-3 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              )}
              <span>{isAutoGeneratingNotes ? 'Generating...' : 'Auto-Generate Notes & Quotes'}</span>
            </button>

            {/* Rephrase user's own notes */}
            <button
              type="button"
              onClick={handleRephraseNotes}
              disabled={isRephrasingNotes || !params.highlights || !params.highlights.trim()}
              title="Rephrase and structure your rough notes into crisp bullet takeaways with AI"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRephrasingNotes ? (
                <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[14px]">edit_note</span>
              )}
              <span>{isRephrasingNotes ? 'Rephrasing...' : 'Rephrase Notes'}</span>
            </button>
          </div>
        </div>

        <textarea
          rows={5}
          value={params.highlights}
          onChange={(e) =>
            onChangeParams((prev) => ({ ...prev, highlights: e.target.value }))
          }
          placeholder="Jot down rough notes, or click 'Auto-Generate Notes & Quotes' above!
• Keynote quote: 'Evaluation harnesses matter 10x more than prompt tricks.'
• Met engineering leaders building autonomous multi-agent pipelines.
• Realized latency and observability matter 10x more than model size."
          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition-all placeholder:text-gray-400 resize-y leading-relaxed font-sans"
        />

        {/* Helper chips */}
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Quick insert:</span>
            <button
              type="button"
              onClick={handleInsertQuoteTemplate}
              className="text-[#0a66c2] hover:underline flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[12px]">format_quote</span>
              <span>+ Keynote Quote</span>
            </button>
            {params.highlights && (
              <button
                type="button"
                onClick={() => onChangeParams((prev) => ({ ...prev, highlights: '' }))}
                className="text-gray-400 hover:text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <span>{params.highlights.length} characters</span>
        </div>
      </div>

      {/* PROVISION TO ADD IMAGES */}
      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#0a66c2]">photo_camera</span>
            <label className="text-xs font-semibold text-gray-800">
              Attach Image / Event Photo
            </label>
            <span className="text-[11px] text-gray-400">(Increases LinkedIn reach by 2x)</span>
          </div>

          {hasImage && imageUrl && (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Photo Attached
            </span>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {hasImage && imageUrl ? (
          /* Image Thumbnail Preview & Actions */
          <div className="relative group overflow-hidden rounded-xl border border-gray-200 bg-gray-900 flex items-center justify-between p-2.5">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0 border border-white/20">
                <img
                  src={imageUrl}
                  alt="Attached event preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Event Visual Attached</p>
                <p className="text-[11px] text-gray-300">Ready to display on your LinkedIn feed card</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Replace photo"
                className="px-2.5 py-1 text-xs font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                title="Remove photo"
                className="p-1 text-red-300 hover:text-white hover:bg-red-600/80 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Upload Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-3.5 transition-all text-center ${
              isDraggingOver
                ? 'border-[#0a66c2] bg-blue-50/70'
                : 'border-gray-300 bg-white hover:border-[#0a66c2]/50 hover:bg-blue-50/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                <span>Upload Device Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsStockGalleryOpen(!isStockGalleryOpen)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-[#0a66c2]">collections</span>
                <span>Stock Event Photos</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUrlInputOpen(!isUrlInputOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span>URL</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mt-2">
              Drop conference photos or stage screenshots here • Supports PNG, JPG, WebP
            </p>
          </div>
        )}

        {/* URL Input Dropdown */}
        {isUrlInputOpen && !hasImage && (
          <div className="mt-3 flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Paste direct image URL (https://...)"
              className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 bg-[#0a66c2] text-white text-xs font-semibold rounded-lg hover:bg-[#004182] transition-colors cursor-pointer"
            >
              Attach
            </button>
            <button
              type="button"
              onClick={() => setIsUrlInputOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Stock Conference Photo Library */}
        {isStockGalleryOpen && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-gray-600">
                Choose a High-Res Conference Photo:
              </span>
              <button
                type="button"
                onClick={() => setIsStockGalleryOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STOCK_EVENT_IMAGES.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    onSetImage(img.url);
                    setIsStockGalleryOpen(false);
                    onTriggerToast(`Attached ${img.label} photo!`);
                  }}
                  className="group text-left rounded-xl overflow-hidden border border-gray-200 hover:border-[#0a66c2] relative h-20 transition-all focus:outline-hidden cursor-pointer"
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                    <span className="text-[11px] font-semibold text-white truncate drop-shadow-xs">
                      {img.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tone & Style Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Select AI Voice & Tone
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TONES.map((tone) => {
            const isSelected = params.tone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() =>
                  onChangeParams((prev) => ({ ...prev, tone: tone.id }))
                }
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-[#0a66c2] bg-blue-50/50 shadow-2xs ring-1 ring-[#0a66c2]'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0a66c2] text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tone.icon}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    {tone.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug line-clamp-1">
                    {tone.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format Controls: Length & Emojis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Post Length
          </label>
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
            {(['concise', 'standard', 'in_depth'] as LengthOption[]).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() =>
                  onChangeParams((prev) => ({ ...prev, length: len }))
                }
                className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  params.length === len
                    ? 'bg-white text-gray-900 font-semibold shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {len === 'in_depth' ? 'Deep' : len}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Subtle Emojis
          </label>
          <div className="flex items-center justify-between p-2 rounded-xl border border-gray-200 bg-gray-50/50">
            <span className="text-xs text-gray-600">Tasteful icons (2-3 max)</span>
            <button
              type="button"
              onClick={() =>
                onChangeParams((prev) => ({
                  ...prev,
                  includeEmojis: !prev.includeEmojis,
                }))
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                params.includeEmojis ? 'bg-[#0a66c2]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  params.includeEmojis ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* DYNAMIC TRENDING HASHTAGS FROM THE INTERNET */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700">
              Hashtags & Mentions
            </label>
            <p className="text-[11px] text-gray-400">
              Add manually or click below to discover popular live tags from the web
            </p>
          </div>

          <button
            type="button"
            onClick={handleDiscoverTrendingHashtags}
            disabled={isDiscoveringHashtags || (!params.eventName && !params.theme)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0a66c2] hover:text-[#004182] bg-blue-50 hover:bg-blue-100/80 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
          >
            {isDiscoveringHashtags ? (
              <div className="w-3.5 h-3.5 border-2 border-[#0a66c2] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            )}
            <span>{isDiscoveringHashtags ? 'Searching Web...' : 'Discover Trending Hashtags'}</span>
          </button>
        </div>

        {/* Input box */}
        <input
          type="text"
          value={params.customTags}
          onChange={(e) =>
            onChangeParams((prev) => ({ ...prev, customTags: e.target.value }))
          }
          placeholder="e.g. #AWSreInvent #GenerativeAI #CloudArchitecture"
          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#0a66c2] focus:ring-2 focus:ring-[#0a66c2]/10 transition-all placeholder:text-gray-400 font-mono"
        />

        {/* Discovered Trending Hashtags Widget */}
        {discoveredHashtags && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#0a66c2] text-[16px]">trending_up</span>
                <span>Popular Real-World Tags from the Web</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddAllDiscoveredTags}
                  className="text-[11px] font-bold text-[#0a66c2] hover:underline cursor-pointer"
                >
                  + Add All
                </button>
                {params.customTags && (
                  <button
                    type="button"
                    onClick={() => onChangeParams((prev) => ({ ...prev, customTags: '' }))}
                    className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Official Event Tags */}
            {discoveredHashtags.officialEventTags.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  🏷️ Official Event Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {discoveredHashtags.officialEventTags.map((tag) => {
                    const isSelected = (params.customTags || '')
                      .toLowerCase()
                      .includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleHashtag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-2xs font-semibold'
                            : 'bg-white text-[#0a66c2] border-blue-200 hover:border-[#0a66c2]'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trending Topic Tags */}
            {discoveredHashtags.trendingTopicTags.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  🔥 Trending Topic & Tech Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {discoveredHashtags.trendingTopicTags.map((tag) => {
                    const isSelected = (params.customTags || '')
                      .toLowerCase()
                      .includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleHashtag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-2xs font-semibold'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#0a66c2]'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* High-Engagement Industry Tags */}
            {discoveredHashtags.highEngagementTags.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  🚀 High-Reach Distribution Tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {discoveredHashtags.highEngagementTags.map((tag) => {
                    const isSelected = (params.customTags || '')
                      .toLowerCase()
                      .includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleHashtag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-2xs font-semibold'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#0a66c2]'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanatory algorithm reach tip */}
            {discoveredHashtags.explanation && (
              <p className="text-[11px] text-gray-500 italic pt-1 border-t border-blue-100/80">
                💡 {discoveredHashtags.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main AI Trigger Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !params.eventName}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0a66c2] via-[#004e99] to-[#003870] hover:opacity-95 text-white font-bold text-sm shadow-md shadow-[#0a66c2]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Post with Gemini AI...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
                auto_awesome
              </span>
              <span>Generate Post with AI</span>
            </>
          )}
        </button>
        {!params.eventName && (
          <p className="text-[11px] text-amber-600 mt-1 text-center font-medium">
            Please enter an event name above to generate.
          </p>
        )}
      </div>
    </div>
  );
};
