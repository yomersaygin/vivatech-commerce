export const nextStatuses: Record<string, string[]> = {
  new: ['confirmed', 'preparing', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrderStatus(current: string, next: string) {
  if (current === next) return true;
  return (nextStatuses[current] ?? []).includes(next);
}

export function validTrackingUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
