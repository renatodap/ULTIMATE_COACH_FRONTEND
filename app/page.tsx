'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import RotatingTextExample from '@/components/landing/RotatingTextExample'
import MemoryTimeline from '@/components/landing/MemoryTimeline'
import AdaptationDemo from '@/components/landing/AdaptationDemo'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-iron-black">
      {/* Background gradient with particles */}
      <div className="fixed inset-0 bg-gradient-to-br from-iron-black via-iron-dark-gray to-iron-black -z-10">
        <div className="absolute inset-0 opacity-30">
          <div className="particles"></div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10">
        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: HERO - FULL VIEWPORT
            ═══════════════════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: SPEAK YOUR LANGUAGE
            ═══════════════════════════════════════════════════════════════ */}
        <motion.section
          className="py-16 sm:py-24 px-4 sm:px-6 border-t-2 border-iron-orange"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12 sm:mb-16" variants={fadeInUp}>
              <p className="text-iron-gray text-sm uppercase tracking-widest mb-4">
                NATURAL UNDERSTANDING
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gradient-orange uppercase leading-tight">
                SPEAK YOUR<br />
                LANGUAGE
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Interactive example */}
              <motion.div variants={fadeInUp}>
                <RotatingTextExample />
              </motion.div>

              {/* Explanation */}
              <motion.div className="space-y-6" variants={fadeInUp}>
                <p className="text-iron-white text-lg sm:text-xl leading-relaxed">
                  Say it however you want. Type, voice, photo. Casual or precise.
                  The AI understands.
                </p>
                <ul className="space-y-4 text-iron-gray">
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Natural language processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Photo food recognition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Understands any phrasing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Same result, every time</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 3: PERMANENT MEMORY
            ═══════════════════════════════════════════════════════════════ */}
        <motion.section
          className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-iron-dark-gray to-iron-black"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12 sm:mb-16" variants={fadeInUp}>
              <p className="text-iron-gray text-sm uppercase tracking-widest mb-4">
                INFINITE CONTEXT
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-iron-white uppercase leading-tight">
                PERMANENT<br />
                <span className="text-gradient-orange">MEMORY</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Explanation */}
              <motion.div className="space-y-6 order-2 lg:order-1" variants={fadeInUp}>
                <p className="text-iron-white text-lg sm:text-xl leading-relaxed">
                  Tell the AI once. It remembers forever. No repeating yourself.
                  No forgetting your constraints.
                </p>
                <ul className="space-y-4 text-iron-gray">
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Allergies & dietary restrictions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Injuries & physical limitations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Goals & preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Never repeats questions</span>
                  </li>
                </ul>
              </motion.div>

              {/* Timeline visualization */}
              <motion.div className="order-1 lg:order-2" variants={fadeInUp}>
                <MemoryTimeline />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 4: DAILY ADAPTATION
            ═══════════════════════════════════════════════════════════════ */}
        <motion.section
          className="py-16 sm:py-24 px-4 sm:px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div className="text-center mb-12 sm:mb-16" variants={fadeInUp}>
              <p className="text-iron-gray text-sm uppercase tracking-widest mb-4">
                INTELLIGENT ADJUSTMENT
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gradient-orange uppercase leading-tight">
                DAILY<br />
                ADAPTATION
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Demo */}
              <motion.div variants={fadeInUp}>
                <AdaptationDemo />
              </motion.div>

              {/* Explanation */}
              <motion.div className="space-y-6" variants={fadeInUp}>
                <p className="text-iron-white text-lg sm:text-xl leading-relaxed">
                  Your life changes daily. So does your plan. Automatic adjustments
                  based on activity, stress, sleep, and goals.
                </p>
                <ul className="space-y-4 text-iron-gray">
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Auto-adjust calories for activity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Factor in sleep & stress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Adapt to your constraints</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-iron-orange text-xl">→</span>
                    <span>Always optimized for YOU</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 5: HOW IT WORKS
            ═══════════════════════════════════════════════════════════════ */}
        <motion.section
          className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-iron-dark-gray to-iron-black"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-black text-iron-white uppercase text-center mb-12 sm:mb-16"
              variants={fadeInUp}
            >
              COACHING THAT<br />
              <span className="text-gradient-orange">UNDERSTANDS YOU</span>
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Phone mockup */}
              <motion.div className="order-2 lg:order-1" variants={fadeInUp}>
                <div className="card-glass border-2 border-iron-orange p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-iron-gray text-xs uppercase">Training Consultation</span>
                    <span className="text-iron-orange text-xs font-bold">45%</span>
                  </div>
                  <div className="h-1 bg-iron-dark-gray">
                    <motion.div
                      className="h-full bg-iron-orange"
                      initial={{ width: 0 }}
                      whileInView={{ width: '45%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="space-y-3">
                    <motion.div
                      className="bg-iron-dark-gray border border-iron-gray p-4 text-sm text-iron-white"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                    >
                      What&apos;s your main training focus?
                    </motion.div>
                    <motion.div
                      className="bg-iron-orange bg-opacity-20 border border-iron-orange p-4 text-sm text-iron-white ml-8"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      Building muscle
                    </motion.div>
                    <motion.div
                      className="bg-iron-dark-gray border border-iron-gray p-4 text-sm text-iron-white flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ●●●
                      </motion.span>
                      <span className="text-iron-gray">AI is typing...</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Features list */}
              <motion.div className="order-1 lg:order-2 space-y-6" variants={fadeInUp}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <h3 className="text-lg font-bold text-iron-orange uppercase">AI Consultation</h3>
                      <p className="text-iron-gray text-sm">15-min natural conversation.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-iron-gray text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-iron-orange">→</span>
                    <span>Understands context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-iron-orange">→</span>
                    <span>Remembers everything</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-iron-orange">→</span>
                    <span>Real-time data search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-iron-orange">→</span>
                    <span>Claude 3.5 Sonnet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-iron-orange">→</span>
                    <span>Auto-generates your plan</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: FEATURES
            ═══════════════════════════════════════════════════════════════ */}
        <motion.section
          className="py-16 sm:py-24 px-4 sm:px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-iron-white uppercase text-center mb-12 sm:mb-16"
              variants={fadeInUp}
            >
              FEATURES
            </motion.h2>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={staggerContainer}
            >
              {/* Feature 1 */}
              <motion.div
                className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl">📸</div>
                <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Photo Tracking</h3>
                <p className="text-iron-gray text-sm">
                  Snap a pic. AI analyzes instantly.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl">🤖</div>
                <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">AI Consultation</h3>
                <p className="text-iron-gray text-sm">
                  15-min conversation. Personalized plan.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl">📊</div>
                <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Smart Analytics</h3>
                <p className="text-iron-gray text-sm">
                  Real-time insights.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl">⚡</div>
                <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Macro Calculator</h3>
                <p className="text-iron-gray text-sm">
                  BMR, TDEE, goals.
                </p>
              </motion.div>

              {/* Feature 5 */}
              <motion.div
                className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl">🎯</div>
                <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Activity Tracking</h3>
                <p className="text-iron-gray text-sm">
                  Log workouts. Track intensity.
                </p>
              </motion.div>

              {/* Feature 6 */}
              <motion.div
                className="card border-2 border-iron-gray hover:border-iron-orange transition-colors p-6 sm:p-8 space-y-4"
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl">💪</div>
                <h3 className="text-xl sm:text-2xl font-bold text-iron-white uppercase">Progress Tracking</h3>
                <p className="text-iron-gray text-sm">
                  Track gains. See what works.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 6: FOOTER
            ═══════════════════════════════════════════════════════════════ */}
        <footer className="bg-iron-black py-12 px-4 sm:px-6 border-t border-iron-gray">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Tech Stack */}
            <div className="text-center text-iron-gray text-xs sm:text-sm">
              <p>Powered by Claude AI • FastAPI • Supabase</p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-iron-gray text-xs sm:text-sm">
              <Link href="/privacy" className="hover:text-iron-orange transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-iron-orange transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-iron-orange transition-colors">
                Cookie Policy
              </Link>
              <Link href="/contact" className="hover:text-iron-orange transition-colors">
                Contact
              </Link>
            </div>

            {/* Contact Info */}
            <div className="text-center text-iron-gray text-xs space-y-1">
              <p>Contact: persimmonautomation@gmail.com</p>
            </div>

            {/* Medical Disclaimer */}
            <div className="bg-iron-dark-gray border-l-4 border-iron-orange p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold text-iron-white uppercase">Medical Disclaimer</h3>
              <p className="text-iron-gray text-xs">
                SHARPENED provides fitness guidance powered by AI. This is not medical advice.
                Consult healthcare professionals before starting any fitness program.
                Not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </div>

            {/* Copyright */}
            <div className="text-center text-iron-gray text-xs">
              <p>© 2025 SHARPENED. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* CSS for particles animation */}
      <style jsx>{`
        .particles {
          width: 100%;
          height: 100%;
          background-image:
            radial-gradient(2px 2px at 20% 30%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(1px 1px at 50% 50%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(2px 2px at 90% 60%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(1px 1px at 33% 80%, rgba(255, 69, 0, 0.4), transparent),
            radial-gradient(2px 2px at 79% 90%, rgba(255, 69, 0, 0.4), transparent);
          background-size: 200% 200%;
          background-position: 0% 0%;
          animation: particleFloat 20s ease-in-out infinite;
        }

        @keyframes particleFloat {
          0%, 100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
        }
      `}</style>
    </div>
  )
}
