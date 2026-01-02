# 📸 Guia: Configurar Upload de Imagens no Supabase

## ❌ Problema
Você está recebendo o erro: **"new row violates row-level security policy"**

Isso acontece porque o Supabase Storage precisa de políticas de segurança (RLS) configuradas corretamente.

---

## ✅ Solução: Configure o Bucket no Painel do Supabase

### **Passo 1: Criar o Bucket**

1. Acesse: https://supabase.com/dashboard/project/wjxwwdgepzrxfqkeaxwc/storage/buckets

2. Clique em **"New bucket"** ou **"Create a new bucket"**

3. Preencha:
   - **Name**: `product-images`
   - ✅ **Public bucket**: **MARQUE ESTA OPÇÃO!** (muito importante)
   - **File size limit**: `5242880` (5 MB)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

4. Clique em **"Create bucket"** ou **"Save"**

---

### **Passo 2: Configurar Políticas de Segurança**

Depois de criar o bucket:

1. Clique no bucket **`product-images`** que você acabou de criar

2. Vá na aba **"Policies"** ou **"Configuration"**

3. Clique em **"New Policy"** para cada política abaixo:

---

#### 🔓 **Política 1: Leitura Pública (SELECT)**

- **Policy name**: `Public read access`
- **Allowed operation**: `SELECT` (ou "Read")
- **Policy command**: `SELECT`
- **Target roles**: Deixe em branco OU selecione `anon` e `authenticated`
- **Policy definition - USING expression**:
  ```sql
  bucket_id = 'product-images'
  ```

---

#### 📤 **Política 2: Upload Público (INSERT)**

- **Policy name**: `Public upload access`
- **Allowed operation**: `INSERT` (ou "Create")
- **Policy command**: `INSERT`
- **Target roles**: Deixe em branco OU selecione `anon` e `authenticated`
- **Policy definition - WITH CHECK expression**:
  ```sql
  bucket_id = 'product-images'
  ```

---

#### 🔄 **Política 3: Atualização Pública (UPDATE)**

- **Policy name**: `Public update access`
- **Allowed operation**: `UPDATE` (ou "Update")
- **Policy command**: `UPDATE`
- **Target roles**: Deixe em branco OU selecione `anon` e `authenticated`
- **Policy definition**:
  - **USING expression**: `bucket_id = 'product-images'`
  - **WITH CHECK expression**: `bucket_id = 'product-images'`

---

#### 🗑️ **Política 4: Exclusão Pública (DELETE)**

- **Policy name**: `Public delete access`
- **Allowed operation**: `DELETE` (ou "Delete")
- **Policy command**: `DELETE`
- **Target roles**: Deixe em branco OU selecione `anon` e `authenticated`
- **Policy definition - USING expression**:
  ```sql
  bucket_id = 'product-images'
  ```

---

### **Passo 3: Testar o Upload**

1. Volte para sua aplicação
2. Vá em **Produtos → Novo Produto**
3. Clique em **"Escolher imagem"**
4. Selecione uma imagem do seu computador
5. ✅ Deve funcionar agora!

---

## 🔧 Solução Alternativa (Mais Rápida)

Se você ainda está tendo problemas com as políticas, pode **temporariamente** permitir acesso total:

### Opção A: Usar Template de Política

1. No Supabase, vá em **Storage → product-images → Policies**
2. Clique em **"New Policy"**
3. Selecione o template: **"Allow public access"** ou **"Allow all operations"**
4. Isso criará automaticamente todas as políticas necessárias

### Opção B: Via SQL (Apenas para Desenvolvimento)

⚠️ **ATENÇÃO**: Isso remove toda a segurança. Use apenas para testar!

Execute no **SQL Editor** do Supabase:

```sql
-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Remover RLS temporariamente (APENAS PARA TESTES!)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Depois de funcionar**, habilite novamente e configure as políticas corretas:

```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

---

## ⚠️ Nota de Segurança

As configurações acima permitem que **qualquer pessoa** (mesmo sem login) faça upload de imagens.

**Para produção**, você deve:
1. Implementar autenticação no seu app
2. Mudar as políticas para aceitar apenas usuários autenticados (`authenticated` role)
3. Adicionar validações adicionais (tamanho, tipo, quantidade, etc.)

---

## 🆘 Ainda com Problemas?

Se ainda não funcionar:

1. Verifique se o bucket está marcado como **"Public"**
2. Verifique se você criou **todas as 4 políticas** (SELECT, INSERT, UPDATE, DELETE)
3. Abra o Console do navegador (F12) e veja se há erros mais específicos
4. Verifique se o nome do bucket está correto: `product-images` (sem espaços)

---

## ✨ Pronto!

Após seguir estes passos, o upload de imagens deve funcionar perfeitamente! 🎉
