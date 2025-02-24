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
    try {
      // Ensure we have a valid date
      const validDate = new Date(date);
      if (isNaN(validDate.getTime())) {
        throw new Error('Invalid date');
      }
      return format(validDate, "yyyy-MM-dd");
    } catch (error) {
      return format(new Date(), "yyyy-MM-dd");
    }
  }

  escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
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
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching house listings:', error.message);
      return [];
    }
  }

  validateUrl(url) {
    try {
      // Remove any leading/trailing whitespace
      url = url.trim();
      
      // Ensure URL starts with forward slash if it's a path
      if (!url.startsWith('http') && !url.startsWith('/')) {
        url = '/' + url;
      }

      // Create full URL
      const fullUrl = url.startsWith('http') ? url : new URL(url, this.config.siteUrl).toString();
      
      // Validate URL format
      new URL(fullUrl);
      
      return this.escapeXml(fullUrl);
    } catch (error) {
      console.error(`Invalid URL: ${url}`);
      return null;
    }
  }

  addUrl({ url, changefreq, priority, lastmod }) {
    const validUrl = this.validateUrl(url);
    if (!validUrl) return;

    // Validate changefreq
    const validChangefreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    if (!validChangefreqs.includes(changefreq)) {
      changefreq = 'weekly';
    }

    // Validate priority
    priority = parseFloat(priority);
    if (isNaN(priority) || priority < 0 || priority > 1) {
      priority = 0.5;
    }

    this.xmlUrls.push(
      '  <url>\n' +
      `    <loc>${validUrl}</loc>\n` +
      `    <lastmod>${this.formatDate(lastmod || new Date())}</lastmod>\n` +
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

    const sitemapUrl = this.validateUrl('/sitemap.xml');
    
    return `User-agent: *
Allow: /
${noindexRoutes}
Disallow: /profile
Disallow: /my-listings

# Sitemap
Sitemap: ${sitemapUrl}`;
  }

  generateSitemapXml() {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
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
        if (house && house._id) {
          this.addUrl({
            url: `/house/${house._id}`,
            changefreq: 'daily',
            priority: 0.9,
            lastmod: house.updatedAt
          });
        }
      });

      if (this.xmlUrls.length === 0) {
        throw new Error('No valid URLs generated for sitemap');
      }

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