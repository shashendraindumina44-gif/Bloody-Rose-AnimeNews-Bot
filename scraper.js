const axios = require('axios');
const cheerio = require('cheerio');
const config = require('./config');

const HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
};

function cleanText(text = '') {
    return text.replace(/\s+/g, ' ').trim();
}

async function fetchViaHtml() {
    const { data: html } = await axios.get(config.CATEGORY_URL, {
        headers: HEADERS,
        timeout: 15000
    });
    const $ = cheerio.load(html);
    const posts = [];

    $('article.item.hentry').each((_, el) => {
        const card = $(el);

        const titleLink = card.find('h2.penci-entry-title a, h2.grid-title a').first();
        const link = titleLink.attr('href');
        const title = cleanText(titleLink.text());
        if (!link || !title) return;

        let image = card.find('.thumbnail a.penci-image-holder').attr('data-bgset') || null;
        if (image) image = image.split(',')[0].trim().split(' ')[0];

        const description = cleanText(card.find('.item-content.entry-content p').first().text());

        posts.push({
            id: link,
            title,
            link,
            description,
            image,
            category: 'Anime News',
            date: null
        });
    });

    return posts;
}

async function enrichFromArticlePage(post) {
    try {
        const { data: html } = await axios.get(post.link, {
            headers: HEADERS,
            timeout: 15000
        });
        const $ = cheerio.load(html);

        if (!post.image) {
            post.image =
                $('meta[property="og:image"]').attr('content') ||
                $('img.wp-post-image').first().attr('data-src') ||
                $('img.wp-post-image').first().attr('src') ||
                null;
        }

        const cat = $('.penci-standard-cat a.penci-cat-name span').first().text();
        if (cat) post.category = cleanText(cat);

        const contentSelector = '#penci-post-entry-inner, .post-entry .entry-content, .entry-content';
        const fullContent = $(contentSelector);

        if (fullContent.length) {
            let bodyText = '';
            
            fullContent.find('p').each((i, el) => {
                const pText = cleanText($(el).text());
                if (pText && pText.length > 20 && !pText.toLowerCase().includes('source:') && i < 8) {
                    bodyText += pText + '\n\n';
                }
            });

            fullContent.find('ul, ol').each((_, el) => {
                const listItems = [];
                $(el).find('li').each((__, li) => {
                    const itemText = cleanText($(li).text());
                    if (itemText) listItems.push(itemText);
                });
                if (listItems.length > 0) {
                    bodyText += '• ' + listItems.join('\n• ') + '\n\n';
                }
            });

            if (!post.description || post.description.length < 100) {
                post.description = bodyText.trim().slice(0, 600) || 
                    cleanText(fullContent.find('p').first().text());
            }
            post.fullBody = bodyText.trim().slice(0, 1500);
        } else {
            if (!post.description) {
                post.description = $('meta[property="og:description"]').attr('content') ||
                    cleanText($('#penci-post-entry-inner p').first().text());
            }
        }

        const date = $('time.entry-date').attr('datetime') || $('meta[property="article:published_time"]').attr('content');
        if (date) post.date = date;

    } catch (err) {
        console.warn(`Enrich failed for ${post.link}:`, err.message);
    }
    return post;
}

async function fetchViaRestApi() {
    const { data } = await axios.get(config.WP_API_URL, {
        headers: HEADERS,
        timeout: 15000
    });
    if (!Array.isArray(data)) throw new Error('Unexpected REST API response');

    return data.map((post) => {
        const media = post._embedded?.['wp:featuredmedia']?.[0];
        const image =
            media?.media_details?.sizes?.large?.source_url ||
            media?.source_url ||
            null;
        const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Anime News';

        return {
            id: String(post.id),
            title: cleanText(post.title?.rendered || ''),
            link: post.link,
            description: cleanText((post.excerpt?.rendered || '').replace(/<[^>]+>/g, '')),
            image,
            category,
            date: post.date
        };
    });
}

async function getLatestPosts() {
    let posts = [];

    try {
        posts = await fetchViaHtml();
    } catch (err) {
        console.warn('⚠️  HTML scrape failed:', err.message);
    }

    if (!posts.length) {
        try {
            posts = await fetchViaRestApi();
        } catch (err) {
            console.warn('⚠️  REST API also failed:', err.message);
        }
    }

    posts = posts.slice(0, config.MAX_POSTS_PER_RUN);

    for (const post of posts) {
        await enrichFromArticlePage(post);
    }

    return posts;
}

module.exports = { getLatestPosts, cleanText };