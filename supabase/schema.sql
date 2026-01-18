-- Create table for saved texts
CREATE TABLE IF NOT EXISTS saved_texts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_texts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
-- In production, you should restrict this based on user authentication
CREATE POLICY "Allow all operations on saved_texts"
  ON saved_texts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS saved_texts_created_at_idx ON saved_texts(created_at DESC);

-- Create table for EPUB books metadata
CREATE TABLE IF NOT EXISTS epubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE epubs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations on epubs"
  ON epubs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS epubs_uploaded_at_idx ON epubs(uploaded_at DESC);

-- Create table for EPUB reading progress
CREATE TABLE IF NOT EXISTS epub_reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  epub_id UUID NOT NULL REFERENCES epubs(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 0,
  current_sentence INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(epub_id)
);

-- Enable Row Level Security
ALTER TABLE epub_reading_progress ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations on epub_reading_progress"
  ON epub_reading_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS epub_reading_progress_epub_id_idx ON epub_reading_progress(epub_id);
CREATE INDEX IF NOT EXISTS epub_reading_progress_last_read_at_idx ON epub_reading_progress(last_read_at DESC);

-- Create table for user preferences (speech synthesis settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rate DECIMAL(3, 1) NOT NULL DEFAULT 1.0,
  pitch DECIMAL(3, 1) NOT NULL DEFAULT 1.0,
  volume DECIMAL(3, 1) NOT NULL DEFAULT 1.0,
  selected_voice TEXT,
  meditation_mode BOOLEAN NOT NULL DEFAULT false,
  meditation_pause DECIMAL(4, 1) NOT NULL DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for development)
CREATE POLICY "Allow all operations on user_preferences"
  ON user_preferences
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_preferences_updated_at_idx ON user_preferences(updated_at DESC);
