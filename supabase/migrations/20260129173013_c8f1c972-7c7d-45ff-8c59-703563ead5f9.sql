-- Create leads table for storing game player contact info
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'email')),
  contact_value TEXT NOT NULL,
  wants_info BOOLEAN DEFAULT true,
  accuracy NUMERIC,
  load_time NUMERIC,
  volume_loaded NUMERIC,
  total_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (no auth required for lead capture)
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Only allow backend/admin to read leads (no public read)
CREATE POLICY "No public read"
ON public.leads
FOR SELECT
USING (false);