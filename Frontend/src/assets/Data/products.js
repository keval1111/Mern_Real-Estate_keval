import { useState, useEffect } from 'react';
import imgEastSide from '../Images/1_600x600.webp';
import imgWhiteHouse from '../Images/1_37a9cf7c-0609-4e7a-9358-c00ba0bb57e7_600x600.webp';
import imgWheelwright from '../Images/1_2366d2e8-e3d8-40cd-b6c9-c6a92538670e_600x600.webp';
import imgMiniPalais from '../Images/1_f26220d0-23df-49cc-8ab9-2ef5f66b891a_600x600.webp';
import imgNeverEnding from '../Images/1_3704aed9-4ae6-414a-b0ed-95ec47e19a0b_600x600.webp';
import imgDarthVader from '../Images/1_8c387548-6a1e-4930-890a-cec2491c0d60_600x600.webp';
import imgSunsetVilla from '../Images/1_f4b79814-9043-4021-bae2-9fdb152c6064_600x600.webp';
import imgHighlandEstate from '../Images/1_fcb7d6ba-48c9-49b5-b5fa-65fbe6576bfd_600x600.webp';

export const mapBackendProperty = (item, fallbackImg = imgWhiteHouse) => {
  let img = item.image || item.imageUrl;
  if (!img) {
    img = fallbackImg;
  } else if (img.startsWith('/uploads')) {
    img = `http://localhost:5000${img}`;
  } else if (img.startsWith('uploads/')) {
    img = `http://localhost:5000/${img}`;
  }

  const cleanPrice = item.price
    ? (item.price.startsWith('$') || item.price.startsWith('₹') || item.price.startsWith('Rs') ? item.price : `Rs. ${item.price}`)
    : 'Rs. 1,00,00,000';

  const priceNum = item.priceNumber || parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 1000000;
  const sqft = String(item.sqft || '1500');
  const sqftNum = parseInt(sqft.replace(/[^0-9]/g, ''), 10) || 1500;
  const sizes = [
    `${Math.max(800, sqftNum - 300)} sq fit`,
    `${sqftNum} sq fit`,
    `${sqftNum + 300} sq fit`,
    `${sqftNum + 600} sq fit`
  ];

  const slug = item.slug || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `prop-${item._id}`);

  return {
    id: item._id || item.id,
    _id: item._id,
    slug: slug,
    title: item.title,
    image: img,
    category: item.category || 'Properties',
    type: item.category || 'Properties',
    brand: 'Real Estate',
    stock: (item.availableUnits ?? 1) > 0 && item.status !== 'Sold' ? 'in_stock' : 'out_of_stock',
    totalUnits: item.totalUnits ?? 1,
    availableUnits: item.availableUnits !== undefined ? item.availableUnits : (item.totalUnits ?? 1),
    status: item.status || 'Active',
    defaultSize: `${sqftNum} sq fit`,
    sizes: sizes,
    price: cleanPrice,
    priceNumber: priceNum,
    oldPrice: item.discountPrice || null,
    tag: item.featured ? 'Featured' : (item.status === 'Active' ? 'New' : item.status),
    description: item.description || '',
    location: item.location || '',
    beds: item.beds,
    baths: item.baths
  };
};

export const products = [
  {
    id: 1,
    slug: 'east-side-living',
    title: 'East Side Living',
    image: imgEastSide,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1200 sq fit',
    sizes: ['1200 sq fit', '1100 sq fit', '1300 sq fit'],
    price: 'Rs. 98,900.00 INR',
    priceNumber: 98900,
    oldPrice: null,
    tag: 'New',
    description: 'This is a list of house types. Houses can be built in a large variety of configurations. A basic division is between free-standing or single-family detached homes and various types of attached or multi-family residential dwellings. Both may vary greatly in scale and the amount of accommodation provided.'
  },
  {
    id: 2,
    slug: 'the-white-house-j-54',
    title: 'The White House J-54',
    image: imgWhiteHouse,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1800 sq fit',
    sizes: ['1300 sq fit', '1800 sq fit'],
    price: 'Rs. 290,400.00 INR',
    priceNumber: 290400,
    oldPrice: null,
    tag: null,
    description: 'Designed for grandeur and modern contemporary elegance, The White House J-54 offers expansive open floor layouts, ceiling-height glass panels, and seamless integration with landscaped garden views.'
  },
  {
    id: 3,
    slug: 'wheelwright-cottage-house',
    title: 'Wheelwright Cottage House',
    image: imgWheelwright,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1800 sq fit',
    sizes: ['1800 sq fit', '2000 sq fit'],
    price: 'Rs. 879,900.00 INR',
    priceNumber: 879900,
    oldPrice: null,
    tag: null,
    description: 'A serene luxury retreat surrounded by lush greenery, private swimming pools, and architectural stonework designed for tranquil suburban living.'
  },
  {
    id: 4,
    slug: 'minipalais-d-703',
    title: 'MiniPalais D-703',
    image: imgMiniPalais,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1300 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit', '1400 sq fit'],
    price: 'Rs. 968,000.00 INR',
    priceNumber: 968000,
    oldPrice: 'Rs. 1,064,800.00 INR',
    tag: 'New',
    description: 'Sophisticated modern palace layout blending minimalist cubic architectural structures with smart home technologies and private terrace lounges.'
  },
  {
    id: 5,
    slug: 'the-never-ending-story-c-52',
    title: 'The Never-Ending Story C-52',
    image: imgNeverEnding,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1100 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit', '1700 sq fit'],
    price: 'Rs. 822,800.00 INR',
    priceNumber: 822800,
    oldPrice: 'Rs. 780,200.00 INR',
    tag: null,
    description: 'Architectural masterpiece crafted with cantilevered viewing balconies, sustainable thermal insulation, and spacious master suites.'
  },
  {
    id: 6,
    slug: 'darth-vader-house-a-24',
    title: 'Darth Vader House A- 24',
    image: imgDarthVader,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1300 sq fit',
    sizes: ['1100 sq fit', '1300 sq fit', '1900 sq fit'],
    price: 'Rs. 678,500.00 INR',
    priceNumber: 678500,
    oldPrice: 'Rs. 687,300.00 INR',
    tag: null,
    description: 'Iconic neo-futuristic residence featuring dramatic bold contours, custom warm wood paneling, floor-to-ceiling glass pavilions, and custom landscape lighting.'
  },
  {
    id: 7,
    slug: 'sunset-villa-x-19',
    title: 'Sunset Villa X-19',
    image: imgSunsetVilla,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1200 sq fit',
    sizes: ['1200 sq fit', '1300 sq fit', '1400 sq fit', '1500 sq fit'],
    price: 'Rs. 1,296,000.00 INR',
    priceNumber: 1296000,
    oldPrice: 'Rs. 1,450,000.00 INR',
    tag: 'Hot',
    description: 'Prestigious waterfront and sunset-facing estate featuring multi-tier entertainment decks, infinity edge pool, and solar-integrated smart roofing.'
  },
  {
    id: 8,
    slug: 'highland-estate-m-05',
    title: 'Highland Estate M-05',
    image: imgHighlandEstate,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1100 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit'],
    price: 'Rs. 1,450,000.00 INR',
    priceNumber: 1450000,
    oldPrice: 'Rs. 1,600,000.00 INR',
    tag: 'New',
    description: 'Elevated highland residence offering 360-degree panoramic valley views, private gated security, smart eco-climate control, and designer finishes.'
  },
  {
    id: 9,
    slug: 'family-villas-c-92',
    title: 'Family Villas C-92',
    image: imgSunsetVilla,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1700 sq fit',
    sizes: ['1700 sq fit', '2000 sq fit', '2200 sq fit'],
    price: 'Rs. 641,300.00 INR',
    priceNumber: 641300,
    oldPrice: 'Rs. 690,700.00 INR',
    tag: 'New',
    description: 'Generously proportioned family villa featuring manicured outdoor lawns, heated swimming pool, double car garage, and smart home automation.'
  },
  {
    id: 10,
    slug: 'heart-and-soul-apartments-d-703',
    title: 'Heart and Soul Apartments D-703',
    image: imgMiniPalais,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1400 sq fit',
    sizes: ['1400 sq fit', '1600 sq fit'],
    price: 'Rs. 1,007,300.00 INR',
    priceNumber: 1007300,
    oldPrice: null,
    tag: 'New',
    description: 'Boutique architectural residence combining timeless aesthetics with contemporary luxuries, floor-to-ceiling glass, and serene landscaped surroundings.'
  },
  {
    id: 11,
    slug: 'east-side-residence',
    title: 'East Side Residence',
    image: imgEastSide,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1400 sq fit',
    sizes: ['1400 sq fit', '1600 sq fit', '1900 sq fit'],
    price: 'Rs. 108,500.00 INR',
    priceNumber: 108500,
    oldPrice: null,
    tag: 'New',
    description: 'Modern luxury loft living in the heart of the district, featuring private balconies, high ceilings, and premium concierge services.'
  },
  {
    id: 12,
    slug: 'oceanview-retreat-b-12',
    title: 'Oceanview Retreat B-12',
    image: imgWheelwright,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1500 sq fit',
    sizes: ['1500 sq fit', '1800 sq fit'],
    price: 'Rs. 896,000.00 INR',
    priceNumber: 896000,
    oldPrice: null,
    tag: null,
    description: 'Idyllic coastal sanctuary with expansive ocean views, modern open-plan kitchen, wrap-around timber decks, and private beach pathway.'
  }
];

let dynamicProducts = [...products];

export const updateDynamicProducts = (newItems) => {
  if (!Array.isArray(newItems)) return;
  const existingSlugs = new Set(dynamicProducts.map((p) => p.slug));
  const toAdd = newItems.filter((p) => !existingSlugs.has(p.slug));
  dynamicProducts = [...toAdd, ...dynamicProducts];
};

if (typeof window !== 'undefined') {
  fetch('http://localhost:5000/api/properties')
    .then((res) => res.json())
    .then((data) => {
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped = data.data.map((item, idx) => mapBackendProperty(item, products[idx % products.length]?.image));
        updateDynamicProducts(mapped);
      }
    })
    .catch(() => {});
}

export const useCategoryProperties = (categoryName, fallbackList = []) => {
  const [properties, setProperties] = useState(fallbackList);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const url = categoryName
      ? `http://localhost:5000/api/properties?category=${encodeURIComponent(categoryName)}`
      : 'http://localhost:5000/api/properties';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item, idx) =>
            mapBackendProperty(item, fallbackList[idx % Math.max(1, fallbackList.length)]?.image)
          );

          // Update dynamic search pool for product detail page
          updateDynamicProducts(mapped);

          // Merge: DB properties first (newest additions at top), followed by fallbacks that aren't duplicates
          const dbTitles = new Set(mapped.map((p) => p.title.toLowerCase().trim()));
          const extraFallbacks = fallbackList.filter((fb) => !dbTitles.has(fb.title.toLowerCase().trim()));
          setProperties([...mapped, ...extraFallbacks]);
        } else if (fallbackList.length > 0) {
          setProperties(fallbackList);
        }
      })
      .catch((err) => {
        console.warn(`Failed to fetch properties for category ${categoryName}:`, err);
        if (isMounted && fallbackList.length > 0) {
          setProperties(fallbackList);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryName]);

  return { properties, loading };
};

export const getProductBySlug = (slug) => {
  if (!slug) return products[0];
  const cleaned = String(slug).toLowerCase().trim();
  const searchPool = dynamicProducts.length > 0 ? dynamicProducts : products;
  const found = searchPool.find(
    (p) =>
      p.slug === cleaned ||
      String(p.id) === cleaned ||
      String(p._id) === cleaned ||
      p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === cleaned ||
      cleaned.startsWith(p.slug) ||
      (p.slug && p.slug.startsWith(cleaned))
  );
  return found || products[0];
};
