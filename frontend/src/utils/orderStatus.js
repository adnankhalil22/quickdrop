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
