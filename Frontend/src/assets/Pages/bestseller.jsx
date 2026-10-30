import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Target, ChevronDown, Check, Heart, Repeat, Eye, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCategoryProperties } from '../Data/products';

import imgEastSide from '../Images/1_600x600.webp';
import imgWhiteHouse from '../Images/1_37a9cf7c-0609-4e7a-9358-c00ba0bb57e7_600x600.webp';
import imgWheelwright from '../Images/1_2366d2e8-e3d8-40cd-b6c9-c6a92538670e_600x600.webp';
import imgMiniPalais from '../Images/1_f26220d0-23df-49cc-8ab9-2ef5f66b891a_600x600.webp';
import imgNeverEnding from '../Images/1_3704aed9-4ae6-414a-b0ed-95ec47e19a0b_600x600.webp';
import imgDarthVader from '../Images/1_8c387548-6a1e-4930-890a-cec2491c0d60_600x600.webp';
import imgSunsetVilla from '../Images/1_f4b79814-9043-4021-bae2-9fdb152c6064_600x600.webp';
import imgHighlandEstate from '../Images/1_fcb7d6ba-48c9-49b5-b5fa-65fbe6576bfd_600x600.webp';

const initialFallbackProducts = [
  {
    id: 1,
    title: 'East Side Living',
    image: imgEastSide,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1200 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit'],
    price: 'Rs. 98,800.00 INR',
    oldPrice: null,
    tag: 'New',
  },
  {
    id: 2,
    title: 'The White House J-54',
    image: imgWhiteHouse,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1800 sq fit',
    sizes: ['1300 sq fit', '1800 sq fit'],
    price: 'Rs. 290,400.00 INR',
    oldPrice: null,
    tag: null,
  },
  {
    id: 3,
    title: 'Wheelwright Cottage House...',
    image: imgWheelwright,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1800 sq fit',
    sizes: ['1800 sq fit'],
    price: 'Rs. 879,900.00 INR',
    oldPrice: null,
    tag: null,
  },
  {
    id: 4,
    title: 'MiniPalais D-703',
    image: imgMiniPalais,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1300 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit', '1400 sq fit'],
    price: 'Rs. 968,000.00 INR',
    oldPrice: 'Rs. 1,064,800.00 INR',
    tag: 'New',
  },
  {
    id: 5,
    title: 'The Never-Ending Story C-52',
    image: imgNeverEnding,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1100 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit', '1700 sq fit'],
    price: 'Rs. 822,800.00 INR',
    oldPrice: 'Rs. 780,200.00 INR',
    tag: null,
  },
  {
    id: 6,
    title: 'Darth Vader House A- 24',
    image: imgDarthVader,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1300 sq fit',
    sizes: ['1100 sq fit', '1300 sq fit', '1900 sq fit'],
    price: 'Rs. 677,600.00 INR',
    oldPrice: 'Rs. 687,300.00 INR',
    tag: null,
  },
  {
    id: 7,
    title: 'Sunset Villa X-19',
    image: imgSunsetVilla,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1200 sq fit',
    sizes: ['1200 sq fit', '1300 sq fit', '1400 sq fit', '1500 sq fit'],
    price: 'Rs. 1,296,000.00 INR',
    oldPrice: 'Rs. 1,450,000.00 INR',
    tag: 'Hot',
  },
  {
    id: 8,
    title: 'Highland Estate M-05',
    image: imgHighlandEstate,
    category: 'Home',
    type: 'Home',
    brand: 'Real Estate',
    stock: 'in_stock',
    defaultSize: '1100 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit'],
    price: 'Rs. 1,450,000.00 INR',
    oldPrice: 'Rs. 1,600,000.00 INR',
    tag: 'New',
  },
];

const availableSizesList = [
  '1100 sq fit',
  '1200 sq fit',
  '1300 sq fit',
  '1400 sq fit',
  '1500 sq fit',
  '1700 sq fit',
  '1800 sq fit',
  '1900 sq fit',
];

const bottomPropertiesList = [
  {
    id: 'b1',
    title: 'The White House J-54',
    image: imgWhiteHouse,
    category: 'Home',
    size: '1800 sq fit',
    sizes: ['1300 sq fit', '1800 sq fit'],
    price: 'Rs. 290,400.00 INR',
    oldPrice: null,
    tag: null,
    tabs: ['Bestseller', 'Luxury Properties'],
  },
  {
    id: 'b2',
    title: 'Wheelwright Cottage House...',
    image: imgWheelwright,
    category: 'Home',
    size: '1800 sq fit',
    sizes: ['1800 sq fit'],
    price: 'Rs. 879,900.00 INR',
    oldPrice: null,
    tag: null,
    tabs: ['Bestseller', 'Farm Vila'],
  },
  {
    id: 'b3',
    title: 'MiniPalais D-703',
    image: imgMiniPalais,
    category: 'Home',
    size: '1300 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit', '1400 sq fit'],
    price: 'Rs. 968,000.00 INR',
    oldPrice: 'Rs. 1,064,800.00 INR',
    tag: 'New',
    tabs: ['Bestseller', 'Farm Vila', 'Luxury Properties'],
  },
  {
    id: 'b4',
    title: 'The Never-Ending Story C-52',
    image: imgNeverEnding,
    category: 'Home',
    size: '1100 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit'],
    price: 'Rs. 822,800.00 INR',
    oldPrice: 'Rs. 780,200.00 INR',
    tag: null,
    tabs: ['Bestseller', 'Royal House'],
  },
  {
    id: 'b5',
    title: 'Darth Vader House A- 24',
    image: imgDarthVader,
    category: 'Home',
    size: '1300 sq fit',
    sizes: ['1100 sq fit', '1300 sq fit', '1900 sq fit'],
    price: 'Rs. 677,600.00 INR',
    oldPrice: 'Rs. 687,300.00 INR',
    tag: null,
    tabs: ['Farm Vila', 'Royal House'],
  },
  {
    id: 'b6',
    title: 'Sunset Villa X-19',
    image: imgSunsetVilla,
    category: 'Home',
    size: '1200 sq fit',
    sizes: ['1200 sq fit', '1300 sq fit', '1400 sq fit'],
    price: 'Rs. 1,296,000.00 INR',
    oldPrice: 'Rs. 1,450,000.00 INR',
    tag: 'Hot',
    tabs: ['Farm Vila', 'Luxury Properties', 'Royal House'],
  },
  {
    id: 'b7',
    title: 'East Side Living',
    image: imgEastSide,
    category: 'Home',
    size: '1200 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit', '1300 sq fit'],
    price: 'Rs. 98,800.00 INR',
    oldPrice: null,
    tag: 'New',
    tabs: ['Bestseller', 'Luxury Properties', 'Royal House'],
  },
  {
    id: 'b8',
    title: 'Highland Estate M-05',
    image: imgHighlandEstate,
    category: 'Home',
    size: '1100 sq fit',
    sizes: ['1100 sq fit', '1200 sq fit'],
    price: 'Rs. 1,450,000.00 INR',
    oldPrice: 'Rs. 1,600,000.00 INR',
    tag: 'New',
    tabs: ['Bestseller', 'Farm Vila', 'Royal House'],
  },
];

const Bestseller = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { properties: allProducts, loading } = useCategoryProperties('Bestseller', initialFallbackProducts);
  const getSlug = (p) => p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Bottom section tab state
  const [activeBottomTab, setActiveBottomTab] = useState('Bestseller');
  const bottomSliderRef = useRef(null);

  const scrollBottomSliderLeft = () => {
    if (bottomSliderRef.current) {
      bottomSliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollBottomSliderRight = () => {
    if (bottomSliderRef.current) {
      bottomSliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  // Filter state
  const [inStockChecked, setInStockChecked] = useState(false);
  const [outOfStockChecked, setOutOfStockChecked] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Accordion toggle states
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isSizeOpen, setIsSizeOpen] = useState(true);
  const [isProductTypeOpen, setIsProductTypeOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);

  // Sorting state
  const [sortBy, setSortBy] = useState('best-selling');

  // Mobile filter drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Card size selection state
  const [cardSelectedSizes, setCardSelectedSizes] = useState({
    1: '1200 sq fit',
    2: '1800 sq fit',
    3: '1800 sq fit',
    4: '1300 sq fit',
    5: '1100 sq fit',
    6: '1300 sq fit',
    7: '1200 sq fit',
    8: '1100 sq fit',
  });

  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleCardSizeChange = (id, newSize) => {
    setCardSelectedSizes((prev) => ({ ...prev, [id]: newSize }));
  };

  const toggleSizeFilter = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleProductTypeFilter = (type) => {
    setSelectedProductTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleBrandFilter = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Filter and sort logic
  const filteredProducts = useMemo(() => {
    let result = (allProducts || []).filter((product) => {
      // Stock filter
      if (inStockChecked && !outOfStockChecked && product.stock !== 'in_stock') {
        return false;
      }
      if (outOfStockChecked && !inStockChecked && product.stock !== 'out_of_stock') {
        return false;
      }

      // Size filter: product must have any of the selected sizes
      if (selectedSizes.length > 0) {
        const pSizes = product.sizes || [product.defaultSize || '1500 sq fit'];
        const matchesSize = pSizes.some((size) => selectedSizes.includes(size));
        if (!matchesSize) return false;
      }

      // Product Type filter
      if (selectedProductTypes.length > 0) {
        if (!selectedProductTypes.includes(product.type)) return false;
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand)) return false;
      }

      return true;
    });

    if (sortBy === 'title-ascending') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-descending') {
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'price-ascending') {
      result = [...result].sort((a, b) => {
        const pA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      });
    } else if (sortBy === 'price-descending') {
      result = [...result].sort((a, b) => {
        const pA = parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      });
    }

    return result;
  }, [allProducts, inStockChecked, outOfStockChecked, selectedSizes, selectedProductTypes, selectedBrands, sortBy]);

  // Bottom section filtered properties
  const filteredBottomProperties = useMemo(() => {
    return bottomPropertiesList.filter((prop) => prop.tabs.includes(activeBottomTab));
  }, [activeBottomTab]);

  // Compute counts dynamically
  const sizeCounts = useMemo(() => {
    const counts = {};
    availableSizesList.forEach((size) => {
      counts[size] = (allProducts || []).filter((p) => (p.sizes || [p.defaultSize || '1500 sq fit']).includes(size)).length;
    });
    return counts;
  }, [allProducts]);

  const availabilitySelectedCount = (inStockChecked ? 1 : 0) + (outOfStockChecked ? 1 : 0);

  const totalSelectedFilters =
    availabilitySelectedCount +
    selectedSizes.length +
    selectedProductTypes.length +
    selectedBrands.length;

  const resetAllFilters = () => {
    setInStockChecked(false);
    setOutOfStockChecked(false);
    setSelectedSizes([]);
    setSelectedProductTypes([]);
    setSelectedBrands([]);
  };

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col pb-24 sm:pb-16">
      {/* Dark Header Banner */}
      <div className="w-full bg-dark pt-8 sm:pt-12 md:pt-16 pb-8 md:pb-11 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="w-full max-w-362.5 mx-auto">
          {/* Back to home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4 sm:mb-5 group cursor-pointer w-fit"
          >
            <span className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-white/50 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
              <ArrowLeft size={12} strokeWidth={2} />
            </span>
            <span className="text-xs sm:text-sm font-medium">Back to home</span>
          </button>

          {/* Title + Description */}
          <div className="max-w-3xl">
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2 sm:mb-3 leading-tight">
              Bestseller{' '}
              <span className="text-base sm:text-lg font-normal text-white/80">({filteredProducts.length})</span>
            </h1>
            <p className="text-xs sm:text-sm font-normal text-white/90 leading-relaxed max-w-2xl">
              A villa is a type of house that was originally an ancient Roman upper class country house. Since its origins
              in the Roman villa, the idea and function of a villa have evolved considerably. After the fall of the Roman
              Republic, villas became small farming compounds, which were increasingly fortified in Late Antiquity,
              sometimes transferred to the Church for reuse as a monastery.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-362.5 mx-auto px-4 sm:px-6 md:px-8 lg:px-20 flex-1 flex flex-col">
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Desktop Left Sidebar Column */}
          <div className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-black">
            {/* Filters Title Header */}
            <div className="h-16 flex items-center pr-6 border-b border-black">
              <h2 className="text-xl font-bold text-dark tracking-tight">Filters</h2>
            </div>

            {/* Filter Groups Aside */}
            <aside className="py-6 pr-6 select-none flex flex-col">
              {/* AVAILABILITY Accordion */}
              <div className="flex flex-col pb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-bold text-gray-900 tracking-wider">AVAILABILITY</span>
                  <button
                    onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                    className="text-gray-900 hover:text-black p-1 text-base font-bold leading-none cursor-pointer"
                  >
                    {isAvailabilityOpen ? '—' : '+'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3.5">
                  <span>{availabilitySelectedCount} selected</span>
                  <button
                    onClick={() => {
                      setInStockChecked(false);
                      setOutOfStockChecked(false);
                    }}
                    disabled={availabilitySelectedCount === 0}
                    className={`text-xs font-medium cursor-pointer transition-colors ${
                      availabilitySelectedCount > 0
                        ? 'text-dark underline hover:text-black'
                        : 'text-gray-600 cursor-default'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                {isAvailabilityOpen && (
                  <div className="flex flex-col gap-2.5">
                    <label
                      onClick={() => setInStockChecked(!inStockChecked)}
                      className="flex items-center justify-between text-sm text-dark cursor-pointer group hover:text-black py-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors ${
                            inStockChecked
                              ? 'bg-dark border-black'
                              : 'border-black bg-white'
                          }`}
                        >
                          {inStockChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[13.5px] font-medium text-gray-800">In stock</span>
                      </div>
                      <span className="text-xs text-gray-700 font-normal">(8)</span>
                    </label>

                    <label
                      onClick={() => setOutOfStockChecked(!outOfStockChecked)}
                      className="flex items-center justify-between text-sm text-dark cursor-pointer group hover:text-black py-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors ${
                            outOfStockChecked
                              ? 'bg-dark border-black'
                              : 'border-black bg-white'
                          }`}
                        >
                          {outOfStockChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-[13.5px] font-medium text-gray-800">Out of stock</span>
                      </div>
                      <span className="text-xs text-gray-700 font-normal">(8)</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-black mb-6"></div>

              {/* SIZE Accordion */}
              <div className="flex flex-col pb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-bold text-gray-900 tracking-wider">SIZE</span>
                  <button
                    onClick={() => setIsSizeOpen(!isSizeOpen)}
                    className="text-gray-900 hover:text-black p-1 text-base font-bold leading-none cursor-pointer"
                  >
                    {isSizeOpen ? '—' : '+'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3.5">
                  <span>{selectedSizes.length} selected</span>
                  <button
                    onClick={() => setSelectedSizes([])}
                    disabled={selectedSizes.length === 0}
                    className={`text-xs font-medium cursor-pointer transition-colors ${
                      selectedSizes.length > 0 ? 'text-dark underline hover:text-black' : 'text-gray-600 cursor-default'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                {isSizeOpen && (
                  <div className="flex flex-col gap-2.5">
                    {availableSizesList.map((size) => {
                      const isChecked = selectedSizes.includes(size);
                      return (
                        <label
                          key={size}
                          onClick={() => toggleSizeFilter(size)}
                          className="flex items-center justify-between text-sm text-dark cursor-pointer group hover:text-black py-0.5"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? 'bg-dark border-black'
                                  : 'border-black bg-white'
                              }`}
                            >
                              {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-[13.5px] font-medium text-gray-800">{size}</span>
                          </div>
                          <span className="text-xs text-gray-700 font-normal">({sizeCounts[size] || 0})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-black mb-6"></div>

              {/* PRODUCT TYPE Accordion */}
              <div className="flex flex-col pb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-bold text-gray-900 tracking-wider">PRODUCT TYPE</span>
                  <button
                    onClick={() => setIsProductTypeOpen(!isProductTypeOpen)}
                    className="text-gray-900 hover:text-black p-1 text-base font-bold leading-none cursor-pointer"
                  >
                    {isProductTypeOpen ? '—' : '+'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3.5">
                  <span>{selectedProductTypes.length} selected</span>
                  <button
                    onClick={() => setSelectedProductTypes([])}
                    disabled={selectedProductTypes.length === 0}
                    className={`text-xs font-medium cursor-pointer transition-colors ${
                      selectedProductTypes.length > 0 ? 'text-dark underline hover:text-black' : 'text-gray-600 cursor-default'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                {isProductTypeOpen && (
                  <div className="flex flex-col gap-2.5">
                    <label
                      onClick={() => toggleProductTypeFilter('Home')}
                      className="flex items-center justify-between text-sm text-dark cursor-pointer group hover:text-black py-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors ${
                            selectedProductTypes.includes('Home')
                              ? 'bg-dark border-black'
                              : 'border-black bg-white'
                          }`}
                        >
                          {selectedProductTypes.includes('Home') && (
                            <Check size={12} className="text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span className="text-[13.5px] font-medium text-gray-800">Home</span>
                      </div>
                      <span className="text-xs text-gray-700 font-normal">(8)</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-black mb-6"></div>

              {/* BRAND Accordion */}
              <div className="flex flex-col pb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] font-bold text-gray-900 tracking-wider">BRAND</span>
                  <button
                    onClick={() => setIsBrandOpen(!isBrandOpen)}
                    className="text-gray-900 hover:text-black p-1 text-base font-bold leading-none cursor-pointer"
                  >
                    {isBrandOpen ? '—' : '+'}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-3.5">
                  <span>{selectedBrands.length} selected</span>
                  <button
                    onClick={() => setSelectedBrands([])}
                    disabled={selectedBrands.length === 0}
                    className={`text-xs font-medium cursor-pointer transition-colors ${
                      selectedBrands.length > 0 ? 'text-dark underline hover:text-black' : 'text-gray-600 cursor-default'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                {isBrandOpen && (
                  <div className="flex flex-col gap-2.5">
                    <label
                      onClick={() => toggleBrandFilter('Real Estate')}
                      className="flex items-center justify-between text-sm text-dark cursor-pointer group hover:text-black py-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors ${
                            selectedBrands.includes('Real Estate')
                              ? 'bg-dark border-black'
                              : 'border-black bg-white'
                          }`}
                        >
                          {selectedBrands.includes('Real Estate') && (
                            <Check size={12} className="text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span className="text-[13.5px] font-medium text-gray-800">Real Estate</span>
                      </div>
                      <span className="text-xs text-gray-700 font-normal">(8)</span>
                    </label>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Right Content Column */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Top Bar: Breadcrumb + Sort by */}
            <div className="min-h-12 sm:min-h-16 py-2.5 sm:py-0 flex items-center justify-between gap-2 sm:gap-3 lg:pl-8 border-b border-black">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-gray-800 truncate">
                <button
                  onClick={() => navigate('/')}
                  className="hover:underline hover:text-black transition-colors cursor-pointer shrink-0"
                >
                  Home
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-semibold truncate">Bestseller</span>
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-900 shrink-0 hidden xs:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-black rounded-lg py-1 sm:py-1.5 pl-2.5 sm:pl-3.5 pr-7 sm:pr-8 text-[11px] sm:text-xs font-semibold text-gray-900 outline-none cursor-pointer hover:border-black transition-colors"
                  >
                    <option value="best-selling">Best selling</option>
                    <option value="featured">Featured</option>
                    <option value="title-ascending">Alphabetically, A-Z</option>
                    <option value="title-descending">Alphabetically, Z-A</option>
                    <option value="price-ascending">Price, low to high</option>
                    <option value="price-descending">Price, high to low</option>
                    <option value="date-descending">Date, new to old</option>
                    <option value="date-ascending">Date, old to new</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-800">
                    <ChevronDown size={13} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Toggle Button (below lg) */}
            <div className="w-full lg:hidden flex items-center justify-between py-2.5 sm:py-3 border-b border-black gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-dark text-white rounded-lg text-xs sm:text-sm font-medium cursor-pointer shrink-0 hover:bg-black transition-colors active:scale-95"
              >
                <SlidersHorizontal size={14} className="shrink-0" />
                <span>Filters {totalSelectedFilters > 0 && `(${totalSelectedFilters})`}</span>
              </button>
              <span className="text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'property' : 'properties'}
              </span>
            </div>

            {/* Right Product Grid */}
            <main className="py-6 lg:pl-8 flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                  <SlidersHorizontal size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No properties found</h3>
                <p className="text-sm text-gray-500 max-w-md mb-6">
                  No properties match your current filter selection. Try removing some filters to see available properties.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="bg-dark text-white rounded-full py-2 px-6 text-xs font-bold hover:bg-black transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-black overflow-hidden flex flex-col shadow-xs hover:shadow-xl transition-all duration-300"
                  >
                    {/* Top Image Container with Diagonal Cut on Bottom-Right */}
                    <div
                      onClick={() => navigate(`/product/${getSlug(product)}`)}
                      className="relative w-full h-52 bg-white overflow-hidden shrink-0 cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{
                          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 35px) 100%, 0 100%)',
                        }}
                      />

                      {/* Tag Badge (e.g. New / Hot) */}
                      {product.tag && (
                        <div className="absolute top-4 right-4 bg-brand text-dark px-3 py-1 rounded-md text-xs font-bold z-20 shadow-xs">
                          {product.tag}
                        </div>
                      )}

                      {/* Quick Action Icons on Hover */}
                      <div className="absolute top-3.5 left-3.5 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          className={`w-7.5 h-7.5 rounded-lg ${
                            isInWishlist(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-dark/60 text-white hover:bg-dark'
                          } backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-sm`}
                          title="Wishlist"
                        >
                          <Heart size={14} fill={isInWishlist(product.id) ? 'white' : 'none'} />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-7.5 h-7.5 rounded-lg bg-dark/60 text-white hover:bg-dark backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          title="Compare"
                        >
                          <Repeat size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${getSlug(product)}`);
                          }}
                          className="w-7.5 h-7.5 rounded-lg bg-dark/60 text-white hover:bg-dark backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                          title="Quick View"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-5 md:p-6 flex flex-col flex-1 bg-white">
                      {/* Home Category */}
                      <div className="flex items-center gap-2 text-dark text-xs font-bold mb-3">
                        <Target size={15} strokeWidth={2} />
                        <span>{product.category}</span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => navigate(`/product/${getSlug(product)}`)}
                        className="text-dark text-[17px] md:text-lg font-bold mb-4 leading-snug line-clamp-1 cursor-pointer hover:underline"
                      >
                        {product.title}
                      </h3>

                      {/* Size Selector Dropdown */}
                      <div className="relative w-fit min-w-33.75 mb-4">
                        <select
                          value={cardSelectedSizes[product.id] || product.defaultSize}
                          onChange={(e) => handleCardSizeChange(product.id, e.target.value)}
                          className="w-full appearance-none bg-white border border-black rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-dark outline-none cursor-pointer hover:border-gray-700 transition-colors shadow-xs"
                        >
                          {(product.sizes || [product.defaultSize || '1500 sq fit']).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark">
                          <ChevronDown size={14} strokeWidth={2} />
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="mb-5 min-h-10.5 flex flex-col justify-center">
                        <div className="text-[14.5px] font-bold text-dark">
                          {product.price}
                        </div>
                        {product.oldPrice && (
                          <div className="text-xs text-gray-400 line-through font-normal mt-0.5">
                            {product.oldPrice}
                          </div>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: `${getSlug(product)}-${cardSelectedSizes[product.id] || product.defaultSize}`,
                            title: product.title,
                            size: cardSelectedSizes[product.id] || product.defaultSize,
                            price: parseInt(String(product.price).replace(/[^0-9]/g, '')) || 98900,
                            quantity: 1,
                            image: product.image
                          });
                        }}
                        className="mt-auto bg-dark hover:bg-black text-white rounded-full py-2.5 px-6 text-xs font-bold flex items-center gap-2 w-fit transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group/btn"
                      >
                        <span>Add to Cart</span>
                        <ArrowRight size={13} strokeWidth={2.5} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>


      {/* Bottom Section: Find your home place */}
      <section className="w-full max-w-362.5 mx-auto px-4 sm:px-6 md:px-8 lg:px-20 pt-10 sm:pt-14 pb-16 sm:pb-20">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-dark tracking-tight mb-4 sm:mb-5">
          Find your home place
        </h2>
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
          {['Bestseller', 'Farm Vila', 'Luxury Properties', 'Royal House'].map((tab) => {
            const isActive = activeBottomTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveBottomTab(tab)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-dark text-white shadow-xs'
                    : 'bg-white text-gray-900 border border-black hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        {/* Divider Line */}
        <div className="w-full mt-4 sm:mt-5 mb-6 sm:mb-8 h-px bg-black/20"></div>

        {/* Slider Container */}
        <div className="w-full relative">
            <div
              ref={bottomSliderRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredBottomProperties.map((product) => (
                <div
                  key={product.id}
                  className="group shrink-0 w-72 md:w-80 snap-start bg-white rounded-2xl border border-black overflow-hidden flex flex-col shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  {/* Top Image Container with Diagonal Cut on Bottom-Right */}
                  <div
                    onClick={() => navigate(`/product/${getSlug(product)}`)}
                    className="relative w-full h-50 bg-white overflow-hidden shrink-0 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 35px) 100%, 0 100%)',
                      }}
                    />

                    {/* Tag Badge */}
                    {product.tag && (
                      <div className="absolute top-4 right-4 bg-brand text-dark px-3 py-1 rounded-md text-xs font-bold z-20 shadow-xs">
                        {product.tag}
                      </div>
                    )}

                    {/* Quick Action Icons on Hover */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className={`w-7.5 h-7.5 rounded-lg ${
                          isInWishlist(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-dark/60 text-white hover:bg-dark'
                        } backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-sm`}
                        title="Wishlist"
                      >
                        <Heart size={14} fill={isInWishlist(product.id) ? 'white' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-7.5 h-7.5 rounded-lg bg-dark/60 text-white hover:bg-dark backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                        title="Compare"
                      >
                        <Repeat size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${getSlug(product)}`);
                        }}
                        className="w-7.5 h-7.5 rounded-lg bg-dark/60 text-white hover:bg-dark backdrop-blur-sm flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                        title="Quick View"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 flex flex-col flex-1 bg-white">
                    {/* Home Category */}
                    <div className="flex items-center gap-2 text-dark text-xs font-bold mb-3">
                      <Target size={15} strokeWidth={2} />
                      <span>{product.category}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => navigate(`/product/${getSlug(product)}`)}
                      className="text-dark text-base font-bold mb-4 leading-snug line-clamp-1 cursor-pointer hover:underline"
                    >
                      {product.title}
                    </h3>

                    {/* Size Selector Dropdown */}
                    <div className="relative w-fit min-w-33.75 mb-4">
                      <select
                        defaultValue={product.size}
                        className="w-full appearance-none bg-white border border-black rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-dark outline-none cursor-pointer hover:border-gray-700 transition-colors shadow-xs"
                      >
                        {product.sizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark">
                        <ChevronDown size={14} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="mb-5 min-h-9.5 flex flex-col justify-center">
                      <div className="text-[14px] font-bold text-dark">
                        {product.price}
                      </div>
                      {product.oldPrice && (
                        <div className="text-xs text-gray-400 line-through font-normal mt-0.5">
                          {product.oldPrice}
                        </div>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: `${getSlug(product)}-${product.size || '1200 sq fit'}`,
                          title: product.title,
                          size: product.size || '1200 sq fit',
                          price: parseInt(String(product.price).replace(/[^0-9]/g, '')) || 98900,
                          quantity: 1,
                          image: product.image
                        });
                      }}
                      className="mt-auto bg-dark hover:bg-black text-white rounded-full py-2.5 px-6 text-xs font-bold flex items-center gap-2 w-fit transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group/btn"
                    >
                      <span>Add to Cart</span>
                      <ArrowRight size={13} strokeWidth={2.5} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Navigation Controls */}
          <div className="flex items-center w-full max-w-300 mx-auto mt-3 px-4 sm:px-6 md:px-8">
            <button
              onClick={scrollBottomSliderLeft}
              className="w-12 h-7 rounded-full border border-black flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-colors shrink-0 cursor-pointer"
              aria-label="Previous properties"
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
            <div className="flex-1 h-px bg-black"></div>
            <button
              onClick={scrollBottomSliderRight}
              className="w-12 h-7 rounded-full border border-black flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-colors shrink-0 cursor-pointer"
              aria-label="Next properties"
            >
              <ArrowRight size={16} strokeWidth={2} />
            </button>
          </div>
        </section>

      {/* Mobile Filters Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[9990] flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-5 sm:p-6 overflow-y-auto flex flex-col z-10 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-black mb-6">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile AVAILABILITY Accordion */}
            <div className="flex flex-col pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 tracking-wider">AVAILABILITY</span>
                <span className="text-xs text-gray-500">{availabilitySelectedCount} selected</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                <span></span>
                <button
                  onClick={() => {
                    setInStockChecked(false);
                    setOutOfStockChecked(false);
                  }}
                  disabled={availabilitySelectedCount === 0}
                  className={`text-xs font-medium cursor-pointer transition-colors ${
                    availabilitySelectedCount > 0 ? 'text-dark underline hover:text-black' : 'text-gray-400 cursor-default'
                  }`}
                >
                  Reset
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                <label
                  onClick={() => setInStockChecked(!inStockChecked)}
                  className="flex items-center justify-between text-sm text-dark cursor-pointer py-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center ${
                        inStockChecked ? 'bg-dark border-black' : 'border-black bg-white'
                      }`}
                    >
                      {inStockChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium">In stock</span>
                  </div>
                  <span className="text-xs text-gray-500">(8)</span>
                </label>

                <label
                  onClick={() => setOutOfStockChecked(!outOfStockChecked)}
                  className="flex items-center justify-between text-sm text-dark cursor-pointer py-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center ${
                        outOfStockChecked ? 'bg-dark border-black' : 'border-black bg-white'
                      }`}
                    >
                      {outOfStockChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm font-medium">Out of stock</span>
                  </div>
                  <span className="text-xs text-gray-500">(8)</span>
                </label>
              </div>
            </div>

            <div className="w-full h-px bg-black mb-6"></div>

            {/* Mobile SIZE */}
            <div className="flex flex-col pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 tracking-wider">SIZE</span>
                <span className="text-xs text-gray-500">{selectedSizes.length} selected</span>
              </div>
              <div className="flex flex-col gap-2">
                {availableSizesList.map((size) => {
                  const isChecked = selectedSizes.includes(size);
                  return (
                    <label
                      key={size}
                      onClick={() => toggleSizeFilter(size)}
                      className="flex items-center justify-between text-sm text-dark cursor-pointer py-1"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center ${
                            isChecked ? 'bg-dark border-black' : 'border-black bg-white'
                          }`}
                        >
                          {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm font-medium">{size}</span>
                      </div>
                      <span className="text-xs text-gray-500">({sizeCounts[size] || 0})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="w-full h-px bg-black mb-6"></div>

            {/* Mobile PRODUCT TYPE */}
            <div className="flex flex-col pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 tracking-wider">PRODUCT TYPE</span>
                <span className="text-xs text-gray-500">{selectedProductTypes.length} selected</span>
              </div>
              <label
                onClick={() => toggleProductTypeFilter('Home')}
                className="flex items-center justify-between text-sm text-dark cursor-pointer py-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center ${
                      selectedProductTypes.includes('Home')
                        ? 'bg-dark border-black'
                        : 'border-black bg-white'
                    }`}
                  >
                    {selectedProductTypes.includes('Home') && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-sm font-medium">Home</span>
                </div>
                <span className="text-xs text-gray-500">(8)</span>
              </label>
            </div>

            <div className="w-full h-px bg-black mb-6"></div>

            {/* Mobile BRAND */}
            <div className="flex flex-col pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 tracking-wider">BRAND</span>
                <span className="text-xs text-gray-500">{selectedBrands.length} selected</span>
              </div>
              <label
                onClick={() => toggleBrandFilter('Real Estate')}
                className="flex items-center justify-between text-sm text-dark cursor-pointer py-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center ${
                      selectedBrands.includes('Real Estate')
                        ? 'bg-dark border-black'
                        : 'border-black bg-white'
                    }`}
                  >
                    {selectedBrands.includes('Real Estate') && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <span className="text-sm font-medium">Real Estate</span>
                </div>
                <span className="text-xs text-gray-500">(8)</span>
              </label>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-2.5 border border-black rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-dark text-white rounded-lg text-xs font-bold hover:bg-black"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bestseller;