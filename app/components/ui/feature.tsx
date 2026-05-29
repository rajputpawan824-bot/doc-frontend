// components/features-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Calendar,
  Users,
  FileText,
  Pill,
  BarChart3,
  Shield,
  MessageCircle,
  Building,
  Workflow,
  Zap,
  Clock,
  Database,
} from "lucide-react";
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const staggerCards = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
};

const cardHover = {
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function FeaturesSection() {
  const mainFeaturesRef = useRef(null);
  const highlightsRef = useRef(null);
  const ctaRef = useRef(null);

  const isMainFeaturesInView = useInView(mainFeaturesRef, {
    once: true,
    margin: "-100px",
  });
  const isHighlightsInView = useInView(highlightsRef, {
    once: true,
    margin: "-100px",
  });
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-50px" });

  const mainFeatures = [
    {
      category: "General & Specialist EMR",
      icon: <FileText className="w-6 h-6" />,
      highlight: "AI Automation",
      features: [
        "Appointment Scheduling",
        "Pharmacy Management",
        "Inventory & Logistics",
        "Teleconsultation",
      ],
      color: "blue",
    },
    {
      category: "Billing & Payments",
      icon: <BarChart3 className="w-6 h-6" />,
      highlight: "Lab Reporting",
      features: [
        "Reports & Analytics",
        "Multi-Location Control",
        "WhatsApp, Email, SMS Integrations",
      ],
      color: "green",
    },
    {
      category: "Workflow Manager",
      icon: <Workflow className="w-6 h-6" />,
      highlight: "Security & Role Access Control",
      features: ["Staff & User Management", "Reports, BI & Analytics"],
      color: "purple",
    },
  ];

  const featureHighlights = [
    {
      title: "AI-Powered Insights",
      description:
        "Get smart predictions and actionable insights to improve clinic performance and decision-making.",
      icon: <Brain className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Staff & Department Management",
      description:
        "Easily manage roles, schedules, and department workflows from a single dashboard.",
      icon: <Users className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Smart Appointment Scheduling",
      description:
        "Automate bookings, reduce wait times, and manage patient flow effortlessly.",
      icon: <Calendar className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Digital Patient Records",
      description:
        "Access complete patient history, reports, and notes in one secure digital place.",
      icon: <Database className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Pharmacy & Lab Management",
      description:
        "Track medicines, manage lab tests, and streamline reporting with integrated tools.",
      icon: <Pill className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Automated Reporting",
      description:
        "Generate instant reports for performance, finance, and operations — without manual effort.",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-teal-500 to-blue-500",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-emerald-600",
      purple: "from-purple-500 to-violet-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Badge
              variant="outline"
              className="text-blue-600 border-blue-600 font-semibold mb-4 px-4 py-1"
            >
              All-in-One Platform
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            variants={containerVariants}
          >
            <motion.span variants={itemVariants}>
              Everything You Need is in{" "}
            </motion.span>
            <motion.span className="text-blue-600" variants={itemVariants}>
              One Place
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            A comprehensive clinical management solution that brings all your
            essential tools together in one seamless, AI-powered platform.
          </motion.p>
        </motion.div>

        {/* Main Features Grid */}
        <div ref={mainFeaturesRef}>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20"
            initial="hidden"
            animate={isMainFeaturesInView ? "visible" : "hidden"}
            variants={staggerCards}
          >
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={slideUp}
                whileHover="hover"
                custom={index}
              >
                <motion.div variants={cardHover}>
                  <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader className="pb-4">
                      {/* Category Header */}
                      <motion.div
                        className="flex items-center gap-3 mb-4"
                        whileHover={{ x: 5 }}
                      >
                        <motion.div
                          className={`p-3 rounded-xl bg-gradient-to-r ${getColorClasses(
                            feature.color
                          )}`}
                          whileHover={{
                            rotate: 360,
                            transition: { duration: 0.5 },
                          }}
                        >
                          {feature.icon}
                        </motion.div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          {feature.category}
                        </CardTitle>
                      </motion.div>

                      {/* Highlight Feature */}
                      <motion.div
                        className="flex items-center gap-2 mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        >
                          <Zap className="w-4 h-4 text-yellow-500" />
                        </motion.div>
                        <Badge variant="secondary" className="font-semibold">
                          {feature.highlight}
                        </Badge>
                      </motion.div>
                    </CardHeader>

                    <CardContent>
                      {/* Features List */}
                      <motion.ul
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {feature.features.map((item, itemIndex) => (
                          <motion.li
                            key={itemIndex}
                            className="flex items-center gap-3"
                            variants={itemVariants}
                            whileHover={{ x: 5 }}
                          >
                            <motion.div
                              className={`w-2 h-2 rounded-full bg-${feature.color}-500 flex-shrink-0`}
                              animate={{
                                scale: [1, 1.3, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: itemIndex * 0.3,
                              }}
                            ></motion.div>
                            <span className="text-gray-700 dark:text-gray-300">
                              {item}
                            </span>
                          </motion.li>
                        ))}
                      </motion.ul>

                      {/* Integration Badges */}
                      {feature.category === "Billing & Payments" && (
                        <motion.div
                          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                        >
                          <div className="flex flex-wrap gap-2">
                            {["WhatsApp", "Email", "SMS"].map(
                              (integration, intIndex) => (
                                <motion.div
                                  key={integration}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: intIndex * 0.1 + 1 }}
                                >
                                  <Badge variant="outline" className="text-xs">
                                    <motion.div
                                      whileHover={{ rotate: 360 }}
                                      transition={{ duration: 0.5 }}
                                    >
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                    </motion.div>
                                    {integration}
                                  </Badge>
                                </motion.div>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          className="flex items-center justify-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.div
            className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div ref={highlightsRef}>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate={isHighlightsInView ? "visible" : "hidden"}
            variants={staggerCards}
          >
            {featureHighlights.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {/* Gradient Background Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    whileHover={{ opacity: 0.1 }}
                  ></motion.div>

                  <CardContent className="p-8 relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`mb-6 p-4 rounded-2xl bg-gradient-to-r ${feature.color} w-fit`}
                      whileHover={{
                        scale: 1.1,
                        rotate: 360,
                        transition: { duration: 0.5 },
                      }}
                    >
                      {feature.icon}
                    </motion.div>

                    {/* Content */}
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </CardTitle>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Indicator */}
                    <motion.div
                      className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      <span>Instant access</span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef} className="mt-20 text-center">
          <motion.div
            initial="hidden"
            animate={isCtaInView ? "visible" : "hidden"}
            variants={scaleIn}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none shadow-2xl overflow-hidden">
              {/* Animated background elements */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              <CardContent className="p-5 lg:p-12 text-white relative z-10">
                <motion.div
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-white/20 p-4 rounded-2xl">
                    <Shield className="w-12 h-12" />
                  </div>
                </motion.div>

                <motion.h3
                  className="text-2xl lg:text-3xl font-bold mb-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span variants={itemVariants}>
                    Ready to Transform Your Clinic?
                  </motion.span>
                </motion.h3>

                <motion.p
                  className="text-white text-lg max-w-2xl mx-auto mb-6"
                  variants={itemVariants}
                >
                  Join hundreds of clinics already using MedFlow to streamline
                  their operations, enhance patient care, and grow their
                  practice.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { icon: Building, text: "Multi-Location Support" },
                    { icon: Workflow, text: "Automated Workflows" },
                    { icon: BarChart3, text: "Real-time Analytics" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="px-4 py-2 text-lg bg-white/20 text-white border-white/30"
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.text}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
