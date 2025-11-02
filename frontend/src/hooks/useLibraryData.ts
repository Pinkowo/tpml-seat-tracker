import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Library, LibraryWithSeat, SeatStatus } from '@/types/library';
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
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData
  });

export const useRealtimeSeats = () =>
  useQuery<SeatStatus[]>({
    queryKey: ['realtime-seats'],
    queryFn: async () => {
      await simulatedDelay(150);
      return mockSeatStatuses;
    },
    placeholderData: (previousData) => previousData
  });

export const useLibraryData = (coordinates?: { lat: number; lng: number }) => {
  const librariesQuery = useLibraries(coordinates);
  const seatsQuery = useRealtimeSeats();

  const mergedData = useMemo<LibraryWithSeat[]>(() => {
    const baseLibraries = librariesQuery.data ?? [];
    const seatData = seatsQuery.data ?? [];

    return baseLibraries.map((library) => ({
      ...library,
      seatStatus: seatData.find((seat) => seat.library.id === library.id)
    }));
  }, [librariesQuery.data, seatsQuery.data]);

  return {
    libraries: mergedData,
    isLoading: librariesQuery.isLoading || seatsQuery.isLoading,
    isFetching: librariesQuery.isFetching || seatsQuery.isFetching,
    isError: librariesQuery.isError || seatsQuery.isError,
    error: librariesQuery.error ?? seatsQuery.error,
    refetch: async () => {
      await Promise.all([librariesQuery.refetch(), seatsQuery.refetch()]);
    }
  };
};
