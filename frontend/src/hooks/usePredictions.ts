import { useQuery } from '@tanstack/react-query';
import type { PredictionResponse } from '@/types/prediction';
import { simulatedDelay } from '@/mocks/libraryData';

const mockPredictionResponse: PredictionResponse = {
  library_id: 1,
  predictions: [
    { horizon_minutes: 30, predicted_seats: 16, is_fallback: false },
    { horizon_minutes: 60, predicted_seats: 12, is_fallback: true }
  ]
};

const fetchPredictions = async (libraryId: number): Promise<PredictionResponse> => {
  await simulatedDelay(200);
  return {
    ...mockPredictionResponse,
    library_id: libraryId
  };
};

export const usePredictions = (libraryId: number | null, enabled: boolean) =>
  useQuery<PredictionResponse>({
    queryKey: ['predictions', libraryId],
    queryFn: () => fetchPredictions(libraryId ?? -1),
    enabled: enabled && Boolean(libraryId),
    staleTime: 5 * 60 * 1000
  });
