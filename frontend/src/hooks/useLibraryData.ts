import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Library, LibraryWithSeat, SeatStatus } from '@/types/library';
import { calculateDistanceInMeters } from '@/utils/geo';
import { mockLibraries, mockSeatStatuses, simulatedDelay } from '@/mocks/libraryData';

const buildLibrariesWithDistance = (coordinates?: { lat: number; lng: number }) => {
  if (!coordinates) {
    return mockLibraries;
  }

  return mockLibraries.map((library) => ({
    ...library,
    distance: calculateDistanceInMeters(coordinates, {
      lat: library.latitude,
      lng: library.longitude
    })
  }));
};

export const useLibraries = (coordinates?: { lat: number; lng: number }) =>
  useQuery<Library[]>({
    queryKey: ['libraries', coordinates?.lat, coordinates?.lng],
    queryFn: async () => {
      await simulatedDelay();
      return buildLibrariesWithDistance(coordinates);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

export const useRealtimeSeats = () =>
  useQuery<SeatStatus[]>({
    queryKey: ['realtime-seats'],
    queryFn: async () => {
      await simulatedDelay(150);
      return mockSeatStatuses;
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000
  });

export const useLibraryData = (coordinates?: { lat: number; lng: number }) => {
  const librariesQuery = useLibraries(coordinates);
  const seatsQuery = useRealtimeSeats();

  const mergedData = useMemo<LibraryWithSeat[]>(() => {
    if (!librariesQuery.data) {
      return [];
    }

    return librariesQuery.data.map((library) => ({
      ...library,
      seatStatus: seatsQuery.data?.find((seat) => seat.library.id === library.id)
    }));
  }, [librariesQuery.data, seatsQuery.data]);

  return {
    libraries: mergedData,
    isLoading: librariesQuery.isLoading || seatsQuery.isLoading,
    isError: librariesQuery.isError || seatsQuery.isError,
    error: librariesQuery.error ?? seatsQuery.error,
    refetch: () => {
      void librariesQuery.refetch();
      void seatsQuery.refetch();
    }
  };
};
