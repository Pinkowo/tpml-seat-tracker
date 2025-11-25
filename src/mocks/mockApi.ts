import type {
  LibraryApiItem,
  LibrariesResponse,
  RealtimeSeatItem,
  RealtimeResponse,
  PredictionApiResponse,
  OpenHoursItem,
} from '@/types/api';

const DEFAULT_OPEN_HOURS: Record<string, OpenHoursItem | null> = {
  monday: { open: '08:30', close: '21:00' },
  tuesday: { open: '08:30', close: '21:00' },
  wednesday: { open: '08:30', close: '21:00' },
  thursday: { open: '08:30', close: '21:00' },
  friday: { open: '08:30', close: '21:00' },
  saturday: { open: '09:00', close: '17:00' },
  sunday: null,
};

const cloneOpenHours = (
  overrides?: Partial<Record<string, OpenHoursItem | null>>
): Record<string, OpenHoursItem | null> =>
  ({
    ...DEFAULT_OPEN_HOURS,
    ...(overrides ?? {}),
  }) as Record<string, OpenHoursItem | null>;

const mockLibraries: LibraryApiItem[] = [
  {
    branch_name: '臺北市立圖書館總館',
    address: '100 臺北市中正區廣州街 20 號',
    phone: '02-2361-7311',
    latitude: 25.034101,
    longitude: 121.517266,
    open_hours: cloneOpenHours(),
    is_open: true,
    closing_in_minutes: 180,
    distance_km: 0.8,
    current_seats: {
      free: 64,
      total: 128,
    },
  },
  {
    branch_name: '北投圖書館',
    address: '112 臺北市北投區光明路 251 號',
    phone: '02-2897-7682',
    latitude: 25.136876,
    longitude: 121.506413,
    open_hours: cloneOpenHours({
      saturday: { open: '09:00', close: '18:00' },
    }),
    is_open: true,
    closing_in_minutes: 45,
    distance_km: 6.2,
    current_seats: {
      free: 18,
      total: 90,
    },
  },
  {
    branch_name: '天母圖書館',
    address: '111 臺北市士林區中山北路七段 210 巷 2 號',
    phone: '02-2873-6012',
    latitude: 25.116917,
    longitude: 121.531235,
    open_hours: cloneOpenHours(),
    is_open: true,
    closing_in_minutes: 260,
    distance_km: 5.4,
    current_seats: {
      free: 42,
      total: 120,
    },
  },
  {
    branch_name: '士林圖書館',
    address: '111 臺北市士林區中山北路五段 325 之 1 號',
    phone: '02-2881-1850',
    latitude: 25.088228,
    longitude: 121.524942,
    open_hours: cloneOpenHours({
      monday: null,
    }),
    is_open: false,
    closing_in_minutes: null,
    distance_km: 4.9,
    current_seats: {
      free: 0,
      total: 80,
    },
  },
  {
    branch_name: '文山圖書館',
    address: '116 臺北市文山區萬美街二段 7 號',
    phone: '02-2931-5304',
    latitude: 24.988154,
    longitude: 121.572542,
    open_hours: cloneOpenHours({
      sunday: { open: '09:00', close: '17:00' },
    }),
    is_open: true,
    closing_in_minutes: 90,
    distance_km: 7.1,
    current_seats: {
      free: 8,
      total: 70,
    },
  },
  {
    branch_name: '大安圖書館',
    address: '106 臺北市大安區信義路三段 155 號',
    phone: '02-2707-1008',
    latitude: 25.033201,
    longitude: 121.543778,
    open_hours: cloneOpenHours(),
    is_open: true,
    closing_in_minutes: 30,
    distance_km: 1.5,
    current_seats: {
      free: 4,
      total: 110,
    },
  },
] satisfies LibraryApiItem[];

const mockRealtimeSeats: RealtimeSeatItem[] = mockLibraries.map((library, index) => {
  const free = library.current_seats?.free ?? 0;
  const total = library.current_seats?.total ?? 0;
  const usageRate = total === 0 ? 0 : Number(((total - free) / total).toFixed(2));

  return {
    branch_name: library.branch_name,
    total_free_count: free,
    total_seat_count: total,
    usage_rate: usageRate,
    last_updated: new Date(Date.now() - index * 5 * 60 * 1000).toISOString(),
    batch_id: `mock-batch-${index + 1}`,
  };
});

const mockPredictionMap: Record<string, PredictionApiResponse> = {
  臺北市立圖書館總館: {
    library_id: 1,
    predictions: [
      { horizon_minutes: 30, predicted_seats: 58, is_fallback: false },
      { horizon_minutes: 60, predicted_seats: 50, is_fallback: false },
    ],
  },
  北投圖書館: {
    library_id: 2,
    predictions: [
      { horizon_minutes: 30, predicted_seats: 12, is_fallback: false },
      { horizon_minutes: 60, predicted_seats: 6, is_fallback: true },
    ],
  },
  天母圖書館: {
    library_id: 3,
    predictions: [
      { horizon_minutes: 30, predicted_seats: 38, is_fallback: false },
      { horizon_minutes: 60, predicted_seats: 32, is_fallback: false },
    ],
  },
  士林圖書館: {
    library_id: 4,
    predictions: [
      { horizon_minutes: 30, predicted_seats: 0, is_fallback: true },
      { horizon_minutes: 60, predicted_seats: 0, is_fallback: true },
    ],
  },
  文山圖書館: {
    library_id: 5,
    predictions: [
      { horizon_minutes: 30, predicted_seats: 5, is_fallback: false },
      { horizon_minutes: 60, predicted_seats: 3, is_fallback: false },
    ],
  },
  大安圖書館: {
    library_id: 6,
    predictions: [
      { horizon_minutes: 30, predicted_seats: 2, is_fallback: true },
      { horizon_minutes: 60, predicted_seats: 1, is_fallback: true },
    ],
  },
} satisfies Record<string, PredictionApiResponse>;

const createMeta = (totalCount: number) => ({
  timestamp: new Date().toISOString(),
  version: 'mock-v1',
  total_count: totalCount,
});

const sortLibraries = (
  libraries: LibraryApiItem[],
  sortBy: 'distance' | 'seats' = 'distance'
) => {
  const sorted = [...libraries];

  if (sortBy === 'seats') {
    return sorted.sort((a, b) => {
      const seatsA = a.current_seats?.free ?? 0;
      const seatsB = b.current_seats?.free ?? 0;
      return seatsB - seatsA;
    });
  }

  return sorted.sort((a, b) => {
    const distanceA = a.distance_km ?? Number.POSITIVE_INFINITY;
    const distanceB = b.distance_km ?? Number.POSITIVE_INFINITY;
    return distanceA - distanceB;
  });
};

const filterByBranchName = (branchName?: string) => {
  if (!branchName) {
    return [...mockLibraries];
  }

  const lowerCaseBranch = branchName.toLowerCase();
  return mockLibraries.filter((library) =>
    library.branch_name.toLowerCase().includes(lowerCaseBranch)
  );
};

export const mockDelay = async (min = 300, max = 700) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
};

export const getMockLibrariesResponse = (params?: {
  branch_name?: string;
  sort_by?: 'distance' | 'seats';
}): LibrariesResponse => {
  const filtered = filterByBranchName(params?.branch_name);
  const sorted = sortLibraries(filtered, params?.sort_by);
  return {
    data: sorted,
    meta: createMeta(sorted.length),
  };
};

export const getMockRealtimeResponse = (branchName?: string): RealtimeResponse => {
  const data = branchName
    ? mockRealtimeSeats.filter(
        (seat) => seat.branch_name.toLowerCase() === branchName.toLowerCase()
      )
    : mockRealtimeSeats;

  return {
    data,
    meta: createMeta(data.length),
  };
};

const fallbackPrediction: PredictionApiResponse = {
  library_id: 0,
  predictions: [
    { horizon_minutes: 30, predicted_seats: 20, is_fallback: true },
    { horizon_minutes: 60, predicted_seats: 15, is_fallback: true },
  ],
};

export const getMockPredictionResponse = (branchName: string): PredictionApiResponse => {
  return mockPredictionMap[branchName] ?? fallbackPrediction;
};
