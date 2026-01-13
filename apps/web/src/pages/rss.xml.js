import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	const publishedPosts = posts
		.filter((post) => post.data.publish === true)
		.sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		language: 'en',
		image: `${context.site}favicon.svg`,
		items: publishedPosts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/blog/${post.id}/`,
			author: 'prakhar@prakhar.codes',
			categories: post.data.tags,
			enclosure: post.data.heroImage ? {
				url: `${context.site}${post.data.heroImage.startsWith('/') ? post.data.heroImage.slice(1) : post.data.heroImage}`,
				type: 'image/png',
				length: 0,
			} : undefined,
		})),
	});
}
