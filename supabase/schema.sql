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
