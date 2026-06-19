"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./ui/AnimatedSection";
import CountUp from "./ui/CountUp";

const highlights = [
  "Strong problem-solving and analytical thinking skills",
  "Experience with agile development methodologies",
  "Excellent communication and teamwork abilities",
  "Passion for learning and adapting to new technologies",
  "Focus on user experience and accessibility",
];

const interests = [
  "🏋️‍♂️ Gym & Fitness",
  "🏃‍♂️ Running",
  "🏸 Playing Badminton",
  "🌍 Traveling & Exploring",
  "📖 Reading Books",
  "📷 Photography",
  "🎮 Gaming",
];

const stats = [
  { value: 2, suffix: "+", label: "Years Experience" },
  { value: 5, suffix: "+", label: "Projects Completed" },
  { value: 15, suffix: "+", label: "Technologies Mastered" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
];

const checkPath = "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z";

const highlightVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const highlightItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const tagVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const tagItem = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
};

const About = () => {
  return (
    <section id="about" className="py-20 bg-white/8 dark:bg-black/10 backdrop-blur-[2px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Passionate software engineer with a love for creating innovative solutions
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Text */}
          <AnimatedSection variant="fadeRight">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              My Journey in Software Engineering
            </h3>

            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-[0.97rem] leading-relaxed">
              <p>
                With over 2 years of experience in software development, I&apos;ve had the privilege
                of working on diverse projects. My journey began with a curiosity about how things
                work, which led me to pursue computer science and eventually specialize in
                full-stack development.
              </p>
              <p>
                I&apos;m passionate about solving complex problems, writing clean, efficient code
                and staying up-to-date with the latest technologies. My approach to development
                focuses on creating scalable, maintainable solutions that not only meet current
                requirements but also adapt to future needs.
              </p>
              <p>
                When I&apos;m not coding, I&apos;m chasing PRs — personal records. I log every
                run, workout, and recovery metric through Apple Watch, and I&apos;ve built a custom
                Python pipeline to surface the patterns. You can explore that data in the{" "}
                <a
                  href="/performance"
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
                >
                  Performance dashboard
                </a>
                .
              </p>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What I Bring to the Table:
              </h4>
              <motion.ul
                className="space-y-2.5"
                variants={highlightVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
              >
                {highlights.map((item) => (
                  <motion.li
                    key={item}
                    variants={highlightItem}
                    className="flex items-center text-gray-600 dark:text-gray-300 gap-3"
                  >
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d={checkPath} clipRule="evenodd" />
                    </svg>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </AnimatedSection>

          {/* Right: Stats + Interests */}
          <AnimatedSection variant="fadeLeft" delay={0.15}>
            {/* Stats */}
            <div className="bg-white/75 dark:bg-gray-700/75 backdrop-blur-md rounded-2xl p-8 shadow-md border border-white/30 dark:border-gray-600/50">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Professional Highlights
              </h4>
              <div className="grid grid-cols-2 gap-6">
                {stats.map(({ value, suffix, label }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-600/50"
                  >
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 mb-1">
                      <CountUp target={value} suffix={suffix} />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                When I&apos;m Not Coding:
              </h4>
              <motion.div
                className="flex flex-wrap gap-3"
                variants={tagVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                {interests.map((interest) => (
                  <motion.span
                    key={interest}
                    variants={tagItem}
                    whileHover={{ scale: 1.07, y: -2 }}
                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full text-sm border border-indigo-100 dark:border-indigo-800/40 cursor-default"
                  >
                    {interest}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Resume */}
            <div className="mt-8">
              <motion.a
                href="/resume.pdf"
                download
                whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(99,102,241,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </motion.a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default About;
