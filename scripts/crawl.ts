/**
 * Link crawler and validator for Maritime Intelligence Platform
 * Discovers all links, validates routes and anchors, generates reports
 */

import { chromium, Page, Browser } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

interface LinkInfo {
  page: string;
  selector: string;
  text: string;
  href: string;
  target?: string;
  rel?: string;
  testId?: string;
  type: 'link' | 'button' | 'cta';
}

interface PageInfo {
  url: string;
  title: string;
  status: number;
  links: LinkInfo[];
  anchors: string[];
  errors: string[];
}

interface CrawlResult {
  sitemap: PageInfo[];
  brokenRoutes: LinkInfo[];
  mismatchedAnchors: LinkInfo[];
  wrongDestinations: LinkInfo[];
  externalIssues: LinkInfo[];
}

export class LinkCrawler {
  private browser!: Browser;
  private baseUrl: string;
  private visited = new Set<string>();
  private results: PageInfo[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    await this.browser?.close();
  }

  private async crawlPage(url: string, page: Page): Promise<PageInfo> {
    console.log(`Crawling: ${url}`);
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      const status = response?.status() ?? 0;
      const title = await page.title();
      
      // Get all anchors/IDs on the page
      const anchors = await page.$$eval('[id]', elements => 
        elements.map(el => el.id).filter(Boolean)
      );
      
      // Get all navigation links
      const links = await this.extractLinks(page, url);
      
      // Check for JavaScript errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(`Console error: ${msg.text()}`);
        }
      });
      
      return {
        url,
        title,
        status,
        links,
        anchors,
        errors
      };
      
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      return {
        url,
        title: '',
        status: 500,
        links: [],
        anchors: [],
        errors: [`Crawl error: ${error}`]
      };
    }
  }

  private async extractLinks(page: Page, currentUrl: string): Promise<LinkInfo[]> {
    const links: LinkInfo[] = [];
    
    // Extract regular links
    const linkElements = await page.$$eval('a[href]', (elements, currentUrl) => 
      elements.map(el => ({
        selector: el.tagName + (el.className ? `.${el.className.split(' ').join('.')}` : ''),
        text: el.textContent?.trim() ?? '',
        href: el.href,
        target: el.target || undefined,
        rel: el.rel || undefined,
        testId: el.getAttribute('data-testid') || undefined,
        type: 'link' as const
      })), currentUrl
    );
    
    // Extract buttons with click handlers that navigate
    const buttonElements = await page.$$eval('button', (elements) => 
      elements.filter(el => 
        el.textContent?.toLowerCase().includes('navigate') ||
        el.getAttribute('data-testid')?.includes('cta') ||
        el.getAttribute('data-testid')?.includes('nav')
      ).map(el => ({
        selector: `button[data-testid="${el.getAttribute('data-testid')}"]`,
        text: el.textContent?.trim() ?? '',
        href: '', // Will be determined by click handler
        testId: el.getAttribute('data-testid') || undefined,
        type: 'button' as const
      }))
    );
    
    links.push(...linkElements, ...buttonElements);
    
    return links.map(link => ({
      ...link,
      page: currentUrl
    }));
  }

  async crawl(): Promise<CrawlResult> {
    await this.init();
    
    const page = await this.browser.newPage();
    const toVisit = [this.baseUrl];
    
    // Crawl all pages
    while (toVisit.length > 0) {
      const url = toVisit.shift()!;
      
      if (this.visited.has(url) || !url.startsWith(this.baseUrl)) {
        continue;
      }
      
      this.visited.add(url);
      const pageInfo = await this.crawlPage(url, page);
      this.results.push(pageInfo);
      
      // Add internal links to crawl queue
      for (const link of pageInfo.links) {
        if (link.href.startsWith(this.baseUrl) && !this.visited.has(link.href)) {
          toVisit.push(link.href);
        }
      }
    }
    
    await page.close();
    await this.close();
    
    return this.analyzeResults();
  }

  private analyzeResults(): CrawlResult {
    const brokenRoutes: LinkInfo[] = [];
    const mismatchedAnchors: LinkInfo[] = [];
    const wrongDestinations: LinkInfo[] = [];
    const externalIssues: LinkInfo[] = [];
    
    // Import route configuration (would need to be adapted for runtime)
    const ROUTE_CANON = {
      "/": { anchors: ["hero", "marine-data", "intelligence-section", "interactive-map-section", "dashboard", "features"] },
      "/intelligence": { anchors: ["overview", "alerts", "map", "cards", "summary", "provenance"] },
      "/intelligence/integrated": { anchors: ["decision-hub"] },
      "/eutrophication": { anchors: ["reports", "data-explorer"] },
      "/shadow-fleet": { anchors: ["tracker", "analysis", "alerts"] },
      "/port-agent": { anchors: ["dashboard", "services", "analytics"] },
      "/auth": { anchors: [] }
    };
    
    for (const pageInfo of this.results) {
      // Check for broken routes (4xx/5xx responses)
      if (pageInfo.status >= 400) {
        brokenRoutes.push({
          page: pageInfo.url,
          selector: 'page',
          text: pageInfo.title,
          href: pageInfo.url,
          type: 'link'
        });
      }
      
      for (const link of pageInfo.links) {
        try {
          const url = new URL(link.href);
          
          // Internal link checks
          if (url.origin === new URL(this.baseUrl).origin) {
            const path = url.pathname;
            const hash = url.hash.replace('#', '');
            
            // Route validation
            if (!(path in ROUTE_CANON)) {
              brokenRoutes.push(link);
            }
            
            // Anchor validation
            if (hash) {
              const targetPage = this.results.find(p => p.url.includes(path));
              if (targetPage && !targetPage.anchors.includes(hash)) {
                mismatchedAnchors.push(link);
              }
            }
          } else {
            // External link checks
            if (link.target !== '_blank' || !link.rel?.includes('noopener')) {
              externalIssues.push(link);
            }
          }
        } catch (error) {
          // Invalid URL
          brokenRoutes.push(link);
        }
      }
    }
    
    return {
      sitemap: this.results,
      brokenRoutes,
      mismatchedAnchors,
      wrongDestinations,
      externalIssues
    };
  }

  async generateReports(results: CrawlResult): Promise<void> {
    const artifactsDir = path.join(process.cwd(), 'artifacts');
    await fs.mkdir(artifactsDir, { recursive: true });
    
    // Generate sitemap.json
    await fs.writeFile(
      path.join(artifactsDir, 'sitemap.json'),
      JSON.stringify(results.sitemap, null, 2)
    );
    
    // Generate CSV reports
    await this.writeCsv(path.join(artifactsDir, 'broken-routes.csv'), results.brokenRoutes);
    await this.writeCsv(path.join(artifactsDir, 'mismatched-anchors.csv'), results.mismatchedAnchors);
    await this.writeCsv(path.join(artifactsDir, 'wrong-destinations.csv'), results.wrongDestinations);
    await this.writeCsv(path.join(artifactsDir, 'external-issues.csv'), results.externalIssues);
    
    // Generate link inventory
    const allLinks = results.sitemap.flatMap(page => page.links);
    await this.writeCsv(path.join(artifactsDir, 'link-inventory.csv'), allLinks);
    
    console.log('Reports generated in artifacts/ directory');
  }

  private async writeCsv(filepath: string, data: any[]): Promise<void> {
    if (data.length === 0) {
      await fs.writeFile(filepath, 'No issues found\n');
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    await fs.writeFile(filepath, csv);
  }
}

// CLI usage
async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  const crawler = new LinkCrawler(baseUrl);
  
  console.log(`Starting crawl of ${baseUrl}...`);
  const results = await crawler.crawl();
  await crawler.generateReports(results);
  
  console.log('Crawl complete. Summary:');
  console.log(`- Pages crawled: ${results.sitemap.length}`);
  console.log(`- Broken routes: ${results.brokenRoutes.length}`);
  console.log(`- Mismatched anchors: ${results.mismatchedAnchors.length}`);
  console.log(`- External issues: ${results.externalIssues.length}`);
  
  // Exit with error if issues found
  const totalIssues = results.brokenRoutes.length + results.mismatchedAnchors.length + results.externalIssues.length;
  process.exit(totalIssues > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(console.error);
}