import { useState } from 'react';
import { FileText, Link2, Loader2, ClipboardPaste } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Label, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PdfService } from '@/services/PdfService';
import { OpenRouterService } from '@/services/OpenRouterService';
import { useToast } from '@/contexts/ToastContext';

export function ReportSummary() {
  const { show } = useToast();
  const [ticker, setTicker] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [mode, setMode] = useState<'url' | 'paste'>('url');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  async function handleGenerate() {
    if (!ticker.trim()) {
      show('warning', 'Informe o ticker do fundo.');
      return;
    }
    if (!OpenRouterService.isConfigured()) {
      show('warning', 'Configure sua chave da OpenRouter em Configurações antes de gerar um resumo.');
      return;
    }

    setLoading(true);
    setSummary(null);
    try {
      let text = manualText;
      if (mode === 'url') {
        if (!pdfUrl.trim()) {
          show('warning', 'Informe a URL do relatório em PDF.');
          setLoading(false);
          return;
        }
        text = await PdfService.extractTextFromUrl(pdfUrl.trim());
      }

      if (!text.trim()) {
        throw new Error('Não foi possível extrair texto do relatório.');
      }

      const result = await OpenRouterService.summarizeReport(text, ticker.toUpperCase());
      setSummary(result.summary);
    } catch (err) {
      show(
        'error',
        'Não foi possível gerar o resumo.',
        err instanceof Error ? err.message : 'Se o PDF bloquear acesso externo (CORS), tente colar o texto manualmente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Resumo do último relatório</h1>
        <p className="text-sm text-ink-500">
          Gere um resumo objetivo do relatório gerencial de um fundo. A IA nunca recomenda compra, venda ou manutenção —
          apenas organiza o que já está no relatório.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="ticker">Ticker do fundo</Label>
            <Input id="ticker" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="Ex: HGLG11" maxLength={8} />
          </div>

          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setMode('url')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border transition-colors ${
                mode === 'url' ? 'border-signal-500 text-signal-400 bg-signal-500/10' : 'border-base-600 text-ink-500'
              }`}
            >
              <Link2 size={14} /> URL do PDF
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border transition-colors ${
                mode === 'paste' ? 'border-signal-500 text-signal-400 bg-signal-500/10' : 'border-base-600 text-ink-500'
              }`}
            >
              <ClipboardPaste size={14} /> Colar texto manualmente
            </button>
          </div>

          {mode === 'url' ? (
            <div>
              <Label htmlFor="pdfUrl">URL do relatório gerencial (PDF)</Label>
              <Input
                id="pdfUrl"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://ri.exemplo.com.br/relatorio-gerencial.pdf"
              />
              <p className="text-xs text-ink-700 mt-1.5">
                Preferencialmente a partir da página oficial de Relações com Investidores do fundo. Se o download falhar
                por CORS, use a opção "Colar texto manualmente".
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="manualText">Cole o texto do relatório</Label>
              <textarea
                id="manualText"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={8}
                className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 focus:border-signal-500 focus:ring-1 focus:ring-signal-500 outline-none resize-none"
                placeholder="Cole aqui o texto extraído do PDF do relatório gerencial..."
              />
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loading ? 'Gerando resumo...' : 'Gerar resumo'}
          </Button>
        </CardBody>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo — {ticker}</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-ink-300">{summary}</div>
            <p className="text-xs text-ink-700 mt-4 border-t border-base-600 pt-3">
              Este resumo é gerado automaticamente a partir do relatório informado e não constitui recomendação de
              investimento.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
