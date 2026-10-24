export interface BuyingGuideFactor {
  factor: string;
  explanation: string;
  keyDetail: string;
}

export interface BuyingGuideTradeOff {
  compromise: string;
  explanation: string;
}

export interface BuyingGuideFaq {
  question: string;
  answer: string;
}

export interface BuyingGuide {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  lastUpdated: string;
  readingTime: string;
  intro: {
    lead: string;
    context: string[];
  };
  whoThisIsFor: string[];
  whatMatters: BuyingGuideFactor[];
  tradeOffs: BuyingGuideTradeOff[];
  compatibilityConsiderations: string[];
  researchedProductIds: string[];
  checklist: string[];
  faqs: BuyingGuideFaq[];
}

export const BUYING_GUIDES: BuyingGuide[] = [
  {
    slug: "portable-power-guide",
    title: "How to Choose Portable Power: Chargers, Power Banks & What Actually Matters",
    subtitle:
      "A technical decision guide on USB-PD standards, GaN semiconductor efficiency, true power delivery profiles, and battery capacity trade-offs.",
    category: "Electronics & Tech Accessories",
    lastUpdated: "2026-09-18",
    readingTime: "7 min read",
    intro: {
      lead:
        "Modern USB-C hardware promises universal charging, but mismatched protocols, deceptive wattage marketing, and thermal constraints often lead to buyer regret.",
      context: [
        "Choosing between a wall charger and a power bank — or selecting the right output wattage — is rarely as simple as buying the largest number on the box.",
        "Charging speed is limited by the lowest common denominator between the power source, the cable, and the device's internal power management controller.",
        "This guide outlines the technical factors that dictate actual charging performance, device safety, and portability.",
      ],
    },
    whoThisIsFor: [
      "Laptop and MacBook users needing reliable 45W–100W Power Delivery on the go",
      "Frequent commuters and business travelers carrying multiple USB-C devices",
      "Buyers frustrated by slow charging or bulky OEM charging bricks",
      "Anyone trying to consolidate their desk and travel setups to a single charger",
    ],
    whatMatters: [
      {
        factor: "Gallium Nitride (GaN) vs. Silicon Architecture",
        explanation:
          "GaN semiconductors operate at higher voltages and switch power faster with less heat generation than traditional silicon. This allows manufacturers to shrink charger footprints by up to 50% while maintaining 65W–100W outputs.",
        keyDetail: "GaN chargers run cooler and fit easily into travel bags without thermal throttling.",
      },
      {
        factor: "Power Delivery (USB-PD 3.0 / PPS) Profiles",
        explanation:
          "High wattage alone does not guarantee fast charging. Modern smartphones (like Samsung and Pixel) and tablets require Programmable Power Supply (PPS) to dynamically adjust voltage in real time. Without PPS, a 100W charger may drop back to standard 15W–18W speeds.",
        keyDetail: "Verify PPS protocol support if fast-charging modern smartphones.",
      },
      {
        factor: "Rated Capacity vs. Usable Energy in Power Banks",
        explanation:
          "A 20,000 mAh battery cell rated at 3.7V holds roughly 74 Watt-hours (Wh) of potential energy. Because DC-to-DC conversion to 5V, 9V, or 20V introduces heat and conversion inefficiency (typically 15–25%), the real-world delivered capacity is usually 14,000–16,000 mAh.",
        keyDetail: "Always calculate capacity in Watt-hours (Wh) rather than raw milliamp-hours (mAh).",
      },
      {
        factor: "Dynamic Port Splitting & Multi-Device Throttling",
        explanation:
          "When a multi-port charger advertises 100W, that rating is almost always for a single port in use. Plugging in a second or third device triggers internal power reallocation, often dropping the primary port to 45W or 65W.",
        keyDetail: "Confirm the multi-port wattage distribution table before assuming full speed across multiple devices.",
      },
    ],
    tradeOffs: [
      {
        compromise: "High Capacity vs. Weight & Airline Regulations",
        explanation:
          "A 20,000 mAh power bank offers multiple laptop recharges but weighs 350g–500g. International aviation regulations (FAA/DGCA) prohibit power banks exceeding 100Wh (approx. 27,000 mAh) without airline approval.",
      },
      {
        compromise: "Multi-Port Versatility vs. Full Single-Device Throughput",
        explanation:
          "Adding secondary USB-A and USB-C ports introduces internal power negotiation chips that briefly disconnect active devices when a new cable is plugged in.",
      },
      {
        compromise: "Ultra-Compact Footprint vs. Sustained Thermal Dissipation",
        explanation:
          "Smaller GaN chargers warm up significantly during continuous high-load sessions (e.g., charging a demanding laptop from 0% to 100%). Quality thermal dissipation materials are required to avoid automatic wattage throttling.",
      },
    ],
    compatibilityConsiderations: [
      "Laptops: Most modern ultrabooks require a minimum of 45W to charge while in active use; 65W is recommended for simultaneous operation and battery recovery.",
      "Cables: Standard USB-C to USB-C cables are limited to 60W (3A). For 65W–100W speeds, an E-Marker certified 100W (5A) cable is strictly required.",
      "Pass-Through Charging: Ensure the power bank supports pass-through charging if you intend to recharge the battery and your phone simultaneously overnight.",
    ],
    researchedProductIds: [
      "87d5f0bb-a6f0-48e6-8052-a826e18e2103", // GM 100W GaN Charger
      "48a3bcdf-273f-4935-9f47-353901faac2f", // URBN 20000 mAh 65W Power Bank
      "bddf3207-b2ab-4f96-8ab7-261492885b66", // Samsung Type-C to C Cable
    ],
    checklist: [
      "Confirm your primary laptop or phone's maximum supported charging wattage (e.g., 25W, 45W, 65W, 100W).",
      "Verify whether your device requires USB-PD PPS for full-speed fast charging.",
      "Ensure your USB-C charging cable supports 5A/100W if using chargers over 60W.",
      "Check the physical dimensions and weight if intended for everyday jacket or bag carry.",
      "For power banks, verify that the battery cell rating is under 100Wh if you plan to fly.",
      "Review the multi-port wattage distribution table if charging multiple devices concurrently.",
    ],
    faqs: [
      {
        question: "Can a 100W charger damage a device that only requires 20W?",
        answer:
          "No. USB Power Delivery operates through smart two-way negotiation. The charger communicates available voltage/amperage profiles, and the receiving device pulls only the specific wattage its battery management system requests.",
      },
      {
        question: "Why does my 20,000 mAh power bank not give four full charges to a 5,000 mAh phone?",
        answer:
          "Power bank internal cells operate at 3.7V, whereas charging occurs at 5V, 9V, or higher. Voltage step-up conversion, cable resistance, and phone thermal management cause standard energy losses of 15–25%.",
      },
      {
        question: "Does GaN technology make charging faster than traditional silicon?",
        answer:
          "GaN itself does not increase the top charging speed; rather, it increases energy efficiency and thermal dissipation. This allows manufacturers to build significantly smaller, lighter chargers that can sustain high outputs without overheating.",
      },
    ],
  },
  {
    slug: "travel-gear-guide",
    title: "Travel Gear & Organization: How to Evaluate Packing Cubes, Rucksacks & Luggage",
    subtitle:
      "An engineering and ergonomic guide to durability, fabric denier, zipper reliability, weight distribution, and carry-on dimension compliance.",
    category: "Travel",
    lastUpdated: "2026-09-17",
    readingTime: "6 min read",
    intro: {
      lead:
        "Travel equipment often fails at the seams, zippers, or airport scales. Choosing gear that survives rough transit requires looking past marketing claims to structural specifications.",
      context: [
        "Luggage marketing relies heavily on lifestyle imagery rather than material disclosures.",
        "Fabric density (denier ratings), zipper grade, polycarbonate shell composition, and internal compression systems dictate whether gear lasts years or splits open mid-transit.",
        "This guide breaks down the physical characteristics that matter when organizing luggage and selecting travel packs.",
      ],
    },
    whoThisIsFor: [
      "Frequent air travelers seeking to maximize carry-on space and avoid checked bag fees",
      "Outdoor trekkers needing ergonomic weight distribution on multi-day journeys",
      "Business commuters transporting laptops, documents, and fragile electronics",
      "Anyone looking to streamline packing with modular compartment systems",
    ],
    whatMatters: [
      {
        factor: "Material Strength: Denier Ratings & Ripstop Weaves",
        explanation:
          "Fabric strength is measured in denier (D). Lightweight daypacks use 210D–420D nylon, while rugged travel gear uses 600D–1000D polyester or Cordura nylon. Ripstop patterns incorporate cross-hatch reinforcement threads to stop tears from spreading.",
        keyDetail: "Look for high denier in high-abrasion zones like the bottom panel and corner seams.",
      },
      {
        factor: "Zipper Quality & Stitching Reinforcement",
        explanation:
          "Zippers are the primary point of mechanical failure on travel bags. Self-repairing coil zippers from reputable manufacturers (such as YKK) withstand internal over-packing pressure far better than generic teeth zippers.",
        keyDetail: "Bar-tack stitching at stress points (where straps meet the bag) prevents seam blowouts.",
      },
      {
        factor: "Hardshell vs. Softside Luggage Durability",
        explanation:
          "100% polycarbonate shells flex under impact and pop back into shape. Cheaper ABS plastic is more rigid but brittle, cracking easily under sub-zero cargo bay temperatures. Softside nylon offers exterior pocket accessibility and flexible expansion.",
        keyDetail: "Choose pure polycarbonate for impact resistance or ballistic nylon for exterior organization.",
      },
      {
        factor: "Modular Compression & Volume Optimization",
        explanation:
          "Packing cubes and compression sacks do not reduce weight, but they eliminate trapped air and prevent clothing from shifting. Compression zippers allow users to condense soft clothing volume by up to 30%.",
        keyDetail: "Modular cubes divide clean clothes, laundry, and tech cables into instantly accessible zones.",
      },
    ],
    tradeOffs: [
      {
        compromise: "Heavy-Duty Materials vs. Baseline Bag Weight",
        explanation:
          "1000D ballistic nylon and reinforced aluminum trolley frames offer maximum longevity but consume 1.5kg–3kg of your airline carry-on allowance before packing a single item.",
      },
      {
        compromise: "Maximum Compartmentalization vs. Interior Volume Efficiency",
        explanation:
          "Bags with dozens of built-in zippered pockets add fabric weight and restrict how you pack large bulky items compared to a cavernous open compartment organized with independent cubes.",
      },
      {
        compromise: "Hardshell Weather Resistance vs. Quick-Access Pockets",
        explanation:
          "Hardshell suitcases protect fragile contents from rain and drops but require opening the entire clam-shell flat to access a laptop or passport during airport security.",
      },
    ],
    compatibilityConsiderations: [
      "Airline Sizing: Standard domestic and international overhead carry-on dimensions typically cap at 55 x 35 x 25 cm (including wheels and handles). Always measure total outer dimensions.",
      "Laptop Sleeves: Ensure backpack laptop compartments feature a false bottom (a 1-inch gap between the sleeve bottom and the bag floor) to protect laptops from direct floor impacts.",
      "Trolley Sleeves: Commuter backpacks should feature a rear luggage pass-through strap to mount securely over rolling suitcase handles.",
    ],
    researchedProductIds: [
      "bb4ba26d-b6c6-4766-9bbd-1b323c979198", // Aristocrat Airpro Max Set of 3 Trolley Bags
      "7b01d27d-209d-44ea-9b99-9a74e9a22199", // Wildcraft Expedition RSK 45 Rucksack
      "4ad2472f-d973-45fa-ba8f-8275eece0a8c", // Flyngo 8 Pcs Travel Organizer Pouch Packing Cubes
      "6619b458-2355-4d1d-93a6-274f32aee7ef", // Gear Classic 6 Antitheft Laptop Backpack
    ],
    checklist: [
      "Confirm total exterior dimensions (including wheels and handles) against your primary airline carry-on limits.",
      "Check empty bag weight to ensure it leaves adequate allowance for personal gear.",
      "Verify zipper grade and ensure primary zippers feature lockable pull tabs.",
      "Examine backpack harness ergonomics: padded hip belts and sternum straps are essential for loads exceeding 7kg.",
      "Ensure laptop sleeves include bottom padding and suspend the device above ground level.",
      "Use packing cubes to separate damp or soiled clothing from clean garments.",
    ],
    faqs: [
      {
        question: "Are packing cubes worth the extra weight?",
        answer:
          "Yes. Quality ultralight nylon cubes weigh only 30g–60g each. They prevent clothes from wrinkling, compress bulky fabrics, and allow airport security inspections without dismantling your entire suitcase.",
      },
      {
        question: "What is the difference between ABS and Polycarbonate luggage?",
        answer:
          "ABS is a rigid, cheaper plastic that tends to crack when subjected to heavy impacts or cold cargo bay conditions. Polycarbonate is flexible; it bends to absorb shock and snaps back to its original shape without fracturing.",
      },
      {
        question: "Can a 45L rucksack be used as a flight carry-on?",
        answer:
          "It depends on the pack's frame dimensions. Many 40L–45L packs fit within overhead dimensions if not over-stuffed, but rigid internal frames exceeding 55cm in length will require gate checking.",
      },
    ],
  },
];

export function getAllGuides(): BuyingGuide[] {
  return BUYING_GUIDES;
}

export function getGuideBySlug(slug: string): BuyingGuide | null {
  return BUYING_GUIDES.find((g) => g.slug === slug) || null;
}
