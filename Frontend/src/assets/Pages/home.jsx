import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useWishlist } from '../Context/WishlistContext';
import { useCategoryProperties } from '../Data/products';
import { Plus, ArrowRight, ArrowLeft, Target, Clock, Heart, Repeat, Eye, ChevronDown, ArrowUpRight } from 'lucide-react';
import sliderImg from '../Images/slider.webp';
import cat1Img from '../Images/cat-1.avif';
import cat2Img from '../Images/cat-2.avif';
import catImg from '../Images/cat-img.webp';
import bestProImg from '../Images/best-pro.webp';
import shopProImg from '../Images/shop-pro.webp';
import modernHousesImg from '../Images/modern-houses.webp';
import penthouseVillaImg from '../Images/1_600x600.webp';
import subscribeImg from '../Images/subscribe-img.webp';
// Luxury Properties Images
import imgWhiteHouse from '../Images/1_37a9cf7c-0609-4e7a-9358-c00ba0bb57e7_600x600.webp';
import imgWheelwright from '../Images/1_9f0b2eb5-ea31-44b5-8a57-c6d8339ee0ab_337x219.avif';
import imgMiniPalais from '../Images/1_f26220d0-23df-49cc-8ab9-2ef5f66b891a_600x600.webp';
import imgNeverEnding from '../Images/1_12cea679-aec3-430e-95c1-55cb596b250a_337x219.avif';
import imgDarthVader from '../Images/1_fcb7d6ba-48c9-49b5-b5fa-65fbe6576bfd_600x600.webp';
import imgExtra1 from '../Images/1_8c387548-6a1e-4930-890a-cec2491c0d60_600x600.webp';
import imgExtra2 from '../Images/1_f4b79814-9043-4021-bae2-9fdb152c6064_600x600.webp';
import imgExtra3 from '../Images/1_2366d2e8-e3d8-40cd-b6c9-c6a92538670e_600x600.webp';
// Blog / Homes Speaking For Themselves Images
import blogImg1 from '../Images/1.webp';
import blogImg2 from '../Images/2.webp';
import blogImg3 from '../Images/3.webp';
import blogImg4 from '../Images/4.webp';
import blogImg5 from '../Images/5.webp';

const blogArticles = [
    {
        id: 1,
        image: blogImg1,
        category: "realestate",
        date: "25 May 2023",
        author: "WorkDo",
        title: "A modern double house in th...",
        description: "Forest Haven, a remarkable retreat nestled amidst the serene beauty of the forest. This modern double house offers a unique blend of contemporar..."
    },
    {
        id: 2,
        image: blogImg2,
        category: "realestate",
        date: "25 May 2023",
        author: "WorkDo",
        title: "A modern home in the...",
        description: "a contemporary residence offering the perfect blend of modern design and the comforts of San Francisco living. Nestled in the heart of this vibrant cit..."
    },
    {
        id: 3,
        image: blogImg4,
        category: "realestate",
        date: "25 May 2023",
        author: "WorkDo",
        title: "2 storey villa with sea access",
        description: "Seaside Serenity, where luxury meets coastal living in this stunning 2-storey villa with direct access to the sparkling sea. Nestled in a prime location, this..."
    },
    {
        id: 4,
        image: blogImg5,
        category: "realestate",
        date: "25 May 2023",
        author: "WorkDo",
        title: "Dream House Diaries Points...",
        description: "where we challenge conventional notions of luxury living and explore the unique joys of prioritizing points over penthouses. In a world where materi..."
    },
    {
        id: 5,
        image: blogImg3,
        category: "realestate",
        date: "25 May 2023",
        author: "WorkDo",
        title: "Pavilion Lakeside Retreat",
        description: "Lakeview sanctuary offering peaceful surroundings with classical architectural charm and picturesque outdoor lounging spaces surrounded by crystal-clear waters."
    },
    {
        id: 6,
        image: imgWhiteHouse,
        category: "realestate",
        date: "25 May 2023",
        author: "WorkDo",
        title: "The White House J-54 Modern",
        description: "Experience state-of-the-art smart living in our iconic architectural masterpiece featuring grand double-height glass facades and ambient evening illumination."
    }
];

const slides = [
    {
        id: 0,
        leftTitle: <>Luxurious Loft Living<br />in the Heart of the City</>,
        hasDivider: true,
        leftDesc: "Embrace a serene lifestyle surrounded by lush green spaces, community gardens, and tranquil water features. From the organic architecture to the use of eco-friendly materials.",
        rightLocation: "Utica, Pensylvania 57867",
        rightTitle: "Eco-Friendly Homes for Modern Living",
        rightDesc: "Experience a harmonious balance between sustainable living and modern comfort in our eco-friendly homes. Designed with a commitment to environmental consciousness, these residences seamlessly integrate energy-efficient features.",
        showButton: true,
    },
    {
        id: 1,
        leftTitle: <>Modern houses<br />for the few</>,
        hasDivider: false,
        leftDesc: "Discover a haven of refined urban living in our luxurious loft residences. Nestled in the vibrant heart of the city, these contemporary homes offer a seamless blend of modern design a...",
        rightLocation: "Utica, Pensylvania 57867",
        rightTitle: "A modern home in the comfort of San Francisco",
        rightDesc: "Enjoy the breathtaking views of the city skyline, indulge in the finest amenities, and experience the unparalleled convenience of living within walking distance of trendy boutiques, gourmet dining, and cultural attractions.",
        showButton: true,
    }
];

const luxuriousProperties = [
    {
        id: 1,
        title: "The White House J-54",
        image: imgWhiteHouse,
        theme: "dark",
        size: "1800 sq fit",
        price: "Rs. 296,000.00 INR"
    },
    {
        id: 2,
        title: "Wheelwright Cottage House...",
        image: imgWheelwright,
        theme: "dark",
        size: "1800 sq fit",
        price: "Rs. 896,900.00 INR"
    },
    {
        id: 3,
        title: "MiniPalais D-703",
        image: imgMiniPalais,
        theme: "light",
        size: "1300 sq fit",
        price: "Rs. 986,700.00 INR",
        oldPrice: "Rs. 1,085,300.00 INR",
        tag: "New"
    },
    {
        id: 4,
        title: "The Never-Ending Story C-52",
        image: imgNeverEnding,
        theme: "dark",
        size: "1100 sq fit",
        price: "Rs. 838,700.00 INR",
        oldPrice: "Rs. 795,300.00 INR"
    },
    {
        id: 5,
        title: "Darth Vader House A- 24",
        image: imgDarthVader,
        theme: "dark",
        size: "1300 sq fit",
        price: "Rs. 690,700.00 INR",
        oldPrice: "Rs. 700,500.00 INR"
    },
    {
        id: 6,
        title: "Sunset Villa X-19",
        image: imgExtra1,
        theme: "light",
        size: "2100 sq fit",
        price: "Rs. 1,296,000.00 INR",
        tag: "Hot"
    },
    {
        id: 7,
        title: "Oceanview Retreat B-12",
        image: imgExtra2,
        theme: "dark",
        size: "1500 sq fit",
        price: "Rs. 896,000.00 INR"
    },
    {
        id: 8,
        title: "Highland Estate M-05",
        image: imgExtra3,
        theme: "dark",
        size: "2400 sq fit",
        price: "Rs. 1,450,000.00 INR"
    }
];

const penthouseProperties = [
    {
        id: 1,
        title: "East Side Living",
        image: imgExtra2,
        tag: "New",
        sizes: ["1200 sq fit", "1500 sq fit", "1800 sq fit"],
        price: "Rs. 99,800.00 INR",
        oldPrice: null
    },
    {
        id: 2,
        title: "East Side Residence",
        image: penthouseVillaImg,
        tag: "New",
        sizes: ["1400 sq fit", "1600 sq fit", "1900 sq fit"],
        price: "Rs. 108,500.00 INR",
        oldPrice: null
    },
    {
        id: 3,
        title: "Family Villas C-92",
        image: cat2Img,
        tag: "New",
        sizes: ["1700 sq fit", "2000 sq fit", "2200 sq fit"],
        price: "Rs. 635,700.00 INR",
        oldPrice: "Rs. 684,600.00 INR"
    },
    {
        id: 4,
        title: "Sunset Villa X-19",
        image: imgExtra1,
        tag: "Hot",
        sizes: ["2100 sq fit", "2400 sq fit", "2700 sq fit"],
        price: "Rs. 1,296,000.00 INR",
        oldPrice: "Rs. 1,450,000.00 INR"
    }
];

const Home = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [bottomSlide, setBottomSlide] = useState(0);
    const [activeLuxuryTab, setActiveLuxuryTab] = useState('Luxury Properties');
    const [penthouseIndex, setPenthouseIndex] = useState(0);
    const [showHotspot, setShowHotspot] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState({
        1: '1200 sq fit',
        2: '1700 sq fit',
        3: '2100 sq fit'
    });
    const [touchStartX, setTouchStartX] = useState(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const luxurySliderRef = useRef(null);
    const blogSliderRef = useRef(null);
    const [blogProgress, setBlogProgress] = useState(0);

    const scrollBlogLeft = () => {
        if (blogSliderRef.current) {
            const card = blogSliderRef.current.querySelector('.blog-card');
            const scrollAmount = card ? card.offsetWidth + 20 : 340;
            blogSliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollBlogRight = () => {
        if (blogSliderRef.current) {
            const card = blogSliderRef.current.querySelector('.blog-card');
            const scrollAmount = card ? card.offsetWidth + 20 : 340;
            blogSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handleBlogScroll = () => {
        if (blogSliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = blogSliderRef.current;
            const maxScroll = scrollWidth - clientWidth;
            if (maxScroll > 0) {
                setBlogProgress((scrollLeft / maxScroll) * 100);
            }
        }
    };

    const nextPenthouse = () => {
        setPenthouseIndex((prev) => (prev + 1) % penthouseProperties.length);
    };

    const prevPenthouse = () => {
        setPenthouseIndex((prev) => (prev - 1 + penthouseProperties.length) % penthouseProperties.length);
    };

    const handleSizeChange = (propId, size) => {
        setSelectedSizes(prev => ({ ...prev, [propId]: size }));
    };

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (!touchStartX) return;
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (diff > 40) nextPenthouse();
        else if (diff < -40) prevPenthouse();
        setTouchStartX(null);
    };

    useEffect(() => {
        if (luxurySliderRef.current) {
            luxurySliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [activeLuxuryTab]);

    const scrollLuxuryLeft = () => {
        if (luxurySliderRef.current) {
            luxurySliderRef.current.scrollBy({ left: -344, behavior: 'smooth' });
        }
    };

    const scrollLuxuryRight = () => {
        if (luxurySliderRef.current) {
            luxurySliderRef.current.scrollBy({ left: 344, behavior: 'smooth' });
        }
    };

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const nextBottomSlide = () => setBottomSlide((prev) => (prev + 1) % 4);
    const prevBottomSlide = () => setBottomSlide((prev) => (prev - 1 + 4) % 4);

    const slide = slides[currentSlide];

    const { properties: liveProperties } = useCategoryProperties('', []);

    const displayLuxuriousProperties = useMemo(() => {
        if (!liveProperties || liveProperties.length === 0) return luxuriousProperties;
        const mappedLive = liveProperties.map((p, idx) => ({
            id: p.id || p._id,
            title: p.title,
            image: p.image || luxuriousProperties[idx % luxuriousProperties.length].image,
            theme: idx % 2 === 0 ? 'dark' : 'light',
            size: p.defaultSize || '1500 sq fit',
            price: p.price,
            oldPrice: p.oldPrice || null,
            tag: p.tag || null,
            category: p.category || 'Properties',
            slug: p.slug
        }));
        const liveTitles = new Set(mappedLive.map(m => m.title.toLowerCase().trim()));
        const extraFallbacks = luxuriousProperties.filter(lp => !liveTitles.has(lp.title.toLowerCase().trim()));
        return [...mappedLive, ...extraFallbacks];
    }, [liveProperties]);

    const filteredProperties = useMemo(() => {
        return displayLuxuriousProperties.filter(prop => {
            const cat = String(prop.category || '').toLowerCase().trim();
            if (activeLuxuryTab === 'Luxury Properties' || activeLuxuryTab === 'All') {
                return true;
            }
            if (activeLuxuryTab === 'Bestseller') {
                return cat.includes('bestseller') || [1, 2, 4, 5, 8].includes(prop.id);
            }
            if (activeLuxuryTab === 'Farm Vila' || activeLuxuryTab === 'Farm Villa') {
                return cat.includes('farm') || cat.includes('villa') || cat.includes('vila') || [2, 3, 6, 7].includes(prop.id);
            }
            if (activeLuxuryTab === 'Royal House') {
                return cat.includes('royal') || [4, 5, 6, 8].includes(prop.id);
            }
            return true;
        });
    }, [displayLuxuriousProperties, activeLuxuryTab]);

    return (
        <div className="w-full flex flex-col font-sans">
            <div className="relative w-full lg:min-h-[calc(100vh-85px)] bg-dark flex flex-col lg:flex-row overflow-x-clip">

                {/* Huge Background Text - strictly visible on wide desktop screens to prevent overlap on mobile/tablet */}
                <div className="hidden xl:block absolute -bottom-14 left-8 2xl:left-20 text-[#f4eae1]/80 font-bold text-5xl xl:text-7xl 2xl:text-[95px] leading-[0.92] tracking-tight z-0 select-none pointer-events-none transition-all duration-500">
                </div>

                {/* Left Image Section */}
                <div
                    className="relative w-full lg:w-[60%] xl:w-[65%] h-[340px] sm:h-[450px] md:h-[500px] lg:h-auto lg:min-h-full z-10 overflow-hidden lg:[clip-path:polygon(0_0,100%_0,100%_75%,75%_100%,0_100%)] shrink-0"
                >
                    <div
                        className="flex w-full h-full transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {slides.map((s, index) => (
                            <img
                                key={index}
                                src={s.image || sliderImg}
                                alt="Modern Home"
                                className="w-full h-full min-w-full object-cover shrink-0"
                            />
                        ))}
                    </div>

                    {/* Dark overlay to make text readable */}
                    <div className="absolute inset-0 bg-linear-to-t from-dark/90 via-dark/20 to-transparent pointer-events-none"></div>

                    {/* + Buttons */}
                    <button className="absolute top-1/4 right-1/4 w-8.5 h-8.5 rounded-full bg-[#dccbbd] flex items-center justify-center text-dark cursor-pointer hover:bg-white transition-colors">
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                    <button className="absolute top-[48%] left-[28%] w-8.5 h-8.5 rounded-full bg-[#dccbbd] flex items-center justify-center text-dark cursor-pointer hover:bg-white transition-colors">
                        <Plus size={18} strokeWidth={2.5} />
                    </button>

                    {/* Left Bottom Content */}
                    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-[24%] left-4 sm:left-8 md:left-10 right-4 sm:right-8 md:right-[10%] text-white z-20 flex items-start gap-3 sm:gap-3.5 transition-opacity duration-500">
                        {/* Icon */}
                        <div className="w-7 h-10 rounded-5 border-[1.5px] border-white flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-3.25 font-bold leading-none">{slide.id}</span>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <h3 className="text-base sm:text-lg md:text-lg font-bold leading-[1.2] mb-1.5 sm:mb-2">
                                {slide.leftTitle}
                            </h3>
                            {slide.hasDivider && <div className="w-35 h-px bg-white/40 mb-1.5 sm:mb-2"></div>}
                            <p className="text-xs sm:text-3.25 leading-relaxed text-slate-200 font-medium max-w-[95%] xl:max-w-120 line-clamp-2 sm:line-clamp-3">
                                {slide.leftDesc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Content Section */}
                <div className="relative w-full lg:w-[40%] xl:w-[35%] flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-8 xl:px-12 z-10 text-white pt-6 pb-3 sm:pt-8 sm:pb-4 lg:py-16 xl:mt-24 transition-opacity duration-500">

                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold mb-3 sm:mb-4">
                        <Target size={16} className="text-white shrink-0" />
                        <span className="truncate">{slide.rightLocation}</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-3.5xl xl:text-4xl font-bold leading-[1.15] mb-3 sm:mb-4">
                        {slide.rightTitle}
                    </h1>

                    <p className="text-[#a0aab2] text-xs sm:text-sm leading-[1.7] mb-6 sm:mb-8 font-medium line-clamp-4 lg:line-clamp-none">
                        {slide.rightDesc}
                    </p>

                    <button
                        onClick={() => navigate('/collections/bestseller')}
                        className="bg-[#f4eae1] text-dark rounded-full py-2.5 px-6 flex items-center gap-2.5 w-fit font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 hover:bg-dark hover:text-white border border-transparent hover:border-white/50 transition-all duration-300 mb-6 sm:mb-8 lg:mb-10 group cursor-pointer shadow-sm active:scale-95"
                    >
                        <span>Show full details</span>
                        <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Slider Controls */}
                    <div className="flex items-center w-full max-w-sm mt-1 sm:mt-4">
                        <button
                            onClick={prevSlide}
                            className={`w-12 sm:w-15 h-8 sm:h-9 rounded-full border border-[#faede3]/70 flex items-center justify-center hover:bg-[#faede3] hover:text-dark transition-colors shrink-0 cursor-pointer ${currentSlide === 1 ? 'bg-[#faede3] text-dark' : 'text-[#faede3]'}`}
                            aria-label="Previous Slide"
                        >
                            <ArrowLeft size={16} strokeWidth={1.5} />
                        </button>

                        <div className="flex-1 h-px bg-[#faede3]/70 relative mx-2">
                            <div className={`absolute top-0 left-0 h-full bg-[#faede3] transition-all duration-300 ${currentSlide === 1 ? 'w-0' : 'w-1/2'}`}></div>
                        </div>

                        <button
                            onClick={nextSlide}
                            className={`w-12 sm:w-15 h-8 sm:h-9 rounded-full border border-[#faede3]/70 flex items-center justify-center hover:bg-[#faede3] hover:text-dark transition-colors shrink-0 cursor-pointer ${currentSlide === 0 ? 'bg-[#faede3] text-dark' : 'text-[#faede3]'}`}
                            aria-label="Next Slide"
                        >
                            <ArrowRight size={16} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- New Bottom Section --- */}
            <div className="relative w-full pt-4 sm:pt-6 md:pt-10 lg:pt-24 pb-8 md:pb-12 flex flex-col">
                {/* Background Split */}
                <div className="absolute top-0 left-0 w-full h-[40%] bg-dark z-0"></div>
                <div className="absolute bottom-0 left-0 w-full h-[60%] bg-[#a57b66] z-0"></div>

                <div className="relative z-10 w-full max-w-350 mx-auto px-6 md:px-10 lg:px-16 flex flex-col lg:flex-row gap-8 lg:gap-14 xl:gap-10">

                    {/* Left Side (Text, Small Images, Slider Controls) */}
                    <div className="w-full lg:w-[50%] flex flex-col pt-0 sm:pt-2">
                        <p className="text-white text-xs sm:text-sm font-medium leading-[1.8] max-w-137.5 mb-8 sm:mb-12">
                            From the organic architecture to the use of eco-friendly materials, these homes provide a
                            sanctuary where you can live in harmony with nature without compromising on luxury or style.
                        </p>

                        {/* Repeating Small Images Slider */}
                        <div className="w-full overflow-hidden mb-4">
                            <div
                                className="flex transition-transform duration-500 ease-in-out w-[200%]"
                                style={{ transform: `translateX(-${bottomSlide * (100 / 6)}%)` }}
                            >
                                {[
                                    { title: 'Farm Vila', img: cat1Img },
                                    { title: 'Bestseller', img: cat2Img },
                                    { title: 'Royal House', img: catImg },
                                    { title: 'Farm Vila', img: cat1Img },
                                    { title: 'Bestseller', img: cat2Img },
                                    { title: 'Royal House', img: catImg }
                                ].map((item, index) => (
                                    <div key={index} className="flex flex-col gap-3.5 w-[16.6666%] shrink-0 pr-3 sm:pr-4 md:pr-6">
                                        {/* Image Wrapper */}
                                        <div
                                            className="relative w-full aspect-square rounded-2xl bg-white p-0.75"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)' }}
                                        >
                                            <img
                                                src={item.img}
                                                className="w-full h-full rounded-2xl object-cover"
                                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 21px), calc(100% - 21px) 100%, 0 100%)' }}
                                                alt={item.title}
                                            />
                                        </div>
                                        {/* Title & Arrow */}
                                        <div className="flex items-center justify-between text-white pr-2 mt-1">
                                            <span className="font-bold text-sm sm:text-base">{item.title}</span>
                                            <ArrowRight size={18} strokeWidth={2} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Left Bottom Slider Controls */}
                        <div className="flex items-center w-full max-w-sm pr-6">
                            <button onClick={prevBottomSlide} className="w-12 sm:w-15 h-8 sm:h-9 rounded-full border border-[#faede3]/70 flex items-center justify-center text-[#faede3] hover:bg-[#faede3] hover:text-dark transition-colors shrink-0 cursor-pointer">
                                <ArrowLeft size={16} strokeWidth={1.5} />
                            </button>
                            <div className="flex-1 h-px bg-[#faede3]/70 mx-2"></div>
                            <button onClick={nextBottomSlide} className="w-12 sm:w-15 h-8 sm:h-9 rounded-full border border-[#faede3]/70 flex items-center justify-center text-[#faede3] hover:bg-[#faede3] hover:text-dark transition-colors shrink-0 cursor-pointer">
                                <ArrowRight size={16} strokeWidth={1.5} />
                            </button>
                        </div>
                    </div>

                    {/* Right Side (Big Image, Bottom Text) */}
                    <div className="w-full lg:w-[50%] flex flex-col justify-start items-start">
                        {/* Big Image */}
                        <div className="w-full lg:w-[calc(100%+30px)] xl:w-[calc(100%+50px)] lg:-ml-4 xl:-ml-6 aspect-[1.32/1] rounded-2xl md:rounded-3xl overflow-hidden mb-6 shadow-2xl">
                            <img src={catImg} className="w-full h-full object-cover" alt="Modern House" />
                        </div>

                        {/* Bottom Text */}
                        <p className="text-white/95 text-xs sm:text-sm font-medium leading-[1.85] text-left max-w-[95%]">
                            Immerse yourself in a welcoming community with top-rated schools, parks, and
                            recreational facilities just moments away. Create lasting memories as you enjoy the
                            comfort, convenience, and tranquility that these modern family homes offer.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Find Your Home Place Section --- */}
            <div className="relative w-full flex flex-col overflow-hidden bg-[#151c23]">
                {/* Background Split */}
                <div className="absolute top-0 left-0 w-full h-[65%] bg-[#a57b66] z-0"></div>
                <div className="absolute bottom-0 left-0 w-full h-[35%] bg-dark z-0"></div>

                <div className="relative z-10 w-full max-w-362.5 mx-auto px-6 md:px-15">

                    {/* Header */}
                    <div className="flex items-center gap-6 mb-10 w-full">
                        <h2 className="text-[#f9ece4] text-9 md:text-9.5 text-3xl font-bold whitespace-nowrap tracking-wide">
                            Find your home place
                        </h2>
                        <div className="flex-1 h-px bg-white/40 mt-1"></div>
                    </div>

                    {/* Content Split */}
                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* Left Side: Cards and Controls */}
                        <div className="w-full lg:w-[47%] rounded-2xl flex flex-col justify-between shrink-0">

                            {/* Cards */}
                            <div className="flex flex-col  md:flex-row gap-6 w-full">

                                {/* Card 1 */}
                                <div className="flex-1 bg-[#faede3] rounded-6 border-2 border-white rounded-2xl overflow-hidden flex flex-col shadow-lg">
                                    <div
                                        onClick={() => navigate('/product/east-side-living')}
                                        className="w-full h-45 relative cursor-pointer"
                                    >
                                        <img
                                            src={catImg}
                                            alt="House 1"
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}
                                        />
                                        <div className="absolute top-4 right-4 bg-brand text-dark px-3.5 py-1 rounded-2 text-3.25 font-bold z-10">New</div>
                                    </div>
                                    <div className="p-6 md:p-7 flex flex-col h-full">
                                        <div className="flex items-center gap-2 text-dark text-3.25 font-bold mb-3">
                                            <Target size={16} />
                                            <span>Home</span>
                                        </div>
                                        <h3
                                            onClick={() => navigate('/product/east-side-living')}
                                            className="text-dark text-xl md:text-5.5 font-bold mb-5 leading-tight pr-4 cursor-pointer hover:underline"
                                        >
                                            East Side Living
                                        </h3>
                                        <div className="relative w-full mb-6">
                                            <select className="w-full appearance-none bg-transparent border border-dark/30 rounded-full py-2.5 px-5 text-sm font-bold text-dark outline-none cursor-pointer">
                                                <option>1200 sq ft</option>
                                                <option>1400 sq ft</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#1a232c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="text-dark text-sm font-bold mb-5">
                                            Rs. 100,700.00 INR
                                        </div>
                                        <button
                                            onClick={() =>
                                                addToCart({
                                                    id: 'home-east-side',
                                                    title: 'East Side Living',
                                                    price: 'Rs. 100,700.00 INR',
                                                    image: catImg,
                                                    size: '1200 sq ft',
                                                    quantity: 1,
                                                })
                                            }
                                            className="mt-auto bg-dark text-white rounded-full py-3 px-6 text-3.25 font-bold flex items-center gap-2 w-fit hover:bg-black transition-colors cursor-pointer"
                                        >
                                            Add to Cart <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="flex-1 bg-dark rounded-6 border border-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                                    <div
                                        onClick={() => navigate('/product/family-villas-c-92')}
                                        className="w-full h-45 relative cursor-pointer"
                                    >
                                        <img
                                            src={cat2Img}
                                            alt="House 2"
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 75% 100%, 0 100%)' }}
                                        />
                                        <div className="absolute top-[60%] left-0 w-full bg-dark py-2.5 flex justify-center items-center gap-2 text-white font-bold text-sm z-10 shadow-lg">
                                            <Clock size={16} />
                                            <span className="tracking-widest">76 : 11 : 02 : 31</span>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-brand text-dark px-3.5 py-1 rounded-2 text-3.25 font-bold z-10">New</div>
                                    </div>
                                    <div className="p-6 md:p-7 flex flex-col h-full">
                                        <div className="flex items-center gap-2 text-white text-3.25 font-bold mb-3">
                                            <Target size={16} />
                                            <span>Home</span>
                                        </div>
                                        <h3
                                            onClick={() => navigate('/product/family-villas-c-92')}
                                            className="text-white text-xl md:text-5.5 font-bold mb-5 leading-tight pr-4 cursor-pointer hover:underline"
                                        >
                                            Family Villas C-92
                                        </h3>
                                        <div className="relative w-full mb-6">
                                            <select className="w-full appearance-none bg-transparent border border-white/30 rounded-full py-2.5 px-5 text-sm font-bold text-white outline-none cursor-pointer">
                                                <option>1700 sq ft</option>
                                                <option>2000 sq ft</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="text-white text-sm font-bold mb-5 flex items-center gap-2">
                                            Rs. 641,300.00 INR
                                            <span className="text-white/40 line-through text-xs font-medium">Rs. 690,700.00 INR</span>
                                        </div>
                                        <button
                                            onClick={() =>
                                                addToCart({
                                                    id: 'home-family-villa',
                                                    title: 'Family Villas C-92',
                                                    price: 'Rs. 641,300.00 INR',
                                                    image: cat2Img,
                                                    size: '1700 sq ft',
                                                    quantity: 1,
                                                })
                                            }
                                            className="mt-auto bg-[#faede3] text-dark rounded-full py-3 px-6 text-3.25 font-bold flex items-center gap-2 w-fit hover:bg-white transition-colors cursor-pointer"
                                        >
                                            Add to Cart <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Bottom Slider Controls */}
                            <div className="flex items-center w-full mt-5 relative z-20 pr-6 lg:pr-0">
                                <button className="w-15 h-9 rounded-full border border-[#faede3]/70 flex items-center justify-center text-[#faede3] hover:bg-[#faede3] hover:text-dark transition-colors shrink-0 cursor-pointer">
                                    <ArrowLeft size={18} strokeWidth={1.5} />
                                </button>
                                <div className="flex-1 h-px bg-[#faede3]/70"></div>
                                <button className="w-15 h-9 rounded-full border border-[#faede3]/70 flex items-center justify-center text-[#faede3] hover:bg-[#faede3] hover:text-dark transition-colors shrink-0 cursor-pointer">
                                    <ArrowRight size={18} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Map Area */}
                        <div className="w-full lg:w-[calc(53%+50vw-50%)] lg:mr-[calc(50%-50vw)] rounded-6 lg:rounded-r-none overflow-hidden relative min-h-100 lg:min-h-0 shrink-0">
                            {/* The single Map Image containing everything */}
                            <img src={bestProImg} className="absolute inset-0 w-full h-full object-cover lg:object-left" alt="Map with popup" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Spacious Living Section --- */}
            <div className="relative w-full pt-8 pb-16 md:pt-12 md:pb-24 bg-dark flex flex-col overflow-hidden">
                <div className="w-full max-w-362.5 mx-auto px-6 md:px-15 relative">

                    {/* Header Row and Cutout Grid */}
                    <div className="flex w-full relative z-20 mt-10 items-start">
                        {/* Left Column (H2) */}
                        <div className="w-full lg:w-[45%] shrink-0">
                            <h2 className="text-[#f9ece4] text-3xl md:text-8 lg:text-8.5 font-bold leading-[1.1] md:whitespace-nowrap max-w-none">
                                Open the door for aspacious living
                            </h2>
                        </div>

                        {/* Right Column (P) */}
                        <div className="hidden lg:block w-[55%] absolute top-0 right-0 pl-10">
                            {/* The Cutout Block Background that perfectly wraps the text and drops over the image! */}
                            <div className="absolute top-0 -right-[calc(50vw-50%)] w-[calc(100%+50vw-50%)] h-full bg-dark z-10"></div>

                            <p className="text-white/95 text-sm md:text-3.625 font-normal leading-[1.8] max-w-162.5 relative z-20 pt-2 pb-3">
                                Indulge in the ultimate coastal lifestyle with our contemporary beachfront properties. Immerse
                                yourself in the soothing sounds of the ocean and bask in the warm embrace of the sun, just steps
                                away from your doorstep.
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="relative w-full mt-4 lg:mt-5">

                        {/* Big Image bleeding to both sides (Desktop) */}
                        <div className="w-400 lg:relative lg:left-1/2 lg:-translate-x-1/2 h-132.5 md:h-157.5 lg:h-177.5 overflow-hidden rounded-6 lg:rounded-none">
                            <img src={shopProImg} alt="Spacious Living" className="w-full h-full object-cover" />
                        </div>

                        {/* Overlapping Content */}
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10 lg:gap-16 mt-0 lg:mt-4">

                            {/* Card Area (Left) */}
                            <div className="w-full lg:w-150 flex flex-col shrink-0 -mt-20 md:-mt-32 lg:-mt-40">
                                {/* The Card */}
                                <div className="w-full bg-[#faede3] rounded-4 rounded-2xl overflow-hidden flex flex-row h-55 shadow-2xl">
                                    {/* Left Image with Diagonal Cut */}
                                    <div
                                        onClick={() => navigate('/product/heart-and-soul-apartments-d-703')}
                                        className="w-[45%] h-full relative cursor-pointer"
                                    >
                                        <img
                                            src={catImg}
                                            alt="Villa"
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 72% 100%, 0 100%)' }}
                                        />
                                    </div>

                                    {/* Right Content */}
                                    <div className="w-[55%] py-4 pr-6 pl-4 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-dark text-2.75 font-bold mb-1.5">
                                            <Target size={14} />
                                            <span>Home</span>
                                        </div>
                                        <h3
                                            onClick={() => navigate('/product/heart-and-soul-apartments-d-703')}
                                            className="text-dark text-lg font-bold mb-3 leading-[1.2] pr-2 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:underline"
                                        >
                                            Heart and Soul Apartments D-...
                                        </h3>

                                        <div className="relative w-fit mb-4">
                                            <select className="appearance-none bg-transparent border border-dark/40 rounded-1.5 py-1 pl-3 pr-8 text-xs font-bold text-dark outline-none cursor-pointer">
                                                <option>1400 sq fit</option>
                                            </select>
                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg width="8" height="5" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#1a232c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="text-dark text-3.375 font-bold mb-4">
                                            Rs. 1,007,300.00 INR
                                        </div>

                                        <button
                                            onClick={() =>
                                                addToCart({
                                                    id: 'home-heart-soul',
                                                    title: 'Heart and Soul Apartments D-703',
                                                    price: 'Rs. 1,007,300.00 INR',
                                                    image: catImg,
                                                    size: '1400 sq fit',
                                                    quantity: 1,
                                                })
                                            }
                                            className="bg-dark text-white rounded-full py-1.5 px-4 text-2.75 font-bold flex items-center gap-2 w-fit hover:bg-black transition-colors cursor-pointer"
                                        >
                                            Add to Cart <ArrowRight size={12} className="text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Slider Controls below card */}
                                <div className="flex items-center w-full mt-3">
                                    <button className="w-15 h-9 rounded-full border border-white/40 flex items-center justify-center text-white/90 hover:bg-white hover:text-dark transition-colors shrink-0">
                                        <ArrowLeft size={16} strokeWidth={1.5} />
                                    </button>
                                    <div className="flex-1 h-px bg-white/40"></div>
                                    <button className="w-15 h-9 rounded-full border border-white/40 flex items-center justify-center text-white/90 hover:bg-white hover:text-dark transition-colors shrink-0">
                                        <ArrowRight size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            {/* Right Side Text (Beside Card) */}
                            <div className="w-full lg:w-[45%] pb-10 lg:pb-0">
                                <p className="text-white/95 text-3.25 md:text-sm font-medium leading-[1.8] max-w-137.5">
                                    Experience the epitome of luxury and leisure in our resort-style private estates. Set within
                                    lush landscaped grounds, these exclusive properties offer a wealth of amenities to indulge
                                    your every desire.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Luxurious properties section */}
            <div className="w-full bg-dark overflow-hidden font-sans pb-20">

                {/* Header (Constrained) */}
                <div className="w-full max-w-362.5 mx-auto px-6 md:px-15">
                    <div className="mb-5">
                        <h2 className="text-[#f9ece4] text-7.5 md:text-4xl font-bold mb-5 tracking-wide">
                            Luxurious properties
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {['Luxury Properties', 'Bestseller', 'Farm Vila', 'Royal House'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveLuxuryTab(tab)}
                                    className={`px-5 py-1.5 rounded-full text-3.25 font-medium border transition-colors cursor-pointer ${activeLuxuryTab === tab ? 'bg-[#faede3] text-dark border-transparent' : 'bg-transparent text-white/80 border-white/60 hover:border-white/80'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Divider Line */}
                    <div className="w-full h-px bg-white/40 mb-10 mt-6"></div>
                </div>
                {/* Slider Container (Bleeding) */}
                <div className="w-full relative mt-4">
                    <div
                        ref={luxurySliderRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide pr-6 md:pr-15"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

                        {filteredProperties.map((prop) => (
                            <div key={prop.id} className={`group shrink-0 rounded-xl w-70 md:w-80 rounded-4 snap-start shadow-xl flex flex-col overflow-hidden border ${prop.theme === 'light' ? 'bg-[#faede3] border-dark/60' : 'bg-dark border-white/80'}`}>
                                {/* Image Area */}
                                <div
                                    onClick={() => navigate(`/product/${prop.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                                    className="w-full h-55 relative shrink-0 cursor-pointer"
                                >
                                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 75% 100%, 0 100%)' }} />

                                    {/* Icons */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(prop);
                                            }}
                                            className={`w-7.5 h-7.5 rounded-2 ${
                                                isInWishlist(prop.id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-dark/50 text-white/80 hover:text-white hover:bg-dark'
                                            } flex items-center justify-center backdrop-blur-sm cursor-pointer transition-colors shadow-sm`}
                                            title="Wishlist"
                                        >
                                            <Heart size={14} fill={isInWishlist(prop.id) ? 'white' : 'none'} />
                                        </button>
                                        <div className="w-7.5 h-7.5 rounded-2 bg-dark/50 flex items-center justify-center text-white/80 backdrop-blur-sm cursor-pointer hover:text-white hover:bg-dark transition-colors"><Repeat size={14} /></div>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/product/${prop.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
                                            }}
                                            className="w-7.5 h-7.5 rounded-2 bg-dark/50 flex items-center justify-center text-white/80 backdrop-blur-sm cursor-pointer hover:text-white hover:bg-dark transition-colors"
                                        >
                                            <Eye size={14} />
                                        </div>
                                    </div>

                                    {/* Tag */}
                                    {prop.tag && (
                                        <div className="absolute top-4 right-4 bg-brand text-dark px-3 py-1 rounded-2 text-xs font-bold z-10">
                                            {prop.tag}
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                <div className="p-5 md:p-6 flex flex-col h-full grow">
                                    <div className={`flex items-center gap-2 text-xs font-bold mb-2 ${prop.theme === 'light' ? 'text-dark' : 'text-white/80'}`}>
                                        <Target size={14} />
                                        <span>Home</span>
                                    </div>
                                    <h3
                                        onClick={() => navigate(`/product/${prop.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                                        className={`text-lg md:text-xl font-bold mb-4 leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:underline ${prop.theme === 'light' ? 'text-dark' : 'text-[#f9ece4]'}`}
                                    >
                                        {prop.title}
                                    </h3>

                                    <div className="relative w-full mb-4">
                                        <select className={`w-full appearance-none bg-transparent border rounded-2 py-2 pl-4 pr-8 text-xs font-bold outline-none cursor-pointer ${prop.theme === 'light' ? 'border-dark/40 text-dark' : 'border-white/30 text-white/90'}`}>
                                            <option>{prop.size}</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1.5L6 6.5L11 1.5" stroke={prop.theme === 'light' ? '#1a232c' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className={`text-sm font-bold mb-6 flex flex-col justify-end min-h-10 ${prop.theme === 'light' ? 'text-dark' : 'text-white/90'}`}>
                                        {prop.price}
                                        {prop.oldPrice && <span className={`text-2.75 font-medium line-through ${prop.theme === 'light' ? 'text-dark/60' : 'text-white/40'}`}>{prop.oldPrice}</span>}
                                    </div>

                                    <button
                                        onClick={() =>
                                            addToCart({
                                                id: prop.id,
                                                title: prop.title,
                                                price: prop.price,
                                                image: prop.image,
                                                size: prop.size,
                                                quantity: 1,
                                            })
                                        }
                                        className={`group/btn mt-auto rounded-full py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 w-fit transition-all cursor-pointer ${prop.theme === 'light' ? 'bg-dark text-[#f9ece4] hover:bg-black hover:text-white' : 'bg-[#faede3] text-dark hover:bg-black hover:text-white'}`}
                                    >
                                        Add to Cart <ArrowRight size={14} className={`transition-colors ${prop.theme === 'light' ? 'text-[#f9ece4] group-hover/btn:text-white' : 'text-dark group-hover/btn:text-white'}`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slider Controls (Constrained) */}
                <div className="w-full max-w-362.5 mx-auto px-6 md:px-15">
                    <div className="flex items-center w-full mt-2">
                        <button onClick={scrollLuxuryLeft} className="w-15 h-9 rounded-full border border-white/80 flex items-center justify-center text-white/90 hover:bg-white hover:text-dark transition-colors shrink-0 cursor-pointer">
                            <ArrowLeft size={16} strokeWidth={1.5} />
                        </button>
                        <div className="flex-1 h-px bg-white/80"></div>
                        <button onClick={scrollLuxuryRight} className="w-15 h-9 rounded-full border border-white/80 flex items-center justify-center text-white/90 hover:bg-white hover:text-dark transition-colors shrink-0 cursor-pointer">
                            <ArrowRight size={16} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Exclusive Penthouse Apartments / East Side Living Bottom Section --- */}
            <div className="relative w-full bg-[#af765e] overflow-hidden pb-10 md:pb-12">
                <div className="w-full flex flex-col lg:flex-row items-start justify-between">

                    {/* Left Side: Modern Living Room Image with Hotspot */}
                    <div className="relative w-full lg:w-[58%] xl:w-[60%] shrink-0">
                        <div className="relative w-full h-120 sm:h-135 md:h-150 lg:h-157.5 xl:h-165 overflow-hidden">
                            <img
                                src={modernHousesImg}
                                alt="Modern Penthouse Living Room"
                                className="w-full h-full object-cover object-[center_28%]"
                            />

                            {/* + Hotspot Button (Positioned over window boundary) */}
                            <div className="absolute top-[21%] right-8 sm:right-9.5 md:right-10.5 z-20">
                                <button
                                    onClick={() => setShowHotspot(!showHotspot)}
                                    className="w-8.5 h-8.5 md:w-9 md:h-9 rounded-full bg-[#faede3] hover:bg-white flex items-center justify-center text-dark shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                                    aria-label="View room hotspot"
                                >
                                    <Plus size={18} strokeWidth={2.5} className={`transition-transform duration-300 ${showHotspot ? 'rotate-45' : ''}`} />
                                </button>

                                {showHotspot && (
                                    <div className="absolute right-0 top-11 bg-dark/95 backdrop-blur-md text-white text-xs py-2 px-3.5 rounded-2.5 shadow-2xl whitespace-nowrap border border-white/20">
                                        <p className="font-bold text-[#faede3]">Velvet Modular Lounge</p>
                                        <p className="text-2.75 text-white/70">Custom Concrete Architectural Interior</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Text & Property Card */}
                    <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col justify-start pt-6 sm:pt-7 lg:pt-7 px-6 sm:px-10 md:px-12 lg:px-8 xl:px-12">

                        {/* Description Text */}
                        <p className="text-white text-3.375 md:text-sm font-normal leading-[1.65] max-w-106.25 mb-5 sm:mb-6">
                            Elevate your living experience to new heights in our exclusive<br className="hidden sm:inline" />{" "}
                            penthouse apartments. Perched atop towering skyscrapers,<br className="hidden sm:inline" />{" "}
                            these magnificent residences offer unrivaled panoramic views<br className="hidden sm:inline" />{" "}
                            that stretch as far as the eye can see.
                        </p>

                        {/* Smooth Sliding Carousel Viewport */}
                        <div
                            className="w-full max-w-97.5 sm:max-w-103.75 overflow-hidden rounded-5"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            {/* Sliding Track with GPU acceleration and cubic-bezier easing */}
                            <div
                                className="flex w-full transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
                                style={{ transform: `translateX(-${penthouseIndex * 100}%)` }}
                            >
                                {penthouseProperties.map((prop) => (
                                    <div
                                        key={prop.id}
                                        className="w-full min-w-full shrink-0 rounded-5 border border-white/70 p-4 sm:p-4.5 flex flex-col shadow-xl box-border"
                                    >
                                        {/* Card Image with Chamfered Bottom-Right Corner & Proper Fitting */}
                                        <div
                                            onClick={() => navigate(`/product/${prop.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                                            className="relative w-full h-56.25 sm:h-61.25 md:h-62.5 overflow-hidden mb-4 rounded-t-3.5 cursor-pointer"
                                        >
                                            <img
                                                src={prop.image}
                                                alt={prop.title}
                                                className="w-full h-full object-cover object-center rounded-t-3.5 transition-transform duration-500 hover:scale-105"
                                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 46px), calc(100% - 46px) 100%, 0 100%)' }}
                                            />
                                            {/* Tag */}
                                            {prop.tag && (
                                                <div className="absolute top-3.5 right-3.5 bg-brand/85 backdrop-blur-xs text-[#faede3] px-3 py-0.5 rounded-1.5 text-xs font-bold shadow-sm">
                                                    {prop.tag}
                                                </div>
                                            )}
                                        </div>

                                        {/* Home Category */}
                                        <div className="flex items-center gap-2 text-white/95 text-3.25 font-bold mb-2">
                                            <Target size={15} className="text-white" />
                                            <span>Home</span>
                                        </div>

                                        {/* Card Title */}
                                        <h3
                                            onClick={() => navigate(`/product/${prop.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)}
                                            className="text-white text-5.25 sm:text-5.5 font-bold leading-tight mb-4 min-h-7 cursor-pointer hover:underline"
                                        >
                                            {prop.title}
                                        </h3>

                                        {/* Size Dropdown Box */}
                                        <div className="relative w-full mb-4">
                                            <select
                                                value={selectedSizes[prop.id] || prop.sizes[0]}
                                                onChange={(e) => handleSizeChange(prop.id, e.target.value)}
                                                className="w-full appearance-none bg-transparent border border-white/40 rounded-3 py-2.5 px-4 text-3.375 font-medium text-white outline-none cursor-pointer hover:border-white/70 transition-colors"
                                            >
                                                {prop.sizes.map((s) => (
                                                    <option key={s} value={s} className="bg-[#af765e] text-white">{s}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/80">
                                                <ChevronDown size={17} strokeWidth={2} />
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-white text-3.625 sm:text-3.75 font-bold mb-4.5 flex items-center flex-wrap gap-2.5">
                                            <span>{prop.price}</span>
                                            {prop.oldPrice && (
                                                <span className="text-white/40 line-through text-3.125 font-medium">
                                                    {prop.oldPrice}
                                                </span>
                                            )}
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() =>
                                                addToCart({
                                                    id: prop.id,
                                                    title: prop.title,
                                                    price: prop.price,
                                                    image: prop.image,
                                                    size: selectedSizes[prop.id] || prop.sizes[0],
                                                    quantity: 1,
                                                })
                                            }
                                            className="bg-[#faede3] text-dark hover:bg-white rounded-full py-2.5 px-6 font-bold text-3.25 flex items-center gap-2 w-fit transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
                                        >
                                            <span>Add to Cart</span>
                                            <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Slider Controls below card */}
                        <div className="flex items-center w-full max-w-97.5 sm:max-w-103.75 mt-4">
                            <button
                                id="penthouse-prev-btn"
                                onClick={prevPenthouse}
                                aria-label="Previous property"
                                className="group w-14 h-8.5 md:w-14.5 md:h-8.75 rounded-full bg-dark border border-white/80 flex items-center justify-center text-white hover:bg-[#faede3] hover:text-dark hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                            >
                                <ArrowLeft size={16} strokeWidth={1.8} className="transition-transform duration-300 group-hover:-translate-x-1 text-inherit" />
                            </button>

                            <div className="flex-1 h-px bg-white/40 relative">
                                <div
                                    className="absolute top-0 left-0 h-full bg-[#faede3] transition-all duration-500 ease-out"
                                    style={{
                                        width: `${((penthouseIndex + 1) / penthouseProperties.length) * 100}%`
                                    }}
                                />
                            </div>

                            <button
                                id="penthouse-next-btn"
                                onClick={nextPenthouse}
                                aria-label="Next property"
                                className="group w-14 h-8.5 md:w-14.5 md:h-8.75 rounded-full bg-dark border border-white/80 flex items-center justify-center text-white hover:bg-[#faede3] hover:text-dark hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                            >
                                <ArrowRight size={16} strokeWidth={1.8} className="transition-transform duration-300 group-hover:translate-x-1 text-inherit" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Find Your Ideal Space & Tech-Integrated Homes Newsletter Section --- */}

            {/* Top-Left Header Cutout Block */}
            <div className="w-full max-w-362.5 mx-auto px-6 md:px-15 mt-10 md:mt-20 mb-4">
                <h2 className="text-white text-3xl sm:text-8.5 md:text-9.5 font-extrabold leading-[1.1] tracking-tight">
                    <span className="block whitespace-nowrap">Find your ideal space</span>
                </h2>
            </div>
            <div className="relative w-full bg-dark overflow-hidden pb-12 md:pb-16">
                <div className="relative w-full h-135 sm:h-145 md:h-155 lg:h-165 xl:h-175 overflow-hidden">

                    {/* Full-width Panoramic Villa Image */}
                    <img
                        src={subscribeImg}
                        alt="Find your ideal space - Tech-integrated luxury home"
                        className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
                    />

                    {/* Top-Right Description Cutout Block */}
                    <div className="hidden md:block absolute top-0 right-0 left-[44%] bg-dark pt-6 pb-6 pl-8 pr-10 lg:pl-12 lg:pr-14 rounded-bl-7 md:rounded-bl-8 z-10">
                        <p className="text-white/90 text-3.125 lg:text-3.625 leading-[1.65] font-normal max-w-155">
                            Welcome to the epitome of modern living in our tech-integrated homes. Seamlessly blending cutting-edge technology with elegant design, these residences are equipped with state-of-the-art smart home systems that enhance convenience, security, and energy efficiency.
                        </p>
                    </div>

                    {/* Bottom-Right Newsletter Cutout Block */}
                    <div className="absolute bottom-0 right-0 w-full md:w-auto md:left-[44%] bg-dark rounded-t-7 md:rounded-tr-none md:rounded-tl-9 pt-7 pb-8 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-14 z-10">
                        <h3 className="text-white text-2xl sm:text-7 md:text-7.5 lg:text-8 font-bold leading-tight mb-2.5 tracking-tight">
                            Subscribe newsletter and get -20% off
                        </h3>

                        <p className="text-slate-300 text-3.125 sm:text-3.25 md:text-3.375 leading-[1.65] font-normal mb-5 max-w-140">
                            Control your home's lighting, temperature, and entertainment systems with a simple touch or voice command. Embrace the future of living as you experience the effortless integration of technology into every aspect of your daily life.
                        </p>

                        {/* Input Bar */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setSubscribed(true);
                                setTimeout(() => setSubscribed(false), 3000);
                            }}
                            className="w-full rounded-xl max-w-160.5 flex items-center bg-dark border-2 border-white/50 p-1.5 focus-within:border-white transition-colors shadow-xl"
                        >
                            <input
                                type="email"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Enter email address..."
                                className="flex-1 bg-transparent text-white placeholder-white/60 text-3.375 px-3.5 py-2 outline-none font-semibold min-w-0"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-[#faede3] hover:bg-white text-dark rounded-1.75 py-2.5 px-5 sm:px-6 font-extrabold text-3.25 flex items-center gap-1.5 shrink-0 transition-all duration-300 shadow-sm hover:scale-[1.02] cursor-pointer group"
                            >
                                <span>{subscribed ? 'Subscribed!' : 'Subscription'}</span>
                                <ArrowUpRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* --- Homes speaking for themselves Blog Section --- */}
            <div className="w-full bg-dark py-10 md:py-14 overflow-hidden font-sans">
                <div className="w-full max-w-362.5 mx-auto px-6 md:px-15">

                    {/* Section Heading */}
                    <h2 className="text-white text-7.5 sm:text-4xl md:text-7.5 font-bold mb-8 tracking-tight">
                        Homes speaking for themselves
                    </h2>

                    {/* Carousel Container */}
                    <div className="w-full relative">
                        <div
                            ref={blogSliderRef}
                            onScroll={handleBlogScroll}
                            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {blogArticles.map((article) => (
                                <div
                                    key={article.id}
                                    className="blog-card rounded-2xl shrink-0 w-72.5 sm:w-80 md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start rounded-5 border-2 border-white/60 hover:border-white bg-dark p-4.5 sm:p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 group"
                                >
                                    {/* Image Container with Angled Cut */}
                                    <div className="w-full h-50 sm:h-52.5 relative rounded-3.5 overflow-hidden mb-4 shrink-0 bg-[#141b22]">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 78%, 80% 100%, 0 100%)' }}
                                        />
                                        {/* Category Badge */}
                                        <span className="absolute top-3 left-3 bg-[#faede3] text-dark px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-sm">
                                            {article.category}
                                        </span>
                                    </div>

                                    {/* Card Info */}
                                    <div className="flex flex-col">
                                        <p className="text-white/80 text-3.25 font-bold mb-1.5">
                                            {article.date} | {article.author}
                                        </p>
                                        <h3 className="text-white font-extrabold text-lg sm:text-4.75 leading-snug mb-2 line-clamp-1 group-hover:text-[#faede3] transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-white/70 text-l text-3.375 leading-[1.65] font-semibold mb-5 line-clamp-4">
                                            {article.description}
                                        </p>

                                        {/* Button */}
                                        <button className="bg-[#faede3] hover:bg-white text-dark rounded-full py-2.5 px-5 font-extrabold text-3.25 flex items-center gap-2 w-fit transition-all duration-300 shadow-sm hover:scale-[1.02] cursor-pointer group/btn mt-auto">
                                            <span>Show full details</span>
                                            <ArrowRight size={14} strokeWidth={2.5} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Slider Controls with Connecting Line */}
                    <div className="flex items-center w-full mt-8 md:mt-10">
                        <button
                            onClick={scrollBlogLeft}
                            aria-label="Previous article"
                            className="group w-12.5 h-8.5 sm:w-14 sm:h-8.75 rounded-full bg-dark border-2 border-white/90 flex items-center justify-center text-white hover:bg-[#faede3] hover:text-dark hover:border-transparent transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                        >
                            <ArrowLeft size={16} strokeWidth={2.2} className="transition-transform duration-300 group-hover:-translate-x-1" />
                        </button>

                        <div className="flex-1 h-0.5 bg-white/50 relative mx-3 sm:mx-4">
                            <div
                                className="absolute top-0 left-0 h-full bg-[#faede3] transition-all duration-300 ease-out"
                                style={{
                                    width: `${Math.max(20, blogProgress || 20)}%`,
                                }}
                            />
                        </div>

                        <button
                            onClick={scrollBlogRight}
                            aria-label="Next article"
                            className="group w-12.5 h-8.5 sm:w-14 sm:h-8.75 rounded-full bg-dark border-2 border-white/90 flex items-center justify-center text-white hover:bg-[#faede3] hover:text-dark hover:border-transparent transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                        >
                            <ArrowRight size={16} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
