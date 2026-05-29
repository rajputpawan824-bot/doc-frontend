"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  Users,
  Database,
  Clock,
  BarChart3,
  Building,
  Activity,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

// Animation variants
// Animation variants - FIXED VERSION
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

export default function AboutSection() {
  const statsRef = useRef(null);
  const problemsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true, margin: "-50px" });
  const isProblemsInView = useInView(problemsRef, {
    once: true,
    margin: "-100px",
  });

  const problems = [
    {
      category: "Clinical Operation",
      icon: <Building className="w-6 h-6" />,
      issues: [
        "Inefficient appointment scheduling",
        "Long patient wait times",
        "Poor coordination between departments",
      ],
      color: "blue",
    },
    {
      category: "Patient Management & Data",
      icon: <Users className="w-6 h-6" />,
      issues: [
        "Incomplete or scattered patient records",
        "Complex long-term surgical data tracking",
        "Poor medical follow-ups and low patient engagement",
      ],
      color: "green",
    },
    {
      category: "Centralized Control",
      icon: <BarChart3 className="w-6 h-6" />,
      issues: [
        "No real-time visibility across locations",
        "Inconsistent operations between branches",
        "Fragmented data without unified reporting",
      ],
      color: "purple",
    },
  ];

  const stats = [
    { number: "40%", label: "Reduction in Admin Work" },
    { number: "60%", label: "Faster Scheduling" },
    { number: "99%", label: "Data Accuracy" },
    { number: "24/7", label: "AI Support" },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-emerald-600",
      purple: "from-purple-500 to-violet-600",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getBadgeVariant = (color: string) => {
    const variants = {
      blue: "default",
      green: "secondary",
      purple: "destructive",
    };
    return variants[color as keyof typeof variants] || "default";
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4"
            variants={itemVariants}
          >
            <motion.div
              className="w-2 h-8 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            ></motion.div>
            <motion.div
              className="w-2 h-8 bg-blue-600 rounded-full opacity-75"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.75, 0.5, 0.75],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.2,
              }}
            ></motion.div>
            <motion.div
              className="w-2 h-8 bg-blue-600 rounded-full opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.4,
              }}
            ></motion.div>
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-600 font-semibold ml-2"
              >
                About Us
              </Badge>
            </motion.div>
          </motion.div>

          <motion.h1
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            variants={containerVariants}
          >
            <motion.span variants={itemVariants}>
              About <span className="text-blue-600">MedFlow Smart AI</span>
            </motion.span>
            <br />
            <motion.span variants={itemVariants}>Clinical Manager</motion.span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            MedFlow is an{" "}
            <span className="font-semibold text-blue-600">
              AI-powered clinical management system
            </span>{" "}
            that streamlines operations, reduces administrative work, and
            enhances patient care through intelligent automation.
          </motion.p>
        </motion.div>

        {/* Stats Bar */}
        <div ref={statsRef}>
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            variants={staggerCards}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="text-center shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <motion.div
                      className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2"
                      initial={{ scale: 0 }}
                      animate={isStatsInView ? { scale: 1 } : { scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: index * 0.1 + 0.3,
                      }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Divider with Icon */}
        <motion.div
          className="flex items-center justify-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-20 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
            <motion.div
              className="bg-blue-600 p-3 rounded-full"
              whileHover={{
                scale: 1.1,
                rotate: 360,
                transition: { duration: 0.5 },
              }}
            >
              <Target className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              className="w-20 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
          </div>
        </motion.div>

        {/* Problems We Solve Section */}
        <div ref={problemsRef} className="mb-16">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate={isProblemsInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              variants={itemVariants}
            >
              Challenges We <span className="text-blue-600">Solve</span>
            </motion.h2>
            <motion.p
              className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Addressing the critical pain points in modern healthcare
              management with AI-driven solutions
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate={isProblemsInView ? "visible" : "hidden"}
            variants={staggerCards}
          >
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                variants={slideUp}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-4">
                    {/* Category Header */}
                    <motion.div
                      className={`inline-flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${getColorClasses(
                        problem.color
                      )} mb-2`}
                      whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <motion.div
                        className="p-2 bg-white/20 rounded-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {problem.icon}
                      </motion.div>
                      <CardTitle className="text-xl font-bold text-white">
                        {problem.category}
                      </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    {/* Issues List */}
                    <motion.ul
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {problem.issues.map((issue, issueIndex) => (
                        <motion.li
                          key={issueIndex}
                          className="flex items-start gap-3"
                          variants={itemVariants}
                          whileHover={{ x: 5 }}
                        >
                          <motion.div
                            className={`w-2 h-2 rounded-full bg-${problem.color}-500 mt-2 flex-shrink-0`}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: issueIndex * 0.5,
                            }}
                          ></motion.div>
                          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {issue}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>

                    {/* Solution Indicator */}
                    <motion.div
                      className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                        <span>AI-powered solutions available</span>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
