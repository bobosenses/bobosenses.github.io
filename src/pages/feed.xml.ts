import rss from '@astrojs/rss';
import { getPosts, postUrl, summary } from '../lib/posts';
import { site } from '../site.config';
export async function GET() {
  return rss({ title: site.title, description: site.description, site: site.url,
    items: (await getPosts()).map(post => ({ title: post.data.title, pubDate: post.data.date, description: summary(post), link: postUrl(post), categories: post.data.categories })),
    customData: '<language>zh-CN</language>',
  });
}
