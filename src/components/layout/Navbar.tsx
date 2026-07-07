import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function Navbar({ onAddPosition }: { onAddPosition?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="flex items-center gap-4 h-16 px-6 border-b border-base-600 bg-base-900/80 backdrop-blur sticky top-0 z-30">
      <form onSubmit={onSubmit} className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ticker, nome, segmento ou gestora..."
          className="w-full rounded-lg border border-base-600 bg-base-800 pl-9 pr-3 py-2 text-sm text-ink-100 placeholder:text-ink-700 focus:border-signal-500 focus:ring-1 focus:ring-signal-500 outline-none transition-colors"
        />
      </form>

      <div className="flex-1" />

      {onAddPosition && (
        <button
          onClick={onAddPosition}
          className="flex items-center gap-1.5 rounded-lg bg-signal-500 px-3 py-2 text-sm font-medium text-base-950 hover:bg-signal-400 transition-colors"
        >
          <Plus size={16} /> Adicionar posição
        </button>
      )}

      <button
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-base-700 hover:text-ink-100 transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
