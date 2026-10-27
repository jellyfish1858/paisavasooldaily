export interface InteractiveGuideMeta {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  readingTime: string;
  category: string;
  interactiveType:
    | 'checklist'
    | 'quiz'
    | 'decision-tree'
    | 'calendar'
    | 'warranty-slider'
    | 'spec-decoder'
    | 'auth-checklist'
    | 'deal-calendar'
    | 'warranty-calc'
    | 'return-flowchart';
  iconName: string;
  badge: string;
  heroHighlight: string;
  keyTakeaways: string[];
  ctaCollectionSlug: string;
  ctaCollectionName: string;
}

// -----------------------------------------------------------------------------
// 1. Quality Checklist Data
// -----------------------------------------------------------------------------
export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'materials' | 'construction' | 'safety' | 'brand';
  weight: number;
}

export const QUALITY_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'mat-1',
    title: 'Disclosed Raw Material Compositions',
    description: 'Manufacturer specifies exact materials (e.g., 6063-T6 aluminum, polycarbonate, full-grain leather) rather than vague marketing terms like "premium alloy" or "genuine leather".',
    category: 'materials',
    weight: 10,
  },
  {
    id: 'mat-2',
    title: 'Substantial Density & Structural Heft',
    description: 'Product feels solid with balanced weight distribution; plastic shells do not creak, flex abnormally, or sound hollow when tapped.',
    category: 'materials',
    weight: 8,
  },
  {
    id: 'mat-3',
    title: 'Precision Surface Finishing & Seam Alignment',
    description: 'Uniform surface texture, anodization, or powder-coating with flush mating seams and no sharp plastic molding flash or uneven gaps.',
    category: 'materials',
    weight: 8,
  },
  {
    id: 'const-1',
    title: 'Standard Serviceable Fasteners',
    description: 'Enclosure uses standard accessible screws (Torx or Phillips) instead of permanent glue, heat-stakes, or tamper-proof plastic clips.',
    category: 'construction',
    weight: 10,
  },
  {
    id: 'const-2',
    title: 'Brand-Name Internal Components',
    description: 'Employs verified Tier-1 sub-components (e.g., YKK zippers, Omron microswitches, Nichia LEDs, Japanese capacitors) rather than unbranded clones.',
    category: 'construction',
    weight: 10,
  },
  {
    id: 'const-3',
    title: 'Reinforced Mechanical Stress Points',
    description: 'Double-stitching, bar-tacks, metal hinge pins, and flexible strain-relief collars on joints, straps, and cable exits.',
    category: 'construction',
    weight: 9,
  },
  {
    id: 'safe-1',
    title: 'Legitimate Safety & Regulatory Certifications',
    description: 'Displays verifiable regulatory marks (UL, ETL, CE, RoHS, FCC, BIS) complete with traceable manufacturer certification registration IDs.',
    category: 'safety',
    weight: 10,
  },
  {
    id: 'safe-2',
    title: 'Engineered Thermal Management',
    description: 'Integrated passive heat sinks, aluminum backing plates, or airflow channels to prevent thermal throttling and fire hazards during heavy use.',
    category: 'safety',
    weight: 9,
  },
  {
    id: 'safe-3',
    title: 'Standard Ingress Protection (IP) Ratings',
    description: 'Features certified IP ratings (e.g., IPX4 water splash, IP68 submersion) for devices used outdoors, in bathrooms, or during travel.',
    category: 'safety',
    weight: 8,
  },
  {
    id: 'brand-1',
    title: 'Transparent Technical Tolerances',
    description: 'Provides exact quantitative specs (wattage profiles, weight in grams, dimensions, battery cycle life) rather than exaggerated superlatives.',
    category: 'brand',
    weight: 6,
  },
  {
    id: 'brand-2',
    title: 'Available Replacement Parts & Consumables',
    description: 'The manufacturer sells or supplies spare ear cushions, replacement batteries, filters, or seals extending functional lifespan.',
    category: 'brand',
    weight: 6,
  },
  {
    id: 'brand-3',
    title: 'Realistic Warranty & Customer Service Presence',
    description: 'Warranty terms clearly stated with a responsive direct contact email, live chat, or regional repair support beyond the bare legal minimum.',
    category: 'brand',
    weight: 6,
  },
];

// -----------------------------------------------------------------------------
// 2. Review Evaluation Quiz Data
// -----------------------------------------------------------------------------
export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: number;
  scenario: string;
  question: string;
  options: QuizOption[];
  contextTip: string;
}

export const REVIEW_EVALUATION_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario: 'A newly launched gadget has 3,200 reviews with a 4.9-star rating. Upon checking the dates, 85% of reviews were published over a single 72-hour weekend, all featuring photos of unboxed packaging and phrases like "Fast delivery, looks nice!"',
    question: 'How should you evaluate this review profile?',
    options: [
      {
        text: 'Trust it — high rating and thousands of photos confirm customers love the item.',
        isCorrect: false,
        explanation: 'Photos of unopened boxes do not reflect actual performance, battery life, or long-term build quality.',
      },
      {
        text: 'Flag as suspicious — high review velocity combined with shallow first-glance comments indicates coordinated review farming.',
        isCorrect: true,
        explanation: 'Coordinated bursts of glowing reviews focusing on delivery or packaging are the primary fingerprint of compensated review syndicates.',
      },
      {
        text: 'Assume the platform verified all of them so they must be completely authentic.',
        isCorrect: false,
        explanation: 'Review syndicates often instruct testers to purchase items on-platform and reimburse them off-platform via PayPal or gift cards.',
      },
    ],
    contextTip: 'Always sort reviews by "Most Recent" and filter for 2-star, 3-star, and 4-star tiers to see genuine usage patterns.',
  },
  {
    id: 2,
    scenario: 'You are analyzing star distributions across 500 reviews on a pair of noise-canceling headphones.',
    question: 'Which star rating tier statistically offers the most reliable, objective purchasing insight?',
    options: [
      {
        text: '5-Star reviews because they reflect peak customer delight.',
        isCorrect: false,
        explanation: '5-star reviews frequently suffer from buyer confirmation bias and honeymoon phase excitement.',
      },
      {
        text: '1-Star reviews because they warn you of dangerous dealbreakers.',
        isCorrect: false,
        explanation: '1-star reviews are heavily skewed by shipping delays, damaged boxes, or user error rather than product faults.',
      },
      {
        text: '3-Star and 4-Star reviews because they balance genuine praise with specific trade-offs.',
        isCorrect: true,
        explanation: 'Moderate reviews almost always articulate nuanced pros and candid cons (e.g., "Great sound, but ear cups get warm after 2 hours").',
      },
    ],
    contextTip: 'Look for reviews written after 3+ months of real-world ownership.',
  },
  {
    id: 3,
    scenario: 'A top review includes the sentence: "I received this product for free in exchange for an honest and unbiased review."',
    question: 'How does psychological reciprocity impact this type of review?',
    options: [
      {
        text: 'It has no effect because the reviewer explicitly stated they are unbiased.',
        isCorrect: false,
        explanation: 'Disclaimers do not eliminate unconscious psychological cognitive biases.',
      },
      {
        text: 'It introduces strong unconscious reciprocity bias, consistently softening criticism of durability and value.',
        isCorrect: true,
        explanation: 'Behavioral research confirms that receiving a free gift activates unconscious goodwill, making reviewers overlook flaws.',
      },
      {
        text: 'It makes the review more critical because the reviewer feels professional responsibility.',
        isCorrect: false,
        explanation: 'Empirical studies prove incentivized reviews skew 0.6 to 1.1 stars higher on average.',
      },
    ],
    contextTip: 'Treat gifted product reviews as feature overviews rather than objective value endorsements.',
  },
  {
    id: 4,
    scenario: 'You encounter a 1-star review stating: "Package was crushed by courier and left in the rain. Product ruined!"',
    question: 'How should you factor this review into your purchase decision?',
    options: [
      {
        text: 'Avoid the product — the manufacturer cannot protect their goods.',
        isCorrect: false,
        explanation: 'Transit carrier mishandling is independent of the product engineering or functionality.',
      },
      {
        text: 'Discount it entirely — courier logistics errors reflect third-party delivery, not product capability.',
        isCorrect: true,
        explanation: 'Irrelevant logistics complaints pollute product ratings without providing insight into whether the actual product works well.',
      },
      {
        text: 'Count it as proof that the return policy is defective.',
        isCorrect: false,
        explanation: 'A delivery complaint does not indicate whether customer support replaced or refunded the item.',
      },
    ],
    contextTip: 'Focus exclusively on reviews detailing product longevity, build defects, software bugs, and ergonomic comfort.',
  },
  {
    id: 5,
    scenario: 'A product has 4.8 stars with 800 reviews. However, when you search the review text for the actual product name, half the reviews talk about an unrelated bedsheet set.',
    question: 'What deceptive marketplace tactic is occurring here?',
    options: [
      {
        text: 'Cross-promotion where the brand gives a discount on bedding.',
        isCorrect: false,
        explanation: 'This is not legitimate cross-promotion; it is review hijacking.',
      },
      {
        text: 'Review Hijacking / ASIN recycling — reviving a legacy high-rated listing to disguise an untested new product.',
        isCorrect: true,
        explanation: 'Unscrupulous sellers swap out old, highly rated listings for completely unrelated items to inherit an artificial 5-star reputation.',
      },
      {
        text: 'A harmless database glitch on the retailer platform.',
        isCorrect: false,
        explanation: 'This is an intentional black-hat tactic designed to exploit consumer trust in overall star counts.',
      },
    ],
    contextTip: 'Verify that the reviews actually describe the specific product model and color variant you are purchasing.',
  },
];

// -----------------------------------------------------------------------------
// 3. Price vs Quality Decision Tree Data
// -----------------------------------------------------------------------------
export interface DecisionTreeNode {
  id: string;
  prompt: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    nextNodeId: string;
  }[];
}

export interface DecisionConclusion {
  id: string;
  badge: string;
  title: string;
  formula: string;
  summary: string;
  recommendations: string[];
  recommendedCollection: string;
  recommendedCollectionName: string;
}

export const DECISION_TREE_NODES: Record<string, DecisionTreeNode> = {
  root: {
    id: 'root',
    prompt: 'How often will you realistically use this product?',
    subtitle: 'Frequency of use determines whether build quality or price savings will deliver better long-term happiness.',
    options: [
      {
        label: 'Daily / Mission-Critical',
        description: 'Work laptops, desk chairs, mattress, chef knife, daily commuter backpack.',
        nextNodeId: 'daily_branch',
      },
      {
        label: 'Weekly / Regular Routine',
        description: 'Gym headphones, blenders, luggage, casual footwear, power banks.',
        nextNodeId: 'weekly_branch',
      },
      {
        label: 'Occasional / One-Off Need',
        description: 'Specialty power tools, camping gear, event apparel, party equipment.',
        nextNodeId: 'occasional_branch',
      },
    ],
  },
  daily_branch: {
    id: 'daily_branch',
    prompt: 'Does your physical comfort, safety, or income depend on this item?',
    subtitle: 'Assessing the cost of catastrophic failure or physical strain.',
    options: [
      {
        label: 'Yes — High Stake / Ergonomic Health',
        description: 'Failure results in missed work, physical pain, or lost productivity.',
        nextNodeId: 'conclusion_tier1',
      },
      {
        label: 'No — Non-Critical Daily Utility',
        description: 'Daily convenience, but temporary downtime has zero financial impact.',
        nextNodeId: 'conclusion_tier2',
      },
    ],
  },
  weekly_branch: {
    id: 'weekly_branch',
    prompt: 'Are you seeking pure practical utility or top-tier sensory refinement?',
    subtitle: 'Distinguishing functional durability from premium branding and luxury cosmetics.',
    options: [
      {
        label: 'Pure Practical Performance',
        description: 'I care about reliable execution and zero headaches; aesthetics are secondary.',
        nextNodeId: 'conclusion_tier3',
      },
      {
        label: 'Refined Materials & Premium Feel',
        description: 'I appreciate precision tactile controls, premium finish, and seamless UX.',
        nextNodeId: 'conclusion_tier2',
      },
    ],
  },
  occasional_branch: {
    id: 'occasional_branch',
    prompt: 'Is renting, borrowing, or buying used feasible for this need?',
    subtitle: 'Avoiding depreciation and closet clutter for items used 1–2 times per year.',
    options: [
      {
        label: 'Yes — Rental or Borrowing is Easy',
        description: 'Can borrow from a friend, rent from a hardware store, or buy refurbished.',
        nextNodeId: 'conclusion_zero_purchase',
      },
      {
        label: 'No — I Must Own One Standby Unit',
        description: 'I need it available in the closet or toolbox whenever emergencies arise.',
        nextNodeId: 'conclusion_tier4',
      },
    ],
  },
};

export const DECISION_CONCLUSIONS: Record<string, DecisionConclusion> = {
  conclusion_tier1: {
    id: 'conclusion_tier1',
    badge: 'Buy It For Life / Flagship Investment',
    title: 'Invest in Benchmark Commercial Grade',
    formula: 'Cost Per Use (CPU) = $500 / (365 days × 4 years) ≈ $0.34 per day',
    summary: 'When an item affects your health, daily focus, or earning capability, saving $100 upfront is an expensive mistake. Diminishing returns do not apply here because high-stress endurance and ergonomics compound daily.',
    recommendations: [
      'Prioritize repairable hardware with published schematics and modular parts.',
      'Bypass trendy direct-to-consumer startups in favor of established industrial benchmarks.',
      'Inspect the warranty: a 5–10 year warranty signals true manufacturing confidence.',
    ],
    recommendedCollection: 'premium-picks',
    recommendedCollectionName: 'Explore Premium Picks',
  },
  conclusion_tier2: {
    id: 'conclusion_tier2',
    badge: 'The Sweet Spot (Flagship Killer)',
    title: 'Target the 80/20 Enthusiast Benchmark',
    formula: 'Cost Per Use (CPU) = $180 / (250 days × 3 years) ≈ $0.24 per day',
    summary: 'You achieve 85% of luxury flagship capability for 45% of the retail price. You avoid the fragile compromises of cheap clones while skipping the 200% brand tax of prestige logos.',
    recommendations: [
      'Target community-favorite mid-tier models (e.g., Anker, Audio-Technica, OXO).',
      'Look for metal structural skeletons wrapped in durable matte polycarbonate.',
      'Check resale value on secondary markets as an indicator of real-world endurance.',
    ],
    recommendedCollection: 'best-value',
    recommendedCollectionName: 'Explore Best Value Picks',
  },
  conclusion_tier3: {
    id: 'conclusion_tier3',
    badge: 'Sleeper Value / Practical Workhorse',
    title: 'Choose High-Spec Functional Contenders',
    formula: 'Cost Per Use (CPU) = $60 / (100 days × 2 years) ≈ $0.30 per day',
    summary: 'For regular routine use, you do not need hand-finished leather or exotic packaging. Buy the reliable tool with core mechanical competence and simple, durable electronics.',
    recommendations: [
      'Verify that all structural joints use metal rivets or screws, not sonic welds.',
      'Check reviews specifically mentioning 12-month endurance.',
      'Spend money on functionality (e.g., GaN charging efficiency) over cosmetic RGB lights.',
    ],
    recommendedCollection: 'smart-buys',
    recommendedCollectionName: 'Explore Smart Buys',
  },
  conclusion_tier4: {
    id: 'conclusion_tier4',
    badge: 'Competent Entry-Level Standby',
    title: 'Solid Entry Baseline with Standard Parts',
    formula: 'Cost Per Use (CPU) = $35 / (6 uses × 3 years) ≈ $1.94 per use',
    summary: 'For infrequent project use, investing in a commercial rig is wasteful. However, do not buy ultra-cheap $9 uncertified items that break on first twist or catch fire.',
    recommendations: [
      'Look for entry-level models from respected hardware brands.',
      'Avoid novelty multi-tools that try to perform 20 jobs poorly; buy dedicated single-purpose tools.',
      'Keep original packaging and receipts in case of immediate return.',
    ],
    recommendedCollection: 'everyday-essentials',
    recommendedCollectionName: 'Explore Everyday Essentials',
  },
  conclusion_zero_purchase: {
    id: 'conclusion_zero_purchase',
    badge: 'Zero-Depreciation Strategy',
    title: 'Rent, Borrow, or Buy Used & Resell',
    formula: 'Cost Per Use (CPU) = $0 Net Depreciation',
    summary: 'The smartest dollar you spend is the one you keep. For items used once a year, storage footprint and battery degradation cost more than the convenience of ownership.',
    recommendations: [
      'Borrow from local tool libraries or neighbor networks.',
      'Rent heavy equipment from home improvement retailers for $25/day.',
      'If buying, purchase second-hand tier-1 gear on marketplace and resell at identical cost.',
    ],
    recommendedCollection: 'best-value',
    recommendedCollectionName: 'Check Best Value Hardware',
  },
};

// -----------------------------------------------------------------------------
// 4. Seasonal Shopping Calendar Data
// -----------------------------------------------------------------------------
export interface MonthShoppingData {
  monthIndex: number;
  monthName: string;
  season: 'Winter' | 'Spring' | 'Summer' | 'Fall';
  savingsScore: number; // 1 to 5 stars
  avgDiscount: string;
  bestToBuy: string[];
  strictlyAvoid: string[];
  strategyTip: string;
  categoryHighlights: {
    category: string;
    discountRange: string;
    reason: string;
  }[];
}

export const SEASONAL_SHOPPING_MONTHS: MonthShoppingData[] = [
  {
    monthIndex: 0,
    monthName: 'January',
    season: 'Winter',
    savingsScore: 4,
    avgDiscount: '30% – 60%',
    bestToBuy: ['Fitness Equipment & Gym Apparel', 'Winter Coats & Boots', 'Bedding & Linens (White Sales)', 'Previous-Year Electronics'],
    strictlyAvoid: ['New Model Televisions (Wait for clearance waves)', 'Spring Apparel (Full retail markup)'],
    strategyTip: 'Brands announce new electronics in early January, causing retailers to aggressively discount previous-generation inventory.',
    categoryHighlights: [
      { category: 'Fitness', discountRange: '25-45% off', reason: 'New Year resolution promotions competition.' },
      { category: 'Winter Wear', discountRange: '40-60% off', reason: 'Inventory clearance to make room for spring.' },
    ],
  },
  {
    monthIndex: 1,
    monthName: 'February',
    season: 'Winter',
    savingsScore: 4,
    avgDiscount: '25% – 50%',
    bestToBuy: ['Big-Screen 4K Televisions & Displays', 'Mattresses & Bedding', 'Winter Outerwear Clearance'],
    strictlyAvoid: ['Jewelry & Perfumes (Valentine markup)', 'Spring Travel Bookings (Peak early demand)'],
    strategyTip: 'Late winter commonly features promotional clearing on previous-model-year televisions before new annual lines arrive.',
    categoryHighlights: [
      { category: 'Home Entertainment', discountRange: '30-45% off', reason: 'Annual television inventory volume sales.' },
      { category: 'Mattresses', discountRange: '20-40% off', reason: 'Seasonal long-weekend retail promotion cycles.' },
    ],
  },
  {
    monthIndex: 2,
    monthName: 'March',
    season: 'Spring',
    savingsScore: 2,
    avgDiscount: '15% – 30%',
    bestToBuy: ['Luggage & Travel Backpacks', 'Previous-Gen Flagship Android Phones', 'Chocolate & Winter Confectionery'],
    strictlyAvoid: ['Spring Clothing & Rain Jackets', 'Patio Furniture & BBQ Grills'],
    strategyTip: 'March is a retail lull between major promotional periods. Hold off on major tech upgrades unless replacing broken gear.',
    categoryHighlights: [
      { category: 'Travel Gear', discountRange: '20-35% off', reason: 'Pre-summer shoulder season promotions.' },
      { category: 'Smartphones', discountRange: '15-25% off', reason: 'Spring flagship releases push older models down.' },
    ],
  },
  {
    monthIndex: 3,
    monthName: 'April',
    season: 'Spring',
    savingsScore: 3,
    avgDiscount: '20% – 40%',
    bestToBuy: ['Vacuum Cleaners & Spring Cleaning Gear', 'Lawn & Garden Tools', 'Cruises & Off-Peak Travel Packages'],
    strictlyAvoid: ['Laptops & Computing (Wait for Back-to-School)', 'Summer Swimwear'],
    strategyTip: 'Vacuum cleaner manufacturers introduce annual refreshes in June, driving strong inventory clearances in April.',
    categoryHighlights: [
      { category: 'Home Appliances', discountRange: '20-35% off', reason: 'Spring cleaning promotional discounts.' },
      { category: 'Garden Hardware', discountRange: '15-25% off', reason: 'Earth Day environmental gear incentives.' },
    ],
  },
  {
    monthIndex: 4,
    monthName: 'May',
    season: 'Spring',
    savingsScore: 4,
    avgDiscount: '25% – 50%',
    bestToBuy: ['Major Kitchen Appliances', 'Mattresses & Bedframes', 'Spring Apparel (First markdowns)'],
    strictlyAvoid: ['Outdoor Grills & Smokers', 'Electronics & High-End Laptops'],
    strategyTip: 'Late spring is one of the top appliance and mattress buying windows of the entire calendar year.',
    categoryHighlights: [
      { category: 'Appliances', discountRange: '30-45% off', reason: 'Pre-summer manufacturer promotional rebates.' },
      { category: 'Sleep & Mattresses', discountRange: '25-40% off', reason: 'Holiday bundle promotions with free bases.' },
    ],
  },
  {
    monthIndex: 5,
    monthName: 'June',
    season: 'Summer',
    savingsScore: 3,
    avgDiscount: '20% – 35%',
    bestToBuy: ['Power Tools & Hardware Kits', 'Lingerie & Undergarments (Semi-Annual sales)', 'Gym Memberships'],
    strictlyAvoid: ['Summer Apparel & Swimwear', 'Back-to-School Electronics'],
    strategyTip: 'Mid-year promotional events bring bundled cordless drill kits, socket sets, and toolboxes down to holiday parity.',
    categoryHighlights: [
      { category: 'Tools & Hardware', discountRange: '25-40% off', reason: 'Mid-year gift set promotions.' },
      { category: 'Apparel Essentials', discountRange: '30-50% off', reason: 'Semi-annual inventory resets.' },
    ],
  },
  {
    monthIndex: 6,
    monthName: 'July',
    season: 'Summer',
    savingsScore: 5,
    avgDiscount: '30% – 60%',
    bestToBuy: ['Tech Accessories, Chargers, Headphones', 'Summer Clothing (Clearance begins)', 'Smart Home & Streaming Devices'],
    strictlyAvoid: ['Fall Fashion & Outerwear', 'Next-Gen Smartphones (September launches impending)'],
    strategyTip: 'Mid-year digital shopping events trigger retail-wide promotional price-matching. Focus on accessories and personal audio.',
    categoryHighlights: [
      { category: 'Consumer Tech', discountRange: '30-55% off', reason: 'Mid-year competing retail events.' },
      { category: 'Smart Home', discountRange: '35-60% off', reason: 'Ecosystem promotional hardware loss-leaders.' },
    ],
  },
  {
    monthIndex: 7,
    monthName: 'August',
    season: 'Summer',
    savingsScore: 4,
    avgDiscount: '25% – 45%',
    bestToBuy: ['Laptops, Monitors & Student Tech', 'Backpacks & Commuter Bags', 'Outdoor Patio Furniture & Grills (Clearance)'],
    strictlyAvoid: ['Flagship Smartphones (New models debut in September)', 'Heaters & Winter Gear'],
    strategyTip: 'Patio furniture and grills see 50%+ clearance as retailers clear floor space for autumn goods. Student discounts stack on electronics.',
    categoryHighlights: [
      { category: 'Computing', discountRange: '20-35% off', reason: 'Back-to-school promotional bundles with gift cards.' },
      { category: 'Outdoor Living', discountRange: '40-60% off', reason: 'End-of-season warehouse clearance.' },
    ],
  },
  {
    monthIndex: 8,
    monthName: 'September',
    season: 'Fall',
    savingsScore: 3,
    avgDiscount: '20% – 40%',
    bestToBuy: ['Previous-Gen Flagship Smartphones', 'Bicycles & Summer Sports Gear', 'Air Conditioners & Fans'],
    strictlyAvoid: ['Winter Coats & Cashmere', 'Holiday Toys & Gaming Consoles'],
    strategyTip: 'When new phone models are announced in September, outgoing models commonly drop in price with abundant certified refurbished stock.',
    categoryHighlights: [
      { category: 'Mobile Tech', discountRange: '20-35% off', reason: 'Trade-in and inventory shifts on older flagships.' },
      { category: 'Cooling Appliances', discountRange: '35-50% off', reason: 'Off-season storage liquidation.' },
    ],
  },
  {
    monthIndex: 9,
    monthName: 'October',
    season: 'Fall',
    savingsScore: 3,
    avgDiscount: '20% – 35%',
    bestToBuy: ['Older Gaming Consoles & Video Games', 'Autumn Clothing & Boots', 'Camp Gear & Cool-Weather Tents'],
    strictlyAvoid: ['Televisions (Save for November)', 'Major Appliances (Save for peak clearance events)'],
    strategyTip: 'October offers promotional teaser sales. Good for niche items, but hold out on big screens and electronics until peak annual clearance events.',
    categoryHighlights: [
      { category: 'Gaming', discountRange: '20-35% off', reason: 'Holiday software lineup prep promotions.' },
      { category: 'Travel & Outdoor', discountRange: '25-40% off', reason: 'End-of-season camping clearance.' },
    ],
  },
  {
    monthIndex: 10,
    monthName: 'November',
    season: 'Fall',
    savingsScore: 5,
    avgDiscount: '35% – 70%',
    bestToBuy: ['4K TVs, Soundbars & Home Audio', 'Tablets, Laptops & Smart Home', 'Kitchen Small Appliances', 'Noise-Canceling Headphones'],
    strictlyAvoid: ['Winter Sports Ski/Snowboard Gear (Peak prices)', 'Fine Jewelry & Gift Cards'],
    strategyTip: 'The single highest-volume promotional period of late year. Look for true price histories using tracking tools to verify promotional pricing.',
    categoryHighlights: [
      { category: 'Consumer Electronics', discountRange: '35-65% off', reason: 'Peak late-year promotional shopping events.' },
      { category: 'Kitchen Small Tech', discountRange: '30-50% off', reason: 'Holiday gift bundle retail promotions.' },
    ],
  },
  {
    monthIndex: 11,
    monthName: 'December',
    season: 'Winter',
    savingsScore: 3,
    avgDiscount: '25% – 50%',
    bestToBuy: ['Toys & Board Games (Dec 15–23)', 'Post-Holiday Clearance (Dec 26+)', 'Gift Sets, Fragrance & Holiday Decor'],
    strictlyAvoid: ['Exercise Equipment (Prices rise ahead of Jan 1)', 'Cold Weather Apparel (Hold for Jan clearance)'],
    strategyTip: 'December 26 onward features radical post-holiday inventory dump sales on returned merchandise and open-box items.',
    categoryHighlights: [
      { category: 'Toys & Family', discountRange: '30-50% off', reason: 'Late holiday inventory markdowns.' },
      { category: 'Open-Box Gear', discountRange: '25-45% off', reason: 'Retail returns restocking after Dec 25.' },
    ],
  },
];

// -----------------------------------------------------------------------------
// 5. Warranty & Return Comparison Data
// -----------------------------------------------------------------------------
export interface WarrantyTierData {
  tierIndex: number;
  name: string;
  badge: string;
  durationLabel: string;
  costLabel: string;
  riskRewardScore: number; // 1 to 10
  coverageSummary: string;
  coveredItems: string[];
  excludedItems: string[];
  verdict: 'Always Use (Included)' | 'Excellent Card Perk' | 'Frequently Overpriced' | 'Niche Emergency Value';
  strategicAdvice: string;
}

export const WARRANTY_TIERS: WarrantyTierData[] = [
  {
    tierIndex: 1,
    name: 'Retailer Return Window',
    badge: 'Standard Baseline',
    durationLabel: '7 – 30 Days',
    costLabel: 'Free / Included',
    riskRewardScore: 9,
    coverageSummary: 'Your legal right to return defective, damaged, or unappealing items immediately after purchase.',
    coveredItems: [
      'Dead-on-arrival (DOA) failures or immediate defects',
      'Shipping transit damage and missing accessories',
      'Buyer remorse (if returned unopened or within policy terms)',
      'Wrong color or model sent by warehouse',
    ],
    excludedItems: [
      'Normal wear and tear after day 30',
      'Accidental drops or water damage',
      'Open-box fees (15% restocking fee on high-end laptops/cameras)',
      'Return shipping fees on heavy freight goods',
    ],
    verdict: 'Always Use (Included)',
    strategicAdvice: 'Inspect and test all ports, buttons, and battery cycles immediately within the first 72 hours while return friction is at its lowest.',
  },
  {
    tierIndex: 2,
    name: 'Manufacturer Standard Warranty',
    badge: 'OEM Guarantee',
    durationLabel: '1 Year (Sometimes 2)',
    costLabel: 'Free / Included',
    riskRewardScore: 8,
    coverageSummary: 'The manufacturer guarantees the product is free from defects in material and workmanship under normal consumer use.',
    coveredItems: [
      'Internal component failures (logic board, motors, heating elements)',
      'Firmware bugs or charging circuit breakdown',
      'Premature battery death exceeding rated threshold (e.g., <80% capacity within year 1)',
      'Defective switches, ports, or factory solder connections',
    ],
    excludedItems: [
      'Cracked screens, dented chassis, or drop damage',
      'Liquid spills, corrosion, and moisture ingress',
      'Inbound shipping costs (customer frequently pays $15–$40 to ship to repair depot)',
      'Turnaround delays (can take 2–6 weeks for inspection and repair)',
    ],
    verdict: 'Always Use (Included)',
    strategicAdvice: 'Register the product on the manufacturer portal on day one to establish an indisputable proof-of-purchase timeline.',
  },
  {
    tierIndex: 3,
    name: 'Credit Card Extended Protection',
    badge: 'Free Premium Perk',
    durationLabel: '+1 to +2 Extra Years',
    costLabel: 'Free (Card Benefit)',
    riskRewardScore: 10,
    coverageSummary: 'Major credit cards (Visa Signature, Mastercard World, Amex) match the original manufacturer warranty for an additional 12–24 months at zero extra cost.',
    coveredItems: [
      'Matches the exact terms of the original manufacturer warranty for year 2 and year 3',
      'Reimburses repair costs or refunds original purchase price if item cannot be fixed',
      'Zero deductible required on valid claims',
      'Valid on laptops, electronics, power tools, and kitchen appliances',
    ],
    excludedItems: [
      'Items bought without using the qualifying credit card',
      'Motorized vehicles, refurbished goods without OEM backing, and commercial use',
      'Claims submitted without the original itemized receipt and monthly statement',
      'Claims exceeding $10,000 per incident or $50,000 per year',
    ],
    verdict: 'Excellent Card Perk',
    strategicAdvice: 'Never buy store extended warranties on electronics until checking your credit card benefits guide. Store PDF receipts in cloud storage for seamless claims.',
  },
  {
    tierIndex: 4,
    name: 'Retailer Extended Protection Plan',
    badge: 'Store Upsell Plan',
    durationLabel: '2 – 3 Years Post-OEM',
    costLabel: '15% – 30% of Item Price',
    riskRewardScore: 3,
    coverageSummary: 'Store-branded third-party insurance sold at checkout. Generates high profit margins for retailers and often features complex claim barriers.',
    coveredItems: [
      'Mechanical breakdown after the manufacturer 1-year warranty ends',
      'Power surge damage on connected home theater hardware',
      'Lemon policy (replacement after 3 failed service repairs)',
    ],
    excludedItems: [
      'Accidental drops or liquid spills (unless costly ADH tier purchased)',
      'Pre-existing conditions or improper self-installation',
      'Long diagnostic waits with outsourced third-party warranty administrators',
      'Deductibles or depreciated cash payouts instead of direct new replacement',
    ],
    verdict: 'Frequently Overpriced',
    strategicAdvice: 'Statistically unnecessary for solid-state electronics (TVs, speakers). Only consider for items with mechanical moving parts (washing machines, treadmills) with known failure curves.',
  },
  {
    tierIndex: 5,
    name: 'Comprehensive Accidental Protection (ADH)',
    badge: 'AppleCare+ / Asurion ADH',
    durationLabel: '2 – 3 Years Total',
    costLabel: '$80 – $250 upfront or monthly',
    riskRewardScore: 7,
    coverageSummary: 'Covers physical drops, cracked screens, and liquid immersion that standard manufacturer warranties categorically deny.',
    coveredItems: [
      'Multiple accidental damage incidents per year (drops, spills, cracks)',
      'Express replacement where a new device is mailed before you return the broken unit',
      '24/7 priority technical support and battery capacity coverage',
    ],
    excludedItems: [
      'Per-incident deductibles ($29 for screen, $99 for whole-device replacement)',
      'Loss or theft (unless paying extra for specific Loss/Theft tier)',
      'Cosmetic scratches and dents that do not impair basic operation',
    ],
    verdict: 'Niche Emergency Value',
    strategicAdvice: 'Only worth the expense on fragile mobile devices you carry daily without a protective case. Skip on static desktop and living-room appliances.',
  },
];

// -----------------------------------------------------------------------------
// Combined Guides Directory
// -----------------------------------------------------------------------------
export const INTERACTIVE_BUYING_GUIDES: InteractiveGuideMeta[] = [
  {
    id: 'guide-spot-quality',
    slug: 'spot-quality',
    title: 'How to Spot Quality in Any Product',
    shortTitle: 'Spot Quality Checklist',
    subtitle: 'An interactive quality inspection framework to evaluate material density, fastener serviceability, and mechanical tolerances before buying.',
    description: 'Avoid buyer regret by learning how to inspect materials, moving hinges, certification stamps, and thermal design with our interactive 12-point quality checklist.',
    readingTime: '5 min interactive',
    category: 'Product Research',
    interactiveType: 'checklist',
    iconName: 'ShieldCheck',
    badge: 'Interactive Checklist',
    heroHighlight: '12-Point Mechanical & Build Quality Assessment',
    keyTakeaways: [
      'Material disclosures: why specific alloy and plastic naming separates legitimate craft from cheap fillers',
      'Fastener rules: how standard Torx/Phillips screws indicate long-term repairability vs throwaway glue',
      'Component tracing: looking for certified sub-components from Tier-1 manufacturers like YKK or Omron',
      'Regulatory verification: identifying genuine safety certifications (UL, ETL, RoHS) with registration numbers',
    ],
    ctaCollectionSlug: 'premium-picks',
    ctaCollectionName: 'View Verified High-Quality Picks',
  },
  {
    id: 'guide-read-reviews',
    slug: 'read-reviews',
    title: 'Reading Reviews: What to Trust & What to Skip',
    shortTitle: 'Review Evaluation Quiz',
    subtitle: 'Test your critical review-analysis skills with 5 real-world scenarios and discover how to bypass fake 5-star review farming.',
    description: 'Learn to separate authentic customer feedback from review syndicates, reciprocity bias, and irrelevant shipping complaints with our interactive quiz.',
    readingTime: '6 min interactive',
    category: 'Consumer Intelligence',
    interactiveType: 'quiz',
    iconName: 'Search',
    badge: 'Evaluation Quiz',
    heroHighlight: '5 Real-World Scenarios with Instant Explanations',
    keyTakeaways: [
      'Review velocity surges: why 500 reviews in 48 hours is an immediate red flag',
      'The 3-star sweet spot: why moderate ratings contain the most actionable trade-offs',
      'Reciprocity bias: how free promotional items unconsciously skew rating objectivity',
      'Review hijacking: spotting reused product listings that inherit unrelated ratings',
    ],
    ctaCollectionSlug: 'best-value',
    ctaCollectionName: 'Browse Authentically Rated Picks',
  },
  {
    id: 'guide-best-value',
    slug: 'best-value',
    title: 'Getting the Best Value Without Compromising Quality',
    shortTitle: 'Price vs Quality Decision Tree',
    subtitle: 'Navigate an interactive branching decision tree to calculate cost-per-use and find the sweet spot before diminishing returns kick in.',
    description: 'Stop overpaying for brand logos or underpaying for fragile junk. Click through branching questions to pinpoint your ideal product price-to-performance tier.',
    readingTime: '5 min interactive',
    category: 'Decision Framework',
    interactiveType: 'decision-tree',
    iconName: 'TrendingUp',
    badge: 'Interactive Decision Tree',
    heroHighlight: 'Branching Flowchart for Cost-Per-Use (CPU) Optimization',
    keyTakeaways: [
      'Cost-Per-Use (CPU) calculation formula: evaluating daily cost over 3-5 years',
      'The 80/20 Enthusiast Tier: getting 85% of luxury performance for 45% of retail price',
      'High-stress vs casual thresholds: when failure costs more than the purchase price',
      'Zero-depreciation rental and refurbished secondary market strategies',
    ],
    ctaCollectionSlug: 'smart-buys',
    ctaCollectionName: 'Explore Smart Value Recommendations',
  },
  {
    id: 'guide-seasonal-shopping',
    slug: 'seasonal-shopping',
    title: 'Seasonal Shopping Smart: Timing Your Purchases',
    shortTitle: 'Shopping Calendar & Savings Tracker',
    subtitle: 'An interactive 12-month calendar and savings tracker revealing the exact months to buy tech, home goods, and travel gear at peak discounts.',
    description: 'Timing is everything in retail. Explore our interactive monthly guide to know when prices bottom out and which months feature artificial markup surges.',
    readingTime: '7 min interactive',
    category: 'Timing & Strategy',
    interactiveType: 'calendar',
    iconName: 'Calendar',
    badge: 'Interactive Calendar',
    heroHighlight: '12-Month Retail Pricing Waves & Savings Potential Gauge',
    keyTakeaways: [
      'Seasonal clearance waves: timing major electronic purchases around annual promotional cycles',
      'Pre-monsoon cooling cycles: why early summer brings competitive appliance promotions',
      'Festive season promotional wave: tracking genuine price drops versus artificial markups',
      'Smart cycle timing: waiting for annual product refresh keynotes to buy preceding flagships',
    ],
    ctaCollectionSlug: 'trending-now',
    ctaCollectionName: 'Browse Current Seasonal Trends',
  },
  {
    id: 'guide-warranties',
    slug: 'warranties',
    title: 'Returns & Warranties: What to Know Before You Buy',
    shortTitle: 'Warranty & Protection Comparison',
    subtitle: 'An interactive comparison slider analyzing retailer return windows, manufacturer guarantees, credit card protections, and extended coverage traps.',
    description: 'Compare protection tiers from free credit card perks to store upsells and accidental damage plans. Learn which warranties save money and which are pure profit traps.',
    readingTime: '6 min interactive',
    category: 'Consumer Protection',
    interactiveType: 'warranty-slider',
    iconName: 'FileText',
    badge: 'Interactive Slider',
    heroHighlight: '5-Tier Dynamic Protection Matrix with Risk/Reward Scores',
    keyTakeaways: [
      'Day 1 to 30 inspection protocol: catching defects before return barriers rise',
      'Payment card protection perks: checking if your card issuer includes automatic warranty extensions',
      'Store extended warranty economics: why 80% are overpriced profit margins',
      'Accidental damage handling (ADH): when screen and spill coverage is actually justified',
    ],
    ctaCollectionSlug: 'everyday-essentials',
    ctaCollectionName: 'Explore Reliable Everyday Essentials',
  },
  // 6. Interactive Spec Decoder
  {
    id: 'guide-read-specs',
    slug: 'read-specs',
    title: 'Reading Product Specifications Like a Pro',
    shortTitle: 'Interactive Spec Decoder',
    subtitle: 'An interactive spec decoder to translate technical marketing jargon into plain language, spotlight critical metrics, and filter out promotional noise.',
    description: 'Don\'t be misled by peak wattage ratings, inflated contrast ratios, or unregulated buzzwords. Search and decode real-world specifications with our interactive technical decoder.',
    readingTime: '6 min interactive',
    category: 'Product Research',
    interactiveType: 'spec-decoder',
    iconName: 'Cpu',
    badge: 'Spec Decoder',
    heroHighlight: 'Real-World Plain-English Translations & Fluff Detector',
    keyTakeaways: [
      'Continuous vs Peak ratings: why continuous output is the reliable operational measurement',
      'Dynamic contrast claims: understanding why native panel contrast is the meaningful baseline',
      'Standardized testing codes: looking for verifiable test codes (like IP ratings) over generic buzzwords',
      'Contextual evaluation: distinguishing metrics that affect daily longevity from promotional marketing',
    ],
    ctaCollectionSlug: 'premium-picks',
    ctaCollectionName: 'View Verified High-Spec Hardware',
  },
  // 7. Spotting Inauthentic & Substandard Products
  {
    id: 'guide-spot-fakes',
    slug: 'spot-fakes',
    title: 'Spotting Inauthentic & Substandard Products',
    shortTitle: 'Authentication Checklist',
    subtitle: 'A 15-point practical inspection framework covering packaging indicators, serial registration signals, material tolerances, and authorized seller checks.',
    description: 'Substandard and replica products require careful verification. Use our 15-point inspection protocol—a helpful verification signal, not proof on its own—to inspect hardware upon delivery.',
    readingTime: '7 min interactive',
    category: 'Consumer Intelligence',
    interactiveType: 'auth-checklist',
    iconName: 'ShieldAlert',
    badge: '15-Point Audit',
    heroHighlight: '15-Point Practical Verification Checklist with Live Scoring',
    keyTakeaways: [
      'Packaging and print signals: checking micro-typography, barcodes, and tamper-evident seals',
      'Serial and portal lookups: verifying serial codes on official manufacturer support portals as a secondary signal',
      'Physical density & weight: comparing device heft against official technical specifications',
      'Invoice & seller verification: confirming registered seller details and authorized warranty coverage',
    ],
    ctaCollectionSlug: 'smart-buys',
    ctaCollectionName: 'Browse Authentic Verified Products',
  },
  // 8. Best Times to Buy: Annual Deal Calendar
  {
    id: 'guide-deal-calendar',
    slug: 'deal-calendar',
    title: 'Best Times to Buy: Annual Deal Calendar',
    shortTitle: 'Annual Deal Calendar',
    subtitle: 'A month-by-month timing guide mapping major shopping periods, festive sales, and end-of-season clearance windows across consumer categories.',
    description: 'Understand annual promotional waves across electronics, home appliances, and lifestyle gear. Discover when seasonal demand peaks and when inventory clearance is commonly promotional.',
    readingTime: '6 min interactive',
    category: 'Timing & Strategy',
    interactiveType: 'deal-calendar',
    iconName: 'CalendarDays',
    badge: '12-Month Deals',
    heroHighlight: '12-Month Shopping Calendar & Category-Specific Buying Windows',
    keyTakeaways: [
      'Republic Day & early-year sales: clearance on preceding-year electronics and appliances',
      'Financial-year-end timing: commercial computing and seasonal clearance in March',
      'Pre-monsoon cooling window: timing air conditioner and refrigerator purchases in April–May',
      'Festive shopping season: navigating peak promotional periods around Diwali with price history checks',
    ],
    ctaCollectionSlug: 'trending-now',
    ctaCollectionName: 'Explore Current Seasonal Deals',
  },
  // 9. Extended Warranties: Is Additional Coverage Worth It?
  {
    id: 'guide-warranty-breakdown',
    slug: 'warranty-breakdown',
    title: 'Extended Warranties: Is Additional Coverage Worth It?',
    shortTitle: 'Extended Warranty Calculator',
    subtitle: 'Calculate repair risk versus upfront plan premiums with an interactive cost-comparison tool and diagnostic decision tree.',
    description: 'Extended protection plans carry high retailer margins. Use our mathematical calculator and repair-risk questions to evaluate whether extended coverage is genuinely worth the extra cost.',
    readingTime: '6 min interactive',
    category: 'Consumer Protection',
    interactiveType: 'warranty-calc',
    iconName: 'Scale',
    badge: 'Warranty Calculator',
    heroHighlight: 'Standard vs Extended vs Card Protection Matrix & Actuarial Risk Calculator',
    keyTakeaways: [
      'Expected loss formula: calculating whether repair probability justifies upfront plan premiums',
      'Payment card protection perks: checking if your card issuer includes automatic warranty extensions',
      'Portability risk factor: why daily mobile carry justifies accidental protection while stationary gear does not',
      'Claim fine print: identifying deductible fees and exclusions before purchasing store protection',
    ],
    ctaCollectionSlug: 'best-value',
    ctaCollectionName: 'Shop Verified Durable Equipment',
  },
  // 10. Returns & Refunds: Navigating Policies & Grievances
  {
    id: 'guide-returns-refunds',
    slug: 'returns-refunds',
    title: 'Returns & Refunds: Navigating Policies & Grievances',
    shortTitle: 'Returns & Grievance Guide',
    subtitle: 'A practical step-by-step return scenario flowchart, unboxing evidence checklist, and consumer grievance protocol for online shopping.',
    description: 'Online return and replacement policies can be difficult to navigate. Learn when replacement-only rules apply, how to collect unboxing evidence, and how to escalate issues through official grievance channels.',
    readingTime: '7 min interactive',
    category: 'Consumer Protection',
    interactiveType: 'return-flowchart',
    iconName: 'Undo2',
    badge: 'Return Flowchart',
    heroHighlight: 'Interactive Scenario Flowchart & Consumer Grievance Protocol',
    keyTakeaways: [
      'Check seller return window: why policies differ between marketplace listings and direct brands',
      'Unboxing evidence protocol: documenting photos and video before packaging is discarded',
      'Replacement vs refund: understanding category-specific replacement-only terms',
      'Grievance channels: escalating unresolved delivery disputes through official consumer platforms',
    ],
    ctaCollectionSlug: 'everyday-essentials',
    ctaCollectionName: 'Browse Guaranteed Return Products',
  },
];

// =============================================================================
// 6. SPEC DECODER DATA
// =============================================================================
export interface SpecDecoderItem {
  id: string;
  category: 'displays' | 'audio' | 'power' | 'computing' | 'durability';
  term: string;
  marketingJargon: string;
  plainEnglishTranslation: string;
  importance: 'usually-important' | 'depends-on-use' | 'marketing-heavy';
  verdict: 'Usually important' | 'Depends on your use' | 'Marketing-heavy; verify the underlying measurement';
  baselineBenchmark: string;
  trapWarning: string;
}

export const SPEC_DECODER_ITEMS: SpecDecoderItem[] = [
  {
    id: 'spec-1',
    category: 'power',
    term: 'Peak vs RMS / Continuous Wattage',
    marketingJargon: '"2000W Max Peak Power Output"',
    plainEnglishTranslation: 'Peak power is the absolute maximum wattage a power station, speaker, or motor can deliver for a fraction of a second before shutting down. Continuous or RMS wattage is the sustained power it delivers reliably during normal continuous operation.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'Check strictly for continuous/RMS wattage. A device labeled "2000W Peak" often operates at only 300W–500W continuous.',
    trapWarning: 'Promotional packaging frequently highlights peak wattage numbers because large numbers create an impression of higher output.',
  },
  {
    id: 'spec-2',
    category: 'displays',
    term: 'Dynamic Contrast Ratio (10,000,000:1)',
    marketingJargon: '"10,000,000:1 Mega Dynamic Contrast Ratio"',
    plainEnglishTranslation: 'Dynamic contrast compares the brightest peak white with full backlight against a completely turned-off backlight. It does not reflect what you see on screen during standard content viewing.',
    importance: 'marketing-heavy',
    verdict: 'Marketing-heavy; verify the underlying measurement',
    baselineBenchmark: 'Native (static) contrast is the meaningful baseline: roughly 1,000:1 for IPS panels, 3,000:1 to 5,000:1 for VA, and near-infinite black levels for OLED.',
    trapWarning: 'Contrast figures with multiple millions are software-manipulated promotional figures rather than native panel measurements.',
  },
  {
    id: 'spec-3',
    category: 'durability',
    term: 'IP Water & Dust Ingress Rating (e.g. IP67 / IP68)',
    marketingJargon: '"Certified Water Resistant & Splash Proof"',
    plainEnglishTranslation: 'Ingress Protection (IP) is a standardized test. The first digit (0–6) indicates dust resistance; the second digit (0–8) indicates water immersion under laboratory conditions. Unqualified "water resistant" claims lack standardized depth testing.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'IPX4 covers splash/sweat resistance. IP67 survives temporary immersion up to 1 meter. IP68 covers freshwater immersion past 1.5 meters.',
    trapWarning: 'Steam, salt water, and pool chemicals can degrade seals over time regardless of standard IP ratings. Never expose warm electronics to hot showers.',
  },
  {
    id: 'spec-4',
    category: 'audio',
    term: 'Total Harmonic Distortion (THD < 0.1%)',
    marketingJargon: '"Ultra-Clean Studio Sound Experience"',
    plainEnglishTranslation: 'THD measures how much distortion an amplifier or speaker introduces to the original audio waveform. Lower percentage values represent cleaner audio reproduction.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'THD below 0.1% across 20Hz–20kHz is typically transparent to human ears. High distortion above 1.0% causes audible muddiness at higher volumes.',
    trapWarning: 'Budget audio systems sometimes claim high wattage at 10% THD—which translates to heavy distortion when pushed to maximum output.',
  },
  {
    id: 'spec-5',
    category: 'durability',
    term: 'Military-Grade Lab Testing Claims',
    marketingJargon: '"Military-Grade Drop and Shock Tested"',
    plainEnglishTranslation: 'Standardized defense testing frameworks exist, but commercial gadget manufacturers often self-test only select environmental sub-tests (such as storage temperature) rather than rugged drop survival.',
    importance: 'marketing-heavy',
    verdict: 'Marketing-heavy; verify the underlying measurement',
    baselineBenchmark: 'Look for independently verified drop height ratings onto hard surfaces (e.g. 1.2m drop test) and reinforced corner bumpers.',
    trapWarning: 'Commercial brands self-certify under internal laboratory conditions; the label alone does not make a glass device unbreakable.',
  },
  {
    id: 'spec-6',
    category: 'displays',
    term: 'Panel Technology: OLED vs QLED vs Mini-LED',
    marketingJargon: '"Next-Gen Quantum Cinema Clarity"',
    plainEnglishTranslation: 'OLED uses self-illuminating pixels with individual shutoff for deep blacks. QLED is standard LCD backlighting enhanced with quantum-dot color sheets. Mini-LED uses smaller LED clusters for refined local dimming.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'OLED excels for dark-room cinema and gaming response. Mini-LED excels in sunlit rooms. Standard QLED remains traditional backlit LCD.',
    trapWarning: 'QLED sounds similar to OLED, but it is fundamentally a traditional backlit LCD panel and can exhibit blooming around bright objects.',
  },
  {
    id: 'spec-7',
    category: 'power',
    term: 'USB-PD Fast Charging & Extended Power Profiles',
    marketingJargon: '"Lightning Fast High-Speed Delivery"',
    plainEnglishTranslation: 'USB Power Delivery (USB-PD) is an open fast-charging standard that negotiates safe voltage and current levels between charger and device, preventing battery overheating.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'Phones typically charge at 18W–45W PD. Thin laptops require 45W–65W PD. High-performance laptops require 100W+ certified chargers and E-marker cables.',
    trapWarning: 'A 65W charger will only charge at maximum speed if both the cable and the connected device support that specific power delivery profile.',
  },
  {
    id: 'spec-8',
    category: 'computing',
    term: 'Sequential Read/Write vs 4K Random IOPS',
    marketingJargon: '"Blazing 7500 MB/s Hyper-Speed Storage"',
    plainEnglishTranslation: 'Sequential speed measures moving single large files (such as 4K videos). Random 4K operations (IOPS) measure opening system files, launching applications, and everyday multitasking responsiveness.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'For general operating system responsiveness, high random 4K read speeds matter considerably more than peak sequential throughput.',
    trapWarning: 'Budget storage drives often boast high sequential speeds on packaging, but may slow down significantly during sustained random multitasking.',
  },
  {
    id: 'spec-9',
    category: 'audio',
    term: 'Gold-Plated Digital Audio / Video Connectors',
    marketingJargon: '"24K Gold-Plated Terminals for Pure Digital Fidelity"',
    plainEnglishTranslation: 'Digital interfaces transmit binary packets (1s and 0s). Gold plating helps resist physical surface corrosion over years, but has zero impact on digital signal resolution, color fidelity, or audio clarity.',
    importance: 'marketing-heavy',
    verdict: 'Marketing-heavy; verify the underlying measurement',
    baselineBenchmark: 'Any standard certified HDMI or digital cable delivers identical digital bits up to its rated bandwidth specification regardless of contact plating.',
    trapWarning: 'Paying a substantial premium for gold-plated digital cables expecting better picture or sound quality is an unnecessary expense.',
  },
  {
    id: 'spec-10',
    category: 'displays',
    term: 'Color Gamut Coverage: sRGB vs DCI-P3 vs NTSC',
    marketingJargon: '"100% Rich Color Gamut Coverage"',
    plainEnglishTranslation: 'Color gamut specifies the range of colors a screen can physically display. 100% sRGB is the standard web color profile. DCI-P3 covers wide-gamut cinema color. 72% NTSC is roughly comparable to 99% sRGB.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'Creative color grading and photo editing require 95%+ DCI-P3 or 99% sRGB. Everyday office computing is comfortable at 100% sRGB.',
    trapWarning: 'Displays labeled "45% NTSC" display muted oranges and desaturated greens, which can look washed out during video playback.',
  },
  {
    id: 'spec-11',
    category: 'power',
    term: 'Battery Cycle Life to 80% Retention',
    marketingJargon: '"High-Capacity Extreme Endurance Cell"',
    plainEnglishTranslation: 'Total capacity (mAh or Wh) indicates runtime per charge. Cycle life indicates how many complete discharge-recharge cycles the battery sustains before permanent chemical capacity degrades to 80%.',
    importance: 'usually-important',
    verdict: 'Usually important',
    baselineBenchmark: 'Standard lithium-ion cells typically deliver 500–800 cycles (2–3 years). LiFePO4 (LFP) chemistry delivers 2,500–3,500+ cycles for long-term power stations.',
    trapWarning: 'Never purchase large power banks or portable power stations that omit battery chemistry and cycle longevity from their technical documentation.',
  },
  {
    id: 'spec-12',
    category: 'audio',
    term: 'Bluetooth Audio Codecs: SBC vs AAC vs LDAC / aptX',
    marketingJargon: '"Equipped with Bluetooth 5.4 Extreme Audio"',
    plainEnglishTranslation: 'The Bluetooth version primarily governs connection range and power efficiency. The audio codec governs compression quality: SBC is standard baseline, AAC is optimized for iOS, and LDAC/aptX Adaptive supports higher bitrate audio.',
    importance: 'depends-on-use',
    verdict: 'Depends on your use',
    baselineBenchmark: 'Standard streaming music listeners on mobile are well served by AAC. Audiophiles listening to local high-resolution audio files benefit from LDAC.',
    trapWarning: 'A headphone advertising the latest Bluetooth version can still default to basic SBC compression if high-bitrate codecs are not licensed in hardware.',
  },
];

// =============================================================================
// 7. AUTHENTICATION CHECKLIST DATA (15-Point Practical Verification)
// =============================================================================
export interface AuthChecklistItem {
  id: string;
  category: 'packaging' | 'serial' | 'physical' | 'firmware';
  title: string;
  description: string;
  redFlags: string[];
  verificationStep: string;
  weight: number;
}

export const AUTHENTICATION_CHECKLIST_ITEMS: AuthChecklistItem[] = [
  // Pillar 1: Packaging & Printing (26 pts)
  {
    id: 'auth-pack-1',
    category: 'packaging',
    title: 'Micro-Typography & Packaging Print Edge Sharpness',
    description: 'Genuine retail boxes utilize high-resolution commercial printing with crisp lettering, even kerning, and sharp barcode lines.',
    redFlags: ['Fuzzy or pixelated text edges under close inspection', 'Bleeding ink around regulatory marks', 'Inconsistent font weights or substituted typography'],
    verificationStep: 'Inspect the fine regulatory text on the box under a bright light. Genuine print remains sharp without halftone dither dots.',
    weight: 7,
  },
  {
    id: 'auth-pack-2',
    category: 'packaging',
    title: 'Holographic Optical Shift & Tamper-Evident Seals',
    description: 'Authentic security seals feature multi-layered holographic patterns that shift color and reveal depth when viewed from varying angles.',
    redFlags: ['Static printed foil sticker that does not shift color under tilted light', 'Peeling stickers with missing tamper-evident adhesive residue', 'Torn seals covered by secondary clear tape'],
    verificationStep: 'Tilt the security seal under direct light. Authentic holograms display clean visual depth rather than flat metallic printing.',
    weight: 7,
  },
  {
    id: 'auth-pack-3',
    category: 'packaging',
    title: 'EAN / UPC Checksum & Scannable Barcode Labeling',
    description: 'Registered retail barcodes have mathematically valid checksum digits and correspond to the specific product model and regional packaging.',
    redFlags: ['Barcode fails to register on standard barcode scanner apps', 'Scanned barcode resolves to an unrelated generic product', 'Misaligned barcode sticker placed over previous packaging text'],
    verificationStep: 'Scan the box barcode using a standard scanner application. Confirm the registered model number corresponds with the product inside.',
    weight: 6,
  },
  {
    id: 'auth-pack-4',
    category: 'packaging',
    title: 'Precision Molded Inlays & Internal Protective Packaging',
    description: 'Established brands use custom-molded paper pulp or contoured internal trays engineered to fit the device without loose rattling.',
    redFlags: ['Product rattles loosely inside the shipping carton', 'Flimsy, generic bubble wrap without custom molded inserts', 'Pungent chemical odor from low-grade adhesives'],
    verificationStep: 'Gently shake the closed retail box. Authentic packaging cradles the hardware firmly with zero internal rattling.',
    weight: 6,
  },

  // Pillar 2: Serial & Documentation Signals (28 pts)
  {
    id: 'auth-ser-1',
    category: 'serial',
    title: 'Matching Serial: Packaging vs Hardware Laser Engraving',
    description: 'The serial number printed on the outer barcode label should match the physical laser-etched serial on the hardware unit exactly.',
    redFlags: ['Serial on the box differs from the serial etched on the hardware', 'Hardware serial is a paper sticker where laser etching is standard', 'Scuffed, faded, or crooked serial stamping'],
    verificationStep: 'Cross-check the serial number printed on the box label against the serial engraved inside the hinge, bottom plate, or battery compartment.',
    weight: 8,
  },
  {
    id: 'auth-ser-2',
    category: 'serial',
    title: 'Official Manufacturer Support Portal Lookup',
    description: 'Many hardware brands provide official online coverage or warranty lookup tools where entering the serial confirms activation status (useful verification signal, not proof on its own).',
    redFlags: ['Serial comes up as unrecognized or invalid on the manufacturer portal', 'Portal indicates warranty was activated months prior to your purchase date', 'Serial has been flagged for multiple duplicate registration claims'],
    verificationStep: 'Input your serial code into the manufacturer\'s official support website to verify whether the serial is registered in their system.',
    weight: 8,
  },
  {
    id: 'auth-ser-3',
    category: 'serial',
    title: 'Valid Tax Invoice & Registered Seller Verification',
    description: 'Authentic retail deliveries include a formal tax invoice showing registered business details (such as a valid GSTIN/tax registration), clear serial numbers, and authorized reseller information.',
    redFlags: ['Missing tax invoice or invoice without registered business trade name and tax identifier', 'Invoice item description differs from delivered model', 'Seller listed has zero verifiable business presence or contact information'],
    verificationStep: 'Check your physical delivery invoice for a valid tax registration number and confirm the seller is an authorized distribution partner.',
    weight: 6,
  },
  {
    id: 'auth-ser-4',
    category: 'serial',
    title: 'Direct HTTPS Domain QR Code Validation',
    description: 'QR codes on packaging should link directly to the brand\'s verified corporate HTTPS domain rather than third-party URL shorteners.',
    redFlags: ['QR code redirects through unverified URL shorteners', 'Landing page domain contains subtle misspellings', 'Prompts to download an external APK file outside official app stores'],
    verificationStep: 'Scan the packaging QR code and verify the destination URL before opening. Ensure it leads to the official brand domain.',
    weight: 6,
  },

  // Pillar 3: Hardware Weight & Physical Tolerances (26 pts)
  {
    id: 'auth-phys-1',
    category: 'physical',
    title: 'Precision Scale Weight Benchmark',
    description: 'Substandard copies often omit internal shielding, copper windings, and balanced counterweights, making replicas noticeably lighter than genuine units.',
    redFlags: ['Device feels noticeably hollow or unusually light in hand', 'Weight deviates by more than 3% from the manufacturer official spec sheet', 'Off-center weight balance tilted toward one side'],
    verificationStep: 'Weigh the bare device on a digital kitchen scale and compare the reading in grams against the official technical specification sheet.',
    weight: 8,
  },
  {
    id: 'auth-phys-2',
    category: 'physical',
    title: 'Flush Seams & Zero Injection Molding Flash',
    description: 'Precision industrial molds produce uniform hairline seams with zero jagged plastic ridges, burrs, or uneven gaps between body panels.',
    redFlags: ['Visible sharp plastic mold seams along body edges or buttons', 'Uneven gaps where one chassis half sits higher than the other', 'Chassis creaks or flexes under gentle pressure'],
    verificationStep: 'Run your fingertip along outer seams, button cutouts, and speaker grilles. All mating surfaces should feel flush and smooth.',
    weight: 6,
  },
  {
    id: 'auth-phys-3',
    category: 'physical',
    title: 'True Metal vs Metallized Plastic Density Test',
    description: 'Authentic hardware uses anodized aluminum, magnesium, or steel alloys. Substandard replicas frequently substitute painted hollow plastic.',
    redFlags: ['Surface immediately feels warm to the touch like plastic', 'Metallic paint chips off showing raw plastic underneath', 'Tap test produces a dull plastic thud rather than a resonant metallic sound'],
    verificationStep: 'Touch the chassis to check thermal conductivity. Real metal feels cool to the touch and conducts ambient temperature rapidly.',
    weight: 6,
  },
  {
    id: 'auth-phys-4',
    category: 'physical',
    title: 'Port Centering & Precision Connector Pin Plating',
    description: 'USB-C and charging ports are machine-centered inside their chassis cutouts with clean, uniform gold- or nickel-plated contact pins.',
    redFlags: ['Port connector tongue is crooked or off-center inside the opening', 'Rough, sticky contact pins during cable insertion', 'Painted contact pins that scratch off after minimal use'],
    verificationStep: 'Examine the charging port under a flashlight. Confirm the internal tongue is centered and internal contact pins are uniform.',
    weight: 6,
  },

  // Pillar 4: Software, Firmware & Compliance (20 pts)
  {
    id: 'auth-soft-1',
    category: 'firmware',
    title: 'Official Companion App Pairing Handshake',
    description: 'Authentic smart peripherals (headphones, wearables, smart home devices) interface with official iOS/Android companion apps using verified hardware IDs.',
    redFlags: ['Device connects via generic Bluetooth settings but official app says "Device Not Found"', 'App fails to display battery status or firmware version', 'Device shows up as a generic string like "BT-Audio" in Bluetooth menus'],
    verificationStep: 'Download the official brand application from the app store and initiate pairing directly inside the official app.',
    weight: 7,
  },
  {
    id: 'auth-soft-2',
    category: 'firmware',
    title: 'Over-The-Air (OTA) Firmware Upgrade Verification',
    description: 'Genuine hardware connects to manufacturer cloud servers to download and install digitally signed firmware revisions.',
    redFlags: ['App displays permanent network connection error when checking firmware', 'Attempting a firmware update immediately causes the device to freeze', 'Firmware version string shown in settings is static or nonsensical'],
    verificationStep: 'Check for firmware updates inside the official app. Authentic devices query manufacturer servers and show verified changelogs.',
    weight: 8,
  },
  {
    id: 'auth-soft-3',
    category: 'firmware',
    title: 'Regulatory & Telecommunication Compliance Marks',
    description: 'Wireless and electrical equipment sold legally carry registered regulatory compliance markings (such as BIS, WPC, or international equivalents) with traceable registration numbers.',
    redFlags: ['Missing mandatory national regulatory marks on device label or digital regulatory screen', 'Printed registration number returns an unrelated product in public databases', 'Counterfeit safety logos with distorted font spacing'],
    verificationStep: 'Check the printed product label or digital regulatory menu for verifiable compliance marks and registration numbers.',
    weight: 5,
  },
];

// =============================================================================
// 8. DEAL CALENDAR DATA (12-Month Annual Shopping Timing)
// =============================================================================
export interface DealMonthData {
  month: string;
  monthNum: number;
  seasonName: string;
  savingsScore: number; // 1 to 5 stars
  averageDiscount: string;
  bestCategories: { name: string; discountRange: string; reason: string }[];
  avoidCategories: { name: string; reason: string }[];
  keyEvents: string[];
  insiderTip: string;
}

export const DEAL_CALENDAR_DATA: DealMonthData[] = [
  {
    month: 'January',
    monthNum: 1,
    seasonName: 'Republic Day & Early-Year Clearance',
    savingsScore: 4,
    averageDiscount: 'Often promotional (20% – 40%)',
    bestCategories: [
      { name: 'Fitness Equipment & Smart Wearables', discountRange: 'Commonly promotional', reason: 'New Year fitness demand prompts competitive brand pricing.' },
      { name: 'Previous-Generation Televisions & Tech', discountRange: 'Clearance pricing', reason: 'Annual hardware refreshes prompt clearing of preceding-year inventory.' },
      { name: 'Winter Apparel & Seasonal Footwear', discountRange: 'End-of-season clearance', reason: 'Retailers clear winter stock to prepare floor space for spring apparel.' },
    ],
    avoidCategories: [
      { name: 'Brand-New Hardware Announcements', reason: 'Freshly announced hardware models command initial maximum retail pricing.' },
    ],
    keyEvents: ['Republic Day Sales Period', 'New Year Promotional Week', 'Winter Clearance Events'],
    insiderTip: 'Mid-to-late January is often worth checking for open-box electronics and preceding-generation displays as retailers reset warehouse inventory.',
  },
  {
    month: 'February',
    monthNum: 2,
    seasonName: 'End-of-Season Winter Clearance & Home Entertainment',
    savingsScore: 3,
    averageDiscount: 'Selective deals (15% – 35%)',
    bestCategories: [
      { name: 'Large 4K Displays & Soundbars', discountRange: 'Commonly promotional', reason: 'Late winter promotional events frequently feature competitive entertainment bundles.' },
      { name: 'Winter Outerwear & Travel Bags', discountRange: 'Final clearance', reason: 'Deepest seasonal markdowns on winter jackets and cold-weather gear.' },
      { name: 'Mattresses & Home Furnishings', discountRange: 'Periodic promotions', reason: 'Seasonal long-weekend retail promotion cycles.' },
    ],
    avoidCategories: [
      { name: 'Spring Fashion Collections', reason: 'Just arriving on digital storefronts at initial retail prices.' },
    ],
    keyEvents: ['End-of-Winter Clearance', 'Valentine Promotional Window'],
    insiderTip: 'Look for bundle offers on home theater equipment and audio accessories where cables or extended coverage are included complimentary.',
  },
  {
    month: 'March',
    monthNum: 3,
    seasonName: 'Financial-Year-End Clearance Period',
    savingsScore: 4,
    averageDiscount: 'Often promotional (20% – 35%)',
    bestCategories: [
      { name: 'Laptops, Monitors & Office Computing', discountRange: 'Commercial clearance', reason: 'Financial-year-end prompts corporate IT and consumer computing clearance.' },
      { name: 'Previous-Gen Flagship Smartphones', discountRange: 'Commonly promotional', reason: 'Spring product release cycles encourage discounting on outgoing flagship models.' },
      { name: 'Luggage & Travel Backpacks', discountRange: 'Shoulder-season timing', reason: 'Pre-summer travel preparation brings competitive gear promotions.' },
    ],
    avoidCategories: [
      { name: 'Cooling Appliances (ACs & Coolers)', reason: 'Demand surges ahead of peak summer heat; prices firm up until mid-monsoon.' },
    ],
    keyEvents: ['Financial Year-End Clearance', 'Holi Festive Promotions'],
    insiderTip: 'March is prime time for buying commercial-grade laptops and office furniture before the close of the financial year on March 31.',
  },
  {
    month: 'April',
    monthNum: 4,
    seasonName: 'Summer Demand & Cooling Season',
    savingsScore: 2,
    averageDiscount: 'Selective deals (10% – 25%)',
    bestCategories: [
      { name: 'Air Conditioners & Inverter Coolers', discountRange: 'Early-season offers', reason: 'Competitive manufacturer launch offers with installation bundle perks.' },
      { name: 'Kitchen Small Appliances & Juicers', discountRange: 'Seasonal demand', reason: 'Summer beverage and kitchen prep promotional promotions.' },
    ],
    avoidCategories: [
      { name: 'Premium Consumer Laptops', reason: 'Back-to-school and mid-year student promotions arrive in July–August; waiting is often wise.' },
    ],
    keyEvents: ['Summer Cooling Sales', 'Baisakhi / Regional New Year Promotions'],
    insiderTip: 'For air conditioners, check for bundle deals that include complimentary standard installation and copper piping to avoid surprise checkout costs.',
  },
  {
    month: 'May',
    monthNum: 5,
    seasonName: 'Pre-Monsoon Preparation & Kitchen Upgrades',
    savingsScore: 3,
    averageDiscount: 'Selective deals (15% – 30%)',
    bestCategories: [
      { name: 'Refrigerators & Freezers', discountRange: 'Commonly promotional', reason: 'Peak summer cooling promotions with exchange bonuses.' },
      { name: 'Water Purifiers & Kitchen Tech', discountRange: 'Pre-monsoon timing', reason: 'Pre-monsoon health and water filtration promotional campaigns.' },
      { name: 'Summer Travel Gear & Sun Protection', discountRange: 'Holiday promotions', reason: 'Summer vacation luggage and portable power accessories.' },
    ],
    avoidCategories: [
      { name: 'Waterproof Monsoon Outerwear', reason: 'Monsoon gear commands full initial retail pricing before seasonal clearance.' },
    ],
    keyEvents: ['Summer Holiday Retail Promos', 'Mid-Summer Appliance Drives'],
    insiderTip: 'When purchasing major cooling appliances, check for exchange bonuses on your older appliance which can reduce net costs by 10%–15%.',
  },
  {
    month: 'June',
    monthNum: 6,
    seasonName: 'Mid-Year Clearance & Travel Peripherals',
    savingsScore: 3,
    averageDiscount: 'Selective deals (15% – 30%)',
    bestCategories: [
      { name: 'Water-Resistant Bags & Cases', discountRange: 'Seasonal utility', reason: 'Monsoon preparation gear and protective travel peripherals.' },
      { name: 'Power Tools & Home Improvement Kits', discountRange: 'Mid-year promotions', reason: 'Mid-year home maintenance promotional campaigns.' },
      { name: 'Wireless Earbuds & Audio Peripherals', discountRange: 'Commonly promotional', reason: 'Mid-year audio refresh cycles.' },
    ],
    avoidCategories: [
      { name: 'Flagship Smartphones', reason: 'Major new smartphone releases arrive in September–October; hold for festive windows.' },
    ],
    keyEvents: ['Mid-Year Inventory Clearance', 'Monsoon Arrival Promos'],
    insiderTip: 'June is an effective month to look for water-resistant backpacks, phone dry pouches, and surge protectors ahead of heavy rains.',
  },
  {
    month: 'July',
    monthNum: 7,
    seasonName: 'Monsoon Essentials & Mid-Year Digital Sales',
    savingsScore: 4,
    averageDiscount: 'Often promotional (25% – 45%)',
    bestCategories: [
      { name: 'Smartphones, Tablets & Audio Gear', discountRange: 'Commonly promotional', reason: 'Mid-year digital shopping events bring broad price-matching across categories.' },
      { name: 'Smart Home & Streaming Devices', discountRange: 'Promotional pricing', reason: 'Ecosystem brands promote streaming hardware and voice peripherals.' },
      { name: 'Personal Audio & Bluetooth Speakers', discountRange: 'Competitive offers', reason: 'Monsoon indoor entertainment promotional drives.' },
    ],
    avoidCategories: [
      { name: 'Air Conditioners & Coolers', reason: 'Post-peak season inventory is drying up; clearance begins later in September.' },
    ],
    keyEvents: ['Mid-Year E-Commerce Shopping Events', 'Monsoon Digital Sales'],
    insiderTip: 'Always check historical pricing trackers during mid-year online shopping events to confirm that promotional tags represent genuine reductions.',
  },
  {
    month: 'August',
    monthNum: 8,
    seasonName: 'Independence Day Shopping Window & Student Tech',
    savingsScore: 4,
    averageDiscount: 'Often promotional (20% – 40%)',
    bestCategories: [
      { name: 'Laptops, Monitors & Student Computing', discountRange: 'Back-to-campus timing', reason: 'Independence Day promotions combine with student computing bundle offers.' },
      { name: 'Ergonomic Study Chairs & Desks', discountRange: 'Commonly promotional', reason: 'Home study and office setup promotional campaigns.' },
      { name: 'Home Appliances & Washing Machines', discountRange: 'National holiday sales', reason: 'Competitive holiday promotional pricing across major appliances.' },
    ],
    avoidCategories: [
      { name: 'Upcoming Smartphone Flagships', reason: 'Annual keynotes in September bring immediate price revisions to preceding generations.' },
    ],
    keyEvents: ['Independence Day Sales Period', 'Raksha Bandhan Gifting Deals'],
    insiderTip: 'Independence Day sales often offer the strongest computing and laptop deals of the monsoon period, particularly when bundled with student proof.',
  },
  {
    month: 'September',
    monthNum: 9,
    seasonName: 'Early Festive Season Preparation',
    savingsScore: 3,
    averageDiscount: 'Selective deals (15% – 35%)',
    bestCategories: [
      { name: 'Previous-Gen Flagship Smartphones', discountRange: 'Clearance adjustments', reason: 'Global September flagship announcements trigger price cuts on older models.' },
      { name: 'Cooling Appliances (ACs & Coolers)', discountRange: 'End-of-summer clearance', reason: 'Retailers clear remaining summer inventory to make space for festive displays.' },
      { name: 'Grooming & Personal Care Electronics', discountRange: 'Pre-festive prep', reason: 'Early festive gifting bundles across hair stylers and trimmers.' },
    ],
    avoidCategories: [
      { name: 'Large 4K TVs & Home Theaters', reason: 'Hold for the peak Diwali festive sales in October when television promotions reach maximum volume.' },
    ],
    keyEvents: ['Pre-Festive Preview Events', 'Annual Smartphone Keynote Launches'],
    insiderTip: 'Buying the previous year\'s flagship smartphone the week following the new model announcement frequently offers exceptional price-to-performance.',
  },
  {
    month: 'October',
    monthNum: 10,
    seasonName: 'Festive-Season Mega Sale Period',
    savingsScore: 5,
    averageDiscount: 'Peak promotional period (25% – 50%)',
    bestCategories: [
      { name: 'Large 4K Smart TVs & Home Theater', discountRange: 'Peak promotional pricing', reason: 'Festive season drives the highest television sales volume of the calendar year.' },
      { name: 'Smartphones & Premium Audio', discountRange: 'High competition', reason: 'Brand flagship promotions with bank card cashback incentives.' },
      { name: 'Major Home Appliances & Kitchen Tech', discountRange: 'Festival exchange bonuses', reason: 'Comprehensive festive home upgrade packages with instant card discounts.' },
    ],
    avoidCategories: [
      { name: 'Winter Outerwear & Room Heaters', reason: 'Winter seasonal demand is just starting; wait for post-festive or mid-winter clearance.' },
    ],
    keyEvents: ['Diwali Mega Festive Sales', 'Navratri / Dussehra Shopping Drives', 'Festive Card Cashback Waves'],
    insiderTip: 'Stack instant bank card discounts (often 10% instant off) with exchange offers during festive mega sales to maximize net savings.',
  },
  {
    month: 'November',
    monthNum: 11,
    seasonName: 'Post-Festive Clearance & Wedding Season',
    savingsScore: 4,
    averageDiscount: 'Often promotional (20% – 40%)',
    bestCategories: [
      { name: 'Bridal Electronics & Kitchen Appliances', discountRange: 'Wedding season promos', reason: 'High-demand wedding gifting and household setup promotional bundles.' },
      { name: 'Water Heaters & Room Heaters', discountRange: 'Early winter drives', reason: 'Early-season volume sales with manufacturer installation offers.' },
      { name: 'Remaining Festive Inventory Electronics', discountRange: 'Post-festival clearance', reason: 'Lingering festive clearance on consumer tech and smart home gear.' },
    ],
    avoidCategories: [
      { name: 'Air Conditioners', reason: 'Winter off-season displays are packed away; stock choice is limited until spring.' },
    ],
    keyEvents: ['Post-Diwali Clearance', 'Wedding Season Shopping Drives'],
    insiderTip: 'The 2 weeks following Diwali often feature quiet clearance on unsold electronics inventory with competitive pricing.',
  },
  {
    month: 'December',
    monthNum: 12,
    seasonName: 'Year-End Clearance & Holiday Tech',
    savingsScore: 4,
    averageDiscount: 'Often promotional (20% – 40%)',
    bestCategories: [
      { name: 'Tech Accessories & Power Banks', discountRange: 'Year-end gifting', reason: 'High-volume seasonal gifting promotions.' },
      { name: 'Year-End Inventory Clearance', discountRange: 'Warehouse resets', reason: 'Retailers clear remaining calendar-year stock before annual financial reporting.' },
      { name: 'Gaming Peripherals & Digital Tech', discountRange: 'Holiday digital promotions', reason: 'Holiday software and gaming accessory promotional campaigns.' },
    ],
    avoidCategories: [
      { name: 'New Year Fitness Gear', reason: 'Fitness trackers and gym gear command full price ahead of January 1 resolution demand.' },
    ],
    keyEvents: ['Year-End Clearance Week', 'Christmas Gifting Promotions'],
    insiderTip: 'Late December (Dec 25–31) is often worth checking for open-box returns and calendar year-end liquidation sales.',
  },
];

// =============================================================================
// 9. WARRANTY CALCULATOR DATA (Is Additional Coverage Worth It?)
// =============================================================================
export interface WarrantyComparisonTier {
  tierId: string;
  name: string;
  provider: string;
  coverageYears: string;
  accidentalDamage: boolean;
  deductible: string;
  costPercentage: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export const WARRANTY_COMPARISON_TIERS: WarrantyComparisonTier[] = [
  {
    tierId: 'tier-standard',
    name: 'Standard Manufacturer Warranty',
    provider: 'Original Equipment Manufacturer (OEM)',
    coverageYears: '1 Year (Standard)',
    accidentalDamage: false,
    deductible: '₹0 (Included)',
    costPercentage: 'Included in purchase price',
    pros: [
      'Included automatically at zero additional cost',
      'Serviced through authorized brand service centers with genuine OEM parts',
      'Repairs verified to meet factory specifications',
    ],
    cons: [
      'Strictly covers factory defects only (excludes drops, spills, and physical wear)',
      'Customers generally carry the unit to the nearest service center',
      'Coverage ends after 12 months as normal component wear-and-tear begins',
    ],
    verdict: 'Essential foundation, but provides zero coverage against accidental physical drops or liquid spills.',
  },
  {
    tierId: 'tier-card',
    name: 'Eligible Premium Card / Banking Perks',
    provider: 'Card Issuer / Banking Partner Benefits',
    coverageYears: '+1 Extra Year (Added to OEM)',
    accidentalDamage: false,
    deductible: '₹0 (Complimentary Perk)',
    costPercentage: 'Complimentary cardholder benefit',
    pros: [
      'Extends the OEM warranty by up to 12 additional months for free on eligible cards',
      'Reimburses repair costs or purchase value if service is unfeasible',
      'Credits settlement directly to your statement rather than store vouchers',
    ],
    cons: [
      'Requires paying 100% of the product purchase on the specific eligible card',
      'Must preserve tax invoice, card statement, and authorized service job sheet',
      'Typically covers mechanical/electrical defects rather than physical liquid damage',
    ],
    verdict: 'A valuable complimentary perk. Check your card agreement to avoid paying for redundant defect-only store plans.',
  },
  {
    tierId: 'tier-extended',
    name: 'Retailer Paid Extended Protection',
    provider: 'Third-Party Protection Plan / Retail Add-on',
    coverageYears: '1 to 2 Additional Years',
    accidentalDamage: true,
    deductible: 'Nominal claim processing fee',
    costPercentage: 'Typically 12% - 20% of product price',
    pros: [
      'Accidental Damage Handling (ADH) covers drops, cracked screens, and liquid spills',
      'Doorstep pickup or localized service logistics in major metro areas',
      'Settlement or replacement if the unit cannot be repaired within stated timelines',
    ],
    cons: [
      'High retail margins make many extended contracts mathematically expensive',
      'Processing deductibles and depreciated valuation caps apply in subsequent years',
      'Exclusions apply for unauthorized repairs, cosmetic wear, and commercial use',
    ],
    verdict: 'Only justified for high-exposure mobile devices carried daily where personal drop risk is elevated.',
  },
];

// Diagnostic Decision Questions for Warranties
export interface WarrantyDecisionStep {
  id: string;
  question: string;
  options: { label: string; score: number; explanation: string }[];
}

export const WARRANTY_DECISION_QUESTIONS: WarrantyDecisionStep[] = [
  {
    id: 'q1',
    question: 'How portable is this product during daily use?',
    options: [
      { label: 'Stationary at home (Smart TV, desktop PC, audio soundbar)', score: 0, explanation: 'Stationary gear has minimal drop risk; paid extended plans are rarely cost-effective.' },
      { label: 'Semi-portable (Tablet around home, blender, power tool)', score: 2, explanation: 'Moderate physical handling, but unlikely to sustain high-impact transit accidents.' },
      { label: 'Daily mobile carry (Laptop in bag, smartphone, camera)', score: 5, explanation: 'High daily exposure to accidental drops, crowded commutes, and liquid spills.' },
    ],
  },
  {
    id: 'q2',
    question: 'Could you comfortably replace or repair this item out-of-pocket without financial distress?',
    options: [
      { label: 'Yes, repair or replacement cost is easily manageable', score: 0, explanation: 'Self-insuring is mathematically superior when out-of-pocket repair costs are small.' },
      { label: 'Manageable with minor budget adjustments', score: 2, explanation: 'Standard manufacturer coverage plus careful handling is typically sufficient.' },
      { label: 'No, failure would cause significant financial or work disruption', score: 4, explanation: 'Essential daily livelihood tools justify protection if you lack an emergency replacement fund.' },
    ],
  },
  {
    id: 'q3',
    question: 'Are you purchasing with an eligible payment card that includes warranty perks?',
    options: [
      { label: 'Yes, paid with an eligible premium card featuring purchase protection', score: 0, explanation: 'You may already have complimentary extended defect coverage. Verify before buying store plans.' },
      { label: 'Unsure / Standard debit card / Cash on delivery / Store financing', score: 3, explanation: 'You will rely strictly on the standard 1-year manufacturer guarantee.' },
    ],
  },
  {
    id: 'q4',
    question: 'What is the retailer asking for the extended warranty relative to the item price?',
    options: [
      { label: 'More than 20% of the total product purchase price', score: 0, explanation: 'Substantially overpriced. High premiums eat into any statistical benefit.' },
      { label: 'Between 10% and 18% with accidental drop coverage', score: 3, explanation: 'Reasonable price point if accidental damage handling is explicitly covered.' },
      { label: 'Under 10% with full accidental damage and replacement promise', score: 5, explanation: 'Competitive protection tier if backed by an authorized service network.' },
    ],
  },
];

// =============================================================================
// 10. RETURNS & REFUNDS FLOWCHART DATA (India Practical Shopping Guidance)
// =============================================================================
export interface ReturnScenario {
  id: string;
  title: string;
  timeframe: string;
  bestOutcome: string;
  difficulty: 'Easy' | 'Moderate' | 'Complex';
  stepByStepAction: string[];
  requiredEvidence: string[];
  finePrintTrap: string;
}

export const RETURN_SCENARIOS: ReturnScenario[] = [
  {
    id: 'scen-damaged',
    title: 'Damaged on Delivery (Transit Impact or Crushed Carton)',
    timeframe: 'Within 24 to 48 hours of delivery',
    bestOutcome: 'Free courier pickup and prompt replacement unit or full refund',
    difficulty: 'Easy',
    stepByStepAction: [
      'Stop unpacking immediately and preserve the outer shipping carton, bubble wrap, and airway bill label.',
      'Capture clear, timestamped photos and an unboxing video showing the exterior parcel damage and broken hardware.',
      'Log into the marketplace or store portal and submit a request under "Damaged on Delivery" within 48 hours.',
      'Keep all original accessories, documentation, and the tax invoice ready for physical courier inspection.',
      'During return pickup, obtain an acknowledgment receipt or tracking confirmation from the delivery executive.',
    ],
    requiredEvidence: ['Photos of crushed outer shipping carton with visible airway bill', 'Unboxing video showing condition upon arrival', 'Copy of retail tax invoice'],
    finePrintTrap: 'Never discard the outer shipping box or delay reporting past 48 hours; courier transit damage claims are routinely disputed if reported late.',
  },
  {
    id: 'scen-wrong',
    title: 'Wrong Item or Variant Received',
    timeframe: 'Day 0 to 7 after delivery',
    bestOutcome: 'Prompt replacement with the correct ordered model or full refund',
    difficulty: 'Easy',
    stepByStepAction: [
      'Keep the delivered item in unused condition with all original packaging and barcode stickers intact.',
      'Photograph the model number label on the retail box side-by-side with your digital order confirmation.',
      'Raise a support request under "Wrong item received / Discrepant model".',
      'Ensure the pickup agent physically verifies the barcode/model number before handing over the parcel.',
    ],
    requiredEvidence: ['Photo of model label on product box vs order invoice', 'Digital order confirmation screenshot', 'Pristine retail packaging'],
    finePrintTrap: 'Do not unseal internal component bags or attempt to use the wrong model; items showing usage signs can be rejected during return pickup inspection.',
  },
  {
    id: 'scen-missing',
    title: 'Missing Accessories or Incomplete Packaging',
    timeframe: 'Within 48 hours of delivery',
    bestOutcome: 'Dispatch of missing components or replacement package',
    difficulty: 'Moderate',
    stepByStepAction: [
      'Lay out all enclosed components on a flat surface next to the retail box packing list.',
      'Take photos of the empty compartments inside the molded tray showing missing adapters, cables, or manuals.',
      'Submit a support ticket under "Missing items / Incomplete box" within 48 hours.',
      'Review whether the seller dispatches the missing part directly or issues a pickup for a complete fresh replacement.',
    ],
    requiredEvidence: ['Photo of all unboxed items alongside the user manual component inventory', 'Shipping carton with weight label', 'Tax invoice'],
    finePrintTrap: 'Waiting several days allows sellers to claim components were misplaced after delivery. Report missing accessories immediately on day one.',
  },
  {
    id: 'scen-not-described',
    title: 'Product Not as Described (Misrepresented Specs)',
    timeframe: 'Within seller return window (typically 7–10 days)',
    bestOutcome: 'Full refund or replacement with compliant model',
    difficulty: 'Moderate',
    stepByStepAction: [
      'Screenshot the product listing page highlighting the specific promised specification (e.g. storage capacity, wattage, or material).',
      'Photograph the actual specification printed on the physical unit or displayed in the device system settings.',
      'Initiate a return stating "Product details mismatch / Feature not as described".',
      'Provide the side-by-side screenshot comparison in the customer support ticket.',
    ],
    requiredEvidence: ['Listing screenshot showing promised specifications', 'Photo of actual hardware specifications or system screen', 'Tax invoice'],
    finePrintTrap: 'Sellers may claim minor technical variance. Clear photographic documentation of the contradiction is the fastest way to secure approval.',
  },
  {
    id: 'scen-after-window',
    title: 'Hardware Defect Discovered After Return Window',
    timeframe: 'After day 7–10, within manufacturer warranty period',
    bestOutcome: 'Free authorized warranty repair, component replacement, or replacement unit',
    difficulty: 'Moderate',
    stepByStepAction: [
      'Locate your official tax invoice containing the valid registered tax identifier and order date.',
      'Check the manufacturer support portal for authorized service center locations in your city.',
      'Book a service inspection or bring the device with original invoice and warranty card to the service center.',
      'Obtain an official Job Sheet / Technical Service Report documenting the verified manufacturing defect.',
      'If the defect cannot be repaired within reasonable time, request an official replacement or credit memo.',
    ],
    requiredEvidence: ['Tax invoice from authorized seller', 'Authorized service center Job Sheet / Inspection Report', 'Device serial number'],
    finePrintTrap: 'Never use unauthorized third-party repair shops during the warranty period, as tampering with internal screws voids manufacturer coverage.',
  },
  {
    id: 'scen-counterfeit',
    title: 'Suspected Inauthentic or Substandard Product',
    timeframe: 'Within 30 days of purchase',
    bestOutcome: 'Full refund and formal seller investigation',
    difficulty: 'Moderate',
    stepByStepAction: [
      'Document all physical anomalies: blurred printing on packaging, incorrect branding fonts, unverified serial numbers, or failed app pairing.',
      'Verify if the serial number is recognized on the official brand support portal (treated as a helpful verification signal).',
      'Contact customer support stating: "Item received appears inauthentic / counterfeit and does not meet manufacturer standards".',
      'If the marketplace does not resolve the ticket promptly, escalate through the platform\'s Grievance Officer and official consumer grievance channels.',
    ],
    requiredEvidence: ['Photos of packaging printing errors and mismatched serials', 'Screenshots of official brand portal error', 'Invoice and seller registered details'],
    finePrintTrap: 'Always purchase from authorized or highly-rated sellers with verified business credentials to minimize clone exposure.',
  },
];

export interface PolicyTerm {
  term: string;
  plainMeaning: string;
  consumerImpact: string;
  howToBypass: string;
}

export const RETURN_POLICY_TERMS: PolicyTerm[] = [
  {
    term: 'Replacement-Only Policy (e.g. 7-Day Replacement)',
    plainMeaning: 'The marketplace or seller policy provides an identical replacement unit rather than an immediate cash refund, unless the item is permanently out of stock.',
    consumerImpact: 'Refund cash is not credited back immediately; a replacement package is dispatched following courier pickup verification.',
    howToBypass: 'If the replacement unit also proves defective or out of stock, you are typically entitled to request a complete monetary refund.',
  },
  {
    term: 'Open-Box Delivery Verification',
    plainMeaning: 'A delivery verification protocol where the courier opens the secondary outer box in your presence before you provide the delivery OTP.',
    consumerImpact: 'Designed to verify that high-value electronics arrived intact without transit breakage or missing hardware before handover.',
    howToBypass: 'Inspect physical screen integrity and model markings carefully before sharing the OTP with the delivery executive.',
  },
  {
    term: 'Authorized Brand Job Sheet Requirement',
    plainMeaning: 'A formal technical inspection report issued by the brand\'s authorized service center verifying a manufacturing hardware defect.',
    consumerImpact: 'Some marketplaces require an authorized service job sheet before approving a return or replacement on opened tech items.',
    howToBypass: 'Visit the brand\'s nearest authorized service center with your retail tax invoice to obtain a documented technical diagnosis.',
  },
  {
    term: 'Category Non-Returnable Clauses',
    plainMeaning: 'Certain product categories (such as personal hygiene, opened software, or consumables) are marked non-returnable under standard remorse policies.',
    consumerImpact: 'You cannot return the product simply because you changed your mind after delivery.',
    howToBypass: 'Non-returnable clauses apply to buyer remorse; they do not preclude remedies if the product arrived physically damaged, broken, or fundamentally mismatched.',
  },
];

export interface ConsumerGrievanceChannel {
  channelName: string;
  scope: string;
  guidanceSummary: string;
  practicalApplication: string;
}

export const CONSUMER_GRIEVANCE_CHANNELS: ConsumerGrievanceChannel[] = [
  {
    channelName: 'E-Commerce Platform Grievance Officer',
    scope: 'Marketplace Escalation',
    guidanceSummary: 'Under national e-commerce rules in India, every registered shopping platform must appoint a dedicated Grievance Officer to handle unresolved customer complaints.',
    practicalApplication: 'If frontline customer support fails to resolve a valid return, submit your ticket and invoice evidence directly to the Grievance Officer contact listed on the platform website.',
  },
  {
    channelName: 'National Consumer Helpline (NCH / DCA)',
    scope: 'Government Pre-Litigation Resolution',
    guidanceSummary: 'The Department of Consumer Affairs operates the National Consumer Helpline (consumerhelpline.gov.in / Dial 1915) to facilitate resolution between consumers and registered companies.',
    practicalApplication: 'If a seller or platform refuses to honor published replacement policies for defective goods, register a grievance on the NCH portal with your invoice and chat transcript.',
  },
  {
    channelName: 'Payment Provider & Banking Transaction Dispute',
    scope: 'Financial Transaction Dispute',
    guidanceSummary: 'Payment networks and issuing banks maintain formal transaction dispute mechanisms for goods not received, unauthorized debits, or unfulfilled merchant commitments.',
    practicalApplication: 'If an order was canceled or returned but the merchant has not credited funds within stated settlement timelines, contact your card issuing bank to file a transaction dispute.',
  },
  {
    channelName: 'Authorized Brand Service Network',
    scope: 'Manufacturer Warranty Channel',
    guidanceSummary: 'Hardware manufacturers operate authorized service networks to diagnose and repair verified manufacturing defects during the warranty period.',
    practicalApplication: 'Always retain your original tax invoice PDF. Presenting the invoice and original warranty card at an authorized center ensures repairs use authentic OEM components.',
  },
];

// Retain alias for backwards compatibility
export const CONSUMER_RIGHTS_ITEMS = CONSUMER_GRIEVANCE_CHANNELS;

export function getInteractiveGuideBySlug(slug: string): InteractiveGuideMeta | undefined {
  return INTERACTIVE_BUYING_GUIDES.find((g) => g.slug === slug);
}

export function getAllInteractiveGuides(): InteractiveGuideMeta[] {
  return INTERACTIVE_BUYING_GUIDES;
}

