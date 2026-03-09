const fs = require("fs");
const path = require("path");

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.name.endsWith(".jsx") || entry.name.endsWith(".js"))
      results.push(full);
  }
  return results;
}

const srcDir = path.join(__dirname, "src");
const files = walk(srcDir);
let fixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Step 1: Remove ALL `import React from "react"` lines (added by previous fix script)
  content = content.replace(/^import React from ['"]react['"];\n/gm, "");

  // Step 2: Find "use client" / "use server" directive anywhere in the file
  const directiveRe = /^(["']use (?:client|server)["'];?\n)/m;
  const match = content.match(directiveRe);
  if (match && !content.startsWith(match[1])) {
    // Remove it from its current position and prepend
    content = content.replace(directiveRe, "");
    content = match[1] + content;
  }

  // Step 3: Remove duplicate `import * as React` when one already exists
  // (only keep the first occurrence)
  const reactStarImports = [
    ...content.matchAll(/^import \* as React from ['"]react['"].*\n/gm),
  ];
  if (reactStarImports.length > 1) {
    let removed = false;
    content = content.replace(
      /^import \* as React from ['"]react['"].*\n/gm,
      (m) => {
        if (!removed) {
          removed = true;
          return m;
        } // keep first
        return ""; // remove subsequent
      },
    );
  }

  // Step 4: If file uses React.createElement but has zero React imports, add one after directive
  const hasCreateElement =
    content.includes("React.createElement") ||
    content.includes("React.Fragment");
  const hasAnyReactImport = /import (\* as )?React\b/.test(content);
  if (hasCreateElement && !hasAnyReactImport) {
    const dirMatch2 = content.match(/^(["']use (?:client|server)["'];?\n)/);
    if (dirMatch2) {
      content =
        content.slice(0, dirMatch2[1].length) +
        'import React from "react";\n' +
        content.slice(dirMatch2[1].length);
    } else {
      content = 'import React from "react";\n' + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Fixed:", path.relative(__dirname, file));
    fixed++;
  }
}

console.log(`\nDone. Fixed ${fixed} files.`);
