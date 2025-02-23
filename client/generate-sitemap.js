const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { format } = require('date-fns');

// Configuration
const config = {
  siteUrl: 'https://rent254.onrender.com',
  apiUrl: 'https://rentkenya.onrender.com/api/houses',
  outputDir: path.join(process.cwd(), 'public'),
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

class SitemapGenerator {
  constructor(config) {
    this.config = config;
    this.xmlUrls = [];
  }

  formatDate(date) {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm:ssxxx");
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.config.outputDir);
    } catch {
      await fs.mkdir(this.config.outputDir, { recursive: true });
    }
  }

  async fetchHouseListings() {
    try {
      const response = await axios.get(this.config.apiUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching house listings:', error.message);
      if (error.response) {
        console.error('API Response:', error.response.data);
      }
      return [];
    }
  }

  addUrl({ url, changefreq, priority, lastmod }) {
    const fullUrl = new URL(url, this.config.siteUrl).toString();
    this.xmlUrls.push(
      '  <url>\n' +
      `    <loc>${fullUrl}</loc>\n` +
      `    <lastmod>${this.formatDate(lastmod || new Date())}</loc>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority.toFixed(1)}</priority>\n` +
      '  </url>'
    );
  }

  generateRobotsTxt() {
    const noindexRoutes = this.config.staticRoutes
      .filter(route => route.noindex)
      .map(route => `Disallow: ${route.url}`)
      .join('\n');

    return `User-agent: *
Allow: /
${noindexRoutes}
Disallow: /profile
Disallow: /my-listings

# Sitemap
Sitemap: ${new URL('sitemap.xml', this.config.siteUrl).toString()}`;
  }

  generateSitemapXml() {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
           '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
           '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n' +
           '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n' +
           this.xmlUrls.join('\n') +
           '\n</urlset>';
  }

  async generate() {
    try {
      await this.ensureOutputDir();

      // Add static routes (excluding noindex)
      this.config.staticRoutes
        .filter(route => !route.noindex)
        .forEach(route => this.addUrl(route));

      // Add dynamic house listings
      const houses = await this.fetchHouseListings();
      houses.forEach(house => {
        this.addUrl({
          url: `/house/${house._id}`,
          changefreq: 'daily',
          priority: 0.9,
          lastmod: house.updatedAt
        });
      });

      // Write sitemap.xml
      const sitemapPath = path.join(this.config.outputDir, 'sitemap.xml');
      await fs.writeFile(sitemapPath, this.generateSitemapXml());

      // Write robots.txt
      const robotsPath = path.join(this.config.outputDir, 'robots.txt');
      await fs.writeFile(robotsPath, this.generateRobotsTxt());

      console.log('✓ Generated sitemap.xml:', sitemapPath);
      console.log('✓ Generated robots.txt:', robotsPath);
      console.log(`✓ Total URLs in sitemap: ${this.xmlUrls.length}`);
    } catch (error) {
      console.error('Error generating SEO files:', error);
      throw error;
    }
  }
}

// Execute the generation
const generator = new SitemapGenerator(config);
generator.generate().catch(error => {
  console.error('Failed to generate SEO files:', error);
  process.exit(1);
});