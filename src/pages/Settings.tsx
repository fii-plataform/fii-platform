import { useRef, useState } from 'react';
import { Eye, EyeOff, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Label, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StorageService } from '@/services/StorageService';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import type { AppBackup } from '@/types/portfolio';

export function Settings() {
  const { show } = useToast();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brapiToken, setBrapiToken] = useState(StorageService.getBrapiToken());
  const [openRouterKey, setOpenRouterKey] = useState(StorageService.getOpenRouterKey());
  const [showBrapi, setShowBrapi] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);

  function saveKeys() {
    StorageService.setBrapiToken(brapiToken.trim());
    StorageService.setOpenRouterKey(openRouterKey.trim());
    show('success', 'Chaves salvas no seu navegador.', 'Elas nunca saem do LocalStorage local, exceto para chamar a respectiva API.');
  }

  function handleExport() {
    const backup = StorageService.exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fii-terminal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    show('success', 'Backup exportado.');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(reader.result as string) as AppBackup;
        if (!backup.version) throw new Error('Arquivo de backup inválido.');
        StorageService.importBackup(backup);
        show('success', 'Backup restaurado. Recarregue a página para ver os dados atualizados.');
      } catch (err) {
        show('error', 'Falha ao importar backup.', err instanceof Error ? err.message : undefined);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleClearAll() {
    if (confirm('Isso apagará todos os dados salvos localmente (carteira, favoritos, chaves). Continuar?')) {
      StorageService.clearAll();
      show('info', 'Todos os dados locais foram apagados. Recarregue a página.');
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-100">Configurações</h1>
        <p className="text-sm text-ink-500">Chaves de API, tema e backup dos seus dados.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chaves de API</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-ink-500 -mt-1">
            Suas chaves ficam salvas apenas no LocalStorage deste navegador — nunca são enviadas para nenhum servidor além
            da própria BRAPI/OpenRouter ao consultar dados.
          </p>

          <div>
            <Label htmlFor="brapi">Chave da BRAPI</Label>
            <div className="relative">
              <Input
                id="brapi"
                type={showBrapi ? 'text' : 'password'}
                value={brapiToken}
                onChange={(e) => setBrapiToken(e.target.value)}
                placeholder="Cole aqui sua chave da BRAPI"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowBrapi((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700 hover:text-ink-300"
              >
                {showBrapi ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="openrouter">Chave da OpenRouter</Label>
            <div className="relative">
              <Input
                id="openrouter"
                type={showOpenRouter ? 'text' : 'password'}
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="Cole aqui sua chave da OpenRouter"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenRouter((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700 hover:text-ink-300"
              >
                {showOpenRouter ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button onClick={saveKeys}>Salvar chaves</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-100">Tema</p>
            <p className="text-xs text-ink-500">Atualmente: {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Alternar para {theme === 'dark' ? 'claro' : 'escuro'}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup dos dados</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} /> Exportar JSON
          </Button>
          <Button variant="secondary" onClick={handleImportClick}>
            <Upload size={16} /> Importar JSON
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona de risco</CardTitle>
        </CardHeader>
        <CardBody>
          <Button variant="danger" onClick={handleClearAll}>
            <Trash2 size={16} /> Apagar todos os dados locais
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
