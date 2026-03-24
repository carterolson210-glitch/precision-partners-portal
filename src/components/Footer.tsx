import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-navy text-body-text-light py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                <span className="text-gold-text font-display font-bold text-[13px]">⚙</span>
              </div>
              <span className="font-display font-bold text-lg text-body-text-light">
                Your<span className="text-gold">Platform</span>
              </span>
            </div>
            <p className="text-steel text-[14px] leading-relaxed">
              The complete business management platform for engineering professionals, firms, and independent contractors.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[16px] text-body-text-light mb-4 font-body">Platform</h4>
            <ul className="space-y-2 text-steel text-[14px]">
              <li><a href="#features" className="hover:text-gold transition-colors">Features</a></li>
              <li><Link to="/pricing" className="hover:text-gold transition-colors">Pricing</Link></li>
              <li><a href="#how-it-works" className="hover:text-gold transition-colors">How It Works</a></li>
              <li><a href="#security" className="hover:text-gold transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[16px] text-body-text-light mb-4 font-body">Tools</h4>
            <ul className="space-y-2 text-steel text-[14px]">
              <li><span className="hover:text-gold transition-colors cursor-default">Project Estimator</span></li>
              <li><span className="hover:text-gold transition-colors cursor-default">Load Calculator</span></li>
              <li><span className="hover:text-gold transition-colors cursor-default">Scheduling</span></li>
              <li><span className="hover:text-gold transition-colors cursor-default">Invoicing</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[16px] text-body-text-light mb-4 font-body">Legal</h4>
            <ul className="space-y-2 text-steel text-[14px]">
              <li><a href="#" className="hover:text-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Data Processing Agreement</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-steel/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-steel text-[13px]">© {new Date().getFullYear()} All rights reserved. Platform name is configurable by the owner.</p>
          <p className="text-steel text-[13px]">Built for engineering professionals.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
