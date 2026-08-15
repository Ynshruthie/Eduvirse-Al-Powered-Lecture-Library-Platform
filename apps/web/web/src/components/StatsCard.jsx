import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ number, label, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="flex flex-col items-center gap-3">
        {Icon && (
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary" />
          </div>
        )}
        <div>
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2" style={{ letterSpacing: '-0.02em' }}>
            {number}
          </div>
          <p className="text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;