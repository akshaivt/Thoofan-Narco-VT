import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gov-navy uppercase tracking-wider">Contact Administration</h1>
        <div className="w-16 h-1 bg-gov-gold mx-auto mt-3"></div>
        <p className="text-slate-600 mt-4 max-w-xl mx-auto">
          Need support? Reach out to our technical desk. Do not use this form to report drug incidents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="bg-gov-navy text-white p-8 rounded-xl lg:col-span-1 border-b-4 border-gov-gold flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wider text-gov-gold">Headquarters</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              NarcoVT Command Center
              <br />Intelligence Bureau
              <br />New Delhi, India
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-5 w-5 text-gov-gold" />
                <span>+91 11 2301-xxxx</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-5 w-5 text-gov-gold" />
                <span>support@narcovt.gov.in</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-5 w-5 text-gov-gold" />
                <span>Block-7, CGO Complex, ND</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 bg-gov-blue/50 rounded border border-gov-blue text-[10px] text-slate-400">
            Note: All network traffic to these servers is audited for security.
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="bg-white p-8 rounded-xl lg:col-span-2 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-gov-navy uppercase tracking-wider mb-6">Send a Message</h3>
          
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-lg">
              Thank you. Your message has been sent successfully to the secure operations desk.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Message</label>
              <textarea
                rows="4"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-gov-blue transition-smooth text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-gov-navy hover:bg-gov-blue text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-smooth flex items-center space-x-2 text-xs uppercase tracking-wider cursor-pointer"
            >
              <span>Submit Enquiry</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
