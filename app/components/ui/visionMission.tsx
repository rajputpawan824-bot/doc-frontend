// components/vision-mission-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Rocket,
  Shield,
  Heart,
  Users,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  HeadphonesIcon,
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
      staggerChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
    },
  },
};

const floatAnimation = {
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1] as const,
    },
  },
};

const pulseGlow = {
  pulse: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1] as const,
    },
  },
};

export default function VisionMissionSection() {
  const valuePropsRef = useRef(null);
  const visionMissionRef = useRef(null);
  const ctaRef = useRef(null);

  const isValuePropsInView = useInView(valuePropsRef, {
    once: true,
    margin: "-100px",
  });
  const isVisionMissionInView = useInView(visionMissionRef, {
    once: true,
    margin: "-100px",
  });
  const isCtaInView = useInView(ctaRef, { once: true, margin: "-50px" });

  const valueProps = [
    {
      title: "Only Internal Required",
      description:
        "In response to our proposed new business, we implement a new method that focuses on internal efficiency and streamlined processes.",
      icon: <Shield className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Have Savings",
      description:
        "Our proposed work with a functional and simplified workforce helps you achieve significant cost reductions while maintaining quality.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Great Support",
      description:
        "Our focus on the business is in line with your daily needs, providing comprehensive help and support when you need it most.",
      icon: <HeadphonesIcon className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/30">
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
              Our Approach
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            variants={containerVariants}
          >
            <motion.span variants={itemVariants}>Built for </motion.span>
            <motion.span className="text-blue-600" variants={itemVariants}>
              Modern Healthcare
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            We&apos;re revolutionizing clinical management with a patient-first
            approach and cutting-edge technology.
          </motion.p>
        </motion.div>

        {/* Value Propositions */}
        <div ref={valuePropsRef}>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            initial="hidden"
            animate={isValuePropsInView ? "visible" : "hidden"}
            variants={staggerCards}
          >
            {valueProps.map((prop, index) => (
              <motion.div
                key={index}
                variants={slideUp}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {/* Gradient Background Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${prop.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    whileHover={{ opacity: 0.1 }}
                  />

                  <CardContent className="p-8 relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`mb-6 p-4 rounded-2xl bg-gradient-to-r ${prop.color} w-fit`}
                      whileHover={{
                        scale: 1.1,
                        rotate: 360,
                        transition: { duration: 0.5 },
                      }}
                    >
                      {prop.icon}
                    </motion.div>

                    {/* Content */}
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {prop.title}
                    </CardTitle>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {prop.description}
                    </p>

                    {/* Decorative Element */}
                    <motion.div
                      className="mt-6 flex items-center gap-2"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                            prop.color
                          } opacity-${70 - i * 20}`}
                          variants={itemVariants}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                        />
                      ))}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Vision & Mission Section */}
        <div ref={visionMissionRef}>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20"
            initial="hidden"
            animate={isVisionMissionInView ? "visible" : "hidden"}
            variants={staggerCards}
          >
            {/* Vision Card */}
            <motion.div variants={scaleIn} whileHover="float">
              <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-blue-600 to-purple-600">
                {/* Animated Background Elements */}
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"
                  animate="pulse"
                  variants={pulseGlow}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"
                  animate="pulse"
                  variants={pulseGlow}
                  transition={{ delay: 1.5 }}
                />

                <CardHeader className="relative z-10">
                  <motion.div
                    className="flex items-center gap-3 mb-4"
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      className="p-3 bg-white/20 rounded-xl"
                      whileHover={{
                        scale: 1.1,
                        rotate: 360,
                        transition: { duration: 0.5 },
                      }}
                    >
                      <Eye className="w-6 h-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white">
                      OUR VISION
                    </CardTitle>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <motion.p
                    className="text-lg text-white leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    To empower healthcare providers with innovative digital
                    tools that make patient care more attractive, faster, and
                    more accurate through intelligent automation and seamless
                    integration.
                  </motion.p>

                  {/* Vision Highlights */}
                  <motion.div
                    className="mt-6 flex flex-wrap gap-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {["Innovation", "Empowerment", "Excellence"].map(
                      (tag, index) => (
                        <motion.div
                          key={tag}
                          variants={itemVariants}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="bg-white/20 text-white border-white/30"
                          >
                            <motion.div
                              animate={{
                                rotate: [0, 360],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.5,
                              }}
                            >
                              <Star className="w-3 h-3 mr-1" />
                            </motion.div>
                            {tag}
                          </Badge>
                        </motion.div>
                      )
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mission Card */}
            <motion.div variants={scaleIn} whileHover="float">
              <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-green-600 to-emerald-600">
                {/* Animated Background Elements */}
                <motion.div
                  className="absolute top-0 left-0 w-28 h-28 bg-white/10 rounded-full -translate-y-14 -translate-x-14"
                  animate="pulse"
                  variants={pulseGlow}
                  transition={{ delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 translate-x-10"
                  animate="pulse"
                  variants={pulseGlow}
                  transition={{ delay: 2 }}
                />

                <CardHeader className="relative z-10">
                  <motion.div
                    className="flex items-center gap-3 mb-4"
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      className="p-3 bg-white/20 rounded-xl"
                      whileHover={{
                        scale: 1.1,
                        rotate: 360,
                        transition: { duration: 0.5 },
                      }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white">
                      OUR MISSION
                    </CardTitle>
                  </motion.div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <motion.p
                    className="text-lg text-green-100 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    To simplify clinical operations through smart automation,
                    streamline communication among healthcare teams, and support
                    clinicians in delivering exceptional patient care with
                    efficiency and precision.
                  </motion.p>

                  {/* Mission Highlights */}
                  <motion.div
                    className="mt-6 flex flex-wrap gap-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {["Simplicity", "Efficiency", "Support"].map(
                      (tag, index) => (
                        <motion.div
                          key={tag}
                          variants={itemVariants}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="bg-white/20 text-white border-white/30"
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.3, 1],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: index * 0.3,
                              }}
                            >
                              <Zap className="w-3 h-3 mr-1" />
                            </motion.div>
                            {tag}
                          </Badge>
                        </motion.div>
                      )
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div ref={ctaRef}>
          <motion.div
            initial="hidden"
            animate={isCtaInView ? "visible" : "hidden"}
            variants={scaleIn}
          >
            <Card className="text-center shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
              {/* Background Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"
                animate={{
                  opacity: [0.05, 0.1, 0.05],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              <CardContent className="p-5 lg:p-12 relative z-10">
                {/* Icon */}
                <motion.div
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                  >
                    <Rocket className="w-8 h-8 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  className="text-xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.span variants={itemVariants}>
                    Ready to Modernize Your Clinic?
                  </motion.span>
                </motion.h2>

                <motion.p
                  className="text-md lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed"
                  variants={itemVariants}
                >
                  Join the future of healthcare management with MedFlow.
                  Streamline your operations, enhance patient care, and grow
                  your practice with our AI-powered platform.
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                    Get Started Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.span>
                  </Button>
                </motion.div>

                {/* Additional Benefits */}
                <motion.div
                  className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { icon: Users, text: "No setup fees" },
                    { icon: Heart, text: "30-day free trial" },
                    { icon: Shield, text: "HIPAA compliant" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.5,
                        }}
                      >
                        <item.icon className="w-4 h-4" />
                      </motion.div>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Decorative Bottom Element */}
        <motion.div
          className="mt-16 flex justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-8 h-1 bg-gradient-to-r from-blue-500 to-transparent rounded-full"
              animate={{ width: [32, 48, 32] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="w-8 h-1 bg-gradient-to-r from-transparent to-blue-500 rounded-full"
              animate={{ width: [32, 48, 32] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
