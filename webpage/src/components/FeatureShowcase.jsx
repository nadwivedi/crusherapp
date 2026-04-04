import { motion } from 'framer-motion';
import { Camera, Zap, FileText, Check, Scale, Wallet, Boxes, Users } from 'lucide-react';

const FeatureShowcase = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-brand-orange font-semibold tracking-wide uppercase text-sm mb-3">Magic Workflow</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-brand-navy mb-6 leading-tight">
            Click a slip. <br/> We do the rest.
          </h3>
          <p className="text-lg text-brand-slate">
            Say goodbye to hours of manual data entry. Our intelligent OCR technology reads weighbridge slips from a simple photo and automatically logs the transaction.
          </p>
        </div>

        {/* Feature Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text/Steps */}
          <div className="order-2 lg:order-1 space-y-12">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex gap-5"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
                  <Camera className="w-6 h-6 text-brand-orange" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-brand-navy mb-2">1. Snap a Photo</h4>
                <p className="text-brand-slate leading-relaxed">
                  Driver or operator takes a quick picture of the physical weighbridge slip using our mobile app or web upload.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-5"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/30">
                  <Zap className="w-6 h-6 text-brand-navy" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-brand-navy mb-2">2. Instant Processing</h4>
                <p className="text-brand-slate leading-relaxed">
                  Our AI engine instantly reads the date, vehicle number, gross weight, and tare weight without any manual typing.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex gap-5"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center border border-green-200">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold text-brand-navy mb-2">3. Auto Entry & Record</h4>
                <p className="text-brand-slate leading-relaxed">
                  The transaction is automatically mapped to the correct party ledger, stock is updated, and the record is secured instantly.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Right Visual/Mockup */}
          <div className="order-1 lg:order-2 relative">
            
            {/* Background Blob */}
            <div className="absolute inset-0 bg-brand-accent/20 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
            
            {/* Fake App UI Container */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-gray-100 relative overflow-hidden"
            >
              {/* Phone "Notch" */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-100 rounded-b-3xl"></div>
              
              <div className="pt-8 pb-4">
                
                {/* Scanner UI Mock */}
                <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl mb-6 flex items-center justify-center overflow-hidden border-4 border-gray-100 shadow-inner">
                  {/* Fake Image Content */}
                  <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
                  
                  {/* Scanner Reticle */}
                  <div className="w-3/4 h-3/4 border-2 border-brand-orange/80 rounded-lg relative flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-orange -mt-1 -ml-1 rounded-tl"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-orange -mt-1 -mr-1 rounded-tr"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-orange -mb-1 -ml-1 rounded-bl"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-orange -mb-1 -mr-1 rounded-br"></div>
                    
                    {/* Scanning Line Animation */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 w-full h-0.5 bg-brand-orange shadow-[0_0_10px_#FF7800]"
                    ></motion.div>
                  </div>

                  <div className="absolute bottom-4 left-0 w-full flex justify-center">
                     <span className="bg-black/60 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                       <Zap size={14} className="text-brand-orange" /> Scanning text...
                     </span>
                  </div>
                </div>

                {/* Extracted Data UI Mock */}
                <div className="space-y-3">
                  <div className="h-6 w-32 bg-gray-100 rounded-md"></div>
                  <div className="p-4 rounded-xl border border-green-200 bg-green-50 backdrop-blur-sm relative">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg transform rotate-12 scale-110 border-2 border-white">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Vehicle No.</span>
                      <span className="text-sm font-bold text-brand-navy">MH 12 AB 1234</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Net Weight</span>
                      <span className="text-sm font-bold text-brand-navy">24,500 KG</span>
                    </div>
                    <div className="w-full h-1 bg-green-200 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full bg-green-500"
                      ></motion.div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Scale,
              title: 'Weightbridge Auto Entry',
              description: 'Capture weightbridge readings and reduce repetitive typing at dispatch time.',
            },
            {
              icon: Wallet,
              title: 'Expense Management',
              description: 'Track operational expenses with cleaner day-to-day control.',
            },
            {
              icon: Users,
              title: 'Party Wise Ledger',
              description: 'See each party ledger, pending amount, and transaction history clearly.',
            },
            {
              icon: Boxes,
              title: 'Stock Movement',
              description: 'Monitor incoming boulder, outgoing sales, and stock movement in one flow.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="mt-5 text-xl font-bold text-brand-navy">{title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-brand-slate">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
