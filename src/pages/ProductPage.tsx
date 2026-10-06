import { Link, useParams } from 'react-router-dom';
import { Price } from '../components/Price';
import { Status } from '../components/Status';
import { ProductGallery } from '../components/ProductGallery';
import { getProductBySlug } from '../data/products';
import { NotFoundPage } from './NotFoundPage';
import { productStatus } from '../data/productStatus';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { getCategoryById } from '../data/categories';

export function ProductPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug ?? '');
  if (!product) return <NotFoundPage />;
  const category = getCategoryById(product.category)!;
  const contactUrl = productStatus[product.status].canContact ? getWhatsAppUrl(product.name) : null;
  return (
    <>
      <Link className="back-link" to={`/category/${category.id}`}><span aria-hidden="true">←</span> Volver a {category.name}</Link>
      <article className="product-detail">
        <ProductGallery key={product.slug} name={product.name} images={product.imageUrls} />
        <div className="product-info">
          <Status status={product.status} />
          <h1>{product.name}</h1>
          <Price value={product.price} />
          <dl className="product-metadata">
            <div><dt>Categoría</dt><dd><Link to={`/category/${category.id}`}>{category.name}</Link></dd></div>
            {product.condition && <div><dt>Condición</dt><dd>{product.condition}</dd></div>}
          </dl>
          <section className="product-description"><h2>Acerca de este artículo</h2><p>{product.description || 'Consulta los detalles de este artículo por WhatsApp.'}</p></section>
          {contactUrl ? <>
            <a className="button contact-button" href={contactUrl} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp <span aria-hidden="true">↗</span><span className="sr-only"> (se abre en una pestaña nueva)</span></a>
            <p className="contact-note">{product.status === 'reserved' ? 'Este artículo está apartado. Puedes consultar su disponibilidad.' : '¿Te interesa? Escríbeme y resolvemos tus dudas.'}</p>
          </> : <p className="contact-unavailable">{product.status === 'sold' ? 'Este artículo ya encontró un nuevo hogar.' : 'El contacto por WhatsApp no está disponible por el momento.'}</p>}
        </div>
      </article>
    </>
  );
}
