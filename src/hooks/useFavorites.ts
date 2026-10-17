import { createListStore } from '../lib/listStore';

const favorites = createListStore('toolglass_favorites');

export const toggleFavorite = (slug: string) => {
  const list = favorites.get();
  favorites.set(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
};

/** Favorites in the user's chosen order. `reorder` takes the full new order. */
export function useFavorites() {
  const list = favorites.use();
  return { favorites: list, isFavorite: (slug: string) => list.includes(slug), toggleFavorite, reorder: favorites.set };
}
