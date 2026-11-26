import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

const demoSeller = {
  name: "ShopEase Demo Seller",
  email: "seller@shopease.test",
  password: "ShopEaseSeller123!",
};

const products = [
  {
    name: "Sunday Morning Ceramic Mug", category: "Home", price: 799, stock: 32, badge: "A little favorite",
    description: "A quietly beautiful stoneware mug with a soft, tactile glaze. Made for slow mornings, second cups, and all the small rituals in between.",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "The Everyday Linen Throw", category: "Home", price: 2499, stock: 18, badge: "Thoughtfully made",
    description: "A breathable, beautifully textured layer for the sofa, the bed, or a picnic that runs a little longer. Woven from soft, natural-feel linen.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Arc Table Lamp", category: "Home", price: 3299, stock: 12, badge: "New in",
    description: "A sculptural little lamp that turns the evening glow into something special. Minimal, warm, and made to find its place anywhere.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "The Weekend Carryall", category: "Accessories", price: 1899, stock: 25, badge: "Ready when you are",
    description: "Room for the essentials and the unexpected. A lightweight, everyday carryall with thoughtful pockets and an easy, goes-with-everything shape.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Soft Form Ceramic Vase", category: "Home", price: 1199, stock: 20, badge: "",
    description: "A hand-finished ceramic vase with a gentle, organic silhouette. Just as lovely with fresh stems as it is doing its own thing.",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Pocket Speaker Mini", category: "Tech", price: 2799, stock: 14, badge: "Big sound, small size",
    description: "Your soundtrack, wherever the day takes you. This compact wireless speaker pairs rich, room-filling sound with a design you’ll want to leave out.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Little Moments Journal", category: "Accessories", price: 599, stock: 48, badge: "",
    description: "A lovely place for the lists, sketches, plans, and things you don’t want to forget. A thoughtfully made notebook for whatever you need it to be.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Everyday Glass Carafe", category: "Home", price: 1499, stock: 16, badge: "Just in",
    description: "A simple, elegant glass carafe that makes even a glass of water feel like a small occasion. Beautiful on the table, useful all day.",
    image: "https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=900&q=85",
  },
];

try {
  await connectDatabase();
  for (const product of products) {
    await Product.updateOne({ name: product.name }, { $setOnInsert: product }, { upsert: true, runValidators: true });
  }
  console.log(`Seeded ${products.length} sample ShopEase products (existing products were preserved).`);
  if (process.env.NODE_ENV === "production") {
    console.log("Skipped demo seller account in production.");
  } else {
    const existingSeller = await User.findOne({ email: demoSeller.email });
    if (!existingSeller) {
      await User.create({ ...demoSeller, role: "seller" });
      console.log(`Created demo seller account: ${demoSeller.email}`);
    } else if (existingSeller.role === "seller") {
      console.log(`Demo seller account already exists: ${demoSeller.email}`);
    } else {
      throw new Error(`Cannot seed demo seller: ${demoSeller.email} is already registered as a non-seller account`);
    }
  }
} catch (error) {
  console.error("Could not seed sample products:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
