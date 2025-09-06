import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HEADER_NAV } from "@/config/nav";
import logo from "@/assets/logo.svg";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img 
              src={logo} 
              alt="Baltic Intelligence" 
              className="h-8 w-auto group-hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {HEADER_NAV.map((item) => (
              <Button
                key={item.testId}
                variant="ghost"
                className={`text-foreground hover:text-primary transition-colors ${
                  location.pathname === item.href 
                    ? "text-primary font-semibold bg-primary/10" 
                    : ""
                }`}
                onClick={() => navigate(item.href)}
                data-testid={item.testId}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t border-border/50">
            {HEADER_NAV.map((item) => (
              <Button
                key={item.testId}
                variant="ghost"
                className={`w-full justify-start text-foreground hover:text-primary transition-colors ${
                  location.pathname === item.href 
                    ? "text-primary font-semibold bg-primary/10" 
                    : ""
                }`}
                onClick={() => {
                  navigate(item.href);
                  setIsMobileMenuOpen(false);
                }}
                data-testid={item.testId}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;