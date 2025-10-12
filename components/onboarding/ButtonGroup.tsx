'use client'

/**
 * Button Group - Framer Motion
 * Staggered children animations with spring physics
 */

import { motion } from 'framer-motion'

interface ButtonOption {
  label: string
  value: string
  description?: string
}

interface ButtonGroupProps {
  options: ButtonOption[]
  onSelect: (value: string) => void
  selected?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

const buttonVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
}

export function ButtonGroup({ options, onSelect, selected }: ButtonGroupProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4 mb-12"
    >
      {options.map((option) => (
        <motion.button
          key={option.value}
          variants={buttonVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onSelect(option.value)}
          disabled={selected !== undefined && selected !== option.value}
          className={`
            w-full p-6 text-left
            border-2 rounded-xl
            ${selected === option.value
              ? 'bg-primary border-primary text-neutral-white shadow-xl shadow-primary/50'
              : selected
              ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed opacity-40'
              : 'bg-neutral-900/50 border-neutral-700 text-neutral-white hover:border-primary hover:bg-neutral-800/80 hover:shadow-lg hover:shadow-primary/20'
            }
            transition-all duration-300
          `}
        >
          <div className="font-bold text-xl">{option.label}</div>
          {option.description && (
            <div className="text-sm text-neutral-400 mt-2">{option.description}</div>
          )}
        </motion.button>
      ))}
    </motion.div>
  )
}
