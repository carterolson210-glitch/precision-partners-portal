import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-navy text-body-text-light py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                <span className="text-gold-text font-display font-bold text-sm">PE</span>
              </div>
              <span className="font-display font-bold text-lg text-body-text-light">Precision<span className="text-gold">Eng</span></span>
            </div>
            <p className="text-steel text-[14px] leading-relaxed">
              Industry-leading engineering solutions for commercial, industrial, and government projects since 1989.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-[16px] text-body-text-light mb-4 font-body">Services</h4>
            <ul className="space-y-2 text-steel text-[14px]">
              <li><a href="#" className="hover:text-gold transition-colors">Structural Engineering</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Civil Infrastructure</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Project Management</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Environmental Compliance</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[16px] text-body-text-light mb-4 font-body">Company</h4>
            <ul className="space-y-2 text-steel text-[14px]">
              <li><a href="#team" className="hover:text-gold transition-colors">Our Team</a></li>
              <li><a href="#portfolio" className="hover:text-gold transition-colors">Portfolio</a></li>
              <li><Link to="/pricing" className="hover:text-gold transition-colors">Pricing</Link></li>
              <li><a href="#contact" className="hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[16px] text-body-text-light mb-4 font-body">Contact</h4>
            <ul className="space-y-2 text-steel text-[14px]">
              <li>1200 Engineering Blvd</li>
              <li>Suite 400, Austin, TX 78701</li>
              <li>+1 (512) 555-0190</li>
              <li>info@precisioneng.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-steel/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-steel text-[13px]">© {new Date().getFullYear()} PrecisionEng. All rights reserved.</p>
          <div className="flex gap-6 text-steel text-[13px]">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
