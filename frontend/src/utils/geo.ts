export interface Coordinates {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6371000;

export const calculateDistanceInMeters = (origin: Coordinates, destination: Coordinates) => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_M * c);
};
