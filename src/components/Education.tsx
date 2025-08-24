const Education = () => {
  const education = [
    {
      id: 1,
      degree: "Bachelor of Science in Computer Science",
      institution: "DIT University",
      location: "Dehradun, India",
      period: "2020 - 2024",
      gpa: "8.79/10.0",
      description:
        "Focused on software engineering, algorithms, and data structures. Completed senior capstone project on machine learning applications.",
      coursework: [
        "Data Structures and Algorithms",
        "Software Engineering",
        "Database Systems",
        "Computer Networks",
        "Machine Learning",
        "Web Development",
      ],
      achievements: [
        "Dean's List for 6 semesters",
        "Computer Science Department Honor Roll",
        "Senior Capstone Project: ML-based Recommendation System",
        "Teaching Assistant for Introduction to Programming",
      ],
    },
    {
      id: 2,
      degree: "Full-Stack Web Development Bootcamp",
      institution: "General Assembly",
      location: "San Francisco, CA",
      period: "2018",
      gpa: null,
      description:
        "Intensive 12-week program covering modern web development technologies and best practices.",
      coursework: [
        "HTML5, CSS3, JavaScript",
        "React.js and Redux",
        "Node.js and Express",
        "MongoDB and PostgreSQL",
        "Git and Version Control",
        "Agile Development",
      ],
      achievements: [
        "Graduated with Distinction",
        "Built 3 full-stack applications",
        "Collaborated on team projects using Agile methodology",
        "Received job placement assistance",
      ],
    },
  ];

  const certifications = [
    {
      id: 1,
      title: "AWS Certified Developer - Associate",
      issuer: "Amazon Web Services",
      date: "March 2023",
      credentialId: "AWS-CDA-2023-001",
      description:
        "Validates expertise in developing and maintaining applications on the AWS platform.",
      skills: ["AWS Lambda", "DynamoDB", "S3", "CloudFormation", "API Gateway"],
    },
    {
      id: 2,
      title: "Professional Scrum Master I (PSM I)",
      issuer: "Scrum.org",
      date: "January 2023",
      credentialId: "PSM-2023-456",
      description:
        "Demonstrates understanding of Scrum framework and ability to support Scrum teams.",
      skills: [
        "Scrum Framework",
        "Agile Principles",
        "Team Facilitation",
        "Sprint Planning",
      ],
    },
    {
      id: 3,
      title: "React Developer Certification",
      issuer: "Meta (Facebook)",
      date: "September 2022",
      credentialId: "META-REACT-2022-789",
      description:
        "Comprehensive certification covering React fundamentals and advanced concepts.",
      skills: [
        "React Hooks",
        "State Management",
        "Component Design",
        "Testing",
      ],
    },
    {
      id: 4,
      title: "Google Analytics Certified",
      issuer: "Google",
      date: "June 2022",
      credentialId: "GA-CERT-2022-123",
      description:
        "Proficiency in Google Analytics for web analytics and data-driven decision making.",
      skills: [
        "Web Analytics",
        "Data Analysis",
        "Conversion Tracking",
        "Reporting",
      ],
    },
  ];

  const onlineCourses = [
    "Advanced React Patterns - Kent C. Dodds",
    "Node.js: The Complete Guide - Maximilian Schwarzmüller",
    "AWS Solutions Architect - A Cloud Guru",
    "TypeScript: The Complete Developer's Guide - Stephen Grider",
    "Docker and Kubernetes - Bret Fisher",
    "GraphQL with React - Robin Wieruch",
  ];

  return (
    <section id="education" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Education & Certifications
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            My academic background and continuous learning journey in technology
          </p>
        </div>

        {/* Formal Education */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            🎓 Formal Education
          </h3>
          <div className="space-y-8">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {edu.degree}
                        </h4>
                        <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium mb-2">
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
                              d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                          </svg>
                          {edu.institution}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            {edu.location}
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0v1a2 2 0 002 2h2a2 2 0 002-2V7m-6 0H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                              />
                            </svg>
                            {edu.period}
                          </span>
                          {edu.gpa && (
                            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                              GPA: {edu.gpa}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {edu.description}
                    </p>

                    {/* Achievements */}
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Achievements:
                      </h5>
                      <ul className="space-y-2">
                        {edu.achievements.map((achievement, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-sm text-gray-600 dark:text-gray-300"
                          >
                            <svg
                              className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Coursework */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Relevant Coursework:
                    </h5>
                    <div className="space-y-2">
                      {edu.coursework.map((course, idx) => (
                        <span
                          key={idx}
                          className="block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-sm"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            🏆 Professional Certifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {cert.title}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {cert.issuer}
                    </p>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                    {cert.date}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {cert.description}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Credential ID: {cert.credentialId}
                  </p>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Skills Covered:
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {cert.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Online Learning */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            📚 Continuous Learning
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Recent Online Courses & Training
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onlineCourses.map((course, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {course}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
