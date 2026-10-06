import { EmptyState } from '../components/EmptyState';

export function NotFoundPage() {
  return <EmptyState title="No encontramos esta página" message="El enlace puede haber cambiado o el artículo ya no está en el catálogo." backLink />;
}
