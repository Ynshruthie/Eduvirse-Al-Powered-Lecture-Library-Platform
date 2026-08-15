const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../pages');
const files = fs.readdirSync(pagesDir).filter(f => f.startsWith('Teacher') && f.endsWith('.jsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has TeacherHeader
    if (content.includes('TeacherHeader')) continue;

    // Extract the header block
    const headerRegex = /<header className="h-16.*?<\/header>/s;
    const match = content.match(headerRegex);

    if (match) {
        const headerBlock = match[0];

        // Extract icon and title
        const iconMatch = headerBlock.match(/<([A-Z]\w+)\s+className="w-5 h-5 text-indigo-500"/);
        const titleMatch = headerBlock.match(/<[A-Z]\w+.*?\/>\s*(.*?)\s*<\/h1>/);

        const icon = iconMatch ? iconMatch[1] : '';
        let title = '';
        if (titleMatch) {
            title = titleMatch[1].trim();
        } else {
            // Fallback for title extraction if the icon is not next to the title
            const h1Match = headerBlock.match(/<h1[^>]*>(.*?)<\/h1>/s);
            if (h1Match) {
                title = h1Match[1].replace(/<[^>]+>/g, '').trim();
            }
        }

        if (icon && title) {
            // Create replacement
            const replacement = `<TeacherHeader title="${title}" icon={${icon}} />`;
            content = content.replace(headerRegex, replacement);

            // Add import
            const importStatement = `import TeacherHeader from '@/components/TeacherHeader.jsx';\n`;
            // Insert after the last import
            const lastImportIndex = content.lastIndexOf('import ');
            const nextLineIndex = content.indexOf('\n', lastImportIndex) + 1;
            content = content.slice(0, nextLineIndex) + importStatement + content.slice(nextLineIndex);

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`Failed to extract icon or title for ${file}`);
        }
    } else {
        console.log(`No header block found in ${file}`);
    }
}
