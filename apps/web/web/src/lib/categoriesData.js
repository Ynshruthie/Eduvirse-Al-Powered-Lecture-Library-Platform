export const categoryGroups = [
  {
    title: 'Class 7',
    items: [
      { name: 'Class 7 - Mathematics' },
      { name: 'Class 7 - General Science' },
      { name: 'Class 7 - Social Science' },
      { name: 'Class 7 - English Literature' },
    ]
  },
  {
    title: 'Class 8',
    items: [
      { name: 'Class 8 - Mathematics' },
      { name: 'Class 8 - General Science' },
      { name: 'Class 8 - Social Science' },
      { name: 'Class 8 - English Literature' },
    ]
  },
  {
    title: 'Class 9',
    items: [
      { name: 'Class 9 - Mathematics' },
      { name: 'Class 9 - Physics' },
      { name: 'Class 9 - Chemistry' },
      { name: 'Class 9 - Biology' },
      { name: 'Class 9 - History & Civics' },
      { name: 'Class 9 - Geography & Economics' },
    ]
  },
  {
    title: 'Class 10',
    items: [
      { name: 'Class 10 - Mathematics' },
      { name: 'Class 10 - Physics' },
      { name: 'Class 10 - Chemistry' },
      { name: 'Class 10 - Biology' },
      { name: 'Class 10 - History & Civics' },
      { name: 'Class 10 - Geography & Economics' },
    ]
  },
  {
    title: 'Class 11',
    items: [
      { name: 'Class 11 - Physics' },
      { name: 'Class 11 - Chemistry' },
      { name: 'Class 11 - Mathematics' },
      { name: 'Class 11 - Biology' },
      { name: 'Class 11 - Computer Science' },
      { name: 'Class 11 - Accountancy' },
      { name: 'Class 11 - Business Studies' },
      { name: 'Class 11 - Economics' },
      { name: 'Class 11 - History & Political Science' },
    ]
  },
  {
    title: 'Class 12',
    items: [
      { name: 'Class 12 - Physics' },
      { name: 'Class 12 - Chemistry' },
      { name: 'Class 12 - Mathematics' },
      { name: 'Class 12 - Biology' },
      { name: 'Class 12 - Computer Science' },
      { name: 'Class 12 - Accountancy' },
      { name: 'Class 12 - Business Studies' },
      { name: 'Class 12 - Economics' },
      { name: 'Class 12 - History & Political Science' },
    ]
  },
  {
    title: 'College Engineering',
    items: [
      { name: 'Data Structures & Algorithms' },
      { name: 'Database Management Systems (DBMS)' },
      { name: 'Operating Systems' },
      { name: 'Computer Networks' },
      { name: 'Web Technologies (Full Stack)' },
      { name: 'Machine Learning & AI' },
      { name: 'Cyber Security' },
      { name: 'Cloud Computing & DevOps' },
    ]
  },
  {
    title: 'College Business',
    items: [
      { name: 'Financial Management' },
      { name: 'Marketing Management' },
      { name: 'Human Resource Management' },
      { name: 'Organizational Behavior' },
      { name: 'Strategic Management' },
      { name: 'Operations & Supply Chain' },
      { name: 'Business Economics' },
    ]
  },
  {
    title: 'College Sciences & Humanities',
    items: [
      { name: 'Higher Calculus & Analysis' },
      { name: 'Organic & Inorganic Chemistry' },
      { name: 'Genetics & Molecular Biology' },
      { name: 'English Literature & Drama' },
      { name: 'Psychology & Counseling' },
      { name: 'Sociology & Anthropology' },
      { name: 'Micro & Macro Economics' },
    ]
  }
];

export const allCategoriesList = categoryGroups.reduce((acc, group) => {
  return [...acc, ...group.items.map(item => item.name)];
}, []);
