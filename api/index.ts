import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini client with recommended User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust JSON parser handling potential markdown fences, preamble, or raw text from LLMs
function safeParseJson(rawText: string, fallback: any = {}) {
  if (!rawText || typeof rawText !== 'string') return fallback;
  try {
    return JSON.parse(rawText);
  } catch {
    let cleaned = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
        } catch {}
      }
    }
  }
  return fallback;
}

// Health check endpoint for Vercel and monitoring
app.get(['/api/health', '/health', '/api'], (_req, res) => {
  res.json({
    status: 'ok',
    service: 'EventPulse AI LinkedIn Post Generator API',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Generate high-impact LinkedIn post
app.post(['/api/generate-post', '/generate-post'], async (req, res) => {
  try {
    const {
      eventName = 'Tech Summit',
      theme = '',
      role = 'Attendee',
      highlights = '',
      tone = 'thought_leader',
      length = 'standard',
      includeEmojis = true,
      customTags = '',
    } = req.body;

    const toneInstructions: Record<string, string> = {
      thought_leader: 'Authoritative, visionary, industry-level insight, framing observations into broader market or technology trends. High dwell-time format.',
      storyteller: 'Engaging personal narrative hook, beginning with a specific moment or realization, lessons learned, and relatable takeaway.',
      bullet_takeaways: 'Clear, high-value bullet points summarizing top 3-4 actionable learnings. Easy to scan and bookmark/save.',
      gratitude: 'Warm, appreciative, celebrating the speakers, organizers, and fellow attendees with energetic community shoutouts.',
      discussion_starter: 'Contrarian or thought-provoking observation with an open-ended question at the end to spark high comment engagement.',
    };

    const lengthInstructions: Record<string, string> = {
      concise: 'Short and punchy, approximately 100-140 words. Direct hook and rapid insight.',
      standard: 'Balanced length, approximately 200-260 words. Strong hook, body paragraphs with whitespace, and call-to-action.',
      in_depth: 'Detailed breakdown, approximately 300-380 words. Deep dive with comprehensive takeaways.',
    };

    const prompt = `You are a world-class LinkedIn ghostwriter and viral growth strategist for professionals and event attendees.
Write an authentic, highly engaging LinkedIn post based on the following event experience:

- Event Name: ${eventName}
- Event Theme/Focus: ${theme || 'Latest technology, innovations, and networking'}
- Author Role: ${role}
- User's Raw Notes / Key Highlights:
${highlights || 'Attended keynotes, networked with industry peers, learned key insights on future trends.'}

Writing Style & Guidelines:
- Tone Style: ${toneInstructions[tone] || toneInstructions.thought_leader}
- Length: ${lengthInstructions[length] || lengthInstructions.standard}
- Emojis: ${includeEmojis ? 'Use subtle, tasteful emojis (2-4 max) to enhance readability, never overwhelm' : 'No emojis at all'}
- Formatting: Use single-line breaks between sentences or short 1-2 sentence paragraphs. LinkedIn algorithm favors readable white-space!
- First Line: Must be an irresistible hook that stops the scroll (no generic "I am thrilled to announce" or "Yesterday I attended").
- Call to Action: End with an engaging prompt or question encouraging discussion in the comments.
- Custom Tags / Hashtags requested: ${customTags || 'None specified'}
- Internet & Social Media Trend Strategy: Dynamically select and incorporate the most popular, real-world hashtags trending on LinkedIn and the internet for this event and topic (including the official event tag like #CES2026, #AWSreInvent, #GTC26, and high-velocity topic tags like #GenerativeAI, #CloudComputing). Place 3-5 top hashtags at the very bottom of the post and list them in suggestedHashtags.

Return your response in valid JSON with these exact fields:
{
  "hook": "The punchy opening line of the post",
  "content": "The full post text including the hook, body, call-to-action, and trailing popular hashtags",
  "suggestedHashtags": ["tag1", "tag2", "tag3", "tag4"],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "viralityScore": 88,
  "viralityTip": "Brief one-sentence tip on why this post will perform well on the LinkedIn algorithm"
}`;

    const callGemini = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook: { type: Type.STRING },
              content: { type: Type.STRING },
              suggestedHashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              viralityScore: { type: Type.NUMBER },
              viralityTip: { type: Type.STRING },
            },
            required: ['hook', 'content', 'suggestedHashtags', 'keyTakeaways', 'viralityScore', 'viralityTip'],
          },
        },
      });
    };

    let response;
    try {
      response = await callGemini('gemini-3.8-flash');
    } catch (modelErr: any) {
      console.warn('Primary model busy, retrying with fallback model...', modelErr?.message);
      response = await callGemini('gemini-3.1-flash-lite');
    }

    const raw = response?.text || '';
    let parsed = safeParseJson(raw, null);
    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }

    const content = (parsed.content || parsed.post || parsed.postContent || parsed.text || parsed.body || raw || '').trim();
    const finalContent = content || `Reflections from ${eventName} today.\n\n${highlights || 'Great discussions, insights, and community connections.'}\n\nWhat were your biggest takeaways from the sessions?`;
    const finalHook = (parsed.hook || finalContent.split('\n')[0] || `Reflections from ${eventName}`).trim();
    const finalTags = Array.isArray(parsed.suggestedHashtags) && parsed.suggestedHashtags.length > 0 
      ? parsed.suggestedHashtags 
      : ['LinkedIn', 'Networking', 'Conferences'];
    const finalTakeaways = Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0
      ? parsed.keyTakeaways
      : ['Valuable peer discussions', 'Industry future directions'];
    const finalScore = typeof parsed.viralityScore === 'number' && !isNaN(parsed.viralityScore) ? parsed.viralityScore : 88;
    const finalTip = parsed.viralityTip || 'Strong opening hook and mobile-friendly paragraph spacing.';

    res.json({
      hook: finalHook,
      content: finalContent,
      suggestedHashtags: finalTags,
      keyTakeaways: finalTakeaways,
      viralityScore: finalScore,
      viralityTip: finalTip,
    });
  } catch (error: any) {
    console.error('Error generating post:', error);
    res.status(500).json({
      error: 'Failed to generate post with AI. ' + (error?.message || 'Please try again.'),
    });
  }
});

// Endpoint: Generate alternative hooks
app.post(['/api/generate-hooks', '/generate-hooks'], async (req, res) => {
  try {
    const { currentContent, eventName, topic } = req.body;

    const prompt = `Given this LinkedIn post draft about "${eventName}" (${topic}):
"""
${currentContent}
"""

Generate 4 distinctly different, high-performing opening hooks that stop readers from scrolling on LinkedIn:
1. Question Hook (provocative question)
2. Counter-intuitive / Contrarian Hook (challenges common belief)
3. Story / Vulnerable Hook (personal realization)
4. Bold Result / Data Hook (striking takeaway)

Return in JSON format:
{
  "hooks": [
    { "type": "Question", "text": "..." },
    { "type": "Contrarian", "text": "..." },
    { "type": "Story", "text": "..." },
    { "type": "Bold Insight", "text": "..." }
  ]
}`;

    const callHooks = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hooks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['type', 'text'],
                },
              },
            },
            required: ['hooks'],
          },
        },
      });
    };

    let response;
    try {
      response = await callHooks('gemini-3.8-flash');
    } catch {
      response = await callHooks('gemini-3.1-flash-lite');
    }

    const raw = response?.text || '';
    const parsed = safeParseJson(raw, { hooks: [] });
    const hooks = Array.isArray(parsed.hooks) && parsed.hooks.length > 0 ? parsed.hooks : [
      { type: 'Question', text: `What if the biggest takeaway from ${eventName} isn't what everyone expected?` },
      { type: 'Contrarian', text: `Most people think conferences are for collecting business cards. Here is the real reason I attended ${eventName}:` },
      { type: 'Story', text: `Sitting in the keynote hall at ${eventName}, a speaker said one sentence that changed everything:` },
      { type: 'Bold Insight', text: `3 unfiltered realities every team needs to know after ${eventName}:` }
    ];
    res.json({ hooks });
  } catch (error: any) {
    console.error('Error generating hooks:', error);
    res.status(500).json({ error: 'Failed to generate hooks.' });
  }
});

// Endpoint: Polish / Rewrite post
app.post(['/api/polish-post', '/polish-post'], async (req, res) => {
  try {
    const { currentContent, action } = req.body;

    let instruction = 'Improve readability, make the flow smoother, and ensure high engagement on LinkedIn.';
    if (action === 'shorten') {
      instruction = 'Cut unnecessary fluff and condense the post to be 30-40% shorter, keeping only the punchiest insights.';
    } else if (action === 'punchy') {
      instruction = 'Make sentences punchier, more impactful, and add high-voltage phrasing while maintaining authenticity.';
    } else if (action === 'add_cta') {
      instruction = 'Strengthen the call-to-action at the end to maximize comments and conversation from industry leaders.';
    }

    const prompt = `You are an expert LinkedIn copy editor.
Current Draft:
"""
${currentContent}
"""

Goal: ${instruction}
Preserve the core message and voice. Keep nice single-line paragraph breaks suitable for LinkedIn mobile feeds.

Return JSON:
{
  "polishedContent": "...",
  "changesMade": "Brief summary of improvements made"
}`;

    const callPolish = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              polishedContent: { type: Type.STRING },
              changesMade: { type: Type.STRING },
            },
            required: ['polishedContent', 'changesMade'],
          },
        },
      });
    };

    let response;
    try {
      response = await callPolish('gemini-3.8-flash');
    } catch {
      response = await callPolish('gemini-3.1-flash-lite');
    }

    const raw = response?.text || '';
    const parsed = safeParseJson(raw, {});
    const polishedContent = (parsed.polishedContent || parsed.content || raw || currentContent).trim();
    const changesMade = parsed.changesMade || 'Refined tone, flow, and formatting for LinkedIn.';
    res.json({ polishedContent, changesMade });
  } catch (error: any) {
    console.error('Error polishing post:', error);
    res.status(500).json({ error: 'Failed to polish post.' });
  }
});

// Endpoint: Auto-generate realistic event notes and quotes based on event name, role, and topics
app.post(['/api/generate-notes', '/generate-notes'], async (req, res) => {
  try {
    const { eventName = 'Industry Summit', role = 'Attendee', theme = '' } = req.body;

    const prompt = `You are an expert industry analyst and keynote observer.
Create a set of realistic, high-value raw notes and quotes for an event attendee with the following context:

- Event Name: ${eventName}
- Attendee Role: ${role}
- Topic / Focus: ${theme || 'Innovations, strategic shifts, and real-world deployment'}

Instructions:
1. Write 3-4 vivid, authentic bullet takeaways that feel genuinely experienced (not generic fluff).
2. Include at least 1 memorable, punchy keynote quote attributed to a session speaker (e.g., • Keynote quote: "..." or • Main stage takeaway: "...").
3. Include 1 tactical or operational observation relevant to their role (${role}).
4. Include 1 forward-looking insight or contrarian observation.
5. Format the notes with clean bullet points (using • or -).

Return JSON format:
{
  "notes": "• Keynote quote: \"...\"\n• Insight 1: ...\n• Insight 2: ...\n• Forward look: ...",
  "quotes": ["Quote 1", "Quote 2"],
  "summary": "Notes tailored for a ${role} at ${eventName}"
}`;

    const callNotes = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              notes: { type: Type.STRING },
              quotes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              summary: { type: Type.STRING },
            },
            required: ['notes', 'quotes', 'summary'],
          },
        },
      });
    };

    let response;
    try {
      response = await callNotes('gemini-3.8-flash');
    } catch {
      response = await callNotes('gemini-3.1-flash-lite');
    }

    const raw = response?.text || '';
    const parsed = safeParseJson(raw, {});
    const notes = (parsed.notes || raw || '').trim() || `• Keynote quote: "The real moat is the feedback loop, not model scale."\n• Takeaway: Real enterprise deployment of ${theme || 'technology'} prioritizes reliability over hype.\n• Networking insight (${role}): Candid operator playbooks revealed similar friction points in production.`;
    const quotes = Array.isArray(parsed.quotes) ? parsed.quotes : [];
    const summary = parsed.summary || `Notes tailored for ${role} at ${eventName}`;
    res.json({ notes, quotes, summary });
  } catch (error: any) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: 'Failed to auto-generate notes.' });
  }
});

// Endpoint: Rephrase and polish user's raw notes
app.post(['/api/rephrase-notes', '/rephrase-notes'], async (req, res) => {
  try {
    const { rawNotes, eventName = 'Event', role = 'Attendee', theme = '' } = req.body;

    if (!rawNotes || !rawNotes.trim()) {
      return res.status(400).json({ error: 'Please provide notes to rephrase.' });
    }

    const prompt = `You are an elite executive editor and conference scribe.
The user is a "${role}" who attended "${eventName}" (Theme: ${theme || 'Industry conference'}).
They jotted down these rough, unpolished notes:
"""
${rawNotes}
"""

Task:
Transform these rough thoughts into 3-4 crisp, well-structured bullet points that capture the core insights with clarity, punchiness, and professional polish.
- Preserve all key facts, quotes, numbers, and personal observations from the original input.
- If they mentioned a quote or saying, format it clearly in quotation marks.
- Fix grammar, fragments, and formatting so they are ready to become a viral LinkedIn post.
- Keep the voice authentic and conversational, not stiff corporate PR.

Return JSON format:
{
  "rephrasedNotes": "• ...\n• ...\n• ...",
  "improvements": "Brief note on what was clarified"
}`;

    const callRephrase = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rephrasedNotes: { type: Type.STRING },
              improvements: { type: Type.STRING },
            },
            required: ['rephrasedNotes', 'improvements'],
          },
        },
      });
    };

    let response;
    try {
      response = await callRephrase('gemini-3.8-flash');
    } catch {
      response = await callRephrase('gemini-3.1-flash-lite');
    }

    const raw = response?.text || '';
    const parsed = safeParseJson(raw, {});
    const rephrasedNotes = (parsed.rephrasedNotes || parsed.notes || raw || rawNotes).trim();
    const improvements = parsed.improvements || 'Structured thoughts into clean, high-impact bullet points.';
    res.json({ rephrasedNotes, improvements });
  } catch (error: any) {
    console.error('Error rephrasing notes:', error);
    res.status(500).json({ error: 'Failed to rephrase notes.' });
  }
});

// Endpoint: Discover trending hashtags from the web & LinkedIn ecosystem
app.post(['/api/discover-hashtags', '/discover-hashtags'], async (req, res) => {
  try {
    const { eventName = '', theme = '', role = 'Attendee' } = req.body;

    if (!eventName && !theme) {
      return res.status(400).json({ error: 'Please specify an event name or topic to discover hashtags.' });
    }

    const prompt = `You are a social media trends researcher and LinkedIn algorithm specialist.
Analyze current internet trends, social media conventions, and real-world tech/business conferences to discover the most effective hashtags for:

- Event: "${eventName || 'Tech Conference'}"
- Topic/Theme: "${theme || 'AI and Technology Innovations'}"
- Attendee Role: "${role}"

Provide a comprehensive, authoritative list of trending hashtags categorized into:
1. "officialEventTags": Official, registered, or widely recognized convention tags (e.g. #reInvent2026, #CES2026, #GTC2026, #WWDC2026, #MWC2026, etc.). Include exact casing and 2-3 common variations attendees search.
2. "trendingTopicTags": 3-5 real-world hashtags currently trending across tech news, Reddit, and LinkedIn feeds related to "${theme || eventName}" (e.g. #AgenticAI, #Kubernetes, #FinTech, #CyberSecurity).
3. "highEngagementTags": 3-4 evergreen high-velocity LinkedIn algorithm tags that maximize impressions and reach (e.g. #TechLeadership, #Innovation, #FutureOfWork).
4. "explanation": 1 crisp sentence explaining why these hashtags boost visibility and dwell time.

Return valid JSON with these exact fields:
{
  "officialEventTags": ["#OfficialTag1", "#OfficialTag2"],
  "trendingTopicTags": ["#TopicTag1", "#TopicTag2", "#TopicTag3"],
  "highEngagementTags": ["#ReachTag1", "#ReachTag2"],
  "explanation": "..."
}`;

    const callHashtags = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              officialEventTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              trendingTopicTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              highEngagementTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              explanation: { type: Type.STRING },
            },
            required: ['officialEventTags', 'trendingTopicTags', 'highEngagementTags', 'explanation'],
          },
        },
      });
    };

    let response;
    try {
      response = await callHashtags('gemini-3.8-flash');
    } catch {
      response = await callHashtags('gemini-3.1-flash-lite');
    }

    const raw = response?.text || '';
    const parsed = safeParseJson(raw, {});

    const cleanTags = (list: any[]) => {
      if (!Array.isArray(list)) return [];
      return Array.from(
        new Set(
          list
            .map((t) => {
              if (typeof t !== 'string') return '';
              let tag = t.trim();
              if (!tag.startsWith('#')) tag = '#' + tag;
              return tag.replace(/[^a-zA-Z0-9_#]/g, '');
            })
            .filter(Boolean)
        )
      );
    };

    const cleanName = eventName.replace(/[^a-zA-Z0-9]/g, '');
    const officialEventTags = cleanTags(
      parsed.officialEventTags?.length ? parsed.officialEventTags : [`#${cleanName || 'TechEvent2026'}`]
    );
    const trendingTopicTags = cleanTags(
      parsed.trendingTopicTags?.length ? parsed.trendingTopicTags : ['#TechTrends', '#Innovation', '#Engineering']
    );
    const highEngagementTags = cleanTags(
      parsed.highEngagementTags?.length
        ? parsed.highEngagementTags
        : ['#Leadership', '#ProfessionalGrowth', '#Networking']
    );
    const explanation =
      parsed.explanation ||
      'Pairing the official event hashtag with 2-3 focused domain tags yields the highest organic dwell time on LinkedIn.';

    res.json({
      officialEventTags,
      trendingTopicTags,
      highEngagementTags,
      explanation,
    });
  } catch (error: any) {
    console.error('Error discovering hashtags:', error);
    res.status(500).json({ error: 'Failed to discover trending hashtags.' });
  }
});

export default app;
