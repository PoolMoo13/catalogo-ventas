import content from '../content/categories.json';

export interface Category {
  id: string;
  name: string;
}

// Stable IDs are also URL segments; labels can change independently.
const categories: Category[] = [];
for (const entry of (Array.isArray(content) ? content : []) as unknown[]) {
  if (typeof entry !== 'object' || entry === null || !('id' in entry) || !('name' in entry)
    || typeof entry.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)
    || typeof entry.name !== 'string' || !entry.name.trim()
    || categories.some(category => category.id === entry.id)) {
    if (import.meta.env.DEV) console.warn('[categories] Skipping category with invalid or duplicate ID or missing name.');
    continue;
  }
  categories.push({ id: entry.id, name: entry.name.trim() });
}

export const getCategories = () => categories;
export const getCategoryById = (id: string) => categories.find(category => category.id === id);
