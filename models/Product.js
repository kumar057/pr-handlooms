import mongoose from "mongoose"

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: "text" },
    category: {
      type: String,
      required: true,
      enum: ["Banarasi", "Kanjivaram", "Paithani", "Chanderi", "Bandhani"],
      index: true,
    },
    price: { type: Number, required: true, index: true },
    images: [{ type: String, required: true }],
    description: { type: String, required: true, index: "text" },
    inStock: { type: Boolean, default: true, index: true },
    occasion: {
      type: String,
      enum: ["Wedding", "Festive", "Casual", "Party"],
      index: true,
    },
    color: { type: String, required: true, index: true },
    material: { type: String, required: true, index: true },
  },
  { timestamps: true },
)

ProductSchema.index({
  name: "text",
  category: "text",
  color: "text",
  occasion: "text",
  material: "text",
  description: "text",
})

export default mongoose.models.Product || mongoose.model("Product", ProductSchema)
