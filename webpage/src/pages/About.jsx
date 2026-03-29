import { motion } from 'framer-motion';
import { Target, Users, Shield, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const About = () => {
  return (
    <div className="w-full pt-10 pb-24 bg-gray-50">
      <Helmet>
        <title>About Us | Crusherbook ERP Solution</title>
        <meta name="description" content="Learn more about Crusherbook, the premier stone crusher management software and ERP solution built for the rock crushing industry." />
      </Helmet>
      
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 mb-20 mt-10">
        <h1 className="text-5xl font-bold text-brand-navy mb-6">About Crusherbook</h1>
        <p className="text-xl text-brand-slate leading-relaxed">
          Crusherbook is stone crusher management software and ERP solution designed to transform the rock crushing industry by replacing outdated, manual data tracking with intelligent, automated, and mobile-first solutions.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-brand-navy mb-6">Our Mission</h2>
              <p className="text-brand-slate text-lg leading-relaxed mb-6">
                Crusherbook was built from the ground up by industry experts who lived the frustration of lost weighbridge slips, tedious ledger reconciliation, and complex software. 
              </p>
              <p className="text-brand-slate text-lg leading-relaxed">
                Our mission is to arm crusher plant owners and managers with absolute clarity. Through cutting-edge features like our <strong>One-Tap Slip Scanner</strong>, we eliminate human error and give you back hours of your day.
              </p>
            </div>
            <div className="bg-brand-navy p-12 md:p-16 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl"></div>
              <h2 className="text-3xl font-bold mb-6">Built for Scale</h2>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg"><Target className="w-6 h-6 text-brand-orange" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Precision Accuracy</h4>
                    <p className="text-brand-accent/80">Every transaction verified and recorded seamlessly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg"><Shield className="w-6 h-6 text-brand-orange" /></div>
                  <div>
                    <h4 className="font-semibold text-lg">Secure Ledger</h4>
                    <p className="text-brand-accent/80">Your financial data is tightly encrypted and backed up.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats / Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm"
          >
            <div className="w-14 h-14 mx-auto bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-4xl font-bold text-brand-navy mb-2">10k+</h3>
            <p className="text-brand-slate font-medium">Slips processed daily</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm"
          >
            <div className="w-14 h-14 mx-auto bg-brand-navy/5 text-brand-navy rounded-full flex items-center justify-center mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-4xl font-bold text-brand-navy mb-2">500+</h3>
            <p className="text-brand-slate font-medium">Active crusher plants powered</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm"
          >
            <div className="w-14 h-14 mx-auto bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
              <Shield size={28} />
            </div>
            <h3 className="text-4xl font-bold text-brand-navy mb-2">99.9%</h3>
            <p className="text-brand-slate font-medium">Uptime guarantee</p>
          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default About;
