import { categoryGroups } from './categoriesData.js';

const baseCourses = [
  {
    _id: "mock-1",
    id: "mock-1",
    title: "Newton's Laws of Motion - Visualized",
    subject: "Physics",
    classLevel: "Class 11",
    category: "Physics",
    priceType: "paid",
    price: 999,
    discountPrice: 499,
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    rating: "4.8",
    instructor: "Ankit Sharma",
    instructorImage: "https://i.pravatar.cc/150?u=ankit",
    teacherName: "Ankit Sharma",
    teacherAvatar: "https://i.pravatar.cc/150?u=ankit",
    teacherId: "teacher-ankit",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    _id: "mock-2",
    id: "mock-2",
    title: "Organic Chemistry - Reaction Mechanisms",
    subject: "Chemistry",
    classLevel: "Class 12",
    category: "Chemistry",
    priceType: "paid",
    price: 1499,
    discountPrice: 799,
    thumbnailUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=800&auto=format&fit=crop",
    rating: "4.9",
    instructor: "Priya Sharma",
    instructorImage: "https://i.pravatar.cc/150?u=priya",
    teacherName: "Priya Sharma",
    teacherAvatar: "https://i.pravatar.cc/150?u=priya",
    teacherId: "teacher-priya",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
  },
  {
    _id: "mock-3",
    id: "mock-3",
    title: "Introduction to Calculus - Limits & Derivatives",
    subject: "Mathematics",
    classLevel: "Class 11",
    category: "Mathematics",
    priceType: "free",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
    rating: "4.7",
    instructor: "Rahul Dev",
    instructorImage: "https://i.pravatar.cc/150?u=rahul",
    teacherName: "Rahul Dev",
    teacherAvatar: "https://i.pravatar.cc/150?u=rahul",
    teacherId: "teacher-rahul",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
  },
  {
    _id: "mock-4",
    id: "mock-4",
    title: "Complete Python Bootcamp for Beginners",
    subject: "Computer Science",
    classLevel: "Skill Development",
    category: "Computer Science",
    priceType: "paid",
    price: 1999,
    discountPrice: 999,
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
    rating: "4.9",
    instructor: "Amit Verma",
    instructorImage: "https://i.pravatar.cc/150?u=amit",
    teacherName: "Amit Verma",
    teacherAvatar: "https://i.pravatar.cc/150?u=amit",
    teacherId: "teacher-amit",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
  },
  {
    _id: "mock-5",
    id: "mock-5",
    title: "Spoken English Fluency & Accent Training",
    subject: "English",
    classLevel: "Language",
    category: "English",
    priceType: "paid",
    price: 899,
    discountPrice: 399,
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop",
    rating: "4.6",
    instructor: "Sarah Jones",
    instructorImage: "https://i.pravatar.cc/150?u=sarah",
    teacherName: "Sarah Jones",
    teacherAvatar: "https://i.pravatar.cc/150?u=sarah",
    teacherId: "teacher-sarah",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
  },
  {
    _id: "mock-6",
    id: "mock-6",
    title: "Trigonometric Identities & Applications",
    subject: "Mathematics",
    classLevel: "Class 10",
    category: "Mathematics",
    priceType: "paid",
    price: 799,
    discountPrice: 299,
    thumbnailUrl: "https://images.unsplash.com/photo-1453733190148-c44698c26588?q=80&w=800&auto=format&fit=crop",
    rating: "4.5",
    instructor: "Rahul Dev",
    instructorImage: "https://i.pravatar.cc/150?u=rahul",
    teacherName: "Rahul Dev",
    teacherAvatar: "https://i.pravatar.cc/150?u=rahul",
    teacherId: "teacher-rahul",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
  },
  {
    _id: "mock-7",
    id: "mock-7",
    title: "Cell Structure & Functions - Biology Guide",
    subject: "Biology",
    classLevel: "Class 9",
    category: "Biology",
    priceType: "free",
    price: 0,
    discountPrice: 0,
    thumbnailUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=800&auto=format&fit=crop",
    rating: "4.7",
    instructor: "Priya Sharma",
    instructorImage: "https://i.pravatar.cc/150?u=priya",
    teacherName: "Priya Sharma",
    teacherAvatar: "https://i.pravatar.cc/150?u=priya",
    teacherId: "teacher-priya",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  },
  {
    _id: "mock-8",
    id: "mock-8",
    title: "Mastering React 18 & State Management",
    subject: "Web Development",
    classLevel: "Skill Development",
    category: "Web Development",
    priceType: "paid",
    price: 2499,
    discountPrice: 1299,
    thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    rating: "4.9",
    instructor: "Aman Verma",
    instructorImage: "https://i.pravatar.cc/150?img=11",
    teacherName: "Aman Verma",
    teacherAvatar: "https://i.pravatar.cc/150?img=11",
    teacherId: "teacher-aman",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    _id: "mock-9",
    id: "mock-9",
    title: "JEE Main Chemistry - Coordination Compounds",
    subject: "Chemistry",
    classLevel: "JEE Prep",
    category: "Chemistry",
    priceType: "paid",
    price: 1199,
    discountPrice: 599,
    thumbnailUrl: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=800&auto=format&fit=crop",
    rating: "4.8",
    instructor: "Amit Verma",
    instructorImage: "https://i.pravatar.cc/150?u=amit",
    teacherName: "Amit Verma",
    teacherAvatar: "https://i.pravatar.cc/150?u=amit",
    teacherId: "teacher-amit",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
  },
  {
    _id: "mock-10",
    id: "mock-10",
    title: "Modern UI/UX Design Fundamentals",
    subject: "Design",
    classLevel: "Skill Development",
    category: "Design",
    priceType: "paid",
    price: 1599,
    discountPrice: 699,
    thumbnailUrl: "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=800&auto=format&fit=crop",
    rating: "4.7",
    instructor: "Sarah Jones",
    instructorImage: "https://i.pravatar.cc/150?u=sarah",
    teacherName: "Sarah Jones",
    teacherAvatar: "https://i.pravatar.cc/150?u=sarah",
    teacherId: "teacher-sarah",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4"
  },
  {
    _id: "mock-11",
    id: "mock-11",
    title: "Electrostatics & Capacitance - Core Physics",
    subject: "Physics",
    classLevel: "Class 12",
    category: "Physics",
    priceType: "paid",
    price: 1399,
    discountPrice: 699,
    thumbnailUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop",
    rating: "4.8",
    instructor: "Ankit Sharma",
    instructorImage: "https://i.pravatar.cc/150?u=ankit",
    teacherName: "Ankit Sharma",
    teacherAvatar: "https://i.pravatar.cc/150?u=ankit",
    teacherId: "teacher-ankit",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  },
  {
    _id: "mock-12",
    id: "mock-12",
    title: "Data Structures & Algorithms in Java",
    subject: "Computer Science",
    classLevel: "Skill Development",
    category: "Computer Science",
    priceType: "paid",
    price: 2999,
    discountPrice: 1499,
    thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=800&auto=format&fit=crop",
    rating: "4.9",
    instructor: "Aman Verma",
    instructorImage: "https://i.pravatar.cc/150?img=11",
    teacherName: "Aman Verma",
    teacherAvatar: "https://i.pravatar.cc/150?img=11",
    teacherId: "teacher-aman",
    videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  }
];

const generatedCourses = [];

// Seed exactly 10 mock video cards for every category in categoryGroups
categoryGroups.forEach(group => {
  group.items.forEach(item => {
    const categoryName = item.name;
    let subject = "General";
    
    if (categoryName.includes("Mathematics") || categoryName.includes("Calculus")) {
      subject = "Mathematics";
    } else if (categoryName.includes("Physics")) {
      subject = "Physics";
    } else if (categoryName.includes("Chemistry")) {
      subject = "Chemistry";
    } else if (categoryName.includes("Biology") || categoryName.includes("Science") || categoryName.includes("Genetics")) {
      subject = "Biology";
    } else if (categoryName.includes("English") || categoryName.includes("Literature") || categoryName.includes("Drama")) {
      subject = "English";
    } else if (categoryName.includes("Computer") || categoryName.includes("Data Structures") || categoryName.includes("DBMS") || categoryName.includes("Operating Systems") || categoryName.includes("Networks") || categoryName.includes("Technologies") || categoryName.includes("Machine Learning") || categoryName.includes("Security") || categoryName.includes("Cloud")) {
      subject = "Computer Science";
    } else if (categoryName.includes("History") || categoryName.includes("Civics") || categoryName.includes("Geography") || categoryName.includes("Economics") || categoryName.includes("Social Science") || categoryName.includes("Sociology") || categoryName.includes("Psychology") || categoryName.includes("Political")) {
      subject = "Social Studies";
    } else if (categoryName.includes("Financial") || categoryName.includes("Marketing") || categoryName.includes("Resource") || categoryName.includes("Management") || categoryName.includes("Behavior") || categoryName.includes("Strategic") || categoryName.includes("Business") || categoryName.includes("Accountancy") || categoryName.includes("Operations")) {
      subject = "Business & Finance";
    }

    for (let i = 1; i <= 10; i++) {
      const isPaid = i % 3 !== 0; // 33% free, 66% paid
      const price = isPaid ? (499 + i * 150) : 0;
      const discountPrice = isPaid ? (Math.round((price * 0.7) / 10) * 10) : 0;
      
      const instructors = [
        "Ankit Sharma", "Priya Sharma", "Rahul Dev", "Amit Verma", 
        "Sarah Jones", "Aman Verma", "Dr. Rajesh K.", "Prof. H.C. Verma", 
        "Anand Kumar", "Sanjay Gupta"
      ];
      const instructor = instructors[(i - 1) % instructors.length];
      const rating = (4.3 + ((i * 7) % 7) * 0.1).toFixed(1);
      
      let thumbnailUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600";
      const lowerCat = categoryName.toLowerCase();
      if (lowerCat.includes("physics")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop";
      } else if (lowerCat.includes("chemistry")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=600&auto=format&fit=crop";
      } else if (lowerCat.includes("math") || lowerCat.includes("calculus")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop";
      } else if (lowerCat.includes("computer") || lowerCat.includes("structures") || lowerCat.includes("network") || lowerCat.includes("web") || lowerCat.includes("machine learning") || lowerCat.includes("dbms")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop";
      } else if (lowerCat.includes("english") || lowerCat.includes("literature") || lowerCat.includes("drama")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop";
      } else if (lowerCat.includes("biology") || lowerCat.includes("science")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600&auto=format&fit=crop";
      } else if (lowerCat.includes("business") || lowerCat.includes("management") || lowerCat.includes("economics") || lowerCat.includes("financial") || lowerCat.includes("accountancy") || lowerCat.includes("studies")) {
        thumbnailUrl = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop";
      }

      const videoUrls = [
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      ];
      const videoUrl = videoUrls[(i - 1) % videoUrls.length];
      
      const courseId = `gen-${categoryName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${i}`;
      generatedCourses.push({
        _id: courseId,
        id: courseId,
        title: `${categoryName} - Lesson Module ${i}`,
        subject: subject,
        classLevel: group.title,
        category: categoryName,
        priceType: isPaid ? "paid" : "free",
        price: price,
        discountPrice: discountPrice,
        thumbnailUrl: thumbnailUrl,
        rating: rating,
        instructor: instructor,
        instructorImage: `https://i.pravatar.cc/150?u=${instructor.replace(/\s+/g, '')}`,
        teacherName: instructor,
        teacherAvatar: `https://i.pravatar.cc/150?u=${instructor.replace(/\s+/g, '')}`,
        teacherId: `teacher-${instructor.toLowerCase().replace(/\s+/g, '-')}`,
        videoUrl: videoUrl,
        live: i === 5 || i === 10,
        status: i === 5 ? 'published' : (i === 10 ? 'draft' : 'published')
      });
    }
  });
});

export const MOCK_COURSES = [...baseCourses, ...generatedCourses];
