# Goldoni Contadores

Site institucional e portal do cliente para contabilidade.

> **Demonstração pública.** Telefones, WhatsApp, e-mail, endereço, CNPJ, redes sociais e dados de clientes são fictícios. Nenhum pedido, mensagem ou formulário é enviado a um canal real.

[**Ver demonstração**](https://goldoni-contadores.vercel.app) · Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL + Drizzle ORM · Tailwind CSS 4

## O que tem

- Site institucional com serviços e conteúdos
- Portal do cliente com documentos, certidões e guias
- Painel da equipe com clientes, solicitações e leads
- Geração de PDF e checklist de documentos
- Autenticação com sessão e dois perfis

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- Tailwind CSS 4

## Rodando localmente

```bash
npm ci
cp .env.example .env.local
# edite .env.local com a sua connection string
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

| Variável | Obrigatória | Para que serve |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Connection string PostgreSQL/Neon |
| `NEXT_PUBLIC_SITE_URL` | Não | URL pública usada em metadados e links |

## Banco de dados

PostgreSQL no Neon (banco `goldoni`). O schema fica em `src/db/schema.ts` e é aplicado com `npx drizzle-kit push`. Em produção, use uma connection string Neon com `sslmode=require`.

## Rotas

| Rota | Descrição |
| --- | --- |
| `/` | Home institucional |
| `/servicos/[slug]` | Detalhe de serviço |
| `/conteudos` | Biblioteca de conteúdos |
| `/portal/login` | Login do cliente |
| `/portal/documentos` | Documentos do cliente |
| `/portal/certidoes` | Certidões |
| `/portal/solicitacoes` | Solicitações |
| `/equipe` | Painel da equipe |
| `/equipe/clientes` | CRM de clientes |
| `/equipe/leads` | Leads |
| `/proposta` | Proposta comercial |

## Testes e qualidade

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Deploy

O deploy é feito na Vercel. Configure as variáveis acima no painel do projeto, conecte o repositório e use `npm run build`.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/(site)/` | Páginas públicas |
| `src/app/portal/` | Portal do cliente |
| `src/app/equipe/` | Painel da equipe |
| `src/components/` | UI e formulários |
| `src/lib/` | Site, seed, PDF e regras |
| `src/db/` | Schema Drizzle |

## Licença

MIT — veja [LICENSE](LICENSE).
