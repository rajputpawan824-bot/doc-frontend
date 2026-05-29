"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Users,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function HeroSection() {
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });

  const features = [
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Easy Clinic Setup",
      description: "Quick and intuitive clinic configuration",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Role Based Access",
      description: "Secure permissions for different staff roles",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure Records",
      description: "HIPAA compliant data protection",
    },
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      title: "Unified Dashboard",
      description: "Complete overview of your clinic operations",
    },
  ];

  return (
    <section className="min-h-screen">
      <div className="container mx-auto px-6 py-10">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
          >
            <motion.h1
              className="text-3xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
              variants={containerVariants}
            >
              <motion.span variants={itemVariants}>Transform the</motion.span>
              <br />
              <motion.span
                className="text-blue-600 dark:text-blue-400"
                variants={itemVariants}
              >
                Way Your Clinic Operates
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              variants={itemVariants}
            >
              An AI-powered clinical management solution that simplifies and
              automates your workflow.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold py-6 px-8 rounded-lg text-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  Book a Demo
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Images Grid */}
          <motion.div
            className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={slideInRight}
          >
            <motion.span
              className="col-span-2 flex justify-end"
              variants={scaleIn}
            >
              <Image
                src="/images/image1.png"
                alt="Hero Image"
                width={300}
                height={200}
                className="rounded-2xl shadow-lg"
              />
            </motion.span>

            <motion.div variants={scaleIn}>
              <Image
                src="/images/image2.png"
                alt="Hero Image"
                width={300}
                height={200}
                className="rounded-2xl shadow-lg"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section ref={featuresRef} className="container mx-auto px-6 py-10">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          initial="hidden"
          animate={isFeaturesInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 },
              }}
            >
              <div className="flex items-start space-x-4">
                <motion.div
                  className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </section>
  );
}
