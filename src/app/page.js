"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { ArrowRight, Workflow, Users, Code, Zap, LineChart, Star, Activity, ChevronRight } from 'lucide-react';

const EnhancedFlowchartAnimation = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <motion.svg viewBox="0 0 400 200" className="w-full h-full">
        {/* Start Node with ripple effect */}
        <motion.circle
          cx="50"
          cy="100"
          r="25"
          className="fill-blue-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.circle
          cx="50"
          cy="100"
          r="25"
          className="fill-blue-500 opacity-50"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Curved Path to Decision Diamond */}
        <motion.path
          d="M75 100 Q 120 100 140 70"
          className="stroke-blue-500"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
        />

        {/* Decision Diamond with rotation */}
        <motion.g
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatDelay: 1 }}
          origin="center"
        >
          <motion.path
            d="M140 40 L170 70 L140 100 L110 70 Z"
            className="fill-yellow-400"
            whileHover={{ scale: 1.1 }}
          />
        </motion.g>

        {/* Multiple Paths from Decision */}
        <motion.path
          d="M170 70 Q 200 70 220 100"
          className="stroke-green-500"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
        
        <motion.path
          d="M140 100 Q 170 130 200 130"
          className="stroke-purple-500"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />

        {/* Process Rectangles with Pulse */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <motion.rect
            x="220"
            y="80"
            width="40"
            height="40"
            rx="8"
            className="fill-green-500"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.g>

        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <motion.rect
            x="200"
            y="110"
            width="40"
            height="40"
            rx="8"
            className="fill-purple-500"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </motion.g>

        {/* Converging Paths to End */}
        <motion.path
          d="M260 100 Q 290 100 310 100"
          className="stroke-blue-500"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 2.5, repeat: Infinity, repeatDelay: 1 }}
        />
        
        <motion.path
          d="M240 130 Q 270 130 310 100"
          className="stroke-blue-500"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 2.5, repeat: Infinity, repeatDelay: 1 }}
        />

        {/* End Node with Starburst */}
        <motion.circle
          cx="330"
          cy="100"
          r="25"
          className="fill-blue-600"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 3, repeat: Infinity, repeatDelay: 1 }}
        />
        <motion.circle
          cx="330"
          cy="100"
          r="25"
          className="fill-blue-400 opacity-50"
          initial={{ scale: 1 }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
};

const MovingBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const positions = useMemo(() => {
    return Array(10).fill(null).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const handleResize = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          initial={{ x: -100, y: -100, rotate: 0 }}
          animate={{ x: dimensions.width, y: dimensions.height, rotate: 360 }}
          transition={{
            duration: 20 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-20 h-20 bg-blue-100/20 rounded-full"
          style={{
            top: `${pos.top}%`,
            left: `${pos.left}%`
          }}
        />
      ))}
    </div>
  );
};

const InteractiveGridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="grid grid-cols-12 gap-4 w-full h-full">
        {[...Array(144)].map((_, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            className="w-full h-full border border-gray-200 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
};

const SlidingTestimonials = ({ testimonials }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="relative overflow-hidden h-96" />;
  }

  return (
    <div className="relative overflow-hidden h-96">
      <motion.div
        className="absolute flex gap-8"
        animate={{
          x: ['0%', '-100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div
            key={index}
            className="w-96 bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <p className="text-gray-600 mb-4">{testimonial.text}</p>
            <div className="border-t pt-4">
              <p className="font-semibold">{testimonial.author}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
              <p className="text-sm text-blue-600">{testimonial.company}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const FlowchartEducation = () => {
  const flowchartTypes = [
    {
      title: "Process Flow",
      description: "Step-by-step progression of a process",
      color: "blue",
      delay: 0
    },
    {
      title: "User Journey",
      description: "Visualizes the user's experience with a product or service",
      color: "green",
      delay: 0.1
    },
    {
      title: "System Architecture",
      description: "Shows the structure and components of a system",
      color: "purple",
      delay: 0.2
    },
    {
      title: "Decision Tree",
      description: "Represents decisions and their possible consequences",
      color: "orange",
      delay: 0.3
    },
    {
      title: "Data Flow",
      description: "Visualizes how data moves through a system",
      color: "teal",
      delay: 0.4
    },
    {
      title: "State Diagram",
      description: "Represents the states of a system and transitions between them",
      color: "pink",
      delay: 0.5
    },
    {
      title: "Sequence Flow",
      description: "Shows the sequence of interactions in a process",
      color: "indigo",
      delay: 0.6
    },
    {
      title: "Minimane Process",
      description: "Simplified representation of a process",
      color: "yellow",
      delay: 0.7
    }
  ];

  const benefits = [
    "Clear Communication",
    "Process Optimization",
    "Decision Making",
    "Training & Documentation",
    "Quality Control",
    "Project Planning"
  ];

  return (
    <div className="bg-gray-50 py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-8">What is a Flowchart?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <p className="text-lg text-gray-600 leading-relaxed">
                A flowchart is a visual representation of a process, workflow, or algorithm. It uses standardized symbols connected by arrows to show the step-by-step progression and relationships between different elements.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              {/* Simpler Infinite Flowchart Animation */}
              <motion.svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Start Node */}
                <motion.circle
                  cx="50"
                  cy="100"
                  r="20"
                  className="fill-blue-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Path to Process */}
                <motion.path
                  d="M70 100 H130"
                  className="stroke-blue-500"
                  strokeWidth="4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Process Rectangle */}
                <motion.rect
                  x="130"
                  y="80"
                  width="60"
                  height="40"
                  rx="8"
                  className="fill-green-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Path to Decision */}
                <motion.path
                  d="M190 100 H250"
                  className="stroke-blue-500"
                  strokeWidth="4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 1, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Decision Diamond */}
                <motion.path
                  d="M250 70 L280 100 L250 130 L220 100 Z"
                  className="fill-yellow-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.5, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Path to End */}
                <motion.path
                  d="M280 100 H330"
                  className="stroke-blue-500"
                  strokeWidth="4"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* End Node */}
                <motion.circle
                  cx="350"
                  cy="100"
                  r="20"
                  className="fill-red-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.svg>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Types of Flowcharts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {flowchartTypes.map((type, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: type.delay }} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-semibold mb-4">{type.title}</h3>
                <p className="text-gray-600">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold text-center mb-12">Why Use Flowcharts?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-white p-6 rounded-xl shadow-lg text-center">
                <h3 className="text-lg font-semibold text-blue-600">{benefit}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Home = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { number: "50K+", label: "Flowcharts Created", icon: <Activity /> },
    { number: "98%", label: "Satisfaction Rate", icon: <Star /> },
    { number: "10K+", label: "Active Users", icon: <Users /> },
    { number: "24/7", label: "AI Support", icon: <Zap /> }
  ];

  const features = [
    {
      title: "Smart Diagrams",
      description: "AI understands your needs and creates perfect flowcharts instantly.",
      icon: <Workflow className="w-6 h-6" />,
      color: "blue"
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates and sharing.",
      icon: <Users className="w-6 h-6" />,
      color: "green"
    },
    {
      title: "Export Anywhere",
      description: "Export to multiple formats and integrate with your tools.",
      icon: <Code className="w-6 h-6" />,
      color: "purple"
    },
    {
      title: "Analytics",
      description: "Track usage and optimize your workflows with insights.",
      icon: <LineChart className="w-6 h-6" />,
      color: "orange"
    }
  ];

  const testimonials = [
    {
      text: "FlowchartGPT transformed how we document our processes. It's incredibly intuitive!",
      author: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp"
    },
    {
      text: "The AI capabilities are mind-blowing. What used to take hours now takes minutes.",
      author: "Michael Rodriguez",
      role: "Business Analyst",
      company: "InnovateHub"
    },
    {
      text: "Best flowchart tool we've ever used. The team collaboration features are outstanding.",
      author: "Emma Thompson",
      role: "Team Lead",
      company: "DesignMasters"
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
      <MovingBackground />
      <InteractiveGridBackground />
      <header className="bg-white/80 backdrop-blur-sm shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">FlowchartGPT</h1>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/new')} className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
          Start Creating <ArrowRight size={16} />
          </motion.button>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              FlowchartGPT
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-blue-600">.</motion.span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">Transform your ideas into stunning flowcharts instantly with AI. Create professional diagrams in seconds, not hours.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/new')} className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
              Start Creating <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <EnhancedFlowchartAnimation />
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-blue-600 text-white py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 + 0.2 }} className="text-blue-300 mb-2 flex justify-center">
                  {stat.icon}
                </motion.div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <p className="text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold text-center mb-16">
          Features that make us different
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5, scale: 1.02 }} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-white text-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold text-center mb-16">
            What our users say
          </motion.h2>
          <SlidingTestimonials testimonials={testimonials} />
        </div>
      </div>

      <FlowchartEducation />

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-4xl font-bold mb-6">
            Ready to transform your workflow?
          </motion.h2>
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-xl text-blue-100 mb-8">
            Join thousands of teams who trust FlowchartGPT
          </motion.p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push('/new')} className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
            Get Started Free <ChevronRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;