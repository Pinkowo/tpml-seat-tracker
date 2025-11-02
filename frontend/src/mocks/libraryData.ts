import type { Library, SeatStatus } from '@/types/library';

export const mockLibraries: Library[] = [
  {
    id: 1,
    name: '臺北市立圖書館 總館',
    address: '臺北市大安區建國南路二段125號',
    latitude: 25.02607,
    longitude: 121.54044,
    distance: 450,
    operatingHours: {
      openTime: '08:00',
      closeTime: '21:00',
      isOpen: true,
      closesInMinutes: 75,
      nextOpenTime: null
    }
  },
  {
    id: 2,
    name: '臺北市立圖書館 天母分館',
    address: '臺北市士林區天母西路62號',
    latitude: 25.11622,
    longitude: 121.5256,
    distance: 3200,
    operatingHours: {
      openTime: '09:00',
      closeTime: '20:00',
      isOpen: true,
      closesInMinutes: 12,
      nextOpenTime: null
    }
  },
  {
    id: 3,
    name: '臺北市立圖書館 景美分館',
    address: '臺北市文山區景後街151號',
    latitude: 24.99244,
    longitude: 121.54054,
    distance: 6100,
    operatingHours: {
      openTime: '10:00',
      closeTime: '18:00',
      isOpen: false,
      closesInMinutes: null,
      nextOpenTime: '明日 10:00'
    }
  }
];

export const mockSeatStatuses: SeatStatus[] = [
  {
    library: mockLibraries[0],
    available_seats: 18,
    total_seats: 120,
    updated_at: new Date().toISOString()
  },
  {
    library: mockLibraries[1],
    available_seats: 0,
    total_seats: 80,
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    library: mockLibraries[2],
    available_seats: 12,
    total_seats: 60,
    updated_at: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  }
];

export const mockUnknownSeatStatus: SeatStatus = {
  library: {
    id: 999,
    name: '資料更新中',
    address: '尚無資料',
    latitude: 25.04178,
    longitude: 121.51687,
    operatingHours: {
      openTime: '--:--',
      closeTime: '--:--',
      isOpen: false,
      closesInMinutes: null,
      nextOpenTime: null
    }
  },
  available_seats: 0,
  total_seats: 0,
  updated_at: new Date().toISOString()
};

export const simulatedDelay = (ms = 200): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
