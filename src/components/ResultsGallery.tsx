import { useMemo } from 'react';
import './ResultsGallery.css';
import type { GenerationResult } from '../types';

type GalleryAction = 'favorite' | 'delete' | 'share' | 'download';

type PendingState = Partial<Record<GalleryAction, string[]>>;

export interface ResultsGalleryProps {
  results: GenerationResult[];
  isLoading?: boolean;
  pendingStates?: PendingState;
  onFavoriteToggle?: (result: GenerationResult) => void;
  onDelete?: (result: GenerationResult) => void;
  onShare?: (result: GenerationResult) => void;
  onDownload?: (result: GenerationResult) => void;
  emptyMessage?: string;
}

const DEFAULT_EMPTY_MESSAGE = 'Generate something magical to see it here!';

const ResultsGallery = ({
  results,
  isLoading = false,
  pendingStates,
  onFavoriteToggle,
  onDelete,
  onShare,
  onDownload,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: ResultsGalleryProps) => {
  const loadingPlaceholders = useMemo(() => Array.from({ length: 6 }), []);

  if (!isLoading && results.length === 0) {
    return <p className="results-gallery__empty">{emptyMessage}</p>;
  }

  return (
    <div className="results-gallery">
      {isLoading
        ? loadingPlaceholders.map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
        : results.map((result) => {
            const isFavoritePending = pendingStates?.favorite?.includes(result.id);
            const isDeletePending = pendingStates?.delete?.includes(result.id);
            const isSharePending = pendingStates?.share?.includes(result.id);
            const isDownloadPending = pendingStates?.download?.includes(result.id);

            return (
              <article className="results-gallery__card" key={result.id} aria-busy={isFavoritePending || isDeletePending}>
                <div className="results-gallery__image-wrapper">
                  <img src={result.imageUrl} alt={result.prompt} loading="lazy" />
                  {result.metadata?.model && (
                    <span className="results-gallery__chip">{result.metadata.model}</span>
                  )}
                  {result.metadata?.inferenceTimeMs && (
                    <span className="results-gallery__chip chip--right">
                      {Math.round(result.metadata.inferenceTimeMs)} ms
                    </span>
                  )}
                </div>
                <div className="results-gallery__body">
                  <h3 title={result.prompt}>{result.prompt}</h3>
                  <dl className="results-gallery__meta">
                    <div>
                      <dt>Generated</dt>
                      <dd>{new Date(result.createdAt).toLocaleString()}</dd>
                    </div>
                    {result.enhancement && result.enhancement !== 'none' && (
                      <div>
                        <dt>Enhancement</dt>
                        <dd>{formatEnhancement(result.enhancement)}</dd>
                      </div>
                    )}
                    <div>
                      <dt>Custom API</dt>
                      <dd>{result.customApiUsed ? 'Yes' : 'No'}</dd>
                    </div>
                    {result.metadata?.width && result.metadata?.height && (
                      <div>
                        <dt>Dimensions</dt>
                        <dd>
                          {result.metadata.width}×{result.metadata.height}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div className="results-gallery__actions">
                    <button
                      type="button"
                      className={`results-gallery__button ${result.isFavorite ? 'is-active' : ''}`}
                      onClick={() => onFavoriteToggle?.(result)}
                      disabled={isFavoritePending}
                      aria-pressed={result.isFavorite}
                    >
                      {isFavoritePending ? 'Saving…' : result.isFavorite ? '★ Favorited' : '☆ Favorite'}
                    </button>
                    <button
                      type="button"
                      className="results-gallery__button"
                      onClick={() => onDownload?.(result)}
                      disabled={isDownloadPending}
                    >
                      {isDownloadPending ? 'Preparing…' : 'Download'}
                    </button>
                    <button
                      type="button"
                      className="results-gallery__button"
                      onClick={() => onShare?.(result)}
                      disabled={isSharePending}
                    >
                      {isSharePending ? 'Sharing…' : 'Share'}
                    </button>
                    <button
                      type="button"
                      className="results-gallery__button button--danger"
                      onClick={() => onDelete?.(result)}
                      disabled={isDeletePending}
                    >
                      {isDeletePending ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
    </div>
  );
};

const SkeletonCard = () => (
  <article className="results-gallery__card skeleton">
    <div className="results-gallery__image-wrapper">
      <div className="skeleton__block" />
    </div>
    <div className="results-gallery__body">
      <div className="skeleton__line" />
      <div className="skeleton__line short" />
      <div className="skeleton__line" />
      <div className="results-gallery__actions">
        <div className="skeleton__pill" />
        <div className="skeleton__pill" />
        <div className="skeleton__pill" />
        <div className="skeleton__pill" />
      </div>
    </div>
  </article>
);

function formatEnhancement(value: NonNullable<GenerationResult['enhancement']>) {
  switch (value) {
    case 'nano-banana':
      return 'Nano Banana';
    case 'prompt-boost':
      return 'Prompt Boost';
    case 'style-transfer':
      return 'Style Transfer';
    default:
      return 'None';
  }
}

export default ResultsGallery;
