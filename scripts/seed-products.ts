import { db } from "../server/db";
import { products } from "../shared/schema";

const FINISHES = [
  { code: "none", label: "Brut", abbr: "B" },
  { code: "cold", label: "Zingué", abbr: "Z" },
  { code: "hot", label: "Zingué à chaud", abbr: "ZC" },
  { code: "acier", label: "Acier", abbr: "A" },
];

const DIAMETERS_FULL = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30];
const DIAMETERS_POELIER = [4, 5, 6, 8];
const DIAMETERS_FROM_12 = [12, 14, 16, 18, 20, 22, 24, 27, 30];
const ECROU_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30, 36];

function getLengths(maxLength: number): number[] {
  const lengths: number[] = [12, 16];
  for (let l = 20; l <= 85 && l <= maxLength; l += 5) {
    lengths.push(l);
  }
  for (let l = 90; l <= maxLength; l += 10) {
    lengths.push(l);
  }
  return lengths;
}

const LENGTHS_200 = getLengths(200);
const LENGTHS_150 = getLengths(150);

interface ProductData {
  name: string;
  sku: string;
  finish: string;
  size: string;
}

function generateSKU(categoryAbbr: string, finishAbbr: string, diameter: number | null, length: number | null): string {
  if (diameter && length) {
    return `${categoryAbbr}${finishAbbr}${diameter}${length}`;
  } else if (diameter) {
    return `${categoryAbbr}${finishAbbr}${diameter}`;
  }
  return `${categoryAbbr}${finishAbbr}`;
}

function generateProducts(): ProductData[] {
  const allProducts: ProductData[] = [];

  function addProduct(
    category: string, 
    categoryAbbr: string,
    diameter: number | null, 
    length: number | null, 
    finish: typeof FINISHES[0], 
    sizeLabel: string
  ) {
    const name = length 
      ? `${category} ${finish.label} ${diameter}x${length}`
      : diameter 
        ? `${category} ${finish.label} ${sizeLabel}`
        : `${category} ${finish.label} ${sizeLabel}`;
    
    const sku = generateSKU(categoryAbbr, finish.abbr, diameter, length);
    
    allProducts.push({
      name,
      sku,
      finish: finish.code,
      size: sizeLabel,
    });
  }

  // 1. Boulon - 12 diameters × 28 lengths × 4 finishes
  for (const d of DIAMETERS_FULL) {
    for (const l of LENGTHS_200) {
      for (const f of FINISHES) {
        addProduct("Boulon", "B", d, l, f, `${d}x${l}`);
      }
    }
  }

  // 2. Boulon Poelier - 4 diameters × 23 lengths × 4 finishes
  for (const d of DIAMETERS_POELIER) {
    for (const l of LENGTHS_150) {
      for (const f of FINISHES) {
        addProduct("Boulon Poelier", "BP", d, l, f, `${d}x${l}`);
      }
    }
  }

  // 3. Boulon Tête Fraisée - 4 diameters × 23 lengths × 4 finishes
  for (const d of DIAMETERS_POELIER) {
    for (const l of LENGTHS_150) {
      for (const f of FINISHES) {
        addProduct("Boulon Tête Fraisée", "BTF", d, l, f, `${d}x${l}`);
      }
    }
  }

  // 4. Boulon Demi Filetage - 9 diameters × 28 lengths × 4 finishes
  for (const d of DIAMETERS_FROM_12) {
    for (const l of LENGTHS_200) {
      for (const f of FINISHES) {
        addProduct("Boulon Demi Filetage", "BDF", d, l, f, `${d}x${l}`);
      }
    }
  }

  // 5. Tige Filetée - 12 diameters × 1 length × 4 finishes
  for (const d of DIAMETERS_FULL) {
    for (const f of FINISHES) {
      addProduct("Tige Filetée", "TF", d, null, f, `${d}mm - 1m`);
    }
  }

  // 6. Ecrou - 13 sizes × 4 finishes
  for (const s of ECROU_SIZES) {
    for (const f of FINISHES) {
      addProduct("Ecrou", "E", s, null, f, `M${s}`);
    }
  }

  // 7. Rivet - 9 diameters × 28 lengths × 4 finishes
  for (const d of DIAMETERS_FROM_12) {
    for (const l of LENGTHS_200) {
      for (const f of FINISHES) {
        addProduct("Rivet", "R", d, l, f, `${d}x${l}`);
      }
    }
  }

  return allProducts;
}

async function seed() {
  console.log("Generating products with new SKU format...");
  const allProducts = generateProducts();
  console.log(`Total products to insert: ${allProducts.length}`);

  const batchSize = 500;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    await db.insert(products).values(batch);
    console.log(`Inserted ${Math.min(i + batchSize, allProducts.length)} / ${allProducts.length}`);
  }

  console.log("Done!");
  console.log("\nSample SKUs:");
  console.log("- Boulon Zingué 8x50:", generateSKU("B", "Z", 8, 50));
  console.log("- Boulon Brut 10x100:", generateSKU("B", "B", 10, 100));
  console.log("- Ecrou Acier M12:", generateSKU("E", "A", 12, null));
  console.log("- Tige Filetée Zingué à chaud 20:", generateSKU("TF", "ZC", 20, null));
  
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding products:", err);
  process.exit(1);
});
