import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveClassCard = ({ instructor, instructorImage, title, time, participants, category }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Badge className="absolute top-4 right-4 bg-red-500 text-white animate-pulse">
            LIVE
          </Badge>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/40"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={instructorImage} alt={instructor} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {instructor.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{instructor}</p>
              <p className="text-xs text-muted-foreground">{category}</p>
            </div>
          </div>
          <h3 className="font-semibold text-lg mb-3 leading-snug">{title}</h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{participants} watching</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default LiveClassCard;