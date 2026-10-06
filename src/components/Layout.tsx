import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { getProductBySlug } from '../data/products';
import { getCategoryById } from '../data/categories';

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    let slug = '';
    try { slug = decodeURIComponent(pathname.split('/')[2] ?? ''); } catch { /* Invalid URL: show the not-found page. */ }
    const product = pathname.startsWith('/product/') ? getProductBySlug(slug) : undefined;
    const category = pathname.startsWith('/category/') ? getCategoryById(slug) : undefined;
    const name = product?.name ?? category?.name;
    document.title = name ? `${name} · Artículos en venta` : 'Artículos en venta';
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <header className="site-header">
        <Link className="brand" to="/"><span className="brand-mark" aria-hidden="true">a.</span> Artículos en venta</Link>
        <span className="header-note">Catálogo personal</span>
      </header>
      <main id="main" tabIndex={-1}><Outlet /></main>
      <footer className="site-footer"><span>Artículos en venta</span><span>Una nueva historia para cada objeto.</span></footer>
    </>
  );
}
