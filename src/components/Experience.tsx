"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./ui/AnimatedSection";
import CountUp from "./ui/CountUp";

const experiences = [
  {
    id: 1,
    title: "Senior Software Developer",
    company: "GoTrust",
    location: "Noida, Uttar Pradesh, IN",
    period: "Aug, 2025 - Present",
    type: "Full-time",
    description:
      "Leading development of two key modules (Cookie Management and Consent Management) in GoTrust using React, Node.js, and cloud technologies. Mentoring junior developers and architecting scalable solutions.",
    achievements: [
      "Led a team of 3 developers in optimising the product that increased the product by 40%",
      "Implemented microservices architecture reducing system downtime by 60%",
      "Optimized application performance resulting in 50% faster load times",
      "Established code review processes and development best practices",
    ],
    technologies: ["React", "TypeScript", "Redux Toolkit", "TailwindCSS", "Shadcn", "Node.js", "AWS", "PostgreSQL", "Docker", "Keycloak"],
    current: true,
  },
  {
    id: 2,
    title: "Software Developer",
    company: "GoTrust",
    location: "Noida, Uttar Pradesh, IN",
    period: "Jan, 2024 - July, 2025",
    type: "Full-time",
    description:
      "One of the founding developers at GoTrust, contributing to building the platform from scratch in a fast-paced startup environment with weekly feature deployments. Worked across frontend architecture, collaborating with backend and DevOps teams to deliver high-performance solutions.",
    achievements: [
      "Module owner for Cookie Consent Management and Universal Consent Management",
      "Increased Web Vitals performance score from 38 to 77 through image lazy loading, React.memo, and rendering optimizations",
      "Contributed to CRM, ROPA, Policy Management, and Consent Management modules",
      "Developed analytics dashboards with real-time metrics, logging, and error handling",
      "Led and mentored a team of 3 junior developers, enforcing best practices",
      "Implemented JWT and OTP-based authentication, integrated Keycloak for SSO",
      "Participated in product strategy discussions, POCs, demos, and issue resolution cycles",
    ],
    technologies: ["React", "TypeScript", "Redux Toolkit", "TailwindCSS", "Shadcn", "Node.js", "AWS", "PostgreSQL", "Docker", "Keycloak"],
    current: false,
  },
];

const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const cardVariants = {
  hidden: (isEven: boolean) => ({ opacity: 0, x: isEven ? -60 : 60 }),
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: cubicEase } },
};

const achievementVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
};

const achievementItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const stats = [
  { value: 2, suffix: "+", label: "Years Experience" },
  { value: 1, suffix: "", label: "Companies" },
  { value: 50, suffix: "+", label: "Projects Delivered" },
  { value: 15, suffix: "+", label: "Technologies Mastered" },
];

const Experience = () => {
  return (
    <section id="experience" className="py-20 bg-white/8 dark:bg-black/10 backdrop-blur-[2px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Experience
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            My journey through various roles and companies, building expertise and delivering impactful solutions
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-transparent" />

          <div className="space-y-16">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`relative flex items-start ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10 mt-6">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg shadow-blue-500/30">
                    {exp.current && (
                      <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <motion.div
                  custom={index % 2 === 0}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-14" : "md:pl-14"} ml-16 md:ml-0`}
                >
                  <motion.div
                    whileHover={{ y: -4, boxShadow: "0 24px 48px rgba(0,0,0,0.1)" }}
                    transition={{ duration: 0.25 }}
                    className="bg-white/75 dark:bg-gray-800/75 backdrop-blur-md rounded-2xl shadow-md p-6 border border-white/30 dark:border-gray-700/50"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {exp.title}
                        </h3>
                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {exp.company}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {exp.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exp.period}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            {exp.type}
                          </span>
                          {exp.current && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                      {exp.description}
                    </p>

                    {/* Achievements */}
                    <motion.div
                      className="mb-4"
                      variants={achievementVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Key Achievements</h4>
                      <ul className="space-y-1.5">
                        {exp.achievements.map((achievement, idx) => (
                          <motion.li
                            key={idx}
                            variants={achievementItem}
                            className="flex items-start text-sm text-gray-600 dark:text-gray-300 gap-2"
                          >
                            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {achievement}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Technologies */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span key={tech} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-indigo-100 dark:border-indigo-800/40">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <AnimatedSection delay={0.1} className="mt-20">
          <motion.div
            whileInView={{ opacity: 1 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-white text-center mb-8">Career Highlights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ value, suffix, label }) => (
                <div key={label} className="text-center">
                  <div className="text-4xl font-bold text-white mb-1">
                    <CountUp target={value} suffix={suffix} />
                  </div>
                  <div className="text-sm text-blue-100">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Experience;
