export const sampleProducts = [
  {
    _id: "sample-sunday-mug", name: "Sunday Morning Ceramic Mug", category: "Home", price: 799, stock: 32, badge: "A little favorite", rating: 4.8, reviewCount: 24,
    description: "A quietly beautiful stoneware mug with a soft, tactile glaze. Made for slow mornings, second cups, and all the small rituals in between.",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-linen-throw", name: "The Everyday Linen Throw", category: "Home", price: 2499, stock: 18, badge: "Thoughtfully made", rating: 4.9, reviewCount: 18,
    description: "A breathable, beautifully textured layer for the sofa, the bed, or a picnic that runs a little longer. Woven from soft, natural-feel linen.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-arc-lamp", name: "Arc Table Lamp", category: "Home", price: 3299, stock: 12, badge: "New in", rating: 4.7, reviewCount: 11,
    description: "A sculptural little lamp that turns the evening glow into something special. Minimal, warm, and made to find its place anywhere.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-carryall", name: "The Weekend Carryall", category: "Accessories", price: 1899, stock: 25, badge: "Ready when you are", rating: 4.8, reviewCount: 31,
    description: "Room for the essentials and the unexpected. A lightweight, everyday carryall with thoughtful pockets and an easy, goes-with-everything shape.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-ceramic-vase", name: "Soft Form Ceramic Vase", category: "Home", price: 1199, stock: 20, badge: "", rating: 4.6, reviewCount: 9,
    description: "A hand-finished ceramic vase with a gentle, organic silhouette. Just as lovely with fresh stems as it is doing its own thing.",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-pocket-speaker", name: "Pocket Speaker Mini", category: "Tech", price: 2799, stock: 14, badge: "Good sound, small package", rating: 4.9, reviewCount: 27,
    description: "Your soundtrack, wherever the day takes you. This compact wireless speaker pairs rich, room-filling sound with a design you’ll want to leave out.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-journal", name: "Little Moments Journal", category: "Accessories", price: 599, stock: 48, badge: "", rating: 4.7, reviewCount: 42,
    description: "A lovely place for the lists, sketches, plans, and things you don’t want to forget. A thoughtfully made notebook for whatever you need it to be.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85",
  },
  {
    _id: "sample-carafe", name: "Everyday Glass Carafe", category: "Home", price: 1499, stock: 16, badge: "Just in", rating: 4.8, reviewCount: 13,
    description: "A simple, elegant glass carafe that makes even a glass of water feel like a small occasion. Beautiful on the table, useful all day.",
    image: "https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=900&q=85",
  },
];

export function filterSampleProducts({ search = "", category = "", sort = "popular", maxPrice = "" } = {}) {
  const query = search.trim().toLowerCase();
  const matches = sampleProducts.filter((product) =>
    (!category || product.category.toLowerCase() === category.toLowerCase()) &&
    (!maxPrice || product.price <= Number(maxPrice)) &&
    (!query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query)),
  );
  if (sort === "price-asc") matches.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") matches.sort((a, b) => b.price - a.price);
  else if (sort === "newest") matches.reverse();
  else matches.sort((a, b) => b.reviewCount - a.reviewCount);
  return matches;
}
