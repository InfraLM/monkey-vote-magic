-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create categories table for managing voting categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  alternatives TEXT[] NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS needed - this is public voting data
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories for testing
INSERT INTO public.categories (title, alternatives, display_order) VALUES
('Melhor Artista Nacional', ARRAY['Anitta', 'Ludmilla', 'Alok', 'Gloria Groove', 'Matuê'], 1),
('Melhor Música do Ano', ARRAY['Vai Malandra', 'Envolver', 'Modo Turbo', 'Nosso Quadro', 'Bang'], 2),
('Melhor Evento', ARRAY['Rock in Rio', 'Lollapalooza', 'Primavera Sound', 'The Town', 'Coachella'], 3);