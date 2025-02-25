const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { format } = require('date-fns');

// Configuration without fallback IDs
const config = {
  siteUrl: process.env.SITE_URL || 'https://rent254.onrender.com',
  apiUrl: process.env.API_URL || 'https://rentkenya.onrender.com/api/houses',
  outputDir: process.env.OUTPUT_DIR || path.join(process.cwd(), 'public'),
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
  ],
  apiTimeout: 20000,  // 20 seconds
  apiRetries: 3,
  debug: true
};

class SitemapGenerator {
  constructor(config) {
    this.config = config;
    this.xmlUrls = [];
    this.debug = config.debug;
  }

  log(message) {
    if (this.debug) console.log(`[INFO] ${message}`);
  }

  warn(message) {
    console.warn(`[WARN] ${message}`);
  }

  error(message, err) {
    console.error(`[ERROR] ${message}`, err ? (err.stack || err) : '');
  }

  formatDate(date) {
    try {
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
    if (!unsafe || typeof unsafe !== 'string') return '';
    
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
      this.log(`Output directory exists: ${this.config.outputDir}`);
    } catch (error) {
      this.log(`Creating output directory: ${this.config.outputDir}`);
      await fs.mkdir(this.config.outputDir, { recursive: true });
    }
  }

  async fetchHouseListings() {
    this.log(`Fetching houses from API: ${this.config.apiUrl}`);
    try {
      const response = await axios.get(this.config.apiUrl, {
        timeout: this.config.apiTimeout,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SitemapGenerator/1.0'
        }
      });

      // Print raw response for debugging
      this.log('Raw API Response: ' + JSON.stringify(response.data).substring(0, 500) + '...');

      let houses = [];

      // Try multiple approaches to extract house data
      if (Array.isArray(response.data)) {
        this.log('Response is a direct array');
        houses = response.data;
      } 
      else if (response.data.houses && Array.isArray(response.data.houses)) {
        this.log('Found houses in response.data.houses');
        houses = response.data.houses;
      }
      else if (response.data.data && Array.isArray(response.data.data)) {
        this.log('Found houses in response.data.data');
        houses = response.data.data;
      }
      else if (typeof response.data === 'object') {
        // Look through all properties for arrays
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            this.log(`Found array in response.data.${key}`);
            houses = response.data[key];
            break;
          }
        }
      }

      // Strict validation - throw error if no houses found
      if (!houses || houses.length === 0) {
        throw new Error('No houses found in API response');
      }

      this.log(`Found ${houses.length} houses in API response`);
      
      // Strict house validation
      const validHouses = houses.filter(house => {
        // Ensure house has a valid ID and required fields
        return house && 
               (house._id || house.id || house.houseId || house.house_id) &&
               (house.updatedAt || house.createdAt || house.updated_at || house.created_at);
      });

      // Throw error if no valid houses
      if (validHouses.length === 0) {
        throw new Error('No houses with valid IDs and dates found');
      }

      return validHouses.map(house => {
        // Normalize ID and date fields
        const id = house._id || house.id || house.houseId || house.house_id;
        return {
          _id: id,
          updatedAt: house.updatedAt || house.updated_at || house.dateModified || new Date(),
          createdAt: house.createdAt || house.created_at || house.dateCreated || new Date()
        };
      });
    } catch (error) {
      this.error('Error fetching house listings:', error);
      throw error; // Rethrow to be handled by caller
    }
  }

  validateUrl(url) {
    try {
      if (!url) return null;
      
      url = url.trim();
      
      if (!url.startsWith('http') && !url.startsWith('/')) {
        url = '/' + url;
      }

      let fullUrl;
      if (url.startsWith('http')) {
        fullUrl = url;
      } else {
        const baseUrl = this.config.siteUrl.endsWith('/') && url.startsWith('/') 
          ? this.config.siteUrl.slice(0, -1) 
          : this.config.siteUrl;
          
        fullUrl = baseUrl + url;
      }
      
      new URL(fullUrl);
      
      return this.escapeXml(fullUrl);
    } catch (error) {
      this.error(`Invalid URL skipped: ${url} - ${error.message}`);
      return null;
    }
  }

  addUrl({ url, changefreq, priority, lastmod }) {
    const validUrl = this.validateUrl(url);
    if (!validUrl) return;

    const validChangefreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    if (!validChangefreqs.includes(changefreq)) {
      changefreq = 'weekly';
    }

    priority = parseFloat(priority);
    if (isNaN(priority) || priority < 0 || priority > 1) {
      priority = 0.5;
    }

    const formattedDate = this.formatDate(lastmod || new Date());

    this.xmlUrls.push(
      '<url>\n' +
      `<loc>${validUrl}</loc>\n` +
      `<lastmod>${formattedDate}</lastmod>\n` +
      `<changefreq>${changefreq}</changefreq>\n` +
      `<priority>${priority.toFixed(1)}</priority>\n` +
      '</url>'
    );
    
    this.log(`Added URL to sitemap: ${validUrl}`);
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
    this.log('Starting sitemap generation...');
    try {
      await this.ensureOutputDir();

      // Add static routes (excluding noindex)
      this.log('Adding static routes...');
      this.config.staticRoutes
        .filter(route => !route.noindex)
        .forEach(route => this.addUrl(route));

      // Add dynamic house listings
      this.log('Fetching and adding house listings...');
      const houses = await this.fetchHouseListings();
      
      this.log(`Processing ${houses.length} houses for sitemap...`);
      
      let validCount = 0;
      houses.forEach(house => {
        if (house && house._id) {
          this.addUrl({
            url: `/house/${house._id}`,
            changefreq: 'daily',
            priority: 0.9,
            lastmod: house.updatedAt || house.createdAt || new Date()
          });
          validCount++;
        }
      });
      
      this.log(`Added ${validCount} house URLs to sitemap`);

      // Write sitemap.xml
      const sitemapPath = path.join(this.config.outputDir, 'sitemap.xml');
      const sitemapContent = this.generateSitemapXml();
      await fs.writeFile(sitemapPath, sitemapContent);
      this.log(`Sitemap content size: ${sitemapContent.length} bytes`);

      // Write robots.txt
      const robotsPath = path.join(this.config.outputDir, 'robots.txt');
      const robotsContent = this.generateRobotsTxt();
      await fs.writeFile(robotsPath, robotsContent);

      // Create a _redirects file for SPA routing
      const redirectsPath = path.join(this.config.outputDir, '_redirects');
      await fs.writeFile(redirectsPath, '/* /index.html 200');
      this.log('Generated _redirects file for SPA routing');

      // Print final sitemap for verification
      console.log('\nGenerated Sitemap Content:');
      console.log(sitemapContent);

      console.log('\n✅ Sitemap generation completed successfully!');
      console.log('✓ Generated sitemap.xml:', sitemapPath);
      console.log('✓ Generated robots.txt:', robotsPath);
      console.log('✓ Generated _redirects:', redirectsPath);
      console.log(`✓ Total URLs in sitemap: ${this.xmlUrls.length}`);
      
      return {
        success: true,
        urlCount: this.xmlUrls.length,
        sitemapPath,
        robotsPath,
        redirectsPath
      };
    } catch (error) {
      this.error('Error generating SEO files:', error);
      throw error;
    }
  }
}

// Execute the generation
(async () => {
  const generator = new SitemapGenerator(config);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('\nFailed to generate SEO files:', error);
    process.exit(1);
  }
})();