import { useEffect } from 'react';
import { focusManager, useQueryClient } from '@tanstack/react-query';

export const useVisibilityRefresh = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState !== 'hidden';
      focusManager.setFocused(isVisible);

      if (isVisible) {
        void queryClient.invalidateQueries();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);
};
