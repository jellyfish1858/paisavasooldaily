export interface InteractiveGuideMeta {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  readingTime: string;
  category: string;
  interactiveType: 'checklist' | 'quiz' | 'decision-tree' | 'calendar' | 'warranty-slider';
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
    bestToBuy: ['Fitness Equipment & Gym Apparel', 'Winter Coats & Boots', 'Bedding & Linens (White Sales)', 'Previous-Year Electronics (CES)'],
    strictlyAvoid: ['New Model Televisions (Wait for Super Bowl)', 'Spring Apparel (Full retail markup)'],
    strategyTip: 'Brands announce new electronics at CES in early January, causing retailers to aggressively discount previous-generation inventory.',
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
    bestToBuy: ['Big-Screen 4K Televisions (Pre-Super Bowl)', 'Mattresses (Presidents Day sales)', 'Winter Sports & Snow Gear'],
    strictlyAvoid: ['Jewelry & Perfumes (Valentine markup)', 'Spring Travel Bookings (Peak early demand)'],
    strategyTip: 'The 2 weeks before the Super Bowl feature the deepest television price cuts outside of Black Friday.',
    categoryHighlights: [
      { category: 'Home Entertainment', discountRange: '30-45% off', reason: 'Pre-Super Bowl TV inventory volume sales.' },
      { category: 'Mattresses', discountRange: '20-40% off', reason: 'Holiday weekend retail promotion cycles.' },
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
    strategyTip: 'March is a retail lull between major holidays. Hold off on major tech upgrades unless replacing broken gear.',
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
    bestToBuy: ['Major Kitchen Appliances (Memorial Day)', 'Mattresses & Bedframes', 'Spring Apparel (First markdowns)'],
    strictlyAvoid: ['Outdoor Grills & Smokers', 'Electronics & High-End Laptops'],
    strategyTip: 'Memorial Day weekend is one of the top three appliance and mattress buying windows of the entire calendar year.',
    categoryHighlights: [
      { category: 'Appliances', discountRange: '30-45% off', reason: 'Memorial Day manufacturer rebates.' },
      { category: 'Sleep & Mattresses', discountRange: '25-40% off', reason: 'Holiday bundle promotions with free bases.' },
    ],
  },
  {
    monthIndex: 5,
    monthName: 'June',
    season: 'Summer',
    savingsScore: 3,
    avgDiscount: '20% – 35%',
    bestToBuy: ['Power Tools & Hardware (Father\'s Day)', 'Lingerie & Undergarments (Semi-Annual sales)', 'Gym Memberships'],
    strictlyAvoid: ['Summer Apparel & Swimwear', 'Back-to-School Electronics'],
    strategyTip: 'Father\'s Day brings bundled cordless drill kits, socket sets, and toolboxes down to holiday parity.',
    categoryHighlights: [
      { category: 'Tools & Hardware', discountRange: '25-40% off', reason: 'Father\'s Day gift set promotions.' },
      { category: 'Apparel Essentials', discountRange: '30-50% off', reason: 'Semi-annual inventory resets.' },
    ],
  },
  {
    monthIndex: 6,
    monthName: 'July',
    season: 'Summer',
    savingsScore: 5,
    avgDiscount: '30% – 60%',
    bestToBuy: ['Tech Accessories, Chargers, Headphones (Prime Day)', 'Summer Clothing (Clearance begins)', 'Smart Home & Streaming Devices'],
    strictlyAvoid: ['Fall Fashion & Outerwear', 'Next-Gen Smartphones (September launches impending)'],
    strategyTip: 'Prime Day triggers retail-wide price-matching across Target, Best Buy, and Walmart. Focus on accessories and personal audio.',
    categoryHighlights: [
      { category: 'Consumer Tech', discountRange: '30-55% off', reason: 'Prime Day & competing mid-year retail events.' },
      { category: 'Smart Home', discountRange: '35-60% off', reason: 'Ecosystem lock-in promotional hardware loss-leaders.' },
    ],
  },
  {
    monthIndex: 7,
    monthName: 'August',
    season: 'Summer',
    savingsScore: 4,
    avgDiscount: '25% – 45%',
    bestToBuy: ['Laptops, Monitors & Student Tech', 'Backpacks & Commuter Bags', 'Outdoor Patio Furniture & Grills (Clearance)'],
    strictlyAvoid: ['iPhones & Apple Watches (New models debut in September)', 'Heaters & Winter Gear'],
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
    bestToBuy: ['Previous-Gen iPhones, Pixels & Apple Watches', 'Bicycles & Summer Sports Gear', 'Air Conditioners & Fans'],
    strictlyAvoid: ['Winter Coats & Cashmere', 'Holiday Toys & Gaming Consoles'],
    strategyTip: 'When new phone models are announced in September, outgoing models immediately drop $100–$200 with abundant certified refurbished stock.',
    categoryHighlights: [
      { category: 'Mobile Tech', discountRange: '20-35% off', reason: 'Carrier trade-in and inventory shifts on older flagships.' },
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
    strictlyAvoid: ['Televisions (Save for November)', 'Major Appliances (Save for Black Friday)'],
    strategyTip: 'October offers "Early Black Friday" teaser sales. Good for niche items, but hold out on big screens and electronics until late November.',
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
    bestToBuy: ['4K TVs, Soundbars & Home Audio', 'Tablets, Laptops & Smart Home', 'Kitchen Stand Mixers & Small Appliances', 'Noise-Canceling Headphones'],
    strictlyAvoid: ['Winter Sports Ski/Snowboard Gear (Peak prices)', 'Fine Jewelry & Gift Cards'],
    strategyTip: 'The single highest-volume discount window. Look for true price histories using tracking tools to ensure Black Friday sales are real.',
    categoryHighlights: [
      { category: 'Consumer Electronics', discountRange: '35-65% off', reason: 'Black Friday and Cyber Week flagship events.' },
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
      { category: 'Toys & Family', discountRange: '30-50% off', reason: 'Late holiday inventory panic markdowns.' },
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
      'Super Bowl TV waves: why February rivals Black Friday for large screen deals',
      'The CES effect: how January trade shows cause immediate previous-gen clearance',
      'The Prime Day ripple: mid-summer price matching across all major retailers',
      'Smart cycle timing: waiting for September announcements to buy discounted flagship phones',
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
      'Credit card double-coverage: unlocking 1–2 extra years of free warranty protection',
      'Store extended warranty economics: why 80% are overpriced profit margins',
      'Accidental damage handling (ADH): when screen and spill coverage is actually justified',
    ],
    ctaCollectionSlug: 'everyday-essentials',
    ctaCollectionName: 'Explore Reliable Everyday Essentials',
  },
];

export function getInteractiveGuideBySlug(slug: string): InteractiveGuideMeta | undefined {
  return INTERACTIVE_BUYING_GUIDES.find((g) => g.slug === slug);
}

export function getAllInteractiveGuides(): InteractiveGuideMeta[] {
  return INTERACTIVE_BUYING_GUIDES;
}
