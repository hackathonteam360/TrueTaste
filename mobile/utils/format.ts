export function formatDistance(km?: number): string {
  if (km === undefined || km === null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatPriceLevel(level: number): string {
  return '$'.repeat(Math.max(1, Math.min(4, level)));
}

export function timeAgo(date: string | Date): string {
  const then = new Date(date).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function coinsToUsd(coins: number): string {
  return `$${(coins * 0.1).toFixed(2)}`;
}

export function ratingColor(rating: number): string {
  if (rating >= 4.5) return '#22C55E';
  if (rating >= 3.5) return '#F59E0B';
  return '#EF4444';
}