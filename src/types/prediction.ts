export interface PredictionItem {
  horizon_minutes: 30 | 60;
  predicted_seats: number;
  is_fallback: boolean;
}

export interface PredictionResponse {
  library_id: number;
  predictions: PredictionItem[];
}

export interface LibraryPrediction extends PredictionItem {
  label: string;
}
