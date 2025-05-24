'use client';

import { useState, useEffect } from 'react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Product Manager',
      company: 'TechCorp Solutions',
      image: '/testimonial-sarah.jpg',
      rating: 5,
      text: 'John is an exceptional developer who consistently delivers high-quality code. His attention to detail and ability to solve complex problems makes him an invaluable team member. He led our React migration project and improved our app performance by 40%.',
      project: 'E-commerce Platform Redesign',
      relationship: 'Direct Manager'
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'CTO',
      company: 'StartupXYZ',
      image: '/testimonial-michael.jpg',
      rating: 5,
      text: 'Working with John was a game-changer for our startup. He built our entire platform from scratch and helped us scale to 10,000+ users. His full-stack expertise and mentoring skills are outstanding.',
      project: 'SaaS Platform Development',
      relationship: 'Client'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      position: 'Senior Designer',
      company: 'Digital Agency Pro',
      image: '/testimonial-emily.jpg',
      rating: 5,
      text: 'John has an incredible ability to translate design concepts into pixel-perfect, responsive websites. His collaboration skills and technical expertise made our projects seamless and successful.',
      project: 'Multiple Client Websites',
      relationship: 'Colleague'
    },
    {
      id: 4,
      name: 'David Thompson',
      position: 'Lead Developer',
      company: 'WebDev Studio',
      image: '/testimonial-david.jpg',
      rating: 5,
      text: 'As John\'s mentor early in his career, I watched him grow into an exceptional developer. His eagerness to learn, problem-solving skills, and code quality are impressive. He\'s now mentoring others with the same dedication.',
      project: 'Junior Developer Mentorship',
      relationship: 'Mentor'
    },
    {
      id: 5,
      name: 'Lisa Wang',
      position: 'Freelance Client',
      company: 'E-commerce Business',
      image: '/testimonial-lisa.jpg',
      rating: 5,
      text: 'John delivered our e-commerce website ahead of schedule and under budget. The site performs beautifully, and our sales increased by 60% after launch. His communication throughout the project was excellent.',
      project: 'Custom E-commerce Solution',
      relationship: 'Client'
    },
    {
      id: 6,
      name: 'Alex Kumar',
      position: 'Junior Developer',
      company: 'TechCorp Solutions',
      image: '/testimonial-alex.jpg',
      rating: 5,
      text: 'John is an amazing mentor who helped me grow as a developer. His code reviews are thorough and educational, and he always makes time to explain complex concepts. I learned more in 6 months working with him than in my previous year.',
      project: 'Mentorship Program',
      relationship: 'Mentee'
    }
  ];

  const companies = [
    { name: 'TechCorp Solutions', logo: '/company-techcorp.png' },
    { name: 'StartupXYZ', logo: '/company-startupxyz.png' },
    { name: 'Digital Agency Pro', logo: '/company-digital.png' },
    { name: 'WebDev Studio', logo: '/company-webdev.png' },
    { name: 'Microsoft', logo: '/company-microsoft.png' },
    { name: 'Google', logo: '/company-google.png' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What People Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Testimonials from colleagues, clients, and mentees who have worked with me
          </p>
        </div>

        {/* Featured Testimonial Carousel */}
        <div className="mb-16">
          <div className="relative bg-white dark:bg-gray-700 rounded-lg shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="absolute top-6 left-6 text-6xl text-blue-200 dark:text-blue-800 font-serif">
              "
            </div>
            
            <div className="relative z-10">
              <div className="flex mb-4">
                {renderStars(testimonials[currentTestimonial].rating)}
              </div>
              
              <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {testimonials[currentTestimonial].text}
              </blockquote>
              
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                  {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">
                    {testimonials[currentTestimonial].position}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Project:</span> {testimonials[currentTestimonial].project}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-600 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-600 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* All Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed line-clamp-4">
                "{testimonial.text}"
              </blockquote>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-xs">
                    {testimonial.position}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-xs">
                    {testimonial.company}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                  {testimonial.relationship}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Companies Section */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            Trusted by Leading Companies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-bold text-xs text-center">
                    {company.name.split(' ').map(word => word.charAt(0)).join('')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Want to Work Together?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              I'm always interested in new opportunities and exciting projects. Let's discuss how we can work together to bring your ideas to life.
            </p>
            <button
              onClick={() => {
                const element = document.querySelector('#contact');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Get In Touch
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
