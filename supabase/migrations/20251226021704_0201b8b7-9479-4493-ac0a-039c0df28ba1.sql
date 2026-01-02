-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#f59e0b',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  unit TEXT NOT NULL DEFAULT 'un',
  image TEXT DEFAULT '/placeholder.svg',
  description TEXT DEFAULT '',
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_tags junction table (many-to-many)
CREATE TABLE public.product_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_slug TEXT NOT NULL REFERENCES public.tags(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  UNIQUE (product_id, tag_slug)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, authenticated write)
CREATE POLICY "Anyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
ON public.categories FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete categories"
ON public.categories FOR DELETE
TO authenticated
USING (true);

-- Tags policies (public read, authenticated write)
CREATE POLICY "Anyone can view tags"
ON public.tags FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert tags"
ON public.tags FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tags"
ON public.tags FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tags"
ON public.tags FOR DELETE
TO authenticated
USING (true);

-- Products policies (public read, authenticated write)
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
TO authenticated
USING (true);

-- Product tags policies (public read, authenticated write)
CREATE POLICY "Anyone can view product_tags"
ON public.product_tags FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert product_tags"
ON public.product_tags FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product_tags"
ON public.product_tags FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.categories (slug, name, description) VALUES
  ('doces', 'Doces', 'Sobremesas e docinhos'),
  ('salgados', 'Salgados', 'Salgados variados'),
  ('massas', 'Massas', 'Massas artesanais'),
  ('bebidas', 'Bebidas', 'Bebidas geladas e quentes'),
  ('combos', 'Combos', 'Combos promocionais');

-- Insert initial tags
INSERT INTO public.tags (slug, name, color) VALUES
  ('mais_vendido', 'Mais vendido', '#f59e0b'),
  ('novo', 'Novo', '#10b981'),
  ('promo', 'Promoção', '#ef4444');