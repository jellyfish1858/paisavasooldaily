import https from 'node:https';

const BASE_URL = 'https://paisavasooldaily.paisavasooldaily.workers.dev';

async function fetchRoute(path) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SmartChoice-Audit-Agent/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });
    const status = res.status;
    const text = await res.text();
    
    // Extract metadata
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'NO_TITLE';
    
    const canonicalMatch = text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
                           text.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : 'NO_CANONICAL';

    const h1Match = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NO_H1';

    const hasAffiliateDisclosure = text.includes('As an affiliate, I earn commissions from qualifying purchases') ||
                                   text.includes('As an Amazon Associate I earn from qualifying purchases') ||
                                   text.includes('affiliate links') ||
                                   text.includes('commission');

    const hasJsonLd = text.includes('application/ld+json');

    return {
      path,
      url,
      status,
      title,
      canonical,
      h1: h1.slice(0, 80),
      hasAffiliateDisclosure,
      hasJsonLd,
      bytes: text.length
    };
  } catch (err) {
    return {
      path,
      url,
      status: 'ERROR: ' + err.message
    };
  }
}

async function run() {
  console.log('Auditing live site endpoints on ' + BASE_URL);

  // Fetch sitemap first to discover live products
  const sitemapRes = await fetchRoute('/sitemap.xml');
  console.log('Sitemap status:', sitemapRes.status, 'Bytes:', sitemapRes.bytes);
  
  const productMatches = [...(sitemapRes.bytes ? (await (await fetch(BASE_URL + '/sitemap.xml')).text()).matchAll(/<loc>(https:\/\/[^<]+\/product\/[^<]+)<\/loc>/g) : [])];
  const liveProductUrls = productMatches.map(m => m[1]);
  console.log(`Discovered ${liveProductUrls.length} live product URLs in sitemap`);

  const collectionMatches = [...(sitemapRes.bytes ? (await (await fetch(BASE_URL + '/sitemap.xml')).text()).matchAll(/<loc>(https:\/\/[^<]+\/collections\/[^<]+)<\/loc>/g) : [])];
  const liveCollectionUrls = collectionMatches.map(m => m[1]);
  console.log(`Discovered ${liveCollectionUrls.length} live collection URLs in sitemap`);

  const coreRoutes = [
    '/',
    '/category',
    '/category/travel',
    '/category/beauty-personal-care',
    '/category/electronics-tech-accessories',
    '/compare',
    '/guides',
    '/guides/portable-power-guide',
    '/guides/travel-gear-guide',
    '/collections',
    '/privacy-policy',
    '/robots.txt',
    '/sitemap.xml',
    '/non-existent-probe-404'
  ];

  // Pick up to 5 live products
  const sampleProducts = liveProductUrls.slice(0, 5).map(u => u.replace(BASE_URL, ''));
  // Pick live collections if any
  const sampleCollections = liveCollectionUrls.slice(0, 3).map(u => u.replace(BASE_URL, ''));

  const allRoutesToTest = [...coreRoutes, ...sampleProducts, ...sampleCollections];

  const results = [];
  for (const r of allRoutesToTest) {
    const res = await fetchRoute(r);
    results.push(res);
    console.log(`[${res.status}] ${r.padEnd(45)} | Title: ${res.title?.slice(0, 30)} | Canonical: ${res.canonical}`);
  }

  return results;
}

run();
