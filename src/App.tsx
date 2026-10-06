import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProductsPage } from './pages/ProductsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProductsPage />} />
        <Route path="category/:categoryId" element={<ProductsPage />} />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
