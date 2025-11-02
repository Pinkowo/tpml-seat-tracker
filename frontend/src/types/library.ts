export interface Library {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

export interface SeatStatus {
  library: Library;
  available_seats: number;
  total_seats: number;
  updated_at: string;
}

export interface LibraryWithSeat extends Library {
  seatStatus?: SeatStatus;
}
