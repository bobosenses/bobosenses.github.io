import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export async function getPosts(): Promise<Post[]> {
  return (await getCollection('posts', ({ data }) => !data.draft && data.date <= new Date()))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
export const postUrl = (post: Post) => `/posts/${post.id}/`;
export const termSlug = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-');
export const termUrl = (kind: 'categories' | 'tags', name: string) => `/${kind}/${encodeURIComponent(termSlug(name))}/`;
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Shanghai',
}).format(date);
export function plainText(text: string) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/<[^>]*>/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`|~]/g, '').replace(/\s+/g, ' ').trim();
}
export const summary = (post: Post) => post.data.excerpt || plainText(post.body || '').slice(0, 120);
export function getTerms(posts: Post[], kind: 'categories' | 'tags') {
  const counts = new Map<string, number>();
  for (const post of posts) for (const name of post.data[kind]) counts.set(name, (counts.get(name) || 0) + 1);
  return [...counts].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
}
