// /functions/api/inventory.js
export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10), 24);

  // Temporary demo data so your UI works immediately.
  const demo = [
    {
      title: "2020 TOYOTA RAV4 AWD • LE",
      image: "https://images.unsplash.com/photo-1553444828-9f8e47e3d3fc?q=80&w=1200&auto=format&fit=crop",
      kms: 103590, stock: "7299", price: "$27,995"
    },
    {
      title: "2018 HONDA ACCORD • EX-L",
      image: "https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1200&auto=format&fit=crop",
      kms: 152011, stock: "7328", price: "$22,995"
    },
    {
      title: "2020 HONDA CR-V 4x4 • EX-L",
      image: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=1200&auto=format&fit=crop",
      kms: 127277, stock: "7260", price: "$28,995"
    }
  ];

  return new Response(
    JSON.stringify({ items: demo.slice(0, limit) }),
    { headers: { "content-type": "application/json", "cache-control": "no-store" } }
  );
};
