require("dotenv").config()

const mongoose = require("mongoose")

const sampleSarees = [
  {
    name: "Banarasi Maroon Bridal Silk Saree",
    category: "Banarasi",
    price: 18999,
    images: ["/products/banarasi-gold.png"],
    description: "Maroon Banarasi silk saree with antique gold zari for wedding ceremonies.",
    inStock: true,
    occasion: "Wedding",
    color: "Maroon",
    material: "Silk",
  },
  {
    name: "Kanjivaram Teal Temple Border Saree",
    category: "Kanjivaram",
    price: 15999,
    images: ["/products/kanjivaram-teal.png"],
    description: "Rich teal Kanjivaram saree with contrast temple border and silk body.",
    inStock: true,
    occasion: "Festive",
    color: "Teal",
    material: "Mulberry Silk",
  },
  {
    name: "Paithani Rose Gold Peacock Saree",
    category: "Paithani",
    price: 21999,
    images: ["/products/silk-rose.png"],
    description: "Rose Paithani silk saree with peacock-inspired pallu and gold zari.",
    inStock: true,
    occasion: "Wedding",
    color: "Rose",
    material: "Silk",
  },
  {
    name: "Chanderi Ivory Casual Cotton Silk Saree",
    category: "Chanderi",
    price: 4999,
    images: ["/products/dupatta-cream.png"],
    description: "Light ivory Chanderi cotton silk saree for daytime and casual wear.",
    inStock: true,
    occasion: "Casual",
    color: "Ivory",
    material: "Cotton Silk",
  },
  {
    name: "Bandhani Navy Festive Saree",
    category: "Bandhani",
    price: 6999,
    images: ["/products/silk-navy.png"],
    description: "Navy Bandhani saree with dotted tie-dye pattern for festive gatherings.",
    inStock: true,
    occasion: "Festive",
    color: "Navy",
    material: "Georgette",
  },
  {
    name: "Banarasi Emerald Party Wear Saree",
    category: "Banarasi",
    price: 12999,
    images: ["/products/silk-emerald.png"],
    description: "Emerald Banarasi silk saree with brocade motifs for party occasions.",
    inStock: false,
    occasion: "Party",
    color: "Emerald",
    material: "Silk",
  },
  {
    name: "Chanderi Indigo Handloom Saree",
    category: "Chanderi",
    price: 5499,
    images: ["/products/fabric-indigo.png"],
    description: "Indigo Chanderi handloom saree with airy texture and subtle zari lines.",
    inStock: true,
    occasion: "Casual",
    color: "Indigo",
    material: "Handloom Cotton",
  },
  {
    name: "Cotton Maroon Everyday Saree",
    category: "Bandhani",
    price: 3299,
    images: ["/products/cotton-maroon.png"],
    description: "Comfortable maroon cotton saree suited for casual daily drapes.",
    inStock: true,
    occasion: "Casual",
    color: "Maroon",
    material: "Cotton",
  },
]

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: "text" },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, index: true },
    images: [{ type: String, required: true }],
    description: { type: String, required: true, index: "text" },
    inStock: { type: Boolean, default: true, index: true },
    occasion: { type: String, index: true },
    color: { type: String, required: true, index: true },
    material: { type: String, required: true, index: true },
  },
  { timestamps: true },
)

productSchema.index({
  name: "text",
  category: "text",
  color: "text",
  occasion: "text",
  material: "text",
  description: "text",
})

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required to seed saree products.")
  }

  await mongoose.connect(process.env.MONGODB_URI)
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema)
  await Product.deleteMany({})
  await Product.insertMany(sampleSarees)
  await mongoose.disconnect()

  console.log(`Seeded ${sampleSarees.length} saree products.`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
