/**
 * MSV Naturals Inspired Organic Product Catalog
 * Authentic cold-pressed wood/chekku oils, unprocessed wild forest honey,
 * A2 desi ghee, and heritage heirloom grains with full multi-variant inventory support.
 */

export const organicProducts = [
  {
    id: 1,
    name: "Wood-Pressed Groundnut Oil (Marachekku)",
    category: "Cold-Pressed Oils",
    basePrice: 195,
    rating: 4.9,
    reviewCount: 428,
    isTrending: true,
    isNew: false,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80",
      "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&q=80"
    ],
    description: "Extracted slowly using traditional Vaagai wood pestles at room temperature. Zero chemical refining, zero trans-fats, retaining native aroma and natural antioxidants.",
    highlights: [
      "100% Traditional Vaagai wood-pressed (Chekku)",
      "Zero chemicals, artificial preservatives, or argemone oil",
      "Rich in natural Vitamin E and heart-healthy monounsaturated fats",
      "High smoke point, perfect for daily Indian cooking and deep frying"
    ],
    specs: {
      "Extraction Method": "Cold-Pressed Wood Ghani (Chekku)",
      "Ingredients": "100% Single-Origin Farm Groundnuts",
      "Shelf Life": "12 Months from Pressing Date",
      "Packaging": "Eco-Friendly Glass Bottle / Food-Grade Tin"
    },
    // 📦 INVENTORY VARIANTS (Pack Sizes & Stock)
    variants: [
      {
        sku: "MSV-GND-500ML",
        size: "500 ml",
        price: 195,
        originalPrice: 220,
        stockQuantity: 45,
        isAvailable: true
      },
      {
        sku: "MSV-GND-1L",
        size: "1 Litre",
        price: 370,
        originalPrice: 420,
        stockQuantity: 28,
        isAvailable: true
      },
      {
        sku: "MSV-GND-5L",
        size: "5 Litre Tin",
        price: 1750,
        originalPrice: 1950,
        stockQuantity: 8,
        isAvailable: true
      }
    ]
  },
  {
    id: 2,
    name: "Raw Wild Multi-Flora Forest Honey",
    category: "Raw Honey",
    basePrice: 240,
    rating: 5.0,
    reviewCount: 615,
    isTrending: true,
    isNew: true,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80"
    ],
    description: "Ethically harvested from wild bee hives in deep Western Ghats and Nilgiri forests. Completely raw, unheated, unpasteurized, and naturally micro-filtered to preserve active bee pollen and therapeutic enzymes.",
    highlights: [
      "Directly sourced from indigenous tribal honey hunters",
      "Unheated and unpasteurized to protect natural enzymes",
      "Zero added sugar, corn syrup, or artificial flavoring",
      "Natural immunity booster with antimicrobial properties"
    ],
    specs: {
      "Harvest Origin": "Western Ghats & Nilgiri Wild Forests",
      "Type": "Multi-Flora Wild Honey",
      "Purity": "100% Raw & Unprocessed",
      "Packaging": "Airtight Glass Jar"
    },
    variants: [
      {
        sku: "MSV-HNY-250G",
        size: "250 grams",
        price: 240,
        originalPrice: 280,
        stockQuantity: 34,
        isAvailable: true
      },
      {
        sku: "MSV-HNY-500G",
        size: "500 grams",
        price: 450,
        originalPrice: 520,
        stockQuantity: 19,
        isAvailable: true
      },
      {
        sku: "MSV-HNY-1KG",
        size: "1 kg",
        price: 850,
        originalPrice: 980,
        stockQuantity: 0,
        isAvailable: false // Out of stock example!
      }
    ]
  },
  {
    id: 3,
    name: "Cold-Pressed Black Sesame (Gingelly) Oil",
    category: "Cold-Pressed Oils",
    basePrice: 220,
    rating: 4.8,
    reviewCount: 310,
    isTrending: false,
    isNew: false,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"
    ],
    description: "Traditional chekku gingelly oil pressed from native heirloom black sesame seeds blended with palm jaggery to moderate heat and bring authentic South Indian flavor.",
    highlights: [
      "Naturally wood-pressed with organic palm jaggery",
      "Rich source of Sesamol, Sesamolin, and Zinc",
      "Authentic base for traditional pickles, gravies, and oil pulling",
      "Zero chemical bleach, neutralizers, or mineral oils"
    ],
    specs: {
      "Source": "Native Black Sesame Seeds + Palm Jaggery",
      "Process": "Marachekku (Cold Pressed)",
      "Shelf Life": "12 Months",
      "Packaging": "UV-Protected Glass Bottle"
    },
    variants: [
      {
        sku: "MSV-SES-500ML",
        size: "500 ml",
        price: 220,
        originalPrice: 250,
        stockQuantity: 22,
        isAvailable: true
      },
      {
        sku: "MSV-SES-1L",
        size: "1 Litre",
        price: 420,
        originalPrice: 480,
        stockQuantity: 15,
        isAvailable: true
      }
    ]
  },
  {
    id: 4,
    name: "A2 Vedic Bilona Desi Cow Ghee",
    category: "A2 Dairy & Ghee",
    basePrice: 650,
    rating: 4.9,
    reviewCount: 520,
    isTrending: true,
    isNew: true,
    image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&q=80"
    ],
    description: "Prepared using the ancient Vedic Bilona two-way churning method from the curd of free-grazing indigenous Hallikar and Gir cows. Golden, aromatic, and granular texture.",
    highlights: [
      "Handcrafted from whole curd (Bilona method), never from raw cream",
      "Sourced exclusively from grass-fed native A2 Indian cows",
      "Rich in A2 beta-casein, butyric acid, and fat-soluble vitamins",
      "Traditional grainy (Danedar) texture with intoxicating aroma"
    ],
    specs: {
      "Cow Breed": "Indigenous Gir & Hallikar (A2)",
      "Method": "Vedic Bilona Churned (Cultured Curd)",
      "Storage": "Room temperature away from direct sunlight",
      "Packaging": "Food-grade Glass Jar"
    },
    variants: [
      {
        sku: "MSV-GHEE-250ML",
        size: "250 ml",
        price: 650,
        originalPrice: 720,
        stockQuantity: 18,
        isAvailable: true
      },
      {
        sku: "MSV-GHEE-500ML",
        size: "500 ml",
        price: 1250,
        originalPrice: 1390,
        stockQuantity: 11,
        isAvailable: true
      },
      {
        sku: "MSV-GHEE-1L",
        size: "1 Litre",
        price: 2400,
        originalPrice: 2650,
        stockQuantity: 4,
        isAvailable: true
      }
    ]
  },
  {
    id: 5,
    name: "Virgin Coconut Oil (Wood-Pressed)",
    category: "Cold-Pressed Oils",
    basePrice: 180,
    rating: 4.8,
    reviewCount: 290,
    isTrending: false,
    isNew: false,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
    ],
    description: "Pressed from naturally sun-dried sulphur-free copra of coastal coconut palms. Pure water-clear consistency with delicious natural coconut aroma.",
    highlights: [
      "100% Sulphur-free sun-dried native coconuts",
      "High concentration of Lauric Acid and MCTs",
      "Multi-purpose: Ideal for cooking, hair nourishment, and infant massage",
      "No chemical bleaching, deodorizing, or refining"
    ],
    specs: {
      "Source": "Coastal Tamil Nadu Coconut Orchards",
      "Purity": "100% Unrefined & Edible",
      "Shelf Life": "12 Months",
      "Packaging": "Glass Bottle"
    },
    variants: [
      {
        sku: "MSV-COC-500ML",
        size: "500 ml",
        price: 180,
        originalPrice: 210,
        stockQuantity: 30,
        isAvailable: true
      },
      {
        sku: "MSV-COC-1L",
        size: "1 Litre",
        price: 340,
        originalPrice: 390,
        stockQuantity: 14,
        isAvailable: true
      }
    ]
  },
  {
    id: 6,
    name: "Unpolished Mappillai Samba Heritage Rice",
    category: "Heritage Grains",
    basePrice: 120,
    rating: 4.9,
    reviewCount: 180,
    isTrending: true,
    isNew: false,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    description: "Ancient Tamil Nadu heirloom red rice traditionally consumed for stamina and vigor. Naturally unpolished, retaining the red bran layer, rich in dietary fiber and iron.",
    highlights: [
      "100% Organically cultivated native red rice variety",
      "Unpolished with bran layer intact",
      "Low Glycemic Index (GI), suitable for balanced diets",
      "Nutrient-dense with high magnesium, zinc, and iron"
    ],
    specs: {
      "Variety": "Mappillai Samba (Bridegroom Rice)",
      "Origin": "Cauvery Delta Basin Farmers",
      "Processing": "Cleaned, Destoned & Unpolished",
      "Packaging": "Food-grade Cotton / Zipper Pouch"
    },
    variants: [
      {
        sku: "MSV-RICE-1KG",
        size: "1 kg",
        price: 120,
        originalPrice: 140,
        stockQuantity: 50,
        isAvailable: true
      },
      {
        sku: "MSV-RICE-5KG",
        size: "5 kg Bag",
        price: 570,
        originalPrice: 650,
        stockQuantity: 20,
        isAvailable: true
      }
    ]
  }
];

export const organicCategories = [
  "All",
  "Cold-Pressed Oils",
  "Raw Honey",
  "A2 Dairy & Ghee",
  "Heritage Grains"
];

export default organicProducts;
