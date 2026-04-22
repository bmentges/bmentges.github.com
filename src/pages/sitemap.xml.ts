import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const STATIC_PAGES = ['', 'about', 'cv'];

export async function GET(context: APIContext) {
  const siteOrigin = context.site?.toString().replace(/\/$/, '') ?? 'https://bmentges.github.io';
  const posts = await getCollection('posts', ({ data }) => data.published !== false);

  const tagSet = new Set<string>();
  for (const post of posts) for (const t of post.data.tags ?? []) tagSet.add(t);

  const now = new Date().toISOString();

  const urls = [
    ...STATIC_PAGES.map(p => ({
      loc: `${siteOrigin}/${p}${p ? '/' : ''}`,
      lastmod: now,
      priority: p === '' ? '1.0' : '0.8',
    })),
    ...posts.map(post => ({
      loc: `${siteOrigin}/posts/${post.slug}/`,
      lastmod: post.data.date?.toISOString() ?? now,
      priority: '0.7',
    })),
    ...Array.from(tagSet).map(tag => ({
      loc: `${siteOrigin}/tags/${tag}/`,
      lastmod: now,
      priority: '0.5',
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
