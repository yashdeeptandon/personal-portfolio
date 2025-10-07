import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Blog from "@/components/Blog";
import Newsletter from "@/components/Newsletter";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import TestCookies from "@/components/TestCookies";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <TestCookies />
      <Navigation />
      <main>
        <Hero />
        <About />
        <Skills />
        {/* <Projects /> */}
        <Experience />
        {/* <Education /> */}
        {/* <Blog /> */}
        {/* <Newsletter /> */}
        {/* <Testimonials /> */}
        <Contact />
      </main>
    </div>
  );
}
