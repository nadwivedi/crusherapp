import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy pt-12 pb-16 lg:pt-20 lg:pb-20">
      <div className="absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2 pointer-events-none">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-brand-orange/20 blur-[100px] opacity-60"></div>
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-brand-accent/20 blur-[100px] opacity-60"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto text-center md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-brand-accent backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-pulse"></span>
            <span className="text-xs font-medium tracking-wide text-brand-accent/90 sm:text-sm">
              Crusher ERP With Weightbridge Workflow
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl"
          >
            CrusherBook - Stone Crusher Plant ERP Software
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 text-base font-light leading-relaxed text-gray-300 md:text-xl"
          >
            Manage sales slips, boulder entries, stock, party ledger, expenses, weighbridge workflow, employee access, and profit reports - all in one powerful crusher plant management system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex w-full flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              to="/pricing"
              className="group flex flex-1 items-center justify-center gap-1 rounded-full bg-brand-orange px-4 py-2.5 text-center text-sm font-bold leading-tight text-white shadow-lg shadow-brand-orange/30 transition-all hover:-translate-y-1 hover:bg-[#e66c00] hover:shadow-brand-orange/50 sm:w-auto sm:flex-none sm:gap-2 sm:px-6 sm:py-3 sm:text-base"
            >
              <span>View Pricing</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5" />
            </Link>
            <Link
              to="/contact"
              className="flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-center text-sm font-bold leading-tight text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto sm:flex-none sm:px-6 sm:py-3 sm:text-base"
            >
              Book Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex flex-col items-center justify-center gap-2 text-xs text-gray-400 sm:flex-row sm:gap-4 sm:text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-accent" />
              <span>Weightbridge ready workflow</span>
            </div>
            <div className="hidden text-gray-600 sm:block">&bull;</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-accent" />
              <span>Slip to entry in minutes</span>
            </div>
            <div className="hidden text-gray-600 sm:block">&bull;</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-accent" />
              <span>Rs 19,999 per year</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
