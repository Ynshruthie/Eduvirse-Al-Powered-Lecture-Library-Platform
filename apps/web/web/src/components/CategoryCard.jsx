import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const CategoryCard = ({ icon, name, courseCount }) => {
  const Icon = typeof icon === 'string' ? null : icon;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
            {Icon ? <Icon className="w-8 h-8 text-primary" /> : icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{courseCount} courses</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;