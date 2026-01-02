-- ============================================
-- CONFIGURAÇÃO DO STORAGE PARA PRODUCT IMAGES
-- ============================================
-- Siga os passos abaixo no painel do Supabase

-- PASSO 1: Criar o Bucket
-- ========================
-- 1. Acesse: https://supabase.com/dashboard/project/wjxwwdgepzrxfqkeaxwc/storage/buckets
-- 2. Clique em "New bucket"
-- 3. Configure:
--    - Name: product-images
--    - ✅ PUBLIC BUCKET (MUITO IMPORTANTE!)
--    - File size limit: 5242880 (5MB)
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- PASSO 2: Configurar Políticas (CRITICAL!)
-- ==========================================
-- Após criar o bucket, clique nele e vá em "Policies"
-- IMPORTANTE: Configure exatamente como abaixo para evitar erro "row-level security policy"

-- 🔓 Política 1: Permitir QUALQUER PESSOA ler imagens (público)
--    Name: Public read access
--    Policy: SELECT
--    Allowed operation: SELECT
--    Target roles: anon, authenticated (ou deixe vazio para "public")
--    Policy definition:
--      USING expression: bucket_id = 'product-images'

-- 📤 Política 2: Permitir QUALQUER PESSOA fazer upload (temporário - para testar)
--    Name: Public upload access
--    Policy: INSERT
--    Allowed operation: INSERT
--    Target roles: anon, authenticated (ou deixe vazio para "public")
--    Policy definition:
--      WITH CHECK expression: bucket_id = 'product-images'

-- 🔄 Política 3: Permitir QUALQUER PESSOA atualizar
--    Name: Public update access
--    Policy: UPDATE
--    Allowed operation: UPDATE
--    Target roles: anon, authenticated (ou deixe vazio para "public")
--    Policy definition:
--      USING expression: bucket_id = 'product-images'
--      WITH CHECK expression: bucket_id = 'product-images'

-- 🗑️ Política 4: Permitir QUALQUER PESSOA deletar
--    Name: Public delete access
--    Policy: DELETE
--    Allowed operation: DELETE
--    Target roles: anon, authenticated (ou deixe vazio para "public")
--    Policy definition:
--      USING expression: bucket_id = 'product-images'

-- ⚠️ NOTA DE SEGURANÇA:
-- As políticas acima permitem acesso público total (anon) para facilitar o desenvolvimento.
-- Em produção, você deve restringir para apenas 'authenticated' users.

-- ALTERNATIVA RÁPIDA: Desabilitar RLS temporariamente
-- =====================================================
-- Se as políticas não funcionarem, você pode TEMPORARIAMENTE desabilitar
-- o RLS no bucket para testar (NÃO RECOMENDADO PARA PRODUÇÃO):
--
-- No Supabase Dashboard > Storage > product-images > Configuration
-- Desmarque "Enable RLS" (se houver essa opção)
--
-- OU execute no SQL Editor como postgres user (service_role):
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVA: Se precisar usar SQL (requer permissões de service_role)
-- ============================================
-- Se você tiver acesso ao service_role key, pode executar via API:
-- Mas é muito mais simples usar a interface web!
