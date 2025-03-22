import { useState, useCallback, useEffect } from 'react';

interface UseSkeletonOptions {
  minLoadTime?: number;
  maxLoadTime?: number;
  showDelay?: number;
}

export const useSkeleton = ({
  minLoadTime = 1000,
  maxLoadTime = 10000,
  showDelay = 300,
}: UseSkeletonOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setLoadStartTime(Date.now());

    // Mostrar skeleton después de un delay para evitar flash
    const timer = setTimeout(() => {
      if (loading) {
        setShowSkeleton(true);
      }
    }, showDelay);

    return () => clearTimeout(timer);
  }, [loading, showDelay]);

  const stopLoading = useCallback(() => {
    if (!loadStartTime) {
      setLoading(false);
      setShowSkeleton(false);
      return;
    }

    const elapsed = Date.now() - loadStartTime;
    
    if (elapsed < minLoadTime) {
      // Mantener el skeleton visible por el tiempo mínimo
      setTimeout(() => {
        setLoading(false);
        setShowSkeleton(false);
      }, minLoadTime - elapsed);
    } else {
      setLoading(false);
      setShowSkeleton(false);
    }
  }, [loadStartTime, minLoadTime]);

  // Forzar fin de carga después del tiempo máximo
  useEffect(() => {
    if (loading && loadStartTime) {
      const timer = setTimeout(() => {
        stopLoading();
      }, maxLoadTime);

      return () => clearTimeout(timer);
    }
  }, [loading, loadStartTime, maxLoadTime, stopLoading]);

  const withSkeleton = useCallback(async <T>(
    promise: Promise<T>,
  ): Promise<T> => {
    try {
      startLoading();
      const result = await promise;
      stopLoading();
      return result;
    } catch (error) {
      stopLoading();
      throw error;
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    showSkeleton,
    startLoading,
    stopLoading,
    withSkeleton,
  };
};