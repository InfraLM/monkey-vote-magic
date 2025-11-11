-- Create votes table to store all voting data
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  category_title text NOT NULL,
  selected_alternative text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_votes_category_id ON public.votes(category_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at DESC);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
CREATE POLICY "Admins can view all votes"
ON public.votes FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert votes"
ON public.votes FOR INSERT
WITH CHECK (true);

-- Create settings table for global configurations
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Insert default configuration (voting active by default)
INSERT INTO public.settings (key, value) 
VALUES ('voting_active', 'true'::jsonb);

-- RLS Policies for settings
CREATE POLICY "Anyone can read settings"
ON public.settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update settings"
ON public.settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();