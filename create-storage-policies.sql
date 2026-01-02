-- ============================================
-- CRIAR POLÍTICAS PARA O BUCKET product-images
-- ============================================
-- Execute este SQL no SQL Editor do Supabase
-- Certifique-se de que o bucket 'product-images' já existe e está marcado como PUBLIC

-- Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- 1. Política de LEITURA pública (SELECT)
-- Permite que qualquer pessoa visualize as imagens
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- 2. Política de UPLOAD público (INSERT)
-- Permite que qualquer pessoa faça upload de imagens
CREATE POLICY "Public upload access"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- 3. Política de ATUALIZAÇÃO pública (UPDATE)
-- Permite que qualquer pessoa atualize imagens
CREATE POLICY "Public update access"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- 4. Política de EXCLUSÃO pública (DELETE)
-- Permite que qualquer pessoa delete imagens
CREATE POLICY "Public delete access"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'product-images');

-- ============================================
-- VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ============================================
-- Execute a query abaixo para conferir:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'objects' AND policyname LIKE 'Public%';
