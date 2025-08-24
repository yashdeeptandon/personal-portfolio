const About = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Passionate software engineer with a love for creating innovative
            solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              My Journey in Software Engineering
            </h3>

            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                With over 2 years of experience in software development,
                I&apos;ve had the privilege of working on diverse projects. My
                journey began with a curiosity about how things work, which led
                me to pursue computer science and eventually specialize in
                full-stack development.
              </p>

              <p>
                I&apos;m passionate about solving complex problems, writing
                clean, efficient code and staying up-to-date with the latest
                technologies. My approach to development focuses on creating
                scalable, maintainable solutions that not only meet current
                requirements but also adapt to future needs.
              </p>

              <p>
                When I&apos;m not coding, you can usually find me at the gym,
                playing badminton, traveling to explore new places, or reading
                books. I enjoy continuous learning and believe in sharing
                knowledge and experiences with the community around me.
              </p>
            </div>

            {/* Key Highlights */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What I Bring to the Table:
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Strong problem-solving and analytical thinking skills
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Experience with agile development methodologies
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Excellent communication and teamwork abilities
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passion for learning and adapting to new technologies
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Focus on user experience and accessibility
                </li>
              </ul>
            </div>
          </div>

          {/* Stats and Achievements */}
          <div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Professional Highlights
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    2+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Years Experience
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    5+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Projects Completed
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    15+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Technologies Mastered
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    100%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Client Satisfaction
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Interests */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                When I&apos;m Not Coding:
              </h4>
              <div className="flex flex-wrap gap-3">
                {[
                  "🏋️‍♂️ Gym & Fitness",
                  "🏃‍♂️ Running",
                  "🏸 Playing Badminton",
                  "🌍 Traveling & Exploring New Places",
                  "📖 Reading Books",
                  "📷 Photography",
                  "🎮 Gaming",
                ].map((interest, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Download Resume Button */}
            <div className="mt-8">
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
