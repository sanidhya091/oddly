import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)' },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  )
}