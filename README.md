# EventPulse AI - LinkedIn Post Studio 🚀

Turn conference insights, event takeaways, and keynote quotes into high-impact, viral LinkedIn posts powered by Google Gemini AI.

![EventPulse AI](https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80)

## 🌟 Key Features

- **⚡ Real-Time LinkedIn Feed Preview**: Pixel-accurate simulation of the LinkedIn feed card with editable author profiles, readable whitespace formatting, character & word counters, and algorithm virality scoring.
- **🧠 Google Gemini 3 AI Integration**:
  - **Auto-Generate Notes & Keynote Quotes**: Generates authentic speaker quotes and takeaways based on event name, attendee role, and topics.
  - **Rephrase & Structure Rough Notes**: Cleans up messy shorthand notes into structured bullet points.
  - **AI Polish & Fine-Tuning**: Instant 1-click tools for *Shorten Fluff*, *Make Punchy*, and *Strong CTA*.
  - **Scroll-Stopping Viral Hooks**: Generates question, contrarian, story, and bold opening hooks.
- **📷 Photo & Media Provision**:
  - Upload photos directly from your computer or phone (keynote stage, attendee selfies, conference hall).
  - Curated library of high-resolution stock conference photos.
  - Custom image URL support.
- **🌐 Dynamic Real-World Trending Hashtags**:
  - AI discovers official event hashtags (e.g. `#AWSreInvent`, `#CloudNext`, `#KubeCon`, `#CES2026`).
  - Discovers high-velocity topic tags and high-reach distribution tags.
  - 1-click interactive hashtag chips to add/remove tags dynamically.
- **📋 1-Click Event Templates & Presets**: Pre-configured conference templates (*Global AI Summit*, *SaaS Founders Retreat*, *NextGen Cloud & Systems*, *UX Design 2026*).
- **📁 Saved Drafts**: Save favorite posts locally, edit anytime, or share straight to LinkedIn.
- **🚀 1-Click Direct LinkedIn Post**: Copies content to clipboard and opens the LinkedIn composer with formatted text.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide / Material Symbols
- **Backend**: Node.js, Express, Vite middleware
- **AI Engine**: Google Gemini API (`@google/genai` SDK with `gemini-3.8-flash`)
- **Build Tool**: Vite, TSX

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Narendra07874/AiBootCamp.git
cd AiBootCamp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and add your Gemini API Key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*(Get a free API key from [Google AI Studio](https://aistudio.google.com/))*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📄 License
MIT License. Created for AI BootCamp.
