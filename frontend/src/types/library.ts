export interface Library {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  operatingHours?: OperatingHours;
}

export interface OperatingHours {
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  closesInMinutes?: number | null;
  nextOpenTime?: string | null;
}

export interface SeatStatus {
  library: Library;
  available_seats: number;
  total_seats: number;
  updated_at: string;
}

export interface LibraryWithSeat extends Library {
  seatStatus?: SeatStatus;
  operatingHours?: OperatingHours;
}
