<div align="center">

# 🌹 BLOODY ROSE ANIME NEWS BOT 🌹
### ⛩️ Automated WhatsApp Channel Broadcaster ⛩️

<img src="https://www.image2url.com/r2/default/gifs/1785920123869-d73912df-cb9e-44ab-a313-26c89373b979.gif" width="100%" alt="Bloody Rose Banner"/>


[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)[cite: 9]
[![WhatsApp Baileys](https://img.shields.io/badge/WhatsApp-Baileys%20v6.7-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/WhiskeySockets/Baileys)[cite: 9]
[![Scraper](https://img.shields.io/badge/Scraper-Cheerio%20%2B%20Axios-FF69B4?style=for-the-badge&logo=javascript&logoColor=white)](https://cheerio.js.org/)[cite: 9]

<p align="center">
  <b>An automated engine that scrapes AnimeCorner.me and posts new articles (image, title, and description) directly to a WhatsApp Newsletter channel.</b>[cite: 9]
</p>

---

</div>

## ⛩️ Overview

**Bloody Rose AnimeNews Bot** is an automation tool designed to keep your WhatsApp community updated with the latest anime news. It actively monitors AnimeCorner, extracts article details (including thumbnails, categories, and links)[cite: 10], and automatically broadcasts formatted cards directly to your WhatsApp Newsletter Channel using the Baileys library[cite: 8, 9]. 

---

## 🌸 Key Features

*   📰 **Smart Web Scraping:** Utilizes Axios and Cheerio to fetch news from the AnimeCorner HTML category page and enriches the data by scraping the full article pages[cite: 10].
*   🔄 **REST API Fallback:** If HTML scraping fails, the bot automatically falls back to fetching data via the WordPress REST API to ensure consistent updates[cite: 10].
*   🌱 **First-Run Seeding:** On its very first run, the bot seeds the local database with existing articles instead of blasting your newsletter, ensuring only genuinely *new* articles get sent in the future[cite: 8, 11].
*   💾 **Spam Prevention:** Keeps track of up to 500 previously posted article IDs in a local `posted.json` file to prevent duplicate posts[cite: 11].
*   ⏰ **Automated Scheduling:** Uses `node-cron` to automatically run checks at your configured time (e.g., 5:00 AM Asia/Colombo)[cite: 7, 8].
*   📱 **Seamless Connection:** Provides a terminal QR code and a fallback browser link to easily link your WhatsApp account.

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
Ensure you have the following installed:
*   **Node.js**: Version 18 or higher[cite: 9].

### 2️⃣ Installation
Install the necessary dependencies to get started:
```bash
npm install
