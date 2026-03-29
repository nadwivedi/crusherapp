import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Contact = () => {
  return (
    <div className="w-full pt-10 pb-24 bg-gray-50">
      <Helmet>
        <title>Contact Us | Crusherbook ERP</title>
        <meta name="description" content="Get in touch with the Crusherbook team for support or inquiries regarding our stone crusher plant management software." />
      </Helmet>
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 mb-16 mt-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-brand-navy mb-6"
        >
          Get in Touch
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-brand-slate leading-relaxed"
        >
          Have a question about Crusherbook or need help setting it up? 
          Our team is ready to assist you.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6"
            >
              <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center shrink-0">
                <Phone className="text-brand-orange w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">Call Us</h3>
                <p className="text-brand-slate mb-1">Mon - Sat: 9:00 AM to 6:00 PM</p>
                <div className="flex flex-col gap-1 mt-3">
                  <a href="tel:+916264682508" className="text-brand-orange font-semibold hover:underline">+91 6264682508</a>
                  <a href="tel:+919202469725" className="text-brand-orange font-semibold hover:underline">+91 9202469725</a>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6"
            >
              <div className="w-12 h-12 bg-brand-accent/20 rounded-full flex items-center justify-center shrink-0">
                <Mail className="text-brand-navy w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">Email Us</h3>
                <p className="text-brand-slate mb-3">Send us an email anytime and we will get back to you within 24 hours.</p>
                <a href="mailto:softwarebytesindia@gmail.com" className="text-brand-orange font-semibold hover:underline break-all">
                  softwarebytesindia@gmail.com
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6"
            >
               <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="text-gray-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">Office</h3>
                <p className="text-brand-slate">
                  Shankar Nagar, Raipur<br/>
                  Chhattisgarh, India<br/>
                  (A SoftwareBytes Product)
                </p>
              </div>
            </motion.div>
          </div>

          {/* Contact Form Placeholder */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-brand-navy mb-6">Send a Message</h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-sans"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-sans"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-2">Message</label>
                <textarea 
                  rows="4" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-sans"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button className="w-full bg-brand-navy hover:bg-brand-orange text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors">
                <span>Send Message</span>
                <Send size={18} />
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
