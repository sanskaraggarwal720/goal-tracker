export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } }
};

export const cardHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap:   { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 25 }
};

export const springPop = {
  initial:  { scale: 0.85, opacity: 0 },
  animate:  { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 500, damping: 28 }
};
