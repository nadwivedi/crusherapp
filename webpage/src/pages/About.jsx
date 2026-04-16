import { motion } from 'framer-motion';
import { Target, Users, Shield, TrendingUp } from 'lucide-react';
import ContactActions from '../components/ContactActions';
import Seo from '../components/Seo';

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About CrusherBook',
  url: 'https://crusherbook.com/about',
  description: 'About CrusherBook, stone crusher plant ERP software built for weighbridge workflow, ledger, stock, expenses, and reporting.',
};

const About = () => {
  return (
    <div className="w-full pt-10 pb-24 bg-gray-50">
      <Seo
        title="About CrusherBook ERP"
        description="Learn about CrusherBook, a stone crusher plant ERP system built for weighbridge workflow, slip entry, party ledger, expenses, stock, and reports."
        path="/about"
        keywords={[
          'about crusher ERP',
          'stone crusher plant software company',
          'crusher management software India',
        ]}
        schema={aboutSchema}
      />
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 mb-20 mt-10">
        <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>
          Trusted by 50+ Crusher Plants
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-brand-navy mb-6">About Crusherbook</h1>
        <p className="text-xl text-brand-slate leading-relaxed max-w-2xl mx-auto">
          Crusherbook is stone crusher management software and ERP solution designed to transform the rock crushing industry by replacing outdated, manual data tracking with intelligent, automated, and mobile-first solutions.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <TrendingUp size={16} />
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy mb-6">Empowering Crusher Plants with Modern ERP</h2>
              <p className="text-brand-slate text-lg leading-relaxed mb-6">
                Crusherbook was built from the ground up by industry experts who lived the frustration of lost weighbridge slips, tedious ledger reconciliation, and complex software. 
              </p>
              <p className="text-brand-slate text-lg leading-relaxed">
                Our mission is to arm crusher plant owners and managers with absolute clarity. Through cutting-edge features like our <strong>One-Tap Slip Scanner</strong>, we eliminate human error and give you back hours of your day.
              </p>
            </div>
            <div className="bg-brand-navy p-12 lg:p-16 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl"></div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-brand-orange px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Shield size={16} />
                Built for Scale
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Choose Crusherbook?</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg shrink-0"><Target className="w-6 h-6 text-brand-orange" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Precision Accuracy</h4>
                    <p className="text-brand-accent/80 text-sm">Every transaction verified and recorded seamlessly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg shrink-0"><Shield className="w-6 h-6 text-brand-orange" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Secure Ledger</h4>
                    <p className="text-brand-accent/80 text-sm">Your financial data is tightly encrypted and backed up.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg shrink-0"><Users className="w-6 h-6 text-brand-orange" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Expert Support</h4>
                    <p className="text-brand-accent/80 text-sm">Dedicated team ready to help you 24/7.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats / Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-lg hover:border-brand-orange/30 transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp size={32} />
            </div>
            <h3 className="text-5xl font-bold text-brand-navy mb-2">10k+</h3>
            <p className="text-brand-slate font-medium">Slips processed daily</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-lg hover:border-brand-navy/30 transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-slate-100 to-slate-50 text-brand-navy rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users size={32} />
            </div>
            <h3 className="text-5xl font-bold text-brand-navy mb-2">50+</h3>
            <p className="text-brand-slate font-medium">Active crusher plants</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-lg hover:border-green-500/30 transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield size={32} />
            </div>
            <h3 className="text-5xl font-bold text-brand-navy mb-2">99.9%</h3>
            <p className="text-brand-slate font-medium">Uptime guarantee</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="group bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-lg hover:border-brand-orange/30 transition-all duration-300"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 text-brand-orange rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users size={32} />
            </div>
            <h3 className="text-5xl font-bold text-brand-navy mb-2">50+</h3>
            <p className="text-brand-slate font-medium">Satisfied clients</p>
          </motion.div>

        </div>

        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy to-slate-900 px-8 py-16 text-center text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built Around Crusher Plant Daily Work</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-white/80">
              From weightbridge connection and sales slip entry to party wise ledger, expense management, employee access, stock movement, and profit and loss visibility, Crusherbook is designed for real plant operations.
            </p>
            <div className="mt-10">
              <ContactActions primaryLabel="WhatsApp Us" secondaryLabel="Call Team" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
