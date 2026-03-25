import { motion } from 'framer-motion';

export function AboutInfo() {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="text-xs text-muted-foreground/40 text-center"
    >
      Your diary lives on this device. You can export it anytime.
    </motion.p>
  );
}
