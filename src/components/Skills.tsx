"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedSection from "./ui/AnimatedSection";

const skillCategories = {
  frontend: {
    title: "Frontend",
    skills: [
      { name: "React", level: 95, icon: "⚛️" },
      { name: "Next.js", level: 90, icon: "🔺" },
      { name: "TypeScript", level: 88, icon: "📘" },
      { name: "JavaScript", level: 92, icon: "💛" },
      { name: "HTML5", level: 95, icon: "🌐" },
      { name: "CSS3", level: 90, icon: "🎨" },
      { name: "Tailwind CSS", level: 85, icon: "💨" },
      { name: "Shadcn", level: 100, icon: "💅" },
    ],
  },
  backend: {
    title: "Backend",
    skills: [
      { name: "Node.js", level: 88, icon: "🟢" },
      { name: "Express.js", level: 85, icon: "🚀" },
      { name: "PostgreSQL", level: 80, icon: "🐘" },
      { name: "MongoDB", level: 75, icon: "🍃" },
    ],
  },
  tools: {
    title: "Tools",
    skills: [
      { name: "Git", level: 90, icon: "📝" },
      { name: "Docker", level: 75, icon: "🐳" },
      { name: "AWS", level: 70, icon: "☁️" },
      { name: "Vercel", level: 85, icon: "▲" },
      { name: "Jest", level: 80, icon: "🃏" },
      { name: "Webpack", level: 75, icon: "📦" },
      { name: "VS Code", level: 95, icon: "💻" },
    ],
  },
  soft: {
    title: "Soft Skills",
    skills: [
      { name: "Problem Solving", level: 92, icon: "🧩" },
      { name: "Team Leadership", level: 85, icon: "👥" },
      { name: "Communication", level: 88, icon: "💬" },
      { name: "Project Management", level: 80, icon: "📋" },
      { name: "Mentoring", level: 82, icon: "🎓" },
      { name: "Agile/Scrum", level: 85, icon: "🔄" },
      { name: "Code Review", level: 90, icon: "🔍" },
      { name: "Documentation", level: 85, icon: "📚" },
    ],
  },
};

const categories = Object.keys(skillCategories) as Array<keyof typeof skillCategories>;

const cardContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: cubicEase } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
};

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof skillCategories>("frontend");

  return (
    <section id="skills" className="py-20 bg-white/8 dark:bg-black/10 backdrop-blur-[2px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Skills &amp; Expertise
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive overview of my technical skills and professional competencies
          </p>
        </AnimatedSection>

        {/* Category Tabs */}
        <AnimatedSection delay={0.1} className="flex flex-wrap justify-center mb-12 gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="relative px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activeCategory === category && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  activeCategory === category
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {skillCategories[category].title}
              </span>
            </button>
          ))}
        </AnimatedSection>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={cardContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {skillCategories[activeCategory].skills.map((skill) => (
              <motion.div
                key={skill.name}
                variants={cardVariants}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                className="bg-white/75 dark:bg-gray-700/75 backdrop-blur-md rounded-xl p-6 shadow-md cursor-default border border-white/30 dark:border-gray-600/40 hover:border-indigo-200 dark:hover:border-indigo-700/60 transition-colors duration-200"
              >
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{skill.icon}</span>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {skill.name}
                  </h3>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Proficiency</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Skills;
