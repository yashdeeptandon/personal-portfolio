const Experience = () => {
  const experiences = [
    {
      id: 1,
      title: 'Senior Full-Stack Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      period: '2022 - Present',
      type: 'Full-time',
      description: 'Leading development of enterprise-level web applications using React, Node.js, and cloud technologies. Mentoring junior developers and architecting scalable solutions.',
      achievements: [
        'Led a team of 5 developers in building a customer portal that increased user engagement by 40%',
        'Implemented microservices architecture reducing system downtime by 60%',
        'Optimized application performance resulting in 50% faster load times',
        'Established code review processes and development best practices'
      ],
      technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker'],
      current: true
    },
    {
      id: 2,
      title: 'Full-Stack Developer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      period: '2020 - 2022',
      type: 'Full-time',
      description: 'Developed and maintained multiple web applications for a fast-growing startup. Worked closely with product team to deliver features that drove business growth.',
      achievements: [
        'Built the company\'s main product from MVP to production serving 10,000+ users',
        'Reduced API response times by 70% through database optimization',
        'Implemented automated testing increasing code coverage to 90%',
        'Collaborated with design team to create responsive, accessible user interfaces'
      ],
      technologies: ['React', 'Express.js', 'MongoDB', 'Redis', 'Jest', 'Tailwind CSS'],
      current: false
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company: 'Digital Agency Pro',
      location: 'Remote',
      period: '2019 - 2020',
      type: 'Contract',
      description: 'Specialized in creating responsive, interactive websites for various clients. Focused on modern frontend technologies and user experience optimization.',
      achievements: [
        'Delivered 15+ client projects with 100% on-time completion rate',
        'Improved client website performance scores by average of 35%',
        'Developed reusable component library used across multiple projects',
        'Mentored 2 junior developers in modern frontend practices'
      ],
      technologies: ['React', 'Vue.js', 'JavaScript', 'Sass', 'Webpack', 'Figma'],
      current: false
    },
    {
      id: 4,
      title: 'Junior Web Developer',
      company: 'WebDev Studio',
      location: 'Chicago, IL',
      period: '2018 - 2019',
      type: 'Full-time',
      description: 'Started my professional journey building websites and learning modern development practices. Gained experience in both frontend and backend technologies.',
      achievements: [
        'Contributed to 20+ website projects for small to medium businesses',
        'Learned and applied modern JavaScript frameworks and libraries',
        'Participated in code reviews and agile development processes',
        'Completed professional development courses in React and Node.js'
      ],
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'MySQL', 'WordPress'],
      current: false
    }
  ];

  return (
    <section id="experience" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Experience
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            My journey through various roles and companies, building expertise and delivering impactful solutions
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-px h-full w-0.5 bg-blue-600"></div>

          {/* Experience items */}
          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800 z-10">
                  {exp.current && (
                    <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping"></div>
                  )}
                </div>

                {/* Content */}
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} ml-16 md:ml-0`}>
                  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {exp.title}
                        </h3>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-2">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {exp.company}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {exp.location}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {exp.period}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            exp.type === 'Full-time' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {exp.type}
                          </span>
                          {exp.current && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {exp.description}
                    </p>

                    {/* Achievements */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Key Achievements:
                      </h4>
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                            <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Technologies Used:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-20 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Career Highlights
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                5+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                4
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Companies
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                50+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Projects Delivered
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
