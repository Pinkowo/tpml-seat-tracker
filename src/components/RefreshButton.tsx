import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface RefreshButtonProps {
  className?: string;
  onAfterRefresh?: () => Promise<void> | void;
}

export const RefreshButton = ({ className, onAfterRefresh }: RefreshButtonProps) => {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
  const [isPressed, setIsPressed] = useState(false);

  const handleRefresh = async () => {
    setIsPressed(true);
    try {
      await queryClient.invalidateQueries();
      if (onAfterRefresh) {
        await onAfterRefresh();
      }
    } finally {
      setTimeout(() => setIsPressed(false), 200);
    }
  };

  const isLoading = isFetching > 0;

  return (
    <button
      type="button"
      onClick={handleRefresh}
      aria-label="手動重新整理資料"
      className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
        isPressed ? 'scale-95 bg-primary/90' : ''
      } ${isLoading ? 'cursor-progress' : ''} ${className ?? ''}`}
    >
      <span
        className={`inline-flex h-5 w-5 items-center justify-center ${isLoading ? 'animate-spin' : ''}`}
        aria-hidden="true"
      >
        ↻
      </span>
    </button>
  );
};
