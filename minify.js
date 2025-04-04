const { execSync } = require("child_process");
const { readdirSync, statSync } = require("fs");
const { join } = require("path");

const findJsFiles = (dir, fileList = []) => {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);

    if (statSync(filePath).isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith(".js")) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

console.log("Minifying CommonJS files...");
const commonJsFiles = findJsFiles("./lib/commonjs");
commonJsFiles.forEach((file) => {
  console.log(`Minifying ${file}...`);
  try {
    execSync(`npx terser "${file}" -o "${file}" --compress --mangle`);
  } catch (error) {
    console.error(`Error minifying ${file}:`, error.message);
  }
});

console.log("Minifying Module files...");
const moduleFiles = findJsFiles("./lib/module");
moduleFiles.forEach((file) => {
  console.log(`Minifying ${file}...`);
  try {
    execSync(`npx terser "${file}" -o "${file}" --compress --mangle`);
  } catch (error) {
    console.error(`Error minifying ${file}:`, error.message);
  }
});

console.log("Minification complete!");
