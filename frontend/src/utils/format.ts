export const formatDistance = (meters: number | null | undefined): string => {
  if (meters === null || meters === undefined || Number.isNaN(meters)) {
    return '距離資訊取得中';
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
};
