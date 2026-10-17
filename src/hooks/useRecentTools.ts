import { createListStore } from '../lib/listStore';

const recents = createListStore('toolglass_recent_tools', 6);
const addRecent = (slug: string) => recents.set([slug, ...recents.get()]);

export function useRecentTools() {
  return { recents: recents.use(), addRecent };
}
