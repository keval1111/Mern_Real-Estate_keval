import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Search, Calendar, User, Clock, Tag, X, Share2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import blogImg1 from '../Images/1.webp';
import blogImg2 from '../Images/2.webp';
import blogImg3 from '../Images/3.webp';
import blogImg4 from '../Images/4.webp';
import blogImg5 from '../Images/5.webp';
import sliderImg from '../Images/slider.webp';

const blogArticles = [
  {
    id: 1,
    image: blogImg1,
    category: "Architecture",
    date: "25 May 2023",
    author: "WorkDo",
    readTime: "5 min read",
    title: "A modern double house in the forest sanctuary",
    description: "Forest Haven is a remarkable retreat nestled amidst the serene beauty of the forest. This modern double house offers a unique blend of contemporary minimalism with natural timber finishes and panoramic floor-to-ceiling glass.",
    fullContent: `Nestled deep within the whispering pine forests, the Forest Haven residence represents an ambition to coexist seamlessly with nature without sacrificing modern conveniences. 

The architectural blueprint leverages sustainable cross-laminated timber (CLT) paired with ultra-low-emissivity glazed panels. These large expanses of glass not only capture passive solar heat during crisper seasons, but also visually dissolve the barrier between the indoor living space and the pristine surrounding foliage.

Every corner of this double-level home was oriented to maximize morning dawn sunlight in the breakfast pavilion, while shading afternoon heat through cantilevered eaves inspired by modern Scandinavian design.`
  },
  {
    id: 2,
    image: blogImg2,
    category: "Real Estate",
    date: "22 May 2023",
    author: "WorkDo",
    readTime: "4 min read",
    title: "Contemporary urban residence in the heart of San Francisco",
    description: "A contemporary residence offering the perfect blend of modern design and the comforts of city living. Nestled in a vibrant cultural neighborhood with breathtaking skyline outlooks.",
    fullContent: `Urban luxury is redefined when sleek industrial elements harmonize with warm organic textures. Situated on a historic hill overlooking the bay, this bespoke residence features an open-concept flow optimized for hosting and relaxed contemplation.

High ceilings, custom acoustic paneling, and integrated smart home infrastructure provide a tranquil sanctuary above the bustling streetscape below. The rooftop terrace introduces private green zones and a fire lounge designed for year-round entertaining.`
  },
  {
    id: 3,
    image: blogImg4,
    category: "Luxury Living",
    date: "18 May 2023",
    author: "WorkDo",
    readTime: "6 min read",
    title: "2-storey coastal villa with direct sea access",
    description: "Seaside Serenity brings luxury to coastal living in this stunning 2-storey villa with direct access to crystal-clear water, infinity plunge pool, and natural stone verandas.",
    fullContent: `Direct water access remains one of the rarest privileges in prime global real estate. Seaside Serenity takes advantage of its cliffside orientation with cascading terraces crafted from local travertine stone.

The interior palette mirrors the shoreline—soft sands, muted ocean blues, and bleached oak joinery. Salt-resistant marine-grade architectural finishes ensure long-lasting durability while maintaining effortless elegance throughout the seasons.`
  },
  {
    id: 4,
    image: blogImg5,
    category: "Design Trends",
    date: "12 May 2023",
    author: "WorkDo",
    readTime: "3 min read",
    title: "Dream House Diaries: Rethinking space and sustainable architecture",
    description: "Challenging conventional notions of luxury living to explore the unique joys of ergonomic flow, sustainable energy generation, and zero-carbon building foundations.",
    fullContent: `Modern luxury is shifting away from excessive square footage toward intelligent spatial efficiency and ecological stewardship. Modern homeowners demand intuitive layout planning where multipurpose zones adapt between remote productivity and relaxed family living.

Key innovations highlighted in this project include greywater recycling systems, subterranean thermal cooling, and rooftop solar arrays subtly blended into matte zinc standing seam roofs.`
  },
  {
    id: 5,
    image: blogImg3,
    category: "Architecture",
    date: "08 May 2023",
    author: "WorkDo",
    readTime: "5 min read",
    title: "Pavilion Lakeside Retreat: Where water meets timber",
    description: "A lakeview sanctuary offering peaceful surroundings with classical architectural charm and picturesque outdoor lounging spaces surrounded by crystal-clear waters.",
    fullContent: `Built on elevated piers to respect natural watershed topography, the Pavilion Lakeside Retreat captures panoramic water views from all four sides. 

A floating boardwalk connects private guest suites to the central living pavilion, where vaulted exposed-beam ceilings create an expansive, air-filled ambiance that echoes timeless lakeside lodges with a clean minimalist twist.`
  },
  {
    id: 6,
    image: sliderImg,
    category: "Real Estate",
    date: "02 May 2023",
    author: "WorkDo",
    readTime: "7 min read",
    title: "The White House: State-of-the-art smart living and timeless design",
    description: "Experience state-of-the-art smart living in our iconic architectural masterpiece featuring grand double-height glass facades, geothermal climate control, and ambient illumination.",
    fullContent: `The White House J-54 stands as a testament to contemporary geometric rigor. Its brilliant white lime plaster facades contrast vividly with midnight-bronze framing and lush landscaped courtyards.

Equipped with automated biometric access, smart dynamic tinting glass, and an intelligent micro-climate regulation unit, this home exemplifies the cutting edge of high-performance luxury living.`
  }
];

const categories = ["All", "Architecture", "Real Estate", "Luxury Living", "Design Trends"];

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesSectionRef = useRef(null);

  const itemsPerPage = 3;

  const filteredArticles = blogArticles.filter((article) => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesQuery =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (articlesSectionRef.current) {
      articlesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const featured = blogArticles[0];

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col">
      {/* Dark Header Banner */}
      <div className="w-full bg-dark pt-20 pb-12 px-4 sm:px-6 md:px-8 lg:px-30">
        <div className="w-full max-w-362.5 mx-auto">
          {/* Back to home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors mb-5 group cursor-pointer w-fit"
          >
            <span className="w-7 h-7 rounded-full border border-white/50 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
              <ArrowLeft size={13} strokeWidth={2} />
            </span>
            <span className="text-xs md:text-sm font-medium">Back to home</span>
          </button>

          {/* Title + Subtitle */}
          <div className="max-w-3xl">
            <h1 className="text-white text-3xl md:text-4xl lg:text-3xl font-bold tracking-tight mb-3 leading-tight">
              Blog & Articles
            </h1>
            <p className="text-xs md:text-sm font-normal text-white/80 leading-relaxed max-w-2xl">
              Explore architectural innovations, luxury property insights, interior inspirations, and behind-the-scenes stories from the world of contemporary living.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-362.5 mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-10 flex-1 flex flex-col">
        {/* Breadcrumb + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-black">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <button
              onClick={() => navigate('/')}
              className="hover:underline hover:text-black transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-semibold">Blog</span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-black rounded-full focus:outline-none transition-colors"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto py-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border border-black ${
                selectedCategory === cat
                  ? 'bg-dark text-white shadow-sm'
                  : 'bg-[#f4efe8] text-dark hover:bg-[#faede3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article Card (if no search filter applied and on page 1) */}
        {selectedCategory === "All" && !searchQuery && safeCurrentPage === 1 && (
          <div className="mb-12 rounded-3xl bg-dark text-white overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 group border border-black">
            <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto relative overflow-hidden">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-[#faede3] text-dark px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow">
                Featured • {featured.category}
              </span>
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs font-medium text-white/70 mb-3">
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> {featured.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {featured.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-[#faede3] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {featured.description}
                </p>
              </div>

              <button
                onClick={() => setActiveArticle(featured)}
                className="bg-[#faede3] hover:bg-white text-dark rounded-full py-3 px-6 font-bold text-sm flex items-center gap-2 w-fit transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.02]"
              >
                <span>Read full story</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* Articles Grid Section with Pagination */}
        <div ref={articlesSectionRef} className="mb-16 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-dark">
              {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredArticles.length}) — Page {safeCurrentPage} of {Math.max(1, totalPages)}
              </span>
            </h3>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-black rounded-2xl bg-gray-50">
              <BookOpen size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No articles matched your criteria.</p>
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); setCurrentPage(1); }}
                className="mt-3 text-sm font-bold text-dark underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              {/* 3 boxes per page */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {currentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-2xl border border-black bg-white p-4.5 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div>
                      {/* Image with cut polygon */}
                      <div className="w-full h-52 relative rounded-xl overflow-hidden mb-4 bg-gray-100 border border-black/20">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%)' }}
                        />
                        <span className="absolute top-3 left-3 bg-[#faede3] text-dark px-3 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm border border-black/20">
                          {article.category}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {article.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-base sm:text-lg font-bold text-dark leading-snug mb-2 line-clamp-2 group-hover:text-brand transition-colors">
                        {article.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {article.description}
                      </p>
                    </div>

                    {/* Read Article Button */}
                    <button
                      onClick={() => setActiveArticle(article)}
                      className="w-full mt-2 bg-[#f4efe8] hover:bg-dark hover:text-white text-dark rounded-full py-2.5 px-4 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border border-black/30"
                    >
                      <span>Read article</span>
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 sm:mt-12 flex items-center justify-center gap-2.5 sm:gap-3">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    aria-label="Previous page"
                    className={`w-10 h-10 rounded-full border border-black flex items-center justify-center transition-all ${
                      safeCurrentPage === 1
                        ? 'opacity-35 cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-white hover:bg-dark hover:text-white text-dark cursor-pointer shadow-sm active:scale-95'
                    }`}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-full border border-black flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                        safeCurrentPage === pageNum
                          ? 'bg-dark text-white shadow-md'
                          : 'bg-white text-dark hover:bg-[#faede3]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    aria-label="Next page"
                    className={`w-10 h-10 rounded-full border border-black flex items-center justify-center transition-all ${
                      safeCurrentPage === totalPages
                        ? 'opacity-35 cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-white hover:bg-dark hover:text-white text-dark cursor-pointer shadow-sm active:scale-95'
                    }`}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="rounded-3xl bg-[#f4efe8] p-8 md:p-12 text-center max-w-3xl mx-auto w-full border border-black">
          <span className="text-xs font-bold uppercase tracking-widest text-dark/70 block mb-2">
            Stay Inspired
          </span>
          <h3 className="text-2xl md:text-3xl font-bold text-dark mb-3">
            Subscribe to our Architecture Gazette
          </h3>
          <p className="text-sm text-gray-700 max-w-xl mx-auto mb-6">
            Get curated architectural breakdowns, luxury property reveals, and design trends delivered weekly directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-full bg-white border border-black text-sm focus:outline-none"
            />
            <button
              onClick={() => alert("Thank you for subscribing to our blog!")}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-dark text-white font-bold text-sm hover:bg-black transition-colors whitespace-nowrap cursor-pointer shadow"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black flex flex-col relative my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Image */}
            <div className="relative w-full h-64 sm:h-72 shrink-0 bg-gray-100">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
              <span className="absolute bottom-4 left-4 bg-[#faede3] text-dark px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase shadow">
                {activeArticle.category}
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-3">
                <span className="flex items-center gap-1.5"><Calendar size={13} /> {activeArticle.date}</span>
                <span className="flex items-center gap-1.5"><User size={13} /> {activeArticle.author}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} /> {activeArticle.readTime}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-dark leading-tight mb-4">
                {activeArticle.title}
              </h2>

              <p className="text-base text-gray-700 font-medium leading-relaxed mb-6 italic border-l-4 border-dark pl-4 bg-gray-50 py-3 rounded-r-lg">
                "{activeArticle.description}"
              </p>

              <div className="prose prose-sm sm:prose text-gray-700 leading-relaxed whitespace-pre-line mb-8">
                {activeArticle.fullContent}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {activeArticle.category}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert("Article link copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-dark hover:underline cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
