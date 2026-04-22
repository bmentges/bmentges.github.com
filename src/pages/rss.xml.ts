import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts', ({ data }) => data.published !== false);

  const sorted = posts.sort((a, b) => {
    const da = a.data.date?.getTime() ?? 0;
    const db = b.data.date?.getTime() ?? 0;
    return db - da;
  });

  return rss({
    title: 'Bruno Mentges — Writing',
    description: 'Field notes on data engineering and AI by Bruno Mentges — senior engineer writing about production systems, LLM integration, and platform design.',
    site: context.site!,
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
