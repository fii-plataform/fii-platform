import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Label, Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { useToast } from '@/contexts/ToastContext';
import type { PortfolioPosition } from '@/types/portfolio';

interface FIIFormModalProps {
  open: boolean;
  onClose: () => void;
  existing?: PortfolioPosition;
}

export function FIIFormModal({ open, onClose, existing }: FIIFormModalProps) {
  const { addPosition, updatePosition, refresh } = usePortfolio();
  const { show } = useToast();

  const [ticker, setTicker] = useState(existing?.ticker ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() ?? '');
  const [averagePrice, setAveragePrice] = useState(existing?.averagePrice?.toString() ?? '');
  const [purchaseDate, setPurchaseDate] = useState(existing?.purchaseDate ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(existing?.notes ?? '');

  function reset() {
    setTicker('');
    setQuantity('');
    setAveragePrice('');
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setNotes('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedQty = Number(quantity);
    const parsedPrice = Number(averagePrice);

    if (!ticker.trim() || !parsedQty || !parsedPrice) {
      show('warning', 'Preencha ticker, quantidade e preço médio.');
      return;
    }

    if (existing) {
      updatePosition(existing.id, {
        ticker: ticker.toUpperCase(),
        quantity: parsedQty,
        averagePrice: parsedPrice,
        purchaseDate,
        notes,
      });
      show('success', 'Posição atualizada.');
    } else {
      addPosition({ ticker: ticker.toUpperCase(), quantity: parsedQty, averagePrice: parsedPrice, purchaseDate, notes });
      show('success', `${ticker.toUpperCase()} adicionado à carteira.`);
    }

    await refresh();
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Editar posição' : 'Adicionar posição'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            id="ticker"
            placeholder="Ex: HGLG11"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            disabled={!!existing}
            maxLength={8}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quantity">Quantidade de cotas</Label>
            <Input id="quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="price">Preço médio (R$)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={averagePrice} onChange={(e) => setAveragePrice(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label htmlFor="date">Data da compra</Label>
          <Input id="date" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="notes">Observações (opcional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-base-600 bg-base-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 focus:border-signal-500 focus:ring-1 focus:ring-signal-500 outline-none transition-colors resize-none"
            placeholder="Ex: aporte mensal, reserva de longo prazo..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{existing ? 'Salvar alterações' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
