/**
 * Hero Section - Landing Page
 *
 * Full viewport hero with logo, headline, phone mockup, and CTA buttons
 */

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from './animations'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Logo with Lightning */}
      <motion.div
        className="mb-8 sm:mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-center leading-none">
          <span className="text-gradient-orange">SHARPENED</span>
          <motion.span
            className="text-iron-orange text-6xl sm:text-7xl md:text-8xl lg:text-9xl inline-block ml-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚡
          </motion.span>
        </h1>
      </motion.div>

      {/* Hero Headline */}
      <motion.div
        className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-iron-white uppercase leading-tight px-4"
          variants={fadeInUp}
        >
          THE AI THAT<br />
          <span className="text-gradient-orange">ADAPTS TO YOU</span>
        </motion.h2>
        <motion.p
          className="text-base sm:text-lg md:text-xl text-iron-gray uppercase tracking-widest"
          variants={fadeInUp}
        >
          Your way. Your words. Your goals.
        </motion.p>
      </motion.div>

      {/* Phone Mockup Placeholder */}
      <motion.div
        className="mb-8 sm:mb-12 w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="card-glass p-6 sm:p-8 border-2 border-iron-gray hover:border-iron-orange transition-colors duration-300">
          <div className="space-y-4">
            <motion.div
              className="h-2 bg-iron-orange w-3/4"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="space-y-2">
              <motion.div
                className="h-16 bg-iron-dark-gray border border-iron-gray flex items-center px-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-iron-gray text-sm">AI: How often do you train?</span>
              </motion.div>
              <motion.div
                className="h-12 bg-iron-orange bg-opacity-20 border border-iron-orange flex items-center justify-end px-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-iron-white text-sm">4x per week</span>
              </motion.div>
            </div>
            <motion.div
              className="text-center text-iron-gray text-xs uppercase tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Consultation in progress...
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Link
          href="/signup"
          className="btn btn-primary text-base sm:text-lg md:text-xl px-8 sm:px-12 py-4 sm:py-5 inline-block w-full sm:w-auto text-center"
        >
          <motion.span
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            GET STARTED →
          </motion.span>
        </Link>
        <Link
          href="/login"
          className="btn btn-secondary text-base sm:text-lg md:text-xl px-8 sm:px-12 py-4 sm:py-5 inline-block w-full sm:w-auto text-center"
        >
          <motion.span
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SIGN IN
          </motion.span>
        </Link>
      </motion.div>

      <motion.p
        className="mt-4 text-iron-gray text-xs sm:text-sm uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        AI-powered coaching that remembers everything
      </motion.p>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="text-iron-orange text-2xl">↓</div>
      </motion.div>
    </section>
  )
}
