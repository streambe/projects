import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { cn } from '../lib/utils';
import { IconSearch } from './ui/Icons';
import type { Client, ClientsListResponse } from '../modules/clients/clients.types';

// ---------------------------------------------------------------------------
// CommandPalette -- Global search overlay triggered by Ctrl+K / Cmd+K
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // -----------------------------------------------------------------------
  // Open / close via keyboard shortcut
  // -----------------------------------------------------------------------

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened, reset state when closed
  useEffect(() => {
    if (open) {
      // Small delay so the DOM is painted before we focus
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setLoading(false);
    }
  }, [open]);

  // -----------------------------------------------------------------------
  // Debounced search
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(0);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await api.get<ClientsListResponse>('/clients', {
          params: { search: query.trim(), perPage: 10 },
        });
        setResults(res.data.data);
        setActiveIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // -----------------------------------------------------------------------
  // Navigation helpers
  // -----------------------------------------------------------------------

  const close = useCallback(() => setOpen(false), []);

  const goToClient = useCallback(
    (id: string) => {
      close();
      navigate(`/clientes/${id}`);
    },
    [close, navigate],
  );

  // -----------------------------------------------------------------------
  // Keyboard navigation inside the list
  // -----------------------------------------------------------------------

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      return;
    }

    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      goToClient(results[activeIndex].id);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (!open) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar clientes"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Palette container */}
      <div
        className={cn(
          'relative w-full max-w-lg rounded-2xl bg-surface-0 shadow-2xl',
          'border border-surface-200',
          'flex flex-col overflow-hidden',
          'animate-in fade-in-0 zoom-in-95',
        )}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3 border-b border-surface-200 px-4 py-3">
          <IconSearch
            width={18}
            height={18}
            className={cn(
              'shrink-0 transition-colors',
              loading ? 'text-accent-400 animate-pulse' : 'text-surface-300',
            )}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar clientes..."
            className={cn(
              'flex-1 bg-transparent text-sm text-brand-800 placeholder:text-surface-300',
              'outline-none',
            )}
            aria-label="Buscar clientes"
            aria-controls="command-palette-results"
            aria-activedescendant={
              results.length > 0 ? `cp-result-${activeIndex}` : undefined
            }
            role="combobox"
            aria-expanded={results.length > 0}
            aria-autocomplete="list"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-[10px] font-mono text-surface-300">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div className="max-h-72 overflow-y-auto overscroll-contain">
          {/* No query yet */}
          {!hasQuery && !loading && (
            <div className="px-4 py-8 text-center text-sm text-surface-300">
              Escribi para buscar...
            </div>
          )}

          {/* Loading */}
          {hasQuery && loading && results.length === 0 && (
            <div className="space-y-1 p-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-skeleton rounded-xl bg-surface-100"
                />
              ))}
            </div>
          )}

          {/* No results */}
          {hasQuery && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-surface-300">
              No se encontraron resultados
            </div>
          )}

          {/* Result list */}
          {results.length > 0 && (
            <ul
              ref={listRef}
              id="command-palette-results"
              role="listbox"
              className="p-2"
            >
              {results.map((client, index) => (
                <li
                  key={client.id}
                  id={`cp-result-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => goToClient(client.id)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                    index === activeIndex
                      ? 'bg-brand-500/10 text-brand-700'
                      : 'text-brand-800 hover:bg-surface-100',
                  )}
                >
                  {/* Avatar circle */}
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
                      index === activeIndex
                        ? 'bg-brand-500 text-white'
                        : 'bg-surface-200 text-brand-600',
                    )}
                  >
                    {client.firstName.charAt(0)}
                    {client.lastName.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-surface-300">
                      <span>DNI {client.dni}</span>
                      <span aria-hidden="true" className="text-surface-200">|</span>
                      <span>{client.phonePrimary}</span>
                    </p>
                  </div>

                  {/* Enter hint on active */}
                  {index === activeIndex && (
                    <kbd className="hidden sm:inline-flex shrink-0 rounded-md border border-surface-200 bg-surface-50 px-1.5 py-0.5 text-[10px] font-mono text-surface-300">
                      Enter
                    </kbd>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-surface-200 px-4 py-2 text-[10px] text-surface-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono">
                &uarr;&darr;
              </kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono">
                Enter
              </kbd>
              abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-surface-200 bg-surface-50 px-1 py-0.5 font-mono">
                Esc
              </kbd>
              cerrar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
