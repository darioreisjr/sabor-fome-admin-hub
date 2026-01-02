# 🔐 Guia de Autenticação

O sistema de autenticação foi configurado usando Supabase Auth.

## Como criar um usuário administrador

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/wjxwwdgepzrxfqkeaxwc/auth/users

2. Clique em **"Add user"** → **"Create new user"**

3. Preencha:
   - **Email**: seu-email@gmail.com (use um email real)
   - **Password**: escolha uma senha forte
   - **Auto Confirm User**: ✅ Marque esta opção (importante!)

4. Clique em **"Create user"**

### Opção 2: Via SQL Editor

1. Acesse: https://supabase.com/dashboard/project/wjxwwdgepzrxfqkeaxwc/sql/new

2. Execute este SQL (substitua email e senha):

```sql
-- Inserir usuário (substitua os valores)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com', -- ALTERE AQUI
  crypt('admin123456', gen_salt('bf')), -- ALTERE A SENHA AQUI
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

## Configurações Importantes

### Desabilitar confirmação de email (desenvolvimento)

Para facilitar o desenvolvimento local:

1. Acesse: https://supabase.com/dashboard/project/wjxwwdgepzrxfqkeaxwc/auth/providers

2. Em **"Email Auth"**, desabilite:
   - ❌ **"Confirm email"**

3. Salve as alterações

## Como fazer login

1. Execute o projeto: `npm run dev`

2. Acesse: http://localhost:5173

3. Você será redirecionado para `/login`

4. Entre com as credenciais criadas

## Recursos implementados

✅ **Autenticação completa com Supabase Auth**
- Login com email/senha
- Proteção de rotas
- Sessão persistente (localStorage)
- Auto-refresh de token
- Logout seguro

✅ **Páginas**
- `/login` - Página de login
- Todas as rotas do admin protegidas

✅ **Componentes**
- `AuthContext` - Gerenciamento de estado de autenticação
- `ProtectedRoute` - HOC para proteção de rotas
- Botão de logout na sidebar

## Troubleshooting

### "Email inválido"
- Use um email no formato válido (ex: usuario@dominio.com)
- Ou crie o usuário via Dashboard do Supabase

### "Sessão expirada"
- O token é renovado automaticamente
- Se expirar, você será redirecionado para o login

### "Não consigo fazer login"
- Verifique se o usuário foi criado no Supabase
- Confirme que o email foi verificado (auto confirm)
- Verifique as credenciais (email/senha)
