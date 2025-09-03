import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export const useInfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
  rootMargin = '100px',
  threshold = 0.1
}: UseInfiniteScrollProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin,
      threshold
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleObserver, rootMargin, threshold]);

  return loadMoreRef;
};
