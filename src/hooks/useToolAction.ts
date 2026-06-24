import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToolStats } from './useToolStats';

export function useToolAction() {
  const { slug } = useParams();
  const { increment } = useToolStats(slug || '');
  return useCallback(() => {
    increment();
  }, [increment]);
}
