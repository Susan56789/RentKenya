const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
  
  siteUrl: 'https://rent254.onrender.com',
  
  apiUrl: 'https://rentkenya.onrender.com/api/houses',
  
  staticRoutes: [
    {
      url: '/',
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: '/add-house',
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: '/login',
      changefreq: 'monthly',
      priority: 0.5,
      noindex: true
    },
    {
      url: '/register',
      changefreq: 'monthly',
      priority: 0.5,
      noindex: true
    },
    {
      url: '/forgot-password',
      changefreq: 'monthly',
      priority: 0.4,
      noindex: true
    }
   
  ]
};

// Fetch house listings from API
async function fetchHouseListings() {
  try {
    const response = await axios.get(config.apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching house listings:', error);
    return [];
  }
}

// Generate house URLs from listings
async function getHouseUrls() {
  const houses = await fetchHouseListings();
  return houses.map(house => ({
    url: `/house/${house._id}`,
    changefreq: 'daily',
    priority: 0.9,
    lastmod: house.updatedAt || new Date().toISOString()
  }));
}

// Generate robots.txt content
function generateRobotsTxt(sitemapUrl) {
  return `User-agent: *
Allow: /
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /profile
Disallow: /my-listings
Sitemap: ${sitemapUrl}/sitemap.xml`;
}

// Generate sitemap XML content
async function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes (excluding noindex routes)
  config.staticRoutes
    .filter(route => !route.noindex)
    .forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${config.siteUrl}${route.url}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += '  </url>\n';
    });

  // Add dynamic house listings
  const houseUrls = await getHouseUrls();
  houseUrls.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${config.siteUrl}${route.url}</loc>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

// Write sitemap and robots.txt files
async function generateSEOFiles() {
  try {
    const publicDir = path.join(__dirname, 'public');
    
    // Create public directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Generate and write sitemap.xml
    const sitemap = await generateSitemap();
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

    // Generate and write robots.txt
    const robotsTxt = generateRobotsTxt(config.siteUrl);
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
    
    console.log('Sitemap and robots.txt generated successfully!');
  } catch (error) {
    console.error('Error generating SEO files:', error);
  }
}

// Execute the generation
generateSEOFiles();