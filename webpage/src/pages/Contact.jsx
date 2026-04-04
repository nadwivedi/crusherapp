import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import ContactActions from '../components/ContactActions';
import Seo from '../components/Seo';

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact CrusherBook',
  url: 'https://crusherbook.com/contact',
  description: 'Contact CrusherBook for stone crusher plant ERP software, pricing, weighbridge workflow, and product demo.',
};

const Contact = () => {
  return (
    <div className="w-full pt-10 pb-24 bg-gray-50">
      <Seo
        title="Contact CrusherBook ERP"
        description="Contact CrusherBook for crusher ERP software pricing, demo, weighbridge workflow, sales slip entry, boulder entry, and support."
        path="/contact"
        keywords={[
          'contact crusher software company',
          'crusher ERP demo',
          'crusherbook contact',
        ]}
        schema={contactSchema}
      />
      
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
        <div className="mt-8">
          <ContactActions primaryLabel="Chat on WhatsApp" secondaryLabel="Call Now" />
        </div>
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
                <div className="mt-4">
                  <a
                    href="https://wa.me/916264682508?text=Hello%20Crusherbook%2C%20I%20want%20to%20know%20about%20pricing%20and%20demo."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    WhatsApp Now
                  </a>
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
            <h3 className="text-2xl font-bold text-brand-navy mb-3">Talk To Sales Fast</h3>
            <p className="text-brand-slate leading-relaxed">
              For pricing, software demo, or weightbridge connection discussion, use WhatsApp or call directly for a faster response.
            </p>
            <div className="mt-8 space-y-4">
              <a
                href="https://wa.me/916264682508?text=Hello%20Crusherbook%2C%20I%20want%20a%20demo%20for%20the%20software."
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700"
              >
                <span>WhatsApp For Demo</span>
                <Send size={18} />
              </a>
              <a
                href="tel:+916264682508"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-orange bg-orange-50 px-5 py-4 font-bold text-brand-orange transition hover:bg-orange-100"
              >
                <Phone size={18} />
                <span>Call +91 6264682508</span>
              </a>
              <a
                href="mailto:softwarebytesindia@gmail.com"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 font-semibold text-brand-navy transition hover:bg-gray-50"
              >
                <Mail size={18} />
                <span>Email Us</span>
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
