/* eslint-disable */
const fs = require('fs');

const toolsToPatch = [
  { path: 'src/tools/base64/Base64Tool.tsx', runFn: 'const run = () => {' },
  { path: 'src/tools/hash/HashTool.tsx', runFn: 'const run = async () => {' },
  { path: 'src/tools/jwt/JwtTool.tsx', runFn: 'const generate = async () => {' },
  { path: 'src/tools/nanoid/NanoIdTool.tsx', runFn: 'const generate = () => {' },
  { path: 'src/tools/objectid/ObjectIdTool.tsx', runFn: 'const generate = () => {' },
  { path: 'src/tools/password/PasswordTool.tsx', runFn: 'const regen = () => {' },
  { path: 'src/tools/uuid/UuidTool.tsx', runFn: 'const generate = () => {' }
];

toolsToPatch.forEach(({path, runFn}) => {
  let content = fs.readFileSync(path, 'utf8');
  if (!content.includes('useToolAction')) {
    content = content.replace("import { useState", "import { useState } from 'react';\nimport { useToolAction } from '../../hooks/useToolAction';\n// import { useState");
    // clean up duplicate imports if any
    content = content.replace("// import { useState", "");
    if (!content.includes("useToolAction")) {
        content = "import { useToolAction } from '../../hooks/useToolAction';\n" + content;
    }
    
    // find the component start to inject hook
    content = content.replace(/(export default function \w+\(\) \{)/, "$1\n  const recordAction = useToolAction();");
    
    // inject into the run function
    if (path.includes('PasswordTool')) {
        content = content.replace("const regen = () => setPwd(generatePassword(opts));", "const regen = () => { setPwd(generatePassword(opts)); recordAction(); };");
    } else {
        content = content.replace(runFn, runFn + "\n    recordAction();");
    }
    
    fs.writeFileSync(path, content);
    console.log(`Patched ${path}`);
  }
});
