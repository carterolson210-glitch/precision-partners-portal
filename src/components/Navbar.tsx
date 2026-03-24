import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "#security" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[var(--nav-height)] bg-background border-b border-card-border z-[1000] flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Configurable Logo Placeholder */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy rounded flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-[13px]">⚙</span>
          </div>
          <span className="font-display font-bold text-lg text-body-text">
            Your<span className="text-gold">Platform</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.label} to={link.href} className="text-body-text font-semibold text-[15px] hover:text-gold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all hover:after:w-full">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="text-body-text font-semibold text-[15px] hover:text-gold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gold after:transition-all hover:after:w-full">
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" size="default" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button variant="gold" size="default" asChild>
            <Link to="/register">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="w-6 h-6 text-body-text" /> : <Menu className="w-6 h-6 text-body-text" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-foreground/50 z-[999] top-[var(--nav-height)]" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-[var(--nav-height)] left-0 right-0 bg-background z-[1000] border-b border-card-border p-6 flex flex-col gap-4">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.label} to={link.href} className="text-body-text font-semibold text-[16px] py-2" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="text-body-text font-semibold text-[16px] py-2" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </a>
              )
            )}
            <div className="flex flex-col gap-3 pt-4 border-t border-card-border">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="gold" className="w-full" asChild>
                <Link to="/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
