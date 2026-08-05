module.exports = {
    SITE_URL: 'https://animecorner.me/',

   
    CATEGORY_URL: 'https://animecorner.me/category/news/',


    WP_API_URL: 'https://animecorner.me/wp-json/wp/v2/posts?per_page=8&_embed',

// This is My whatsapp channel newsletter.you can your channel one using whatsapp bot.
    NEWSLETTER_JID: '120363409533772994@newsletter',


//change time according to your country time zone.
//  You can use https://crontab.guru/ to generate cron expressions. The current setting is for 5:00 AM every day in the Asia/Colombo timezone.
    CRON_TIME: '0 5 * * *',
    TIMEZONE: 'Asia/Colombo',


    RUN_ON_STARTUP: true,

    MAX_POSTS_PER_RUN: 5,
    // ADD YOUR OWN TAG HERE.

    BLOODY_TAG: '🌹 *ʙʟᴏᴏᴅʏ ʀᴏsᴇ ᴀɴɪᴍᴇ* 🌹',

    POSTED_DB_FILE: './posted.json',

    AUTH_FOLDER: './auth_info'
};