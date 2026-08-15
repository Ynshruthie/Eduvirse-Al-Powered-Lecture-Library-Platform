import React from 'react';
import { Crown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CourseCard = ({ 
  title, 
  instructor, 
  instructorImage, 
  thumbnail, 
  rating, 
  students, 
  duration, 
  price, 
  category 
}) => {
  const isPremium = price && Number(price) > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-md dark:hover:border-slate-700 group/card cursor-pointer h-full">
      <div className="relative h-28 overflow-hidden">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
        />
        {isPremium && (
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 text-slate-800 dark:text-slate-200 shadow-sm">
            <Crown className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> Premium
          </div>
        )}
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-all duration-300 active:scale-75 hover:scale-110"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-1 leading-tight line-clamp-2 min-h-[32px] group-hover/card:text-[#6366f1] dark:group-hover/card:text-indigo-400 transition-colors">
            {title}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 transition-colors">
            {category || 'General'}
          </p>
        </div>
        <div className="mt-auto">
          <div className="flex items-end gap-1.5 mb-2.5">
            <span className="text-sm font-bold text-slate-900 dark:text-white transition-colors">
              {isPremium ? `₹${price}` : 'Free'}
            </span>
          </div>
          <Button 
            variant="outline" 
            className="w-full rounded-lg border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 font-semibold h-7 text-[10px] transition-all duration-300 active:scale-95"
          >
            View Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;