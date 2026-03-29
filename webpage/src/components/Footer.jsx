import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
               <img 
                src="/cruhserbook.webp" 
                alt="Crusherbook Logo" 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The ultimate ERP management software for rock crusher plants. Automate your workflow, manage stock, and increase productivity from anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-orange transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-orange transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-orange transition-colors"><Share2 size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 flex items-center">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-brand-orange transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-brand-orange transition-colors">About Us</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-orange transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-orange shrink-0 mt-0.5" />
                <span className="text-gray-400">Shankar Nagar, Raipur, Chhattisgarh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-brand-orange shrink-0" />
                <div className="flex flex-col text-gray-400 text-sm">
                  <span>6264682508</span>
                  <span>9202469725</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-brand-orange shrink-0" />
                <span className="text-gray-400 break-all text-sm">softwarebytesindia@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Crusherbook. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>A</span>
            <a href="https://softwarebytes.in/" target="_blank" rel="noopener noreferrer" className="text-brand-orange font-semibold hover:text-white transition-colors">
              SoftwareBytes
            </a>
            <span>Product</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
