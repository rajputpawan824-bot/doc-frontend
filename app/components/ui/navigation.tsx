"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Logo from "@/public/images/logo-landscape.png";
export function CustomNavigation() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
const router = useRouter()
  return (
    <nav className="flex justify-between items-center w-full px-4 sm:px-6 py-4">
      {/* Left - Logo */}
      <div className="flex items-center">
       <Image
          src={Logo}
          alt="Clinic Management Logo"
          width={100}
          height={100}
          className="mr-2"
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <NavigationMenu />
        <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
          Login
        </Button>
        <Button size="sm" onClick={() => router.push('/signup')}>Get Started</Button>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden items-center space-x-2">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => router.push('/login')}>
          Login
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 md:hidden bg-background border-b shadow-lg z-50">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Items */}
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t space-y-3">
              <Button
                variant="outline"
                className="w-full justify-center"
                size="lg"
onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button className="w-full justify-center" size="lg" onClick={() => router.push('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

const navigationItems = [
  { name: "About", href: "/about" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

function NavigationMenu() {
  const [activeItem, setActiveItem] = React.useState("About");

  return (
    <div className="flex items-center space-x-1">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
            activeItem === item.name
              ? "text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
          onClick={() => setActiveItem(item.name)}
        >
          {item.name}
        
        </Link>
      ))}
    </div>
  );
}
