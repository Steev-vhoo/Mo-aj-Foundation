import { getCollection } from 'astro:content';

const published = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

export async function getStories() {
  const all = await getCollection('stories', (e) => published(e) && e.data.consentOnFile);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getNews() {
  const all = await getCollection('news', published);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
