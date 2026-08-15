import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import CourseCard from '@/components/CourseCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api.js';
import { allCategoriesList } from '@/lib/categoriesData.js';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const filterParam = searchParams.get('filter') || '';
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCourses({
      search: query || undefined,
      category: categoryParam !== 'all' ? categoryParam : undefined,
      filter: filterParam || undefined,
      limit: 50,
    })
      .then((results) => {
        const fetched = (results || []).filter(c => c.videoUrl && c.videoUrl.trim() !== '');
        setCourses(fetched);
      })
      .catch(() => {
        setCourses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, categoryParam, filterParam]);

  const handleCategoryChange = (val) => {
    if (val === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', val);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <Helmet>
        <title>Search Results - Eduvirse</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {filterParam === 'premium' ? 'Premium Courses' : filterParam === 'live' ? 'Live Classes' : query ? `Results for "${query}"` : 'All Courses'}
              </h1>
              <p className="text-muted-foreground">Found {courses.length} courses</p>
            </div>
            <div className="w-full md:w-64">
              <Select value={categoryParam} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategoriesList.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map(course => (
                <Link key={course._id || course.id} to={`/course/${course._id || course.id}`}>
                  <CourseCard 
                    title={course.title}
                    instructor={course.instructor?.name || course.instructor}
                    instructorImage={course.instructorImage || course.instructor?.avatar}
                    thumbnail={course.thumbnailUrl || course.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'}
                    rating={course.rating || 4.5}
                    students={course.enrollmentCount || course.enrolledStudents?.length || 0}
                    duration="24h"
                    price={course.price}
                    category={course.category?.name || course.category}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SearchResults;
