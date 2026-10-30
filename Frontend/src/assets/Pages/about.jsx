import React from 'react';
import { ArrowLeft, Award, ShieldCheck, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import sliderImg from '../Images/slider.webp';

const About = () => {
  const navigate = useNavigate();

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

          {/* Title + Description */}
          <div className="max-w-3xl">
            <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-tight">
              About us
            </h1>
            <p className="text-xs md:text-sm font-normal text-white/80 leading-relaxed max-w-2xl">
              We are dedicated to delivering premier architectural craftsmanship, luxury suburban residences,
              and bespoke real estate solutions that turn visionary living into timeless homes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-362.5 mx-auto px-4 sm:px-6 md:px-8 lg:px-20 py-12 flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800 pb-8 border-b border-black">
          <button
            onClick={() => navigate('/')}
            className="hover:underline hover:text-black transition-colors cursor-pointer"
          >
            Home
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">About us</span>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand mb-2 block">
              Our Heritage & Vision
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark tracking-tight mb-6 leading-tight">
              Crafting extraordinary living spaces since 2014.
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
              Founded on the belief that a home is more than an address, Modern Real Estate curates residences
              that seamlessly blend cutting-edge contemporary aesthetics with ecological sustainability and functional elegance.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-8">
              From countryside villas to urban penthouses, every property in our portfolio undergoes rigorous architectural
              verification to guarantee unparalleled luxury and lasting value for families and investors worldwide.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-black bg-white">
                <div className="text-2xl md:text-3xl font-extrabold text-dark mb-1">12+</div>
                <div className="text-xs text-gray-600 font-medium">Years of Excellence</div>
              </div>
              <div className="p-4 border border-black bg-white">
                <div className="text-2xl md:text-3xl font-extrabold text-dark mb-1">850+</div>
                <div className="text-xs text-gray-600 font-medium">Properties Delivered</div>
              </div>
              <div className="p-4 border border-black bg-white">
                <div className="text-2xl md:text-3xl font-extrabold text-dark mb-1">99%</div>
                <div className="text-xs text-gray-600 font-medium">Client Satisfaction</div>
              </div>
              <div className="p-4 border border-black bg-white">
                <div className="text-2xl md:text-3xl font-extrabold text-dark mb-1">24/7</div>
                <div className="text-xs text-gray-600 font-medium">Concierge Support</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-black overflow-hidden shadow-lg bg-gray-100">
              <img
                src={sliderImg}
                alt="Modern Architecture"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="pt-8 pb-16 border-t border-black">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-dark mb-3">
              Why Choose Modern Real Estate
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Built upon transparency, architectural precision, and an unwavering commitment to our clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-black bg-white flex flex-col hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-dark text-white flex items-center justify-center mb-5 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-bold text-dark mb-2">Verified Integrity</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Clear documentation, verified land titles, and transparent valuation policies for complete peace of mind.
              </p>
            </div>

            <div className="p-6 border border-black bg-white flex flex-col hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-dark text-white flex items-center justify-center mb-5 shrink-0">
                <Building2 size={24} />
              </div>
              <h4 className="text-lg font-bold text-dark mb-2">Prime Locations</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Exclusively positioned in high-growth corridors, lush serene countryside, and prime cosmopolitan hubs.
              </p>
            </div>

            <div className="p-6 border border-black bg-white flex flex-col hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-dark text-white flex items-center justify-center mb-5 shrink-0">
                <Award size={24} />
              </div>
              <h4 className="text-lg font-bold text-dark mb-2">Architectural Excellence</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Modern floor plans designed by award-winning architects with energy-efficient materials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
