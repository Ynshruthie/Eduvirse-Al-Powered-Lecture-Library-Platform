import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api.js';
import { toast } from 'sonner';
const EnrollmentModal = ({ isOpen, onClose, course, onEnrollSuccess }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    if (!currentUser) {
      toast.error('Please login to enroll');
      return;
    }

    setIsLoading(true);
    try {
      await api.enrollCourse(course._id || course.id);
      toast.success('Successfully enrolled in course!');
      if (onEnrollSuccess) onEnrollSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to enroll');
    } finally {
      setIsLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Enrollment</DialogTitle>
          <DialogDescription>You are about to enroll in this course.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-semibold text-lg">{course.title}</h3>
          <p className="text-muted-foreground text-sm mt-1">Instructor: {course.instructor?.name || course.instructor}</p>
          <div className="mt-4 p-4 bg-muted rounded-lg flex justify-between items-center">
            <span className="font-medium">Total Price:</span>
            <span className="text-xl font-bold text-primary">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleEnroll} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm Enrollment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentModal;