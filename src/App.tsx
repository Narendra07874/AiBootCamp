import React, { useState, useEffect } from 'react';
import {
  PostGenerationParams,
  GeneratedPostResult,
  SavedDraft,
  EventPreset,
} from './types';
import { EVENT_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { PostGenerator } from './components/PostGenerator';
import { LinkedInPreview } from './components/LinkedInPreview';
import { TemplatesView } from './components/TemplatesView';
import { SavedDrafts } from './components/SavedDrafts';
import { UserGuideModal } from './components/UserGuideModal';
import { HooksModal } from './components/HooksModal';
import { Toast } from './components/Toast';

const DEFAULT_PARAMS: PostGenerationParams = {
  eventName: '',
  theme: '',
  role: 'Attendee',
  highlights: '',
  tone: 'thought_leader',
  length: 'standard',
  includeEmojis: true,
  customTags: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'presets' | 'drafts'>('studio');
  const [params, setParams] = useState<PostGenerationParams>(DEFAULT_PARAMS);
  const [postResult, setPostResult] = useState<GeneratedPostResult | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHooksModalOpen, setIsHooksModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    try {
      const saved = localStorage.getItem('eventpulse_saved_drafts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any legacy dummy sample posts
          return parsed.filter(
            (d: SavedDraft) => d && d.id !== 'initial-sample' && d.content && d.content.trim()
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync drafts to local storage
  useEffect(() => {
    try {
      localStorage.setItem('eventpulse_saved_drafts', JSON.stringify(savedDrafts));
    } catch (e) {
      console.error(e);
    }
  }, [savedDrafts]);

  // Toast timer
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const triggerToast = (msg: string) => setToastMessage(msg);

  // Generate Post with Gemini API
  const handleGenerate = async () => {
    if (!params.eventName) {
      triggerToast('Please provide an event name.');
      return;
    }

    setIsGenerating(true);
    triggerToast('Generating with Gemini AI...');

    try {
      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server returned an error');
      }

      const data: GeneratedPostResult = await res.json();
      if (data && data.content) {
        setPostResult(data);
        setEditedContent(data.content);
        triggerToast('Post created with Gemini AI!');
        
        // Auto scroll to preview on mobile/tablet viewports
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setTimeout(() => {
            const previewEl = document.getElementById('preview-container');
            previewEl?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } else {
        throw new Error('AI returned an empty draft');
      }
    } catch (error: any) {
      console.error('Generate post error:', error);
      triggerToast(error.message || 'Error connecting to AI. Using smart fallback generation.');
      // Graceful fallback
      const fallbackPost = `Reflections from ${params.eventName} today.\n\n${
        params.highlights || 'Key insights and discussions on industry evolution.'
      }\n\nWhat were your biggest takeaways from the sessions?\n\n${params.customTags || '#Conferences #Networking'}`;
      setEditedContent(fallbackPost);
    } finally {
      setIsGenerating(false);
    }
  };

  // Polish / Rewrite Action
  const handlePolish = async (action: 'shorten' | 'punchy' | 'add_cta') => {
    if (!editedContent) return;
    setIsPolishing(true);
    triggerToast('Polishing with Gemini AI...');

    try {
      const res = await fetch('/api/polish-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentContent: editedContent, action }),
      });

      const data = await res.json();
      if (data.polishedContent) {
        setEditedContent(data.polishedContent);
        triggerToast(data.changesMade || 'Post refined!');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Failed to polish post.');
    } finally {
      setIsPolishing(false);
    }
  };

  // Replace hook in content
  const handleSelectHook = (newHook: string) => {
    if (!editedContent) {
      setEditedContent(newHook);
      return;
    }
    const lines = editedContent.split('\n');
    // Replace first paragraph or first line
    const remaining = lines.slice(1).join('\n');
    const updated = `${newHook}\n${remaining.trim() ? remaining : ''}`;
    setEditedContent(updated);
    triggerToast('Hook updated!');
  };

  // Save draft
  const handleSaveDraft = () => {
    if (!editedContent) return;
    const newDraft: SavedDraft = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      eventName: params.eventName || 'Event',
      role: params.role,
      tone: params.tone,
      content: editedContent,
      hashtags: postResult?.suggestedHashtags || [],
      imageUrl: hasImage ? imageUrl : undefined,
      viralityScore: postResult?.viralityScore,
    };
    setSavedDrafts((prev) => [newDraft, ...prev]);
    triggerToast('Draft saved to My Drafts!');
  };

  // Delete draft
  const handleDeleteDraft = (id: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== id));
    triggerToast('Draft deleted.');
  };

  // Load draft into studio
  const handleLoadDraft = (draft: SavedDraft) => {
    setParams((prev) => ({
      ...prev,
      eventName: draft.eventName,
      role: draft.role,
      tone: draft.tone,
    }));
    setEditedContent(draft.content);
    if (draft.imageUrl) {
      setImageUrl(draft.imageUrl);
      setHasImage(true);
    }
    setActiveTab('studio');
    triggerToast('Draft loaded into Studio.');
  };

  // Load preset template
  const handleSelectPreset = (preset: EventPreset) => {
    setParams({
      eventName: preset.title,
      theme: preset.theme,
      role: preset.defaultRole,
      highlights: preset.highlights,
      tone: preset.suggestedTone,
      length: 'standard',
      includeEmojis: true,
      customTags: preset.tags.map((t) => `#${t}`).join(' '),
    });
    setImageUrl(preset.bannerUrl);
    setHasImage(true);
    setActiveTab('studio');
    triggerToast(`Loaded "${preset.title}" template!`);
  };

  // Quick Sample button in header
  const handleLoadSample = () => {
    const randomPreset = EVENT_PRESETS[Math.floor(Math.random() * EVENT_PRESETS.length)];
    handleSelectPreset(randomPreset);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenGuide={() => setIsGuideOpen(true)}
        onLoadSample={handleLoadSample}
        draftsCount={savedDrafts.length}
      />

      {/* Main Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form & AI Controls */}
            <div className="lg:col-span-6">
              <PostGenerator
                params={params}
                onChangeParams={setParams}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onLoadPresetClick={() => setActiveTab('presets')}
                onTriggerToast={triggerToast}
                imageUrl={imageUrl}
                hasImage={hasImage}
                onSetImage={(url) => {
                  setImageUrl(url);
                  setHasImage(true);
                }}
                onRemoveImage={() => {
                  setImageUrl(undefined);
                  setHasImage(false);
                }}
              />
            </div>

            {/* Right Column: LinkedIn Live Preview & Polish */}
            <div id="preview-container" className="lg:col-span-6 lg:sticky lg:top-20">
              <LinkedInPreview
                postResult={postResult}
                editedContent={editedContent}
                onContentChange={setEditedContent}
                eventName={params.eventName}
                role={params.role}
                onSaveDraft={handleSaveDraft}
                onOpenHooksModal={() => setIsHooksModalOpen(true)}
                onTriggerPolish={handlePolish}
                isPolishing={isPolishing}
                onTriggerToast={triggerToast}
                imageUrl={imageUrl}
                onToggleImage={setHasImage}
                hasImage={hasImage}
                isGenerating={isGenerating}
                onRemoveImage={() => {
                  setImageUrl(undefined);
                  setHasImage(false);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <TemplatesView
            onSelectPreset={handleSelectPreset}
            onOpenStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'drafts' && (
          <SavedDrafts
            drafts={savedDrafts}
            onLoadDraft={handleLoadDraft}
            onDeleteDraft={handleDeleteDraft}
            onOpenStudio={() => setActiveTab('studio')}
            onTriggerToast={triggerToast}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">EventPulse AI</span>
            <span>•</span>
            <span>LinkedIn Growth Engine</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-[#0a66c2] transition-colors"
            >
              How to Use
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className="hover:text-[#0a66c2] transition-colors"
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className="hover:text-[#0a66c2] transition-colors"
            >
              Drafts
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadSample={handleLoadSample}
      />

      <HooksModal
        isOpen={isHooksModalOpen}
        onClose={() => setIsHooksModalOpen(false)}
        currentContent={editedContent}
        eventName={params.eventName}
        onSelectHook={handleSelectHook}
        onTriggerToast={triggerToast}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
