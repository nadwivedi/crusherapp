import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/cruhserbook.webp" 
                alt="Crusherbook Logo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-brand-slate hover:text-brand-orange transition-colors font-medium">Home</Link>
            <Link to="/about" className="text-brand-slate hover:text-brand-orange transition-colors font-medium">About</Link>
            <Link to="/contact" className="text-brand-slate hover:text-brand-orange transition-colors font-medium">Contact</Link>
            
            <button className="bg-brand-orange text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all">
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-slate hover:text-brand-orange focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-brand-slate hover:bg-gray-50 hover:text-brand-orange"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-brand-slate hover:bg-gray-50 hover:text-brand-orange"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-brand-slate hover:bg-gray-50 hover:text-brand-orange"
            >
              Contact
            </Link>
            <div className="pt-4 px-3">
              <button className="w-full bg-brand-orange text-white px-6 py-3 rounded-full font-semibold shadow-md">
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
