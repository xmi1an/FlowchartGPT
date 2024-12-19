// src/app/page.js
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Workflow, Users, Code, Zap, 
  LineChart, Star, Activity 
} from 'lucide-react';

const FlowchartIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-16 h-16 text-blue-600"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const AnimatedNumbers = ({ value }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-5xl font-bold"
    >
      {value}
    </motion.span>
  );
};

export default function Home() {
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute inset-0"
          />
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.3,
              type: "spring",
              stiffness: 260,
              damping: 20 
            }}
            className="absolute -top-10 left-1/2 transform -translate-x-1/2"
          >
            <FlowchartIcon />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-7xl font-bold text-gray-900 mb-6">
              FlowchartGPT
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-blue-600"
              >
                .
              </motion.span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ideas into stunning flowcharts instantly with AI.
              <br />
              Professional diagrams in seconds, not hours.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push('/new')}
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            Start Creating <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-blue-600 text-white py-16 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-blue-400"
                >
                  {stat.icon}
                </motion.div>
                <AnimatedNumbers value={stat.number} />
                <p className="text-blue-100 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Animated background elements */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 -right-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-20 blur-3xl"
        />
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20"
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Start creating amazing flowcharts today
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 mb-8"
          >
            Join thousands of teams who trust FlowchartGPT
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/new')}
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, index }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}