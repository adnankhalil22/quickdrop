export function LoadingState({ label = 'Loading…' }) {
  return <p className="state-message">{label}</p>;
}

export function EmptyState({ label = 'Nothing here yet.' }) {
  return <p className="state-message">{label}</p>;
}

export function ErrorState({ label = 'Something went wrong.' }) {
  return <p className="state-message alert alert-danger">{label}</p>;
}
