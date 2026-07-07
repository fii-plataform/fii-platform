import { OPENROUTER_BASE_URL, OPENROUTER_DEFAULT_MODEL } from '@/config/constants';
import { StorageService } from '@/services/StorageService';

const SYSTEM_PROMPT = `Você é um assistente que resume relatórios gerenciais de Fundos de Investimento Imobiliário (FIIs) brasileiros.

Regras obrigatórias:
- Gere APENAS um resumo objetivo do conteúdo do relatório.
- NUNCA faça recomendação de compra, venda ou manutenção do investimento.
- NUNCA emita opinião sobre se o fundo é uma boa ou má oportunidade.
- Utilize linguagem simples e direta, acessível a um investidor não especialista.
- Organize o resumo em até 10 tópicos, cobrindo (quando presentes no texto):
  principais acontecimentos, alterações no portfólio, vacância, contratos,
  dividendos, aquisições, vendas, riscos destacados e perspectivas futuras.
- Se alguma dessas categorias não aparecer no relatório, simplesmente a omita — não invente informação.`;

export interface ReportSummaryResult {
  summary: string;
  model: string;
}

export const OpenRouterService = {
  isConfigured(): boolean {
    return StorageService.getOpenRouterKey().trim().length > 0;
  },

  async summarizeReport(reportText: string, ticker: string): Promise<ReportSummaryResult> {
    const apiKey = StorageService.getOpenRouterKey();
    if (!apiKey) {
      throw new Error('Configure sua chave da OpenRouter na tela de Configurações antes de gerar um resumo.');
    }

    // Trim to a safe length so we don't blow context limits on very long reports.
    const MAX_CHARS = 60000;
    const truncated = reportText.length > MAX_CHARS ? reportText.slice(0, MAX_CHARS) : reportText;

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Ticker do fundo: ${ticker}\n\nConteúdo extraído do relatório gerencial:\n\n${truncated}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Falha ao consultar a OpenRouter (${response.status}): ${errText || 'erro desconhecido'}`);
    }

    const json = await response.json();
    const summary: string | undefined = json?.choices?.[0]?.message?.content;
    if (!summary) throw new Error('A resposta da IA veio vazia.');

    return { summary, model: json?.model ?? OPENROUTER_DEFAULT_MODEL };
  },
};
