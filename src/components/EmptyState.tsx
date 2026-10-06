import { Link } from 'react-router-dom';

export function EmptyState({ title, message, backLink = false }: { title: string; message: string; backLink?: boolean }) {
  return <section className="empty-state"><span className="eyebrow">Catálogo personal</span><h1>{title}</h1><p>{message}</p>{backLink && <Link className="button" to="/">Volver al catálogo</Link>}</section>;
}
