import { Product } from "../types";
import perfume20ml from "../imports/perfume-20ml.png";
import perfume50ml from "../imports/perfume-50ml.jpg";
import perfumeOil from "../imports/perfume-oil.jpg";

export const INITIAL_PRODUCTS: Product[] = [
  // ─── PERFUMES (20ml MRP 450/Sale 350, 50ml MRP 700/Sale 600) ───
  {
    id: 1,
    name: "Gulzaar",
    category: "Perfume",
    gender: "Unisex",
    occasion: "Evening",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Oud", "Floral", "Rose"],
    img: perfume20ml,
    description: "A rich, royal garden of aged Assam oud and fresh Bulgarian rose otto. Sophisticated and everlasting."
  },
  {
    id: 2,
    name: "Gustakhiyan",
    category: "Perfume",
    gender: "Women",
    occasion: "Night",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Floral", "Spicy", "Vanilla"],
    img: perfume20ml,
    description: "Rebellious tuberose and warm saffron layered with madagascar vanilla and cashmere wood."
  },
  {
    id: 3,
    name: "Samirah",
    category: "Perfume",
    gender: "Women",
    occasion: "Day",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Floral", "Fresh", "Citrus"],
    img: perfume20ml,
    description: "Bright bergamot and fresh jasmine blossom, settling into a clean white musk and skin trail."
  },
  {
    id: 4,
    name: "Inaayat",
    category: "Perfume",
    gender: "Unisex",
    occasion: "Evening",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Woody", "Smoky", "Amber"],
    img: perfume20ml,
    description: "A blessing of deep sandalwood and smoky benzoin resin, warmed with dry amber accords."
  },
  {
    id: 5,
    name: "Aroha",
    category: "Perfume",
    gender: "Unisex",
    occasion: "Day",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Woody", "Fresh", "Aromatic"],
    img: perfume20ml,
    description: "Earth vetiver and dry cedar wood, brightened by spicy black pepper and lemon zest."
  },
  {
    id: 6,
    name: "Siara",
    category: "Perfume",
    gender: "Women",
    occasion: "Day",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Floral", "Musky", "Fresh"],
    img: perfume20ml,
    description: "Delicate white lily petals, sweet golden peach, and soft cashmere musk."
  },
  {
    id: 7,
    name: "Rooh",
    category: "Perfume",
    gender: "Unisex",
    occasion: "Night",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Oud", "Patchouli", "Leather"],
    img: perfume20ml,
    description: "The soul of Arabic perfumery. Dark, intense leather, rich patchouli, and raw Assam oud."
  },
  {
    id: 8,
    name: "Ikhtiyaar",
    category: "Perfume",
    gender: "Men",
    occasion: "Night",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Smoky", "Tobacco", "Woody"],
    img: perfume20ml,
    description: "Power and choice. Rich tobacco leaves, warm tonka bean, and dry cedar wood."
  },
  {
    id: 9,
    name: "Aabshaar",
    category: "Perfume",
    gender: "Unisex",
    occasion: "Day",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Fresh", "Aquatic", "Vanilla"],
    img: perfume20ml,
    description: "Cascading fresh aquatic minerals, cool mint, and a warm salty-vanilla dry-down."
  },
  {
    id: 10,
    name: "Amaya",
    category: "Perfume",
    gender: "Women",
    occasion: "Evening",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Floral", "Gourmand", "Vanilla"],
    img: perfume20ml,
    description: "Enchanting night jasmine, warm buttery caramel, and sweet pod vanilla."
  },
  {
    id: 11,
    name: "Surkhab",
    category: "Perfume",
    gender: "Men",
    occasion: "Night",
    sizes: ["20ml", "50ml"],
    prices: { "20ml": 450, "50ml": 700 },
    salePrices: { "20ml": 350, "50ml": 600 },
    notes: ["Spicy", "Leather", "Amber"],
    img: perfume20ml,
    description: "A rare and fiery blend of cardamom, warm cinnamon, rich leather, and ambergris."
  },

  // ─── PERFUME OILS (8ml MRP 500/Sale 350) ───
  {
    id: 12,
    name: "Gulzaar Perfume Oil",
    category: "Oil",
    gender: "Unisex",
    occasion: "Evening",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Oud", "Floral", "Rose"],
    img: perfumeOil,
    description: "Concentrated nectar of aged Assam oud and Bulgarian rose suspended in golden jojoba oil."
  },
  {
    id: 13,
    name: "Gustakhiyan Perfume Oil",
    category: "Oil",
    gender: "Women",
    occasion: "Night",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Floral", "Spicy", "Vanilla"],
    img: perfumeOil,
    description: "Pure roll-on oil extract of tuberose, warm saffron, and vanilla bean in light coconut carrier."
  },
  {
    id: 14,
    name: "Inaayat Perfume Oil",
    category: "Oil",
    gender: "Unisex",
    occasion: "Evening",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Woody", "Smoky", "Amber"],
    img: perfumeOil,
    description: "Intense sandalwood and smoky benzoin resin roll-on, yielding an exceptional 12+ hour scent wear."
  },
  {
    id: 15,
    name: "Rooh Perfume Oil",
    category: "Oil",
    gender: "Unisex",
    occasion: "Night",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Oud", "Patchouli", "Leather"],
    img: perfumeOil,
    description: "Highly concentrated attar oil featuring raw Assam oud wood extract, leather, and patchouli."
  },
  {
    id: 16,
    name: "Amaya Perfume Oil",
    category: "Oil",
    gender: "Women",
    occasion: "Evening",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Floral", "Gourmand", "Vanilla"],
    img: perfumeOil,
    description: "Luminous night jasmine and warm caramel oil infusion. Rich and deeply intimate."
  },
  {
    id: 17,
    name: "Surkhab Perfume Oil",
    category: "Oil",
    gender: "Men",
    occasion: "Night",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Spicy", "Leather", "Amber"],
    img: perfumeOil,
    description: "Cardamom, hot cinnamon, and rich leather concentrated oil. Warm, bold, and magnetic."
  },
  {
    id: 18,
    name: "Ikhtiyaar Perfume Oil",
    category: "Oil",
    gender: "Men",
    occasion: "Night",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Smoky", "Tobacco", "Woody"],
    img: perfumeOil,
    description: "Concentrated tobacco leaf, warm tonka bean, and dry cedar wood roll-on oil."
  },
  {
    id: 19,
    name: "Aabshaar Perfume Oil",
    category: "Oil",
    gender: "Unisex",
    occasion: "Day",
    sizes: ["8ml"],
    prices: { "8ml": 500 },
    salePrices: { "8ml": 350 },
    notes: ["Fresh", "Aquatic", "Vanilla"],
    img: perfumeOil,
    description: "Pure roll-on oil extract of mineral sea spray, cool mint, and salty vanilla."
  }
];

export const BLENDS = [
  { name: "Gulzaar", subtitle: "Royal · Oud · Rose", img: perfume50ml },
  { name: "Gustakhiyan", subtitle: "Spicy · Vanilla · Intense", img: perfume20ml },
  { name: "Samirah", subtitle: "Floral · Fresh · Citrus", img: perfume50ml },
];

export const CATEGORIES = [
  { name: "Perfumes", emoji: "💨" },
  { name: "Oils", emoji: "💧" }
];

export const NOTES = [
  "Amber", "Citrus", "Earthy", "Floral", "Fresh", "Incense", "Leather", "Musky", "Oud", 
  "Patchouli", "Smoky", "Spicy", "Tobacco", "Vanilla", "Woody"
];

export const COLLECTIONS_LINKS = [
  "Perfumes", "Oils"
];

export const getProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(INITIAL_PRODUCTS), 100));
};

export const getProductById = async (id: number | string, products: Product[]): Promise<Product | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(products.find(p => String(p.id) === String(id))), 50));
};

export const getRelatedProducts = async (product: Product, products: Product[]): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const related = products.filter(p => p.id !== product.id && (p.category === product.category || p.notes.some(n => product.notes.includes(n))));
      resolve(related.slice(0, 4));
    }, 100);
  });
};

export function setProducts(newProducts: Product[]) {
  // Deprecated
}
