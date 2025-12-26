# Speaker TTS Books

A modern web application that converts text and EPUB books into audio using browser-based text-to-speech (TTS) technology.

## Features

### Text Reading
- Paste or type text directly into the application
- Automatic sentence segmentation with word-by-word highlighting
- Save texts to database for later reading
- Manage saved texts (view, delete)

### EPUB Book Management
- Upload EPUB files with drag-and-drop or file selection
- Automatic metadata storage (title, file size, upload date)
- Download and delete books
- Reading progress tracking

### Text-to-Speech
- Adjustable playback speed (0.1x - 2.0x)
- Pitch control (0.5 - 2.0)
- Volume control (0% - 100%)
- Multiple voice selection based on system availability
- Play, pause, and stop controls

### Smart Reading Experience
- Automatic sentence highlighting during playback
- Click on any sentence to jump to it
- Automatic scrolling to keep current sentence in view
- Interactive mode toggle for browser extension compatibility
- Screen wake lock to prevent sleep during reading

### EPUB-Specific Features
- Page-by-page navigation
- Progress tracking with automatic and manual save
- Chapter detection and progress display
- Saved reading position recovery

### UI/UX
- Light and dark theme toggle
- Responsive design for mobile, tablet, and desktop
- Color-coded status indicators

## Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Database & Storage**: Supabase (PostgreSQL + Storage)
- **EPUB Handling**: epubjs
- **TTS**: Web Speech API (native browser)

## Setup

### Prerequisites
- Node.js (v18+)
- npm
- Supabase account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Go to your Supabase project SQL editor
2. Run the SQL from `supabase/schema.sql` to create tables
3. Create a storage bucket named "epubs"
4. Run the SQL from `supabase/storage-policies.sql` to configure storage policies

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
├── components/          # React components
│   ├── EpubReader.tsx      # Main reader component
│   ├── PlaybackControls.tsx # Play/pause controls
│   ├── VoiceSettings.tsx    # Voice configuration
│   ├── SentenceHighlight.tsx # Text highlighting
│   ├── EpubUpload.tsx       # File upload
│   ├── EpubsList.tsx        # Book list
│   ├── SavedTextsList.tsx   # Saved texts list
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useEpubReader.ts     # EPUB loading & pagination
│   ├── useSentenceReader.ts # TTS management
│   ├── useTexts.ts          # Text CRUD operations
│   ├── useEpubs.ts          # EPUB file management
│   └── useWakeLock.ts       # Screen wake lock
├── context/             # React contexts
│   └── ThemeContext.tsx     # Theme state
├── page.tsx             # Home page
├── epubs/page.tsx       # EPUB management page
├── epub/[id]/page.tsx   # EPUB reader
└── text/[id]/page.tsx   # Text reader

utils/
└── supabase/            # Supabase client setup
    ├── client.ts
    └── server.ts

supabase/
├── schema.sql           # Database schema
└── storage-policies.sql # Storage bucket policies
```

## Browser Compatibility

- Chrome, Firefox, Safari, Edge (desktop)
- iOS Safari, Android Chrome (mobile)
- Requires Web Speech API support
- Android users may need to configure system TTS settings

## License

MIT
