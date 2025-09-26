import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import ResultsGallery from '../components/ResultsGallery';
import { deleteHistoryEntry, fetchHistory, toggleFavorite, ApiError } from '../api/history';
import type { GenerationResult, HistoryQueryParams } from '../types';
import './HistoryDashboard.css';

interface FiltersState {
  startDate: string | null;
  endDate: string | null;
  enhancement: HistoryQueryParams['enhancement'];
  customApiOnly: boolean;
}

interface FeedbackState {
  type: 'error' | 'success';
  message: string;
}

const PAGE_SIZE = 12;

const defaultFilters: FiltersState = {
  startDate: null,
  endDate: null,
  enhancement: 'all',
  customApiOnly: false,
};

const enhancementOptions: { value: NonNullable<HistoryQueryParams['enhancement']>; label: string }[] = [
  { value: 'all', label: 'All enhancements' },
  { value: 'nano-banana', label: 'Nano Banana' },
  { value: 'prompt-boost', label: 'Prompt Boost' },
  { value: 'style-transfer', label: 'Style Transfer' },
  { value: 'none', label: 'No Enhancement' },
];

const HistoryDashboard = () => {
  const [items, setItems] = useState<GenerationResult[]>([]);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isInitialLoading, setInitialLoading] = useState(true);
  const [isPageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<string[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [pendingShareIds, setPendingShareIds] = useState<string[]>([]);
  const [pendingDownloadIds, setPendingDownloadIds] = useState<string[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const applyFilters = useCallback(
    (overrides: Partial<FiltersState> = {}) => {
      setPage(1);
      setFilters((current) => ({ ...current, ...overrides }));
    },
    []
  );

  const loadHistory = useCallback(
    async (requestedPage = 1, currentFilters = filters, useInitialLoader = false) => {
      setError(null);
      setFeedback(null);
      if (useInitialLoader) {
        setInitialLoading(true);
      } else {
        setPageLoading(true);
      }

      try {
        const query: HistoryQueryParams = {
          page: requestedPage,
          pageSize: PAGE_SIZE,
          startDate: currentFilters.startDate,
          endDate: currentFilters.endDate,
          enhancement: currentFilters.enhancement,
          customApiOnly: currentFilters.customApiOnly,
        };

        const response = await fetchHistory(query);
        setItems(response.items);
        setTotal(response.total);
      } catch (cause) {
        const message = cause instanceof ApiError ? cause.message : 'Unable to load history.';
        setError(message);
      } finally {
        setInitialLoading(false);
        setPageLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const useInitialLoader = page === 1 && items.length === 0;
    loadHistory(page, filters, useInitialLoader);
  }, [page, filters, loadHistory, items.length]);

  const handleFavoriteToggle = useCallback(
    async (result: GenerationResult) => {
      if (pendingFavoriteIds.includes(result.id)) {
        return;
      }

      const optimisticValue = !result.isFavorite;
      const previousItems = items.map((item) => ({ ...item }));

      setPendingFavoriteIds((prev) => [...prev, result.id]);
      setItems((current) =>
        current.map((item) =>
          item.id === result.id
            ? {
                ...item,
                isFavorite: optimisticValue,
              }
            : item
        )
      );

      try {
        await toggleFavorite(result.id, optimisticValue);
        setFeedback({ type: 'success', message: optimisticValue ? 'Marked as favorite.' : 'Removed from favorites.' });
      } catch (cause) {
        const message = cause instanceof ApiError ? cause.message : 'Unable to update favorite.';
        setItems(previousItems);
        setFeedback({ type: 'error', message });
      } finally {
        setPendingFavoriteIds((prev) => prev.filter((id) => id !== result.id));
      }
    },
    [items, pendingFavoriteIds]
  );

  const handleDelete = useCallback(
    async (result: GenerationResult) => {
      if (pendingDeleteIds.includes(result.id)) {
        return;
      }

      const previousItems = items.map((item) => ({ ...item }));
      setPendingDeleteIds((prev) => [...prev, result.id]);
      setItems((current) => current.filter((item) => item.id !== result.id));

      try {
        await deleteHistoryEntry(result.id);
        setFeedback({ type: 'success', message: 'Entry deleted.' });
      } catch (cause) {
        const message = cause instanceof ApiError ? cause.message : 'Unable to delete entry.';
        setItems(previousItems);
        setFeedback({ type: 'error', message });
      } finally {
        setPendingDeleteIds((prev) => prev.filter((id) => id !== result.id));
      }
    },
    [items, pendingDeleteIds]
  );

  const handleShare = useCallback(
    async (result: GenerationResult) => {
      if (pendingShareIds.includes(result.id)) {
        return;
      }

      setPendingShareIds((prev) => [...prev, result.id]);

      try {
        if (navigator.share && (result.shareUrl || result.imageUrl)) {
          await navigator.share({
            title: 'Check out this generation',
            text: result.prompt,
            url: result.shareUrl || result.imageUrl,
          });
          setFeedback({ type: 'success', message: 'Shared successfully.' });
        } else if (navigator.clipboard && (result.shareUrl || result.imageUrl)) {
          await navigator.clipboard.writeText(result.shareUrl || result.imageUrl);
          setFeedback({ type: 'success', message: 'Link copied to clipboard.' });
        } else {
          throw new Error('Sharing is not supported in this browser.');
        }
      } catch (cause) {
        const message = cause instanceof ApiError ? cause.message : (cause as Error).message || 'Unable to share image.';
        setFeedback({ type: 'error', message });
      } finally {
        setPendingShareIds((prev) => prev.filter((id) => id !== result.id));
      }
    },
    [pendingShareIds]
  );

  const handleDownload = useCallback(
    async (result: GenerationResult) => {
      if (pendingDownloadIds.includes(result.id)) {
        return;
      }

      setPendingDownloadIds((prev) => [...prev, result.id]);

      try {
        const response = await fetch(result.imageUrl);
        if (!response.ok) {
          throw new ApiError('Unable to download image', { status: response.status });
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = `${result.id}.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(blobUrl);
        setFeedback({ type: 'success', message: 'Download started.' });
      } catch (cause) {
        const message = cause instanceof ApiError ? cause.message : 'Unable to download image.';
        setFeedback({ type: 'error', message });
      } finally {
        setPendingDownloadIds((prev) => prev.filter((id) => id !== result.id));
      }
    },
    [pendingDownloadIds]
  );

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const pendingStates = useMemo(
    () => ({
      favorite: pendingFavoriteIds,
      delete: pendingDeleteIds,
      share: pendingShareIds,
      download: pendingDownloadIds,
    }),
    [pendingDeleteIds, pendingDownloadIds, pendingFavoriteIds, pendingShareIds]
  );

  const handleDateChange = (key: 'startDate' | 'endDate') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value || null;
      applyFilters({ [key]: value });
    };

  const handleEnhancementChange = (event: ChangeEvent<HTMLSelectElement>) => {
    applyFilters({ enhancement: event.target.value as FiltersState['enhancement'] });
  };

  const handleCustomApiOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyFilters({ customApiOnly: event.target.checked });
  };

  return (
    <main className="history-dashboard">
      <header className="history-dashboard__header">
        <div>
          <h1>Generation History</h1>
          <p>Review, favorite, and manage all of your generated images.</p>
        </div>
        <div className="history-dashboard__filters">
          <label>
            <span>From</span>
            <input type="date" value={filters.startDate ?? ''} onChange={handleDateChange('startDate')} />
          </label>
          <label>
            <span>To</span>
            <input type="date" value={filters.endDate ?? ''} onChange={handleDateChange('endDate')} />
          </label>
          <label>
            <span>Enhancement</span>
            <select value={filters.enhancement ?? 'all'} onChange={handleEnhancementChange}>
              {enhancementOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="history-dashboard__checkbox">
            <input type="checkbox" checked={filters.customApiOnly} onChange={handleCustomApiOnlyChange} />
            <span>Only show custom API results</span>
          </label>
        </div>
      </header>

      {error && <div className="history-dashboard__alert history-dashboard__alert--error">{error}</div>}
      {feedback && (
        <div
          className={`history-dashboard__alert ${
            feedback.type === 'error' ? 'history-dashboard__alert--error' : 'history-dashboard__alert--success'
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={clearFeedback} aria-label="Dismiss notification">
            ×
          </button>
        </div>
      )}

      <section className="history-dashboard__content" aria-live="polite">
        <ResultsGallery
          results={items}
          isLoading={isInitialLoading || isPageLoading}
          pendingStates={pendingStates}
          onFavoriteToggle={handleFavoriteToggle}
          onDelete={handleDelete}
          onShare={handleShare}
          onDownload={handleDownload}
          emptyMessage={
            filters.customApiOnly
              ? 'No custom API generations yet. Try creating one from the studio!'
              : 'No generations match your filters just yet.'
          }
        />
      </section>

      <footer className="history-dashboard__footer">
        <div className="history-dashboard__pagination">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
        <p className="history-dashboard__results-count">
          Showing {(page - 1) * PAGE_SIZE + Math.min(items.length, PAGE_SIZE)} of {total} results
        </p>
      </footer>
    </main>
  );
};

export default HistoryDashboard;
