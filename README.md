# 🎧 DJ Simon Telini — Landing Page

Landing page de alta conversão para venda de **Pack de Músicas** e **Curso de DJ**, com captura de leads integrada ao Supabase.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (PostgreSQL para leads)
- **Tailwind CSS** (dark/neon theme)
- **Deploy: Vercel**

---

## 1. Configurar o Supabase

### 1.1 Criar projeto
1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Dê um nome (ex: `dj-simon-telini`) e crie

### 1.2 Criar tabela de leads
Vá em **SQL Editor** e execute:

```sql
create table leads (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  interest text check (interest in ('pack', 'curso', 'ambos')) not null,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz default now()
);

-- Índice para busca por e-mail
create index leads_email_idx on leads (email);

-- Row Level Security (apenas backend com service_role pode inserir)
alter table leads enable row level security;
create policy "Service role only" on leads
  for all using (auth.role() = 'service_role');
```

### 1.3 Copiar chaves
Vá em **Settings → API** e copie:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de ambiente
cp .env.local.example .env.local
# → edite com suas chaves do Supabase

# 3. Rodar
npm run dev
```

Acesse: http://localhost:3000

---

## 3. Deploy no Vercel

### Opção A — Via GitHub (recomendado)
```bash
git init
git add .
git commit -m "feat: landing page DJ Simon Telini"
git remote add origin https://github.com/SEU_USUARIO/dj-simon-telini.git
git push -u origin main
```

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório do GitHub
3. Em **Environment Variables**, adicione as 3 variáveis do Supabase
4. Clique **Deploy** ✅

### Opção B — Via CLI
```bash
npm i -g vercel
vercel
# Siga o assistente e adicione as env vars quando solicitado
```

---

## 4. Visualizar leads

No Supabase → **Table Editor → leads** você vê todos os cadastros em tempo real.

Para exportar como CSV: **Table Editor → leads → Export → CSV**

---

## 5. Personalizar conteúdo

| Arquivo | O que editar |
|---|---|
| `app/page.tsx` | Textos, preços, módulos, depoimentos |
| `app/globals.css` | Cores, fontes, animações |
| `app/layout.tsx` | Meta tags, SEO |
| `app/api/lead/route.ts` | Lógica de captura de lead |
| `.env.local` | Chaves do Supabase |

---

## 6. Adicionar domínio personalizado no Vercel
1. Vercel → Projeto → **Domains**
2. Adicione seu domínio (ex: `djsimontelini.com.br`)
3. Configure os DNS conforme indicado

---

## Estrutura do projeto
```
dj-simon-telini/
├── app/
│   ├── layout.tsx          # Layout global + meta tags
│   ├── page.tsx            # Landing page completa
│   ├── globals.css         # Estilos globais + tema
│   └── api/
│       └── lead/
│           └── route.ts    # Endpoint de captura de leads
├── lib/
│   └── supabase.ts         # Client Supabase + tipos
├── .env.local.example      # Template de variáveis de ambiente
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```
