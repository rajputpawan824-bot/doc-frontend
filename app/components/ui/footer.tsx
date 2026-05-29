// components/footer.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  Shield,
  Users,
  Calendar,
  FileText,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Testimonials", href: "#testimonials" },
        { name: "Demo", href: "#demo" },
        { name: "API Docs", href: "#api" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { name: "Hospitals", href: "#hospitals" },
        { name: "Clinics", href: "#clinics" },
        { name: "Private Practice", href: "#practice" },
        { name: "Multi-Location", href: "#multi-location" },
        { name: "Telemedicine", href: "#telemedicine" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#careers" },
        { name: "Press", href: "#press" },
        { name: "Blog", href: "#blog" },
        { name: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#help" },
        { name: "Documentation", href: "#docs" },
        { name: "System Status", href: "#status" },
        { name: "Training", href: "#training" },
        { name: "Security", href: "#security" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: <Facebook className="w-5 h-5" />, href: "#" },
    { name: "Twitter", icon: <Twitter className="w-5 h-5" />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, href: "#" },
    { name: "Instagram", icon: <Instagram className="w-5 h-5" />, href: "#" },
  ];

  const certifications = [
    "HIPAA Compliant",
    "ISO 27001 Certified",
    "GDPR Ready",
    "SOC 2 Type II",
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Top Section */}

        {/* Middle Section - Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="space-y-6 col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">hello@medflow.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                <span className="text-gray-300">
                  123 Healthcare Ave
                  <br />
                  Medical District, CA 94107
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Certified & Compliant
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            {certifications.map((cert) => (
              <div key={cert} className="flex items-center gap-2 text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm">{cert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Highlight */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                text: "Patient Management",
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                text: "Smart Scheduling",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                text: "EMR Integration",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                text: "Secure & Compliant",
              },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-600/20 rounded-xl">
                  {feature.icon}
                </div>
                <span className="text-sm text-gray-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} MedFlow Smart AI Clinical Manager developed by AppVibe. All rights
              reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              <a
                href="#privacy"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#terms"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#cookies"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Cookie Policy
              </a>
              <a
                href="#security"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Security
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-600/10 border-t border-red-500/20">
        <div className="container mx-auto px-6 py-4 text-center">
          <p className="text-red-300 text-sm">
            <strong>Important:</strong> This is not a real medical service. In
            case of emergency, please call your local emergency services
            immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
