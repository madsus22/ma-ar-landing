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

// functions/api/inventory.js
// Cloudflare Pages Function
const SOURCE = 'https://alfaromeowinnipeg.ca/inventory-page-used';

export async function onRequest() {
  try {
    const resp = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await resp.text();

    // --- 1) Try JSON-LD first (common on dealership sites) ---
    const ldMatches = [...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    )];

    let items = [];
    for (const m of ldMatches) {
      try {
        const block = JSON.parse(m[1].trim());
        const asArray = Array.isArray(block) ? block : [block];
        for (const b of asArray) {
          // Vehicle schema or Product schema with vehicle-ish fields
          if (
            (b['@type'] && String(b['@type']).toLowerCase().includes('vehicle')) ||
            (b.productID && (b.brand || b.model))
          ) {
            const name =
              b.name ||
              [b.brand?.name || b.brand, b.model?.name || b.model, b.vehicleModelDate || b.modelDate]
                .filter(Boolean)
                .join(' ')
                .trim();

            const price =
              b.offers?.priceCurrency && b.offers?.price
                ? `${b.offers.priceCurrency} ${b.offers.price}`
                : b.offers?.price || null;

            const mileage =
              b.mileage?.value ? `${b.mileage.value} ${b.mileage.unitText || 'km'}` : null;

            const image =
              Array.isArray(b.image) ? b.image[0] : b.image || null;

            const url = b.url || b.offers?.url || SOURCE;

            items.push({ title: name || 'Vehicle', price, mileage, image, url });
          }
        }
      } catch (_) { /* ignore json parse errors */ }
    }

    // --- 2) Fallback: scrape common card markup (very light/forgiving) ---
    if (!items.length) {
      const cardRegex = /<article[\s\S]*?class=["'][^"']*(vehicle|inventory|card)[^"']*["'][\s\S]*?<\/article>/gi;
      const titleRegex = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/i;
      const priceRegex = /(Price|Sale Price|Our Price)[^$]*\$[\s]*([\d,]+)/i;
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
      const urlRegex = /<a[^>]+href=["']([^"']+)["']/i;
      const mileageRegex = /(KM|Mileage)[^0-9]*([\d,]+)\s*(KM|km|Miles|mi)?/i;

      let match;
      while ((match = cardRegex.exec(html))) {
        const block = match[0];
        const title = (block.match(titleRegex)?.[1] || '').replace(/<[^>]+>/g, '').trim();
        const price = block.match(priceRegex)?.[2] ? `$${block.match(priceRegex)[2]}` : null;
        const image = block.match(imgRegex)?.[1] || null;
        let url = block.match(urlRegex)?.[1] || SOURCE;
        if (url && url.startsWith('/')) {
          const u = new URL(SOURCE);
          url = `${u.protocol}//${u.host}${url}`;
        }
        const mileage = block.match(mileageRegex)?.[2]
          ? `${block.match(mileageRegex)[2]} ${block.match(mileageRegex)[3] || 'KM'}`
          : null;

        if (title || image) items.push({ title: title || 'Vehicle', price, mileage, image, url });
      }
    }

    // --- 3) Last resort: demo data so UI still works ---
    if (!items.length) {
      items = [
        {
          title: '2020 Alfa Romeo Stelvio Ti AWD',
          price: '$34,995',
          mileage: '58,210 KM',
          image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/2019_Alfa_Romeo_Stelvio_Ti_Sport_AWD_front_6.12.19.jpg/640px-2019_Alfa_Romeo_Stelvio_Ti_Sport_AWD_front_6.12.19.jpg',
          url: SOURCE
        },
        {
          title: '2018 Alfa Romeo Giulia AWD',
          price: '$28,500',
          mileage: '72,400 KM',
          image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2017_Alfa_Romeo_Giulia_Veloce_AWD_2.0_Front.jpg/640px-2017_Alfa_Romeo_Giulia_Veloce_AWD_2.0_Front.jpg',
          url: SOURCE
        }
      ];
    }

    return new Response(JSON.stringify({ items }, null, 2), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 's-maxage=300, stale-while-revalidate=86400',
        'access-control-allow-origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ items: [], error: String(err) }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
}

