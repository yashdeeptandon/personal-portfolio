"use client";

import { useState } from "react";

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState("frontend");

  const skillCategories = {
    frontend: {
      title: "Frontend Development",
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
      title: "Backend Development",
      skills: [
        { name: "Node.js", level: 88, icon: "🟢" },
        { name: "Express.js", level: 85, icon: "🚀" },
        // { name: "Python", level: 82, icon: "🐍" },
        // { name: "Django", level: 78, icon: "🎯" },
        { name: "PostgreSQL", level: 80, icon: "🐘" },
        { name: "MongoDB", level: 75, icon: "🍃" },
        // { name: "Redis", level: 70, icon: "🔴" },
        // { name: "GraphQL", level: 72, icon: "📊" },
      ],
    },
    tools: {
      title: "Tools & Technologies",
      skills: [
        { name: "Git", level: 90, icon: "📝" },
        { name: "Docker", level: 75, icon: "🐳" },
        { name: "AWS", level: 70, icon: "☁️" },
        { name: "Vercel", level: 85, icon: "▲" },
        { name: "Jest", level: 80, icon: "🃏" },
        { name: "Webpack", level: 75, icon: "📦" },
        // { name: "Figma", level: 70, icon: "🎨" },
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

  const categories = Object.keys(skillCategories);

  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Skills & Expertise
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive overview of my technical skills and professional
            competencies
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 mx-2 mb-4 rounded-lg font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600"
              }`}
            >
              {skillCategories[category as keyof typeof skillCategories].title}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {skillCategories[
            activeCategory as keyof typeof skillCategories
          ].skills.map((skill, index) => (
            <div
              key={skill.name}
              className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{skill.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {skill.name}
                </h3>
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Proficiency
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {skill.level}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications Section */}
        {/* <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Certifications & Achievements
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "AWS Certified Developer",
                issuer: "Amazon Web Services",
                date: "2023",
                icon: "☁️",
              },
              {
                title: "React Developer Certification",
                issuer: "Meta",
                date: "2022",
                icon: "⚛️",
              },
              {
                title: "Scrum Master Certified",
                issuer: "Scrum Alliance",
                date: "2022",
                icon: "🔄",
              },
            ].map((cert, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-lg text-center"
              >
                <div className="text-4xl mb-4">{cert.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {cert.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-1">
                  {cert.issuer}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {cert.date}
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Skills;
