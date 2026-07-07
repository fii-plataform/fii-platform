# FII Terminal — Plataforma Pessoal de Análise de FIIs

Plataforma web para uso pessoal, para gerenciar e analisar Fundos de Investimento
Imobiliário (FIIs) brasileiros. Substitui planilhas e a necessidade de consultar
vários sites diferentes. **Não emite recomendações de compra/venda.**

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:5173.

## Configuração de chaves de API — IMPORTANTE

Este projeto **não tem nenhuma chave de API hardcoded no código-fonte.** Você
configura suas próprias chaves (BRAPI e OpenRouter) na tela **Configurações**
dentro do app — elas ficam salvas apenas no LocalStorage do seu navegador.

> ⚠️ Se você colou uma chave de API em algum chat, editor compartilhado, print
> de tela, repositório público, etc., trate-a como comprometida e gere uma nova
> chave no painel da BRAPI / OpenRouter antes de usar em produção.

## Deploy na Vercel

Sem necessidade de backend próprio:

```bash
npm run build
```

Depois, importe o repositório na Vercel (framework preset: Vite). As chaves de
API continuam sendo inseridas pelo usuário final na tela de Configurações —
nada precisa ser definido como variável de ambiente na Vercel para a aplicação
funcionar.

## Arquitetura

```
src/
  components/   # UI reutilizável (ui/, layout/, dashboard/, fii/)
  pages/        # Uma página por rota
  layouts/      # Shell da aplicação (sidebar + navbar)
  services/     # DataService, BrapiProvider, StorageService, OpenRouterService, PdfService
  contexts/     # Theme, Toast, Portfolio (estado global via Context API)
  hooks/        # useFII, usePortfolio helpers, useDebounce, useLocalStorage
  types/        # Contratos de dados (FII, Portfolio, etc.)
  utils/        # Formatters e cálculos financeiros puros
  config/       # Constantes (chaves de storage, URLs de API)
```

### DataService — arquitetura de múltiplas fontes

`src/services/DataService.ts` é o único ponto de entrada para dados de FIIs.
Ordem de prioridade, conforme especificado:

1. **BRAPI** (`BrapiProvider.ts`)
2. **Outras APIs públicas** — há um slot pronto (`otherProviders` dentro de
   `DataService.ts`) para plugar novas fontes sem alterar nenhum outro arquivo.
3. **Dados cadastrados manualmente** pelo usuário (Configurações → dados manuais
   por ticker), usados como último recurso ou para completar campos que a API
   não cobre.

Se todas as fontes falharem, `DataService` retorna `{ data: null, source:
'unavailable' }` em vez de lançar uma exceção — a interface nunca quebra.

### Armazenamento

`src/services/StorageService.ts` centraliza todo acesso ao LocalStorage. Nenhum
outro arquivo chama `localStorage` diretamente. Isso deixa a futura migração
para Supabase/Firebase mecânica: basta reescrever os métodos deste arquivo.

### Resumo de relatório via IA (OpenRouter)

Fluxo: o usuário informa a URL do PDF do relatório gerencial → `PdfService.ts`
baixa e extrai o texto no navegador (via `pdfjs-dist`) → apenas o texto (nunca
o PDF binário) é enviado para `OpenRouterService.ts`, que tem instruções de
sistema explícitas para **nunca recomendar compra/venda**, apenas resumir.

Se o PDF bloquear download via CORS, a tela oferece uma opção de colar o texto
manualmente.

## Limitações conhecidas / próximos passos

- Indicadores como Cap Rate, WAULT, vacância e dados de gestora não são
  expostos pelo endpoint gratuito da BRAPI — ficam como campos "manuais" até
  uma fonte pública os cobrir automaticamente.
- Coordenadas de imóveis para o mapa (Leaflet) precisam ser cadastradas
  manualmente por enquanto — nenhuma API pública gratuita geocodifica os
  imóveis de um FII automaticamente.
- O histórico de patrimônio no Dashboard é uma aproximação (capital investido +
  dividendos acumulados), já que histórico diário de cotação por fundo não está
  disponível no plano gratuito da BRAPI.
- Arquitetura já preparada (sem necessidade de refatoração) para: autenticação,
  banco de dados real, sincronização multi-dispositivo, PWA.
