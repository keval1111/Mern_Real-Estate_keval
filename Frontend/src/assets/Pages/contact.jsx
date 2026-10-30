import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const clientName = `${formData.firstName} ${formData.lastName}`.trim() || 'Storefront Visitor';
      const res = await fetch('http://localhost:5000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: clientName,
          email: formData.email,
          phone: formData.phone || '',
          property: 'Contact Us Inquiry',
          message: formData.description || 'General Inquiry from storefront contact page.',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit inquiry');
      }

      setSubmittedInfo(json.data || {
        client: clientName,
        email: formData.email,
        phone: formData.phone,
        message: formData.description,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        description: '',
      });
    } catch (err) {
      console.warn('Backend inquiry post error:', err);
      setErrorMessage(err.message || 'Could not connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white font-sans text-dark flex flex-col relative overflow-hidden">
      {/* Background split: Dark on top, White on bottom */}
      <div className="absolute top-0 left-0 right-0 h-96.25 md:h-93.75 bg-dark z-0" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-362.5 mx-auto px-4 sm:px-6 md:px-8 lg:px-20 pt-16 pb-28 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Left Column: Top text in dark area, Contact details in white area */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Dark Top Section */}
            <div>
              {/* Back to Home Button */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors mb-6 group cursor-pointer w-fit select-none"
              >
                <span className="w-7 h-7 rounded-full border border-white/50 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all shrink-0">
                  <ArrowLeft size={13} strokeWidth={2} />
                </span>
                <span className="text-xs md:text-sm font-medium">Back to Home</span>
              </button>

              {/* Title */}
              <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
                Contact with us
              </h1>

              {/* Description */}
              <p className="text-xs md:text-sm font-normal text-white/80 leading-relaxed max-w-md">
                With that in mind, we strive to deliver accurate, trustworthy, and engaging content to our users. Our team of experts, researchers, and writers work tirelessly to curate high-quality articles, guides, and resources that cover various domains such as technology, science, health, business, and more.
              </p>
            </div>

            {/* Bottom White Area: CALL US, ADDRESS, EMAIL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 mt-20 sm:mt-24 lg:mt-32 pt-2">
              {/* CALL US */}
              <div className="flex flex-col">
                <span className="text-xs md:text-[13px] font-bold text-dark tracking-wider uppercase mb-1.5">
                  CALL US
                </span>
                <span className="text-sm md:text-base font-bold text-dark">
                  +48 0021-32-12
                </span>
              </div>

              {/* ADDRESS */}
              <div className="flex flex-col sm:row-span-2">
                <span className="text-xs md:text-[13px] font-bold text-dark tracking-wider uppercase mb-1.5">
                  ADDRESS:
                </span>
                <p className="text-sm md:text-base font-bold text-dark leading-relaxed">
                  1093 Marigold Lane,<br />
                  Coral Way, Miami,<br />
                  Florida, 33169
                </p>
              </div>

              {/* EMAIL */}
              <div className="flex flex-col">
                <span className="text-xs md:text-[13px] font-bold text-dark tracking-wider uppercase mb-1.5">
                  EMAIL:
                </span>
                <span className="text-sm md:text-base font-bold text-dark">
                  shop@company.com
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form heading + Overlapping Card */}
          <div className="lg:col-span-7 mt-2 sm:mt-4 lg:mt-30 flex flex-col">
            {/* Header: Contact form */}
            <h2 className="text-dark lg:text-white text-2xl sm:text-3xl md:text-2xl font-bold tracking-tight mb-4 sm:mb-5 leading-tight">
              Contact form
            </h2>

            {/* Contact Form Card */}
            <div className="bg-white border border-black p-6 sm:p-8 md:p-9 shadow-xs text-dark">
              {isSubmitted && submittedInfo && (
                <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-extrabold text-sm md:text-base">
                    <CheckCircle2 size={22} className="shrink-0 text-emerald-600" />
                    <span>Inquiry Successfully Saved to Database!</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                    Thank you <strong className="font-bold underline">{submittedInfo.client}</strong>! Your message has been recorded into our platform. Reference ID: <code className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold">{submittedInfo._id || 'SAVED-IN-MONGODB'}</code>
                  </p>
                  <div className="text-[11px] bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-emerald-800 flex flex-wrap gap-x-4 gap-y-1 font-medium">
                    <span>📧 {submittedInfo.email}</span>
                    {submittedInfo.phone && <span>📞 {submittedInfo.phone}</span>}
                    <span>📅 {submittedInfo.date || 'Today'}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 italic">
                    Our property agents will contact you shortly. You can also chat with us live using the floating chat button on the bottom right.
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-400 text-rose-800 text-xs font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Row 1: First name & Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-[13px] font-medium text-dark">
                      First name <span className="text-red-500 font-bold">*</span> :
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 border border-black text-xs md:text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-black bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-[13px] font-medium text-dark">
                      Last name <span className="text-red-500 font-bold">*</span> :
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 border border-black text-xs md:text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-black bg-white"
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-[13px] font-medium text-dark">
                      Email <span className="text-red-500 font-bold">*</span> :
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="shop@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 border border-black text-xs md:text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-black bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs md:text-[13px] font-medium text-dark">
                      Phone number <span className="text-red-500 font-bold">*</span> :
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 sm:py-3 border border-black text-xs md:text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-black bg-white"
                    />
                  </div>
                </div>

                {/* Row 3: Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs md:text-[13px] font-medium text-dark">
                    Description:
                  </label>
                  <textarea
                    rows={5}
                    placeholder="How Can We Help?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-black text-xs md:text-sm text-dark placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-black bg-white resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-dark hover:bg-black text-white rounded-full py-3 px-8 text-xs md:text-sm font-bold flex items-center gap-2.5 cursor-pointer transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-60"
                  >
                    <span>{submitting ? 'Sending to Database...' : 'Send Message'}</span>
                    <ArrowRight size={14} strokeWidth={2.5} className={submitting ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Google Map Section */}
      <div className="w-full relative border-t border-black/10 overflow-hidden bg-gray-100">
        {/* Floating Location Card matching reference */}
        <div className="absolute top-5 left-5 z-20 bg-white/95 backdrop-blur-xs p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 max-w-70 sm:max-w-85 pointer-events-auto">
          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
            1-2 Adam Court, Sráid Grafton
          </h4>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
            1-2 Adam Court, Sráid Grafton, Dublin 2, D02 W0Y7, Ireland
          </p>
          <div className="flex items-center gap-2.5 mt-3.5">
            <a
              href="https://www.google.com/maps/search/?api=1&query=1-2+Adam+Court,+Sr%C3%A1id+Grafton,+Dublin+2,+D02+W0Y7,+Ireland"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Open in Maps</span>
            </a>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=1-2+Adam+Court,+Sr%C3%A1id+Grafton,+Dublin+2,+D02+W0Y7,+Ireland"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center transition-colors shadow-2xs"
              title="Get Directions"
            >
              <ArrowRight size={14} className="-rotate-45" />
            </a>
          </div>
        </div>

        {/* Google Map iframe */}
        <iframe
          title="1-2 Adam Court, Sráid Grafton Location Map"
          src="https://maps.google.com/maps?q=1-2%20Adam%20Court%2C%20Sr%C3%A1id%20Grafton%2C%20Dublin%202%2C%20D02%20W0Y7%2C%20Ireland&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-95 sm:h-105 md:h-120 lg:h-130 border-0 block"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
