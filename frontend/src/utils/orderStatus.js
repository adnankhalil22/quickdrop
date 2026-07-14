const BADGE_CLASSES = {
  pending: 'badge-warning',
  accepted: 'badge-info',
  preparing: 'badge-info',
  out_for_delivery: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
  rejected: 'badge-danger',
};

export function getStatusBadgeClass(status) {
  return BADGE_CLASSES[status] || 'badge-muted';
}

export function formatStatusLabel(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

// Mirrors the backend's Order::TRANSITIONS state machine (Phase 11) so the
// UI only ever offers actions the API will actually accept.
const MANAGER_TRANSITIONS = {
  pending: ['accepted', 'rejected'],
  accepted: ['preparing'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
};

export function getNextStatuses(status) {
  return MANAGER_TRANSITIONS[status] || [];
}
