import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-brand-navy pt-12 pb-16 lg:pt-20 lg:pb-20">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/20 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-accent/20 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-brand-accent mb-4 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium tracking-wide text-brand-accent/90">The #1 Stone Crusher Plant ERP Solution</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-400">Crusher Plant</span> With Complete Clarity
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base md:text-xl text-gray-300 mb-6 leading-relaxed font-light"
          >
            Automate transactions, track inventory, and eliminate manual entry in seconds. Built for speed, designed for scale.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-row items-center justify-center gap-3 sm:gap-4 w-full"
          >
            <button className="flex-1 sm:flex-none sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-brand-orange hover:bg-[#e66c00] text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-1 sm:gap-2 group text-center leading-tight">
              <span>Free Trial</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
            <button className="flex-1 sm:flex-none sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold text-sm sm:text-base backdrop-blur-sm transition-all flex items-center justify-center text-center leading-tight">
              Book Demo
            </button>
          </motion.div>

          {/* Quick Perks */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block text-gray-600">•</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>14-day free trial</span>
            </div>
            <div className="hidden sm:block text-gray-600">•</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>Setup in minutes</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
