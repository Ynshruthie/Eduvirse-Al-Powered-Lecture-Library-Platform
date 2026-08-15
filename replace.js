const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'apps/web/web/src/pages');
const files = [
  'TeacherSettingsPage.jsx',
  'TeacherCommentsPage.jsx',
  'TeacherAnalyticsPage.jsx',
  'TeacherLiveClassesPage.jsx',
  'TeacherCoursesPage.jsx',
  'TeacherContentPage.jsx',
  'TeacherEarningsPage.jsx',
  'TeacherStudentsPage.jsx',
  'TeacherSupportPage.jsx',
  'TeacherAnnouncementsPage.jsx',
  'DashboardPage.jsx',
  'UploadLecturePage.jsx'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not exists
    if (!content.includes('useUnreadComments')) {
      content = "import { useUnreadComments } from '@/hooks/useUnreadComments';\n" + content;
    }

    // Add unreadCount hook inside the component
    // Assuming the component name is usually the file name or DashboardPage
    const componentRegex = /const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{/;
    const match = content.match(componentRegex);
    if (match && !content.includes('const unreadCount = useUnreadComments();')) {
      const insertPos = match.index + match[0].length;
      content = content.slice(0, insertPos) + "\n  const unreadCount = useUnreadComments();" + content.slice(insertPos);
    }

    // Replace the sidebar link
    content = content.replace(
      /\{\s*icon:\s*MessageSquare,\s*label:\s*'Comments',(?:[^}]*?)path:\s*'\/teacher\/comments'(?:[^}]*?)\}/g,
      "{ icon: MessageSquare, label: 'Comments', badge: unreadCount > 0 ? unreadCount : undefined, path: '/teacher/comments' }"
    );
    
    // Handle the specific badge: 6 case just in case regex missed it
    content = content.replace(
      /\{\s*icon:\s*MessageSquare,\s*label:\s*'Comments',\s*badge:\s*6,\s*path:\s*'\/teacher\/comments'\s*\}/g,
      "{ icon: MessageSquare, label: 'Comments', badge: unreadCount > 0 ? unreadCount : undefined, path: '/teacher/comments' }"
    );

    // Some might have active: true
    content = content.replace(
      /\{\s*icon:\s*MessageSquare,\s*label:\s*'Comments',\s*path:\s*'\/teacher\/comments',\s*active:\s*true\s*\}/g,
      "{ icon: MessageSquare, label: 'Comments', badge: unreadCount > 0 ? unreadCount : undefined, path: '/teacher/comments', active: true }"
    );
    
    // Specifically for DashboardPage which might not have active: true but we already replaced above.
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Done replacing!');
