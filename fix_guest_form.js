// Fix guest-form.tsx TypeScript issues by adding value={field.value || ''} to all inputs and textareas
const fs = require('fs');
const path = require('path');

const filePath = './client/src/components/ui/guest-form.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Fix Input components
let newContent = content.replace(/<Input([^>]*)(placeholder="[^"]*")(.*?)(\s+)({\.\.\.field})(.*?)\/>/g, '<Input$1$2$3$4{...field} value={field.value || ""}$6/>');

// Fix Textarea components
newContent = newContent.replace(/<Textarea([^>]*)(placeholder="[^"]*")(.*?)(\s+)({\.\.\.field})(.*?)\/>/g, '<Textarea$1$2$3$4{...field} value={field.value || ""}$6/>');

// Fix Select defaultValue
newContent = newContent.replace(/defaultValue={field\.value}/g, 'defaultValue={field.value || ""}');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Fixed guest-form.tsx');
