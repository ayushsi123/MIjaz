# Shopify Custom Theme Integration Guide

This guide explains how to integrate your custom **Mijaz Luxury** React/Vite storefront build into a **Shopify** store.

Shopify uses a proprietary template system called **Liquid**. Because your storefront is built in React, you have two primary methods to run it on Shopify:

---

## Method 1: The Easy Method (Hosted iFrame Embed)
This is the most common, robust, and easiest method. It preserves all page routing, CSS styles, animations, and cart structures without interfering with your Shopify theme's existing scripts.

### Step 1: Deploy to Vercel/Netlify (Or use your Replit App)
If you already have your React storefront hosted on Replit, you can use your Replit live URL: `https://mijaz-website-design--TERRIBEAST069.replit.app`.

Otherwise, you can deploy your build:
1. Extract `mijaz-luxury-shopify-build.zip` on your computer.
2. Drag and drop the unzipped `dist` folder into [Netlify Drop](https://app.netlify.com/drop) or upload to [Vercel](https://vercel.com/).
3. Copy the live URL.

### Step 2: Create a Custom Page in Shopify
1. Go to your **Shopify Admin** ➔ **Online Store** ➔ **Pages**.
2. Click **Add page**.
3. In the page content editor, click the **Show HTML** button (`</>`).
4. Paste the following iFrame code:
   ```html
   <iframe 
     src="https://mijaz-website-design--TERRIBEAST069.replit.app" 
     style="width: 100%; height: 100vh; border: none; overflow: hidden;"
     allow="geolocation; microphone; camera; midi; encrypted-media;"
   ></iframe>
   ```
5. Click **Save**. The entire interactive store is now embedded in your Shopify page!

---

## Method 2: Headless Custom Asset Upload (Direct Theme Integration)
If you want to run the React app directly from Shopify's servers instead of an external iFrame, you can inject the build assets directly into your Shopify theme.

### Step 1: Upload Assets to Shopify Theme
1. In your Shopify Admin, go to **Online Store** ➔ **Themes**.
2. Click the three dots `...` next to your active theme and select **Edit code**.
3. Under the **Assets** folder in the left sidebar, click **Add a new asset**.
4. Upload the following files from your extracted `dist/assets` directory:
   - Your JS file: `index-D7dCzC9g.js` (or similar)
   - Your CSS file: `index-BRX1QSVH.css` (or similar)
   - Upload any local brand images (logo, category covers) from `dist/assets` to the assets folder as well.

### Step 2: Create a Liquid Page Template
1. Under the **Templates** folder in the left sidebar, click **Add a new template**.
2. Select **page** from the dropdown, choose **liquid**, and name it **mijaz-store**.
3. Paste the following layout script into `page.mijaz-store.liquid` to render the React DOM container and link the uploaded assets:
   ```liquid
   {% layout 'theme' %}

   <!-- React App root element -->
   <div id="root" class="mijaz-react-app-root"></div>

   <!-- Load Custom Style Sheet -->
   {{ 'index-BRX1QSVH.css' | asset_url | stylesheet_tag }}

   <!-- Load React App Bundle -->
   {{ 'index-D7dCzC9g.js' | asset_url | script_tag }}

   <style>
     .mijaz-react-app-root {
       min-height: 80vh;
       background-color: #FAF8F4;
     }
     /* Hide default Shopify headers/footers if you want full page takeover */
     /* .site-header, .site-footer { display: none !important; } */
   </style>
   ```
4. Click **Save**.

### Step 3: Assign the Template to your Page
1. Go back to **Pages** in Shopify.
2. Select or create your store page.
3. On the right-hand sidebar under **Theme template**, select **page.mijaz-store**.
4. Save the page. The React storefront is now running natively inside your Shopify theme container!
