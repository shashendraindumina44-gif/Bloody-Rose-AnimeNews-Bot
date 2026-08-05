const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcodeTerminal = require('qrcode-terminal');
const cron = require('node-cron');

const config = require('./config');
const { getLatestPosts } = require('./scraper');
const store = require('./store');

let sock;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['AnimeCorner-Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📲 Scan this QR code with WhatsApp (Linked Devices):\n');
            qrcodeTerminal.generate(qr, { small: true });

            const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qr)}`;
            console.log('\n🔗 Or open this link in a browser to scan it:\n' + qrLink + '\n');
        }

        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Connection closed.', shouldReconnect ? 'Reconnecting...' : 'Logged out, please re-scan QR.');
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bloody Anime News Bot.. Connected to WhatsApp!');
            scheduleJob();
            if (config.RUN_ON_STARTUP) checkAndPostNews();
        }
    });
}



async function checkAndPostNews() {
    console.log('🔍 Checking AnimeCorner for new articles...');
    let posts;
    try {
        posts = await getLatestPosts();
    } catch (err) {
        console.error('❌ Failed to fetch posts:', err.message);
        return;
    }

    if (!posts.length) {
        console.log('⚠️ No posts found.');
        return;
    }

    if (store.seedIfEmpty(posts)) {
        console.log(`🌱 Seeded ${posts.length} existing posts. Future NEW posts will be sent automatically.`);
        return;
    }

    const freshPosts = posts.filter((p) => !store.isPosted(p.id)).reverse();

    if (!freshPosts.length) {
        console.log('✅ No new articles since last check.');
        return;
    }

    for (const post of freshPosts) {
        await sendToNewsletter(post);
        store.markPosted(post.id);
        await sleep(2000);
    }

    console.log(`📤 Sent ${freshPosts.length} new article(s) to the newsletter.`);
}

async function sendToNewsletter(post) {
    let body = post.description ? `${trim(post.description, 500)}\n\n` : '';
    
    if (post.fullBody) {
        body += post.fullBody + '\n\n';
    }

    const caption =
        `📰 *${post.title}*\n\n` +
        body +
        `🏷️ ${post.category}\n` +
        `🔗 ${post.link}\n\n` +
        `${config.BLOODY_TAG}`;

    try {
        if (post.image) {
            await sock.sendMessage(config.NEWSLETTER_JID, {
                image: { url: post.image },
                caption: trim(caption, 4000)
            });
        } else {
            await sock.sendMessage(config.NEWSLETTER_JID, { text: trim(caption, 4000) });
        }
        console.log(`   ➜ Posted: ${post.title}`);
    } catch (err) {
        console.error(`   ❌ Failed to post "${post.title}":`, err.message);
    }
}

function trim(text, max) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max - 1).trim() + '…' : text;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function scheduleJob() {
    cron.schedule(config.CRON_TIME, () => {
        console.log(`\n⏰ [${new Date().toLocaleString('en-US', { timeZone: config.TIMEZONE })}] Running scheduled check...`);
        checkAndPostNews();
    }, {
        timezone: config.TIMEZONE
    });

    console.log(`🗓️ Scheduled daily check at 5:00 AM (${config.TIMEZONE}).`);
}

startBot();