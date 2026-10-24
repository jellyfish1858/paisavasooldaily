export interface CategoryFactor {
  factor: string;
  description: string;
}

export interface CategoryComparison {
  label: string;
  url: string;
  context: string;
}

export interface Subcategory {
  slug: string;
  name: string;
  description: string;
}

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  intro: {
    lead: string;
    details: string[];
  };
  whatMatters: CategoryFactor[];
  antiRegretConsiderations: string[];
  featuredProductIds: string[];
  guideSlugs: string[];
  suggestedComparisons: CategoryComparison[];
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    slug: "travel",
    name: "Travel",
    shortName: "Travel",
    tagline: "Trolley luggage, travel rucksacks, commuter backpacks, and packing accessories compared.",
    description:
      "Buying considerations, material durability analysis, and Anti-Regret decision support for cabin luggage, travel rucksacks, commuter bags, and transit gear.",
    intro: {
      lead:
        "Travel gear balances packing volume, baseline tare weight, hardware resilience, and airline dimensional constraints across transit environments.",
      details: [
        "Evaluating luggage, backpacks, and packing organizers involves inspecting shell polymers, zipper gauges, load distribution ergonomics, and airline carry-on allowances.",
        "We compare published exterior dimensions, tare weights, compartment layouts, and material durability based on verified manufacturer specifications.",
      ],
    },
    whatMatters: [
      {
        factor: "Shell Polymer & Fabric Denier",
        description:
          "Polypropylene and polycarbonate resist cracking under rough airport handling, while high-denier ripstop weaves prevent seam blowouts on loaded travel packs.",
      },
      {
        factor: "Spinner Wheels & Hardware Longevity",
        description:
          "Reinforced dual spinner wheel housings and heavy-duty coil zippers withstand airport terminal transit stresses without sudden mechanical failure.",
      },
      {
        factor: "Airline Carry-On Dimension Compliance",
        description:
          "Domestic and international cabin allowances (often 55 x 35 x 25 cm) dictate whether bags fit into overhead bins or incur unexpected gate-check fees.",
      },
      {
        factor: "Modular Organization & Weight Distribution",
        description:
          "Compression packing cubes and ergonomic harnesses balance volume and keep pack center of gravity aligned with the spine during long walking transit.",
      },
    ],
    antiRegretConsiderations: [
      "Confirm your primary airline's maximum carry-on dimensions including wheels and handles before selecting rigid luggage.",
      "Check zipper construction and seam reinforcement on main compartments that experience frequent tension.",
      "For commuter backpacks, verify the presence of a suspended laptop sleeve with a false bottom to protect electronics.",
    ],
    featuredProductIds: [
      "750b24bf-b524-498f-9f81-8652e54f028d", // FLYNGO Windproof Umbrella
      "bb4ba26d-b6c6-4766-9bbd-1b323c979198", // Aristocrat Airpro Max Set of 3 Trolley Bags
      "6619b458-2355-4d1d-93a6-274f32aee7ef", // Gear Classic 6 Laptop Backpack
      "4ad2472f-d973-45fa-ba8f-8275eece0a8c", // Flyngo 8 Pcs Packing Cubes
      "3f4c9827-0e0c-40f8-a5b5-585a4abc6df1", // DailyObjects Check-In Passport Wallet
      "7b01d27d-209d-44ea-9b99-9a74e9a22199", // Wildcraft Expedition RSK 45 Rucksack
      "d766c92a-0afc-4886-9c6e-433199574a55", // Wosta Insulated Travel Coffee Mug 2.0
    ],
    guideSlugs: ["travel-gear-guide"],
    suggestedComparisons: [
      {
        label: "Hard-Sided Trolley Luggage vs 45L Expedition Rucksack",
        url: "/compare?ids=bb4ba26d-b6c6-4766-9bbd-1b323c979198,7b01d27d-209d-44ea-9b99-9a74e9a22199",
        context: "Compare airport terminal rolling mobility against flexible outdoor trail utility.",
      },
      {
        label: "Commuter Laptop Backpack vs Modular Packing Cubes",
        url: "/compare?ids=6619b458-2355-4d1d-93a6-274f32aee7ef,4ad2472f-d973-45fa-ba8f-8275eece0a8c",
        context: "Compare integrated backpack compartment organization against modular cube packing.",
      },
    ],
    subcategories: [
      { slug: "luggage-trolleys", name: "Luggage & Trolleys", description: "Hard-sided spinner luggage and checked transit bags." },
      { slug: "travel-backpacks", name: "Travel Backpacks & Rucksacks", description: "High-capacity travel packs and trekking rucksacks." },
      { slug: "commuter-bags", name: "Commuter Bags & Daypacks", description: "Daily laptop backpacks and anti-theft commuter packs." },
      { slug: "packing-organizers", name: "Packing & Luggage Organizers", description: "Compression packing cubes and modular luggage organizers." },
      { slug: "travel-wallets", name: "Travel Wallets & Document Organizers", description: "Passport covers and zippered transit travel folios." },
      { slug: "travel-comfort", name: "Travel Comfort & Transit Accessories", description: "Windproof travel umbrellas, neck pillows, and transit accessories." },
      { slug: "travel-drinkware", name: "Travel Drinkware & Commute Essentials", description: "Insulated travel tumblers and leakproof commute travel mugs." },
    ],
  },
  {
    slug: "beauty-personal-care",
    name: "Beauty & Personal Care",
    shortName: "Beauty & Personal Care",
    tagline: "Daily hygiene, bath bars, skincare essentials, and personal-care tools evaluated.",
    description:
      "Ingredient transparency, daily hygiene evaluations, and objective Anti-Regret decision support for bath essentials, personal care, and grooming.",
    intro: {
      lead:
        "Personal care products balance effective cleansing, formulation safety, skin barrier compatibility, and realistic expectations without marketing hyperbole.",
      details: [
        "Evaluating bath bars and personal care involves looking past miracle marketing claims to examine core surfactants, moisturizing bases, and ingredient safety.",
        "We analyze published ingredient lists, surfactant profiles, and user suitability to help you choose products that suit your skin type.",
      ],
    },
    whatMatters: [
      {
        factor: "Surfactant Mildness & Skin Barrier Respect",
        description:
          "Gentle, non-stripping cleansers protect the skin acid mantle, preventing dehydration and post-wash tightness.",
      },
      {
        factor: "Ingredient Transparency & Botanical Bases",
        description:
          "Clear disclosures of carrier oils and botanical extracts help buyers identify nourishing formulations and avoid synthetic irritants.",
      },
      {
        factor: "Realistic Efficacy vs Marketing Hyperbole",
        description:
          "Topical cleansers provide daily grime removal and gentle maintenance; they do not perform overnight miracle transformations.",
      },
      {
        factor: "Skin Type Compatibility",
        description:
          "Balancing clarifying performance for oily or humid conditions against nourishing formulations required for dry and sensitive skin.",
      },
    ],
    antiRegretConsiderations: [
      "Check the primary cleansing base—deep-cleansing soap bars can be drying for compromised skin barriers unless paired with immediate moisturizer.",
      "Disregard miracle claims like instant tan removal; skin renewal requires consistent gentle care and daily broad-spectrum sun protection.",
      "Patch test botanical extracts and essential oils if you have reactive or allergy-prone skin.",
    ],
    featuredProductIds: [
      "4bb03cfa-eaed-4876-8b0b-8c3490a1a40a", // Ghar Soaps Sandalwood & Saffron Magic Bar
    ],
    guideSlugs: [],
    suggestedComparisons: [],
    subcategories: [
      { slug: "bath-body-cleansing", name: "Bath, Body & Cleansing", description: "Solid bath bars, body washes, and gentle cleansers." },
      { slug: "skincare-essentials", name: "Skincare Essentials & Treatments", description: "Sunscreens, moisturizers, and barrier care serums." },
      { slug: "haircare-scalp", name: "Haircare & Scalp Health", description: "Sulphate-free shampoos, conditioners, and scalp treatments." },
      { slug: "grooming-hygiene", name: "Grooming & Personal Hygiene", description: "Deodorants, shaving essentials, and oral care." },
      { slug: "personal-care-tools", name: "Personal Care Tools & Accessories", description: "Microfiber hair wraps, silk pillowcases, and travel toiletry tools." },
    ],
  },
  {
    slug: "electronics-tech-accessories",
    name: "Electronics & Tech Accessories",
    shortName: "Electronics & Tech",
    tagline: "GaN chargers, high-wattage power banks, certified cables, and ergonomic tech gear compared.",
    description:
      "Buying considerations, power protocol verification, and Anti-Regret decision support for USB-PD chargers, power banks, cables, and workstation accessories.",
    intro: {
      lead:
        "Modern tech accessories balance charging standards, thermal dissipation, ergonomic comfort, and multi-device interoperability.",
      details: [
        "Choosing chargers, power banks, and cables requires checking supported USB Power Delivery protocols, dynamic wattage splitting, and safety certifications.",
        "We evaluate published USB-PD profiles, Programmable Power Supply (PPS) support, real-world watt-hour ratings, and ergonomic build specifications.",
      ],
    },
    whatMatters: [
      {
        factor: "USB-PD & PPS Protocol Compliance",
        description:
          "Programmable Power Supply (PPS) enables compatible devices to dynamically adjust voltage, preventing slow charging on modern smartphones.",
      },
      {
        factor: "Multi-Port Dynamic Wattage Allocation",
        description:
          "Multi-output chargers split total power across ports according to internal rules. Verifying single-port maximums ensures laptops receive adequate power under load.",
      },
      {
        factor: "True Energy Capacity (Watt-Hours)",
        description:
          "Power bank energy is best measured in Watt-hours (Wh) rather than nominal mAh, factoring in 15–25% DC-to-DC conversion losses.",
      },
      {
        factor: "Cable Wattage Rating & E-Marker Validation",
        description:
          "Cables above 60W require an integrated E-Marker chip to safely negotiate 100W (5A) or 240W charging speeds without thermal hazards.",
      },
    ],
    antiRegretConsiderations: [
      "Verify your laptop's minimum power threshold (such as 45W, 65W, or 100W) before selecting a compact multi-port charger.",
      "Check whether a multi-port charger briefly interrupts secondary ports when an additional device is connected.",
      "Pair high-wattage chargers with certified cables rated for your target wattage.",
    ],
    featuredProductIds: [
      "87d5f0bb-a6f0-48e6-8052-a826e18e2103", // GM 100W GaN Charger
      "48a3bcdf-273f-4935-9f47-353901faac2f", // URBN 65W Power Bank
      "bddf3207-b2ab-4f96-8ab7-261492885b66", // Samsung Type-C Cable
      "14241aaf-4c2d-4709-bc07-6101dfe8aa04", // Portronics Laptop Stand
    ],
    guideSlugs: ["portable-power-guide"],
    suggestedComparisons: [
      {
        label: "65W Power Bank vs 100W GaN Wall Charger",
        url: "/compare?ids=48a3bcdf-273f-4935-9f47-353901faac2f,87d5f0bb-a6f0-48e6-8052-a826e18e2103",
        context: "Compare portable battery reserve against maximum AC wall charging throughput based on published specifications.",
      },
    ],
    subcategories: [
      { slug: "wall-chargers", name: "Wall Chargers & Power Adapters", description: "GaN multi-port wall adapters and fast-charging power blocks." },
      { slug: "power-banks", name: "Power Banks & Portable Batteries", description: "High-wattage laptop batteries and travel power banks." },
      { slug: "cables", name: "Charging Cables & Interconnects", description: "100W/240W E-Marker certified USB-C cables and connectors." },
      { slug: "hubs-docks", name: "Hubs, Docks & Display Adapters", description: "Multi-port USB-C hubs, HDMI adapters, and commuter docks." },
      { slug: "desk-ergonomics", name: "Desk, Mounts & Ergonomic Tech Accessories", description: "Adjustable laptop risers, desk stands, and cable organizers." },
      { slug: "commuter-audio", name: "Commuter Audio & Device Protection", description: "Active noise-cancelling earbuds and protective device sleeves." },
    ],
  },
];

export function getAllCategories(): Category[] {
  return CATEGORIES;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();

  // Canonical slugs
  const exact = CATEGORIES.find((c) => c.slug === clean);
  if (exact) return exact;

  // Legacy slug aliases
  if (clean === "travel-gear" || clean === "everyday-carry") {
    return getCategoryBySlug("travel");
  }
  if (clean === "portable-power") {
    return getCategoryBySlug("electronics-tech-accessories");
  }

  return undefined;
}

/**
 * Resolves an active category from a product's category string or ID.
 */
export function getCategoryForProduct(categoryString?: string, productId?: string): Category | undefined {
  if (productId) {
    const byProduct = CATEGORIES.find((cat) => cat.featuredProductIds.includes(productId));
    if (byProduct) return byProduct;
  }

  if (!categoryString) return undefined;
  const clean = categoryString.toLowerCase().trim();

  // Direct canonical slug or name match
  if (
    clean === "travel" ||
    clean === "/category/travel" ||
    clean === "travel-gear" ||
    clean === "luggage & travel" ||
    clean === "travel accessories" ||
    clean === "travel & trekking gear" ||
    clean === "everyday carry" ||
    clean === "everyday  carry(edc)" ||
    clean === "everyday carry & commuter gear" ||
    clean === "tech & commuter accessories" ||
    clean.includes("luggage") ||
    clean.includes("travel") ||
    clean.includes("packing") ||
    clean.includes("rucksack") ||
    clean.includes("umbrella") ||
    clean.includes("passport") ||
    clean.includes("carry") ||
    clean.includes("backpack") ||
    clean.includes("mug")
  ) {
    return getCategoryBySlug("travel");
  }

  if (
    clean === "beauty & personal care" ||
    clean === "beauty-personal-care" ||
    clean === "/category/beauty-personal-care" ||
    clean === "personal care / beauty" ||
    clean.includes("beauty") ||
    clean.includes("personal care") ||
    clean.includes("bath") ||
    clean.includes("soap")
  ) {
    return getCategoryBySlug("beauty-personal-care");
  }

  if (
    clean === "electronics & tech accessories" ||
    clean === "electronics-tech-accessories" ||
    clean === "/category/electronics-tech-accessories" ||
    clean === "tech accessories" ||
    clean === "portable-power" ||
    clean === "portable power & charging" ||
    clean.includes("electronics") ||
    clean.includes("tech") ||
    clean.includes("power") ||
    clean.includes("charger") ||
    clean.includes("charging") ||
    clean.includes("cable") ||
    clean.includes("stand")
  ) {
    return getCategoryBySlug("electronics-tech-accessories");
  }

  return undefined;
}

/**
 * Resolves the parent category for a given buying guide slug.
 */
export function getCategoryByGuideSlug(guideSlug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.guideSlugs.includes(guideSlug));
}
