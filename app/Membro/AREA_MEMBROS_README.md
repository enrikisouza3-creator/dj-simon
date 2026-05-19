# Área de Membros — DJ Simon

## Arquivos criados

```
app/
  membro/
    layout.tsx          ← Layout com sidebar (wrap de todas as páginas)
    page.tsx            ← Redireciona /membro → /membro/dashboard
    login/page.tsx      ← Tela de login
    dashboard/page.tsx  ← Dashboard com progresso e acesso rápido
    curso/page.tsx      ← Player de vídeos com módulos e progresso
    downloads/page.tsx  ← Arquivos e plugins disponíveis por plano
    perfil/page.tsx     ← Dados do membro + alterar senha

components/membro/
  MemberAuthProvider.tsx  ← Context de autenticação
  MemberSidebar.tsx       ← Menu lateral
  withMemberAuth.tsx      ← HOC de proteção de rota

lib/
  supabase.ts             ← Tipos atualizados (Member, Video, Plugin, Progress)

SUPABASE_SETUP.sql        ← SQL para criar tabelas e RLS
```

## Setup

### 1. Supabase
Execute o `SUPABASE_SETUP.sql` no SQL Editor do Supabase.
Ele cria a tabela `progress`, adiciona colunas em `videos` e `plugins`,
e configura as RLS policies.

### 2. Tabela videos — campo obrigatório
Ao cadastrar vídeos no admin, preencher:
- `modulo` — ex: "Módulo 1", "Módulo 2"
- `ordem` — número para ordenação (1, 2, 3...)
- `youtube_url` — URL completa do YouTube

### 3. Planos
Os planos funcionam assim:
| Plano  | Curso | Downloads |
|--------|-------|-----------|
| pack   | ❌    | ✅        |
| curso  | ✅    | ❌        |
| ambos  | ✅    | ✅        |

### 4. Login do aluno
O admin cria o membro normalmente no painel.
O aluno acessa: `seudominio.com/membro/login`

## Como adicionar campos modulo/ordem no admin
No `AdminPanel.jsx`, na seção de vídeos, adicionar os inputs:
```jsx
<input placeholder="Módulo" value={form.modulo} onChange={...} />
<input type="number" placeholder="Ordem" value={form.ordem} onChange={...} />
```
