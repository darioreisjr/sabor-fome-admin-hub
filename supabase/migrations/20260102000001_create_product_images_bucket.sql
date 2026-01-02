-- Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to product images
CREATE POLICY "Public Access to Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy to allow authenticated users to upload product images
CREATE POLICY "Authenticated Users Can Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update product images
CREATE POLICY "Authenticated Users Can Update Product Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete product images
CREATE POLICY "Authenticated Users Can Delete Product Images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
