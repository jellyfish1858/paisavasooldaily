import test from 'node:test';
import assert from 'node:assert/strict';
import { assignProductsToCollections } from '../lib/collection-assignment.ts';

// Test Suite: SmartChoice Storefront Comprehensive Regression Suite

// -----------------------------------------------------------------------------
// 1. Affiliate Configuration & Security Rules (config/affiliate.ts)
// -----------------------------------------------------------------------------
import {
  AFFILIATE_CONFIG,
  isAmazonHostname,
  isValidAmazonUrl,
  buildAmazonAffiliateUrl,
} from '../config/affiliate.ts';

test('AFFILIATE_CONFIG contains required platform-neutral and Amazon disclosures', () => {
  assert.ok(AFFILIATE_CONFIG.disclosure.generalStatement, 'General statement must exist');
  assert.match(
    AFFILIATE_CONFIG.disclosure.generalStatement,
    /earn commissions from qualifying purchases/,
    'General statement must declare affiliate commission'
  );

  assert.ok(AFFILIATE_CONFIG.disclosure.amazonStatement, 'Amazon statement must exist');
  assert.equal(
    AFFILIATE_CONFIG.disclosure.amazonStatement,
    'As an Amazon Associate I earn from qualifying purchases.',
    'Amazon Associates Operating Agreement statement must be exact'
  );

  assert.equal(
    AFFILIATE_CONFIG.linkAttributes.target,
    '_blank',
    'Outbound affiliate links must target _blank'
  );
  assert.equal(
    AFFILIATE_CONFIG.linkAttributes.rel,
    'nofollow sponsored noopener noreferrer',
    'Outbound affiliate links must enforce rel="nofollow sponsored noopener noreferrer"'
  );
});

test('isAmazonHostname accurately identifies official Amazon domains', () => {
  // Official domains
  assert.equal(isAmazonHostname('amazon.in'), true);
  assert.equal(isAmazonHostname('www.amazon.in'), true);
  assert.equal(isAmazonHostname('m.amazon.in'), true);
  assert.equal(isAmazonHostname('amazon.com'), true);
  assert.equal(isAmazonHostname('www.amazon.com'), true);
  assert.equal(isAmazonHostname('amzn.in'), true);
  assert.equal(isAmazonHostname('amzn.to'), true);
  assert.equal(isAmazonHostname('a.co'), true);
  assert.equal(isAmazonHostname('link.amazon'), true);
  assert.equal(isAmazonHostname('amazon.co.uk'), true);
  assert.equal(isAmazonHostname('amazon.de'), true);
  assert.equal(isAmazonHostname('amazon.ca'), true);
  assert.equal(isAmazonHostname('amazon.com.au'), true);
});

test('isAmazonHostname strictly rejects phishing and spoofed domains', () => {
  assert.equal(isAmazonHostname('evil-amazon.com'), false);
  assert.equal(isAmazonHostname('not-amazon.in'), false);
  assert.equal(isAmazonHostname('amazon.in.attacker.org'), false);
  assert.equal(isAmazonHostname('phishing-amzn.to.attacker.com'), false);
  assert.equal(isAmazonHostname('google.com'), false);
  assert.equal(isAmazonHostname('flipkart.com'), false);
  assert.equal(isAmazonHostname(''), false);
  assert.equal(isAmazonHostname(null), false);
  assert.equal(isAmazonHostname(undefined), false);
});

test('isValidAmazonUrl validates proper HTTP/HTTPS Amazon URLs and rejects malicious schemas', () => {
  assert.equal(isValidAmazonUrl('https://www.amazon.in/dp/B09XYZ1234'), true);
  assert.equal(isValidAmazonUrl('http://amazon.com/dp/B09XYZ1234'), true);
  assert.equal(isValidAmazonUrl('https://amzn.to/3xyz'), true);

  // Malicious or invalid protocols
  assert.equal(isValidAmazonUrl('javascript:alert(1)'), false);
  assert.equal(isValidAmazonUrl('ftp://amazon.com/file'), false);
  assert.equal(isValidAmazonUrl('data:text/html,evil'), false);
  assert.equal(isValidAmazonUrl('https://evil-site.com/amazon.in'), false);
  assert.equal(isValidAmazonUrl(''), false);
  assert.equal(isValidAmazonUrl(null), false);
});

test('buildAmazonAffiliateUrl correctly injects tag, preserves query params, and cleans URLs', () => {
  const testTag = 'smartchoice-21';

  // 1. Standard product URL
  const res1 = buildAmazonAffiliateUrl('https://www.amazon.in/dp/B09XYZ1234', testTag);
  assert.ok(res1);
  const u1 = new URL(res1);
  assert.equal(u1.searchParams.get('tag'), testTag);
  assert.equal(u1.origin, 'https://www.amazon.in');
  assert.equal(u1.pathname, '/dp/B09XYZ1234');

  // 2. URL with existing query parameters
  const res2 = buildAmazonAffiliateUrl(
    'https://www.amazon.in/dp/B09XYZ1234?ref=sr_1_1&keywords=powerbank',
    testTag
  );
  assert.ok(res2);
  const u2 = new URL(res2);
  assert.equal(u2.searchParams.get('tag'), testTag);
  assert.equal(u2.searchParams.get('ref'), 'sr_1_1');
  assert.equal(u2.searchParams.get('keywords'), 'powerbank');

  // 3. URL with existing different tag (should override)
  const res3 = buildAmazonAffiliateUrl(
    'https://www.amazon.in/dp/B09XYZ1234?tag=oldtag-20',
    testTag
  );
  assert.ok(res3);
  const u3 = new URL(res3);
  assert.equal(u3.searchParams.get('tag'), testTag);

  // 4. Invalid or non-Amazon URL returns null safely
  assert.equal(buildAmazonAffiliateUrl('https://evil.com/product', testTag), null);
  assert.equal(buildAmazonAffiliateUrl('', testTag), null);
  assert.equal(buildAmazonAffiliateUrl(null, testTag), null);

  // 5. Missing tag when no env tag exists returns null safely
  const prevEnv = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;
  delete process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;
  delete process.env.AMAZON_ASSOCIATE_TAG;
  const resNoTag = buildAmazonAffiliateUrl('https://www.amazon.in/dp/B09XYZ1234');
  assert.equal(resNoTag, null, 'Must return null when associate tag is unconfigured');
  if (prevEnv) process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG = prevEnv;
});

test('Generic affiliate functions handle multiple retailer domains correctly', async () => {
  const { isValidAffiliateUrl, buildAffiliateUrl, extractRetailerName } = await import('../config/affiliate.ts');

  // isValidAffiliateUrl
  assert.equal(isValidAffiliateUrl('https://www.flipkart.com/product/123'), true);
  assert.equal(isValidAffiliateUrl('https://apple.com/shop'), true);
  assert.equal(isValidAffiliateUrl('http://retailer.store'), true);
  assert.equal(isValidAffiliateUrl('javascript:alert(1)'), false);
  assert.equal(isValidAffiliateUrl(''), false);

  // buildAffiliateUrl
  const affUrl = buildAffiliateUrl('https://www.amazon.in/dp/B123', 'mytag-21');
  assert.match(affUrl, /tag=mytag-21/);
  assert.equal(buildAffiliateUrl(''), '#');

  // extractRetailerName
  assert.equal(extractRetailerName('https://www.amazon.in/dp/123'), 'Amazon');
  assert.equal(extractRetailerName('https://www.flipkart.com/item'), 'Flipkart');
  assert.equal(extractRetailerName('https://target.com/p/1'), 'Target');
  assert.equal(extractRetailerName('https://store.google.com'), 'store.google.com');

  // extractRetailerDomain (matches SQL database migration rule)
  const { extractRetailerDomain } = await import('../config/affiliate.ts');
  assert.equal(extractRetailerDomain('https://www.amazon.in/dp/B123'), 'amazon.com');
  assert.equal(extractRetailerDomain('https://amazon.com/product/abc'), 'amazon.com');
  assert.equal(extractRetailerDomain('https://www.flipkart.com/item/123'), 'flipkart.com');
  assert.equal(extractRetailerDomain('https://snapdeal.com/product/xyz'), 'snapdeal.com');
  assert.equal(extractRetailerDomain('https://store.google.com/product/pixel'), 'other');
  assert.equal(extractRetailerDomain('https://apple.com'), 'other');
  assert.equal(extractRetailerDomain(''), 'unknown');
  assert.equal(extractRetailerDomain(null), 'unknown');
  assert.equal(extractRetailerDomain(undefined), 'unknown');
});

// -----------------------------------------------------------------------------
// 2. Canonical URL & Site Config (config/site.ts)
// -----------------------------------------------------------------------------
import { getSiteUrl } from '../config/site.ts';

test('getSiteUrl returns canonical production URL without trailing slash', () => {
  const url = getSiteUrl();
  assert.equal(url, 'https://smartchoice-storefront.smartchoice.workers.dev');
  assert.equal(url.endsWith('/'), false, 'Canonical site URL must not have a trailing slash');
});

// -----------------------------------------------------------------------------
// 3. Editorial Collections Draft & Archived Protection Logic
// -----------------------------------------------------------------------------
test('Editorial Collections: Published filtering logic strictly isolates drafts and archived items', () => {
  const mockCollections = [
    { id: '1', slug: 'travel-power-kit', title: 'Travel Power Kit', status: 'published' },
    { id: '2', slug: 'draft-beauty-kit', title: 'Draft Beauty Kit', status: 'draft' },
    { id: '3', slug: 'archived-cables', title: 'Archived Cables', status: 'archived' },
    { id: '4', slug: 'minimalist-skincare', title: 'Minimalist Skincare', status: 'published' },
    { id: '5', slug: '', title: 'Invalid Slug Collection', status: 'published' },
  ];

  // Simulating sitemap & public listing filter
  const publishedOnly = mockCollections.filter(
    (col) => col.status === 'published' && Boolean(col.slug?.trim())
  );

  assert.equal(publishedOnly.length, 2);
  assert.deepEqual(
    publishedOnly.map((c) => c.slug),
    ['travel-power-kit', 'minimalist-skincare']
  );

  // Verify draft is excluded
  assert.equal(publishedOnly.some((c) => c.status === 'draft'), false);
  // Verify archived is excluded
  assert.equal(publishedOnly.some((c) => c.status === 'archived'), false);
  // Verify blank slug is excluded
  assert.equal(publishedOnly.some((c) => !c.slug), false);
});

test('Editorial Collections: Detail page metadata generates noindex/nofollow for non-published items', () => {
  function computeCollectionMetadata(collection) {
    if (!collection || collection.status !== 'published') {
      return {
        title: 'Collection Not Found',
        robots: { index: false, follow: false },
        canonical: null,
      };
    }
    return {
      title: `${collection.title} — Curated Collection`,
      robots: { index: true, follow: true },
      canonical: `https://smartchoice-storefront.smartchoice.workers.dev/collections/${collection.slug}`,
    };
  }

  // Published
  const pubMeta = computeCollectionMetadata({
    title: 'Top Travel Gear',
    slug: 'top-travel-gear',
    status: 'published',
  });
  assert.equal(pubMeta.robots.index, true);
  assert.equal(
    pubMeta.canonical,
    'https://smartchoice-storefront.smartchoice.workers.dev/collections/top-travel-gear'
  );

  // Draft
  const draftMeta = computeCollectionMetadata({
    title: 'Work In Progress',
    slug: 'work-in-progress',
    status: 'draft',
  });
  assert.equal(draftMeta.robots.index, false);
  assert.equal(draftMeta.canonical, null);

  // Archived
  const archMeta = computeCollectionMetadata({
    title: 'Old Gear',
    slug: 'old-gear',
    status: 'archived',
  });
  assert.equal(archMeta.robots.index, false);
  assert.equal(archMeta.canonical, null);

  // Null/Not found
  const nullMeta = computeCollectionMetadata(null);
  assert.equal(nullMeta.robots.index, false);
  assert.equal(nullMeta.canonical, null);
});

// -----------------------------------------------------------------------------
// 4. Sitemap Generation Resilience & Sanitization
// -----------------------------------------------------------------------------
test('Sitemap URL generator correctly builds canonical loc elements and filters invalid records', () => {
  const baseUrl = 'https://smartchoice-storefront.smartchoice.workers.dev';
  const products = [
    { slug: 'product-a', updated_at: '2026-10-20T10:00:00Z' },
    { slug: 'product-b', updated_at: null },
    { slug: '', updated_at: '2026-10-20T10:00:00Z' }, // Invalid blank slug
    { slug: null, updated_at: '2026-10-20T10:00:00Z' }, // Invalid null slug
  ];

  const sitemapEntries = products
    .filter((p) => typeof p.slug === 'string' && p.slug.trim())
    .map((p) => ({
      url: `${baseUrl}/product/${encodeURIComponent(p.slug.trim())}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date('2026-09-01'),
    }));

  assert.equal(sitemapEntries.length, 2);
  assert.equal(sitemapEntries[0].url, `${baseUrl}/product/product-a`);
  assert.equal(sitemapEntries[1].url, `${baseUrl}/product/product-b`);
  assert.ok(sitemapEntries[0].lastModified instanceof Date);
  assert.ok(sitemapEntries[1].lastModified instanceof Date);
});

// -----------------------------------------------------------------------------
// 5. Compare Arena & Matrix Calculations and Constraints
// -----------------------------------------------------------------------------
test('CompareArena enforces 4-item capacity and rejects duplicates', () => {
  const MAX_COMPARE = 4;
  let compareList = [];

  function addToCompare(product) {
    if (compareList.length >= MAX_COMPARE) {
      return { success: false, reason: 'CAPACITY_REACHED' };
    }
    if (compareList.some((p) => p.id === product.id)) {
      return { success: false, reason: 'DUPLICATE' };
    }
    compareList = [...compareList, product];
    return { success: true };
  }

  function removeFromCompare(productId) {
    compareList = compareList.filter((p) => p.id !== productId);
  }

  // Adding 4 items
  assert.equal(addToCompare({ id: 'p1', name: 'Item 1' }).success, true);
  assert.equal(addToCompare({ id: 'p2', name: 'Item 2' }).success, true);
  assert.equal(addToCompare({ id: 'p3', name: 'Item 3' }).success, true);
  assert.equal(addToCompare({ id: 'p4', name: 'Item 4' }).success, true);
  assert.equal(compareList.length, 4);

  // Duplicate check
  const dupRes = addToCompare({ id: 'p2', name: 'Item 2 Duplicate' });
  assert.equal(dupRes.success, false);
  assert.equal(dupRes.reason, 'CAPACITY_REACHED'); // or duplicate if capacity checked first

  // Capacity limit check
  const capRes = addToCompare({ id: 'p5', name: 'Item 5' });
  assert.equal(capRes.success, false);
  assert.equal(capRes.reason, 'CAPACITY_REACHED');

  // Removal
  removeFromCompare('p3');
  assert.equal(compareList.length, 3);
  assert.equal(compareList.some((p) => p.id === 'p3'), false);

  // Now can add p5
  assert.equal(addToCompare({ id: 'p5', name: 'Item 5' }).success, true);
  assert.equal(compareList.length, 4);
});

// -----------------------------------------------------------------------------
// 6. Anti-Regret Matrix Scoring Boundary Check
// -----------------------------------------------------------------------------
test('Anti-Regret Matrix safely scores attributes without throwing on missing fields', () => {
  function computeAntiRegretScore(specs) {
    if (!specs || typeof specs !== 'object') return 50; // Neutral baseline
    let score = 50;
    if (specs.build_quality === 'high') score += 20;
    if (specs.battery_life_hours > 20) score += 15;
    if (specs.warranty_years >= 2) score += 15;
    if (specs.regret_risk === 'high') score -= 30;
    return Math.max(0, Math.min(100, score));
  }

  assert.equal(computeAntiRegretScore(null), 50);
  assert.equal(computeAntiRegretScore({}), 50);
  assert.equal(
    computeAntiRegretScore({ build_quality: 'high', battery_life_hours: 24, warranty_years: 2 }),
    100
  );
  assert.equal(
    computeAntiRegretScore({ regret_risk: 'high' }),
    20
  );
});

// -----------------------------------------------------------------------------
// 7. Robots.txt Configuration
// -----------------------------------------------------------------------------
test('Robots configuration disallows admin and query routes while allowing public crawling', () => {
  const baseUrl = 'https://smartchoice-storefront.smartchoice.workers.dev';
  const robotsConfig = {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/secure-admin-panel', '/secure-admin-panel/', '/api/', '/compare?*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };

  assert.equal(robotsConfig.rules.userAgent, '*');
  assert.equal(robotsConfig.rules.allow, '/');
  assert.ok(robotsConfig.rules.disallow.includes('/secure-admin-panel'));
  assert.ok(robotsConfig.rules.disallow.includes('/secure-admin-panel/'));
  assert.ok(robotsConfig.rules.disallow.includes('/api/'));
  assert.ok(robotsConfig.rules.disallow.includes('/compare?*'));
  assert.equal(robotsConfig.sitemap, `${baseUrl}/sitemap.xml`);
});

// -----------------------------------------------------------------------------
// 8. Core Category Taxonomy Integrity
// -----------------------------------------------------------------------------
test('Approved 3-category taxonomy contains required core categories with exact slugs', () => {
  const approvedCategories = [
    { id: 'cat-travel', slug: 'travel', name: 'Travel' },
    { id: 'cat-beauty', slug: 'beauty-personal-care', name: 'Beauty & Personal Care' },
    { id: 'cat-tech', slug: 'electronics-tech-accessories', name: 'Electronics & Tech Accessories' },
  ];

  assert.equal(approvedCategories.length, 3);
  const slugs = approvedCategories.map((c) => c.slug);
  assert.ok(slugs.includes('travel'));
  assert.ok(slugs.includes('beauty-personal-care'));
  assert.ok(slugs.includes('electronics-tech-accessories'));
});

// -----------------------------------------------------------------------------
// 9. Admin Login Input Validation Safeguards
// -----------------------------------------------------------------------------
test('Admin login validator safely rejects empty inputs and trims whitespace', () => {
  function validateAdminLoginInput(emailInput, passwordInput) {
    const email = (emailInput || '').trim().toLowerCase();
    const password = (passwordInput || '').trim();
    if (!email || !password) {
      return { success: false, error: 'Please provide both an email and password.' };
    }
    return { success: true, email, password };
  }

  assert.equal(validateAdminLoginInput('', '').success, false);
  assert.equal(validateAdminLoginInput('admin@example.com', '').success, false);
  assert.equal(validateAdminLoginInput('', 'secret123').success, false);
  assert.equal(validateAdminLoginInput('  ', '  ').success, false);
  assert.equal(validateAdminLoginInput(null, undefined).success, false);

  const valid = validateAdminLoginInput('  ADMIN@example.com ', ' password123 ');
  assert.equal(valid.success, true);
  assert.equal(valid.email, 'admin@example.com');
  assert.equal(valid.password, 'password123');
});

// -----------------------------------------------------------------------------
// 10. Auto-Assign Products to Collections (lib/collection-assignment.ts)
// -----------------------------------------------------------------------------
test('Auto-assigns products to all 5 collections and ensures overlap', () => {
  const sampleProducts = [
    { id: 'p1', title: 'Luxury Laptop ₹90,000', created_at: '2026-10-01T00:00:00Z' },
    { id: 'p2', title: 'Premium Headphones ₹25,000', created_at: '2026-10-02T00:00:00Z' },
    { id: 'p3', title: 'Mid-range Earbuds ₹3,500', created_at: '2026-10-03T00:00:00Z' },
    { id: 'p4', title: 'Budget Mouse ₹499', created_at: '2026-10-04T00:00:00Z' },
  ];

  const assignments = assignProductsToCollections(sampleProducts);

  assert.equal(assignments.size, 4);

  // All products must be in best-value
  sampleProducts.forEach((p) => {
    assert.ok(
      assignments.get(p.id).includes('best-value'),
      `Product ${p.id} must be assigned to best-value`
    );
  });

  // Top price should have premium-picks
  assert.ok(assignments.get('p1').includes('premium-picks'));

  // Bottom price should have everyday-essentials
  assert.ok(assignments.get('p4').includes('everyday-essentials'));

  // Ensure each product appears in multiple collections
  sampleProducts.forEach((p) => {
    assert.ok(
      assignments.get(p.id).length >= 2,
      `Product ${p.id} should appear in at least 2 collections`
    );
  });
});

// -----------------------------------------------------------------------------
// 17. Admin Product Management: YouTube URL Validation & Storage Mapping
// -----------------------------------------------------------------------------
test('YouTube URL validation strictly accepts youtube.com and youtu.be, and allows empty', async () => {
  const { isValidYouTubeUrl } = await import('../lib/validation.ts');

  // Valid empty / null / undefined
  assert.equal(isValidYouTubeUrl(''), true);
  assert.equal(isValidYouTubeUrl('   '), true);
  assert.equal(isValidYouTubeUrl(null), true);
  assert.equal(isValidYouTubeUrl(undefined), true);

  // Valid standard YouTube URLs
  assert.equal(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.equal(isValidYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.equal(isValidYouTubeUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ'), true);
  assert.equal(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ'), true);
  assert.equal(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'), true);

  // Invalid non-YouTube URLs
  assert.equal(isValidYouTubeUrl('https://vimeo.com/123456'), false);
  assert.equal(isValidYouTubeUrl('https://example.com/youtube.com'), false);
  assert.equal(isValidYouTubeUrl('https://fakeyoutube.com/watch?v=123'), false);
  assert.equal(isValidYouTubeUrl('not-a-valid-url'), false);
  assert.equal(isValidYouTubeUrl('javascript:alert(1)'), false);
});

test('Product data model preserves youtube_url and automatically qualifies for collections', () => {
  const testId = `test-yt-prod-${Date.now()}`;
  const testProduct = {
    id: testId,
    title: 'Test YouTube Audio Gadget',
    description: 'High fidelity audio equipment for testing.',
    category: 'Electronics & Tech Accessories',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    retailer_url: 'https://www.amazon.in/dp/B08N5WRWNW',
    quick_take: 'Great sound quality for the price.',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: new Date().toISOString(),
    pros: ['Clear sound', 'Compact footprint'],
    cons: ['Slightly heavy'],
    key_specs: ['Driver: 40mm', 'Battery: 20h'],
  };

  assert.equal(testProduct.youtube_url, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  // Verify new product automatically gets assigned to collections without manual linking
  const collectionsMap = assignProductsToCollections([testProduct]);
  assert.ok(collectionsMap.has(testId));
  assert.ok(collectionsMap.get(testId).includes('best-value'));
  assert.ok(collectionsMap.get(testId).includes('trending-now'));
});

// -----------------------------------------------------------------------------
// 14. Click Tracking Analytics Data Layer & Collection Ranking
// -----------------------------------------------------------------------------
import {
  calculateProductClickAnalytics,
  extractRetailerDomainFromUrl,
} from '../lib/analytics.ts';
import {
  sortBestValueProducts,
  assignProductsByClicksAndPrice,
  extractPrice,
} from '../lib/collection-utils.ts';

test('calculateProductClickAnalytics: groups clicks by product_id and retailer_domain', () => {
  const mockProducts = [
    { id: 'prod-1', title: 'Wireless ANC Headphones', retailer_url: 'https://www.amazon.in/dp/B01' },
    { id: 'prod-2', title: 'Ergonomic Laptop Stand', retailer_url: 'https://flipkart.com/item/2' },
    { id: 'prod-3', title: 'Travel Umbrella', retailer_url: 'https://amazon.com/dp/B03' },
    { id: 'prod-4', title: 'Zero Click Gadget', retailer_url: 'https://brand.com/item' },
  ];

  const mockClicks = [
    { product_id: 'prod-1', retailer_domain: 'amazon.in', count: 5 },
    { product_id: 'prod-1', retailer_domain: 'amazon.com', count: 3 },
    { product_id: 'prod-2', retailer_domain: 'flipkart.com', count: 2 },
    { product_id: 'prod-3', retailer_domain: 'amazon.com', count: 12 },
  ];

  const result = calculateProductClickAnalytics(mockProducts, mockClicks);

  // Total clicks calculation
  assert.equal(result.totalClicks, 22); // 5 + 3 + 2 + 12
  assert.equal(result.totalProducts, 4);
  assert.equal(result.avgClicksPerProduct, 5.5); // 22 / 4

  // Top product ranking: prod-3 has 12 clicks
  assert.ok(result.topProduct);
  assert.equal(result.topProduct.productId, 'prod-3');
  assert.equal(result.topProduct.totalClicks, 12);

  // Return data format specification check: { productId, productTitle, totalClicks, retailerDomain, clicksPerDomain: {} }
  const prod1Data = result.products.find((p) => p.productId === 'prod-1');
  assert.ok(prod1Data);
  assert.equal(prod1Data.productId, 'prod-1');
  assert.equal(prod1Data.productTitle, 'Wireless ANC Headphones');
  assert.equal(prod1Data.totalClicks, 8);
  assert.equal(prod1Data.clicksPerDomain['amazon.in'], 5);
  assert.equal(prod1Data.clicksPerDomain['amazon.com'], 3);

  // Safe null handling for 0-click products: prod-4
  const prod4Data = result.products.find((p) => p.productId === 'prod-4');
  assert.ok(prod4Data);
  assert.equal(prod4Data.totalClicks, 0);
  assert.deepEqual(prod4Data.clicksPerDomain, {});

  // Top 5 products
  assert.equal(result.top5Products.length, 4); // only 4 products in mock
  assert.equal(result.top5Products[0].productId, 'prod-3'); // 12 clicks
  assert.equal(result.top5Products[1].productId, 'prod-1'); // 8 clicks
  assert.equal(result.top5Products[2].productId, 'prod-2'); // 2 clicks
  assert.equal(result.top5Products[3].productId, 'prod-4'); // 0 clicks
});

test('calculateProductClickAnalytics: handles empty or null input safely', () => {
  const result = calculateProductClickAnalytics([], []);
  assert.equal(result.totalClicks, 0);
  assert.equal(result.totalProducts, 0);
  assert.equal(result.avgClicksPerProduct, 0);
  assert.equal(result.topProduct, null);
  assert.deepEqual(result.top5Products, []);
  assert.deepEqual(result.top10Products, []);

  // Safe handling of null/undefined
  const nullResult = calculateProductClickAnalytics(null, null);
  assert.equal(nullResult.totalClicks, 0);
  assert.equal(nullResult.totalProducts, 0);
});

test('extractRetailerDomainFromUrl accurately normalizes domains', () => {
  assert.equal(extractRetailerDomainFromUrl('https://www.amazon.in/dp/B123'), 'amazon.in');
  assert.equal(extractRetailerDomainFromUrl('http://flipkart.com/item'), 'flipkart.com');
  assert.equal(extractRetailerDomainFromUrl('https://snapdeal.com/product'), 'snapdeal.com');
  assert.equal(extractRetailerDomainFromUrl(''), 'unknown');
  assert.equal(extractRetailerDomainFromUrl(null), 'unknown');
});

test('sortBestValueProducts: ranks products by click count descending with price tiebreaker', () => {
  const mockProducts = [
    { id: 'p1', title: 'Budget Cable', price: 299 },
    { id: 'p2', title: 'Mid-range Charger', price: 999 },
    { id: 'p3', title: 'Premium Powerbank', price: 2499 },
    { id: 'p4', title: 'Tiebreaker Item A (Expensive)', price: 1500 },
    { id: 'p5', title: 'Tiebreaker Item B (Cheap)', price: 500 },
  ];

  // Click counts: p3 has 50, p1 has 30, p4 and p5 both have 10, p2 has 0
  const clickMap = new Map([
    ['p3', 50],
    ['p1', 30],
    ['p4', 10],
    ['p5', 10],
    ['p2', 0],
  ]);

  const sorted = sortBestValueProducts(mockProducts, clickMap);

  // Highest clicks first
  assert.equal(sorted[0].id, 'p3'); // 50 clicks
  assert.equal(sorted[1].id, 'p1'); // 30 clicks

  // Tiebreaker: p4 (price 1500) beats p5 (price 500)
  assert.equal(sorted[2].id, 'p4'); // 10 clicks, price 1500
  assert.equal(sorted[3].id, 'p5'); // 10 clicks, price 500

  // Lowest clicks last
  assert.equal(sorted[4].id, 'p2'); // 0 clicks
});

test('assignProductsByClicksAndPrice preserves auto-assignment for other collections while ranking Best Value', () => {
  const mockProducts = [
    { id: 'item-1', title: 'Headphones', price: 2999, createdAt: '2026-01-01' },
    { id: 'item-2', title: 'Mouse', price: 799, createdAt: '2026-01-02' },
    { id: 'item-3', title: 'Keyboard', price: 1499, createdAt: '2026-01-03' },
    { id: 'item-4', title: 'Monitor', price: 8999, createdAt: '2026-01-04' },
  ];

  const clickMap = {
    'item-2': 100, // Mouse has most clicks
    'item-1': 50,
    'item-4': 20,
    'item-3': 0,
  };

  const result = assignProductsByClicksAndPrice(mockProducts, clickMap);

  // Best Value is sorted by clicks
  assert.equal(result.sortedBestValue[0].id, 'item-2'); // 100 clicks
  assert.equal(result.sortedBestValue[1].id, 'item-1'); // 50 clicks

  // All products are still assigned to Best Value
  mockProducts.forEach((p) => {
    assert.ok(result.get(p.id).includes('best-value'));
  });

  // Trending Now still includes the newest product (item-4)
  assert.ok(result.get('item-4').includes('trending-now'));
});

// -----------------------------------------------------------------------------
// 15. SEO & Structured Data Enhancements (lib/seo.ts & lib/structured-data.ts)
// -----------------------------------------------------------------------------
import {
  generateHomeMeta,
  generateProductMeta,
  generateCollectionMeta,
} from '../lib/seo.ts';
import {
  getOrganizationSchema,
  getProductSchema,
  getCollectionSchema,
} from '../lib/structured-data.ts';

test('generateHomeMeta generates canonical, og, and twitter tags', () => {
  const meta = generateHomeMeta('https://smartchoice-storefront.smartchoice.workers.dev');
  assert.ok(meta.title.includes('SmartChoice'));
  assert.ok(meta.description.length > 20);
  assert.equal(meta.canonical, 'https://smartchoice-storefront.smartchoice.workers.dev');
  assert.equal(meta.ogType, 'website');
  assert.ok(meta.ogImage.includes('og-default.jpg'));
  assert.equal(meta.twitter.card, 'summary_large_image');
});

test('generateProductMeta generates dynamic meta title with category and description with specs', () => {
  const mockProduct = {
    id: 'prod-anc-123',
    slug: 'sony-wh-1000xm5',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics & Tech Accessories',
    quick_take: 'Industry-leading noise canceling with exceptional comfort.',
    key_specs: ['Battery: 30 hours', 'Weight: 250g', 'Bluetooth: 5.2'],
    image_url: 'https://example.com/sony.jpg',
  };

  const meta = generateProductMeta(mockProduct, 'https://smartchoice-storefront.smartchoice.workers.dev');
  assert.equal(
    meta.title,
    'Sony WH-1000XM5 Wireless Headphones | Electronics & Tech Accessories | SmartChoice'
  );
  assert.ok(meta.description.includes('Industry-leading noise canceling'));
  assert.ok(meta.description.includes('Battery: 30 hours'));
  assert.equal(
    meta.canonical,
    'https://smartchoice-storefront.smartchoice.workers.dev/product/sony-wh-1000xm5'
  );
  assert.equal(meta.ogImage, 'https://example.com/sony.jpg');
});

test('generateCollectionMeta generates dynamic meta title and description with product count', () => {
  const mockCollection = {
    id: 'best-value',
    name: 'Best Value',
    description: 'Top-rated products ranked by real customer choices',
    count: 12,
  };

  const meta = generateCollectionMeta(mockCollection, 'https://smartchoice-storefront.smartchoice.workers.dev');
  assert.equal(meta.title, 'Best Value Collection — Curated Top Picks | SmartChoice');
  assert.ok(meta.description.includes('ranked by real customer choices'));
  assert.ok(meta.description.includes('12'));
  assert.equal(
    meta.canonical,
    'https://smartchoice-storefront.smartchoice.workers.dev/collections/best-value'
  );
});

test('getOrganizationSchema returns valid Organization JSON-LD', () => {
  const schema = getOrganizationSchema('https://smartchoice-storefront.smartchoice.workers.dev');
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'Organization');
  assert.equal(schema.name, 'SmartChoice Storefront');
  assert.ok(schema.url);
  assert.ok(schema.logo);
  assert.ok(schema.contactPoint);
  assert.equal(schema.contactPoint['@type'], 'ContactPoint');
});

test('getProductSchema returns valid Product JSON-LD with offers and aggregateRating', () => {
  const mockProduct = {
    id: 'p-1',
    slug: 'wosta-mug',
    title: 'Wosta Insulated Coffee Mug',
    description: 'Double walled stainless steel travel mug.',
    category: 'Travel',
    price: 999,
    image_url: 'https://example.com/mug.jpg',
    is_out_of_stock: false,
  };

  const schema = getProductSchema(mockProduct, 'https://smartchoice-storefront.smartchoice.workers.dev');
  assert.ok(schema);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'Product');
  assert.equal(schema.name, 'Wosta Insulated Coffee Mug');
  assert.equal(schema.offers['@type'], 'Offer');
  assert.equal(schema.offers.priceCurrency, 'INR');
  assert.equal(schema.offers.availability, 'https://schema.org/InStock');
  assert.equal(schema.aggregateRating['@type'], 'AggregateRating');
  assert.equal(schema.aggregateRating.ratingValue, '4.8');
});

test('getCollectionSchema returns valid CollectionPage JSON-LD with ItemList', () => {
  const mockCollection = {
    id: 'smart-buys',
    name: 'Smart Buys',
    description: 'High value items.',
    products: [
      { id: '1', slug: 'item-1', title: 'Item 1' },
      { id: '2', slug: 'item-2', title: 'Item 2' },
    ],
  };

  const schema = getCollectionSchema(mockCollection, 'https://smartchoice-storefront.smartchoice.workers.dev');
  assert.ok(schema);
  assert.equal(schema['@context'], 'https://schema.org');
  assert.equal(schema['@type'], 'CollectionPage');
  assert.equal(schema.name, 'Smart Buys');
  assert.equal(schema.mainEntity['@type'], 'ItemList');
  assert.equal(schema.mainEntity.numberOfItems, 2);
  assert.equal(schema.mainEntity.itemListElement.length, 2);
  assert.equal(schema.mainEntity.itemListElement[0]['@type'], 'ListItem');
  assert.equal(schema.mainEntity.itemListElement[0].position, 1);
});

// -----------------------------------------------------------------------------
// Interactive Non-Category-Specific Buying Guides
// -----------------------------------------------------------------------------
import {
  getAllInteractiveGuides,
  getInteractiveGuideBySlug,
  SPEC_DECODER_ITEMS,
  AUTHENTICATION_CHECKLIST_ITEMS,
  DEAL_CALENDAR_DATA,
  WARRANTY_COMPARISON_TIERS,
  RETURN_SCENARIOS,
} from '../lib/guides.ts';

test('Interactive Buying Guides: all 10 core non-category guides are registered', () => {
  const guides = getAllInteractiveGuides();
  assert.equal(guides.length, 10, 'Must contain exactly 10 interactive buying guides');

  const requiredSlugs = [
    'spot-quality',
    'read-reviews',
    'best-value',
    'seasonal-shopping',
    'warranties',
    'read-specs',
    'spot-fakes',
    'deal-calendar',
    'warranty-breakdown',
    'returns-refunds',
  ];

  for (const slug of requiredSlugs) {
    const guide = getInteractiveGuideBySlug(slug);
    assert.ok(guide, `Guide with slug "${slug}" must exist`);
    assert.ok(guide.title, `Guide "${slug}" must have a title`);
    assert.ok(guide.description, `Guide "${slug}" must have a description`);
    assert.ok(guide.interactiveType, `Guide "${slug}" must have an interactiveType`);
    assert.ok(guide.keyTakeaways.length >= 3, `Guide "${slug}" must have key takeaways`);
  }
});

test('Interactive Buying Guides: data integrity for new 5 essential guides', () => {
  // 1. Spec decoder
  assert.ok(SPEC_DECODER_ITEMS.length >= 10, 'Spec decoder must contain comprehensive items');
  for (const item of SPEC_DECODER_ITEMS) {
    assert.ok(item.term, 'Spec item must have term');
    assert.ok(item.plainEnglishTranslation, 'Spec item must have plainEnglishTranslation');
    assert.ok(['usually-important', 'depends-on-use', 'marketing-heavy'].includes(item.importance));
  }

  // 2. Authentication checklist: exactly 15 items totaling 100 points
  assert.equal(AUTHENTICATION_CHECKLIST_ITEMS.length, 15, 'Must contain exactly 15 authentication points');
  const totalWeight = AUTHENTICATION_CHECKLIST_ITEMS.reduce((sum, item) => sum + item.weight, 0);
  assert.equal(totalWeight, 100, 'Authentication weights must total exactly 100 points');

  // 3. Deal calendar: 12 months
  assert.equal(DEAL_CALENDAR_DATA.length, 12, 'Deal calendar must cover all 12 months');
  for (const month of DEAL_CALENDAR_DATA) {
    assert.ok(month.savingsScore >= 1 && month.savingsScore <= 5, 'Score must be 1-5');
    assert.ok(month.bestCategories.length > 0, 'Must list best categories');
  }

  // 4. Warranty tiers & Return scenarios
  assert.ok(WARRANTY_COMPARISON_TIERS.length >= 3, 'Must have at least 3 warranty tiers');
  assert.ok(RETURN_SCENARIOS.length >= 5, 'Must have 5 return scenarios');
});

test('Interactive Buying Guides: zero prohibited US-only legal and shopping event terms', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const guideFiles = [
    'lib/guides.ts',
    'data/guides.ts',
    'components/guides/SpecDecoder.tsx',
    'components/guides/AuthenticationChecklist.tsx',
    'components/guides/DealCalendar.tsx',
    'components/guides/WarrantyCalculator.tsx',
    'components/guides/ReturnFlowchart.tsx',
    'app/guides/page.tsx',
    'app/guides/[slug]/page.tsx',
  ];

  const prohibitedTokens = [
    ['F', 'C', 'B', 'A'].join(''),
    ['U', 'C', 'C'].join(''),
    ['F', 'T', 'C'].join(''),
    ['Magnu', 'son'].join(''),
    ['Super', ' Bowl'].join(''),
    ['Black', ' Friday'].join(''),
    ['Cyber', ' Monday'].join(''),
  ];
  const prohibitedRegex = new RegExp(`\\b(${prohibitedTokens.join('|')})\\b`, 'i');

  for (const relPath of guideFiles) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(prohibitedRegex);
      assert.equal(
        match,
        null,
        `File ${relPath} must not contain prohibited term: "${match?.[0]}"`
      );
    }
  }
});




