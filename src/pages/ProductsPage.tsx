import { Link, NavLink, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getProductsByCategory } from '../data/products';
import { getCategories, getCategoryById } from '../data/categories';
import { NotFoundPage } from './NotFoundPage';

export function ProductsPage() {
  const { categoryId } = useParams();
  const selectedCategory = categoryId ? getCategoryById(categoryId) : undefined;
  if (categoryId && !selectedCategory) return <NotFoundPage />;
  const categories = getCategories();
  const visibleCategories = selectedCategory ? [selectedCategory] : categories;
  return (
    <>
      <section className="catalog-intro">
        <span className="eyebrow">Una segunda vida, una buena compra</span>
        <h1>{selectedCategory ? selectedCategory.name : <>Encuentra algo<br />para tu día a día.</>}</h1>
        <p>{selectedCategory ? `Explora los artículos de ${selectedCategory.name} y consulta sus detalles por WhatsApp.` : 'Explora los artículos por categoría, conoce sus detalles y conversemos por WhatsApp.'}</p>
      </section>
      <nav className="category-nav" aria-label="Categorías">
        <NavLink to="/" end>Todo el catálogo</NavLink>
        {categories.map(category => <NavLink key={category.id} to={`/category/${category.id}`}>{category.name}</NavLink>)}
      </nav>
      {visibleCategories.map(category => {
        const products = getProductsByCategory(category.id);
        return (
          <section className="category-section" key={category.id} aria-labelledby={`category-${category.id}`}>
            <div className="catalog-heading">
              <h2 id={`category-${category.id}`}>{selectedCategory ? 'Artículos' : <Link to={`/category/${category.id}`}>{category.name} <span aria-hidden="true">↗</span></Link>}</h2>
              <span>{products.length} {products.length === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            {products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.slug} product={product} />)}</div>
              : <p className="category-empty">Pronto habrá nuevos artículos en {category.name}. Vuelve a visitarnos más adelante.</p>}
          </section>
        );
      })}
    </>
  );
}
