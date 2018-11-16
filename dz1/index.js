const fs = require('fs');
const path = require('path');
const readLine = require('readline');
const program = require('commander');

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

program
  .version('0.1.0')
  .option('-e, --entryDir [type]', 'Add entry directory', path.join(__dirname, '/entry'))
  .option('-o, --outputDir [type]', 'Add output directory', path.join(__dirname, '/output'))
  .option('-r, --remove', 'Remove entryDir')
  .parse(process.argv);

if (program.entryDir) console.log('Your entryDir: ', program.entryDir);
if (program.outputDir) console.log('Your outputDir: ', program.outputDir);
if (program.remove) {
  console.log('Entry directory ', program.entryDir, ' will be remove!');
} else {
  console.log('Entry directory ', program.entryDir, ' will not be remove!');
}

let entry = program.entryDir;
let output = program.outputDir;
const remove = program.remove;
const files = [];
let childDirs = [];

rl.question('Write your entry directory> ', (entryAnswer) => {
  if (entryAnswer !== '') entry = entryAnswer;
  rl.question('Write your output directory> ', (outputAnswer) => {
    if (entryAnswer !== '') output = outputAnswer;
    main(() => {
      readDir(entry);
    }, () => {
      checkDir(entry, childDirs);
    }, () => {
      copyFiles(files, output);
    }, () => {
      if (remove) removeDir(entry);
    }, () => {
      rl.close();
    });
  });
});

function main (readDir, checkDir, copyFiles, removeDir, close) {
  readDir();
  checkDir();
  copyFiles();
  removeDir();
  close();
}

function readDir (dir) {
  const dirs = fs.readdirSync(dir);
  childDirs = dirs.slice();
}

function checkDir (dir, childDirs) {
  childDirs.forEach((childDir) => {
    const directory = path.join(dir, childDir);
    if (fs.statSync(directory).isDirectory()) {
      const items = fs.readdirSync(directory);
      return checkDir(directory, items);
    }
    return files.push({ name: childDir, path: dir });
  });
  return files;
}

function createDir (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(path.join(dir));
    console.log(`Directory: ${dir} create successfully!`);
  }
}

function copyFiles (files, dir) {
  files.forEach((file) => {
    createDir(dir);
    createDir(path.join(dir, file.name[0]));
    const entry = path.join(file.path, file.name);
    const output = path.join(dir, file.name[0], file.name);
    fs.copyFileSync(entry, output);
    console.log(`File: ${output} copied and sorted!`);
  });
}

function removeDir (dir) {
  let files;
  const rmSelf = true;
  dir = dir + '/';
  try { files = fs.readdirSync(dir); } catch (e) { console.log(`Directory is not exist!`); return; }
  if (files.length > 0) {
    files.forEach((x) => {
      if (fs.statSync(dir + x).isDirectory()) {
        removeDir(dir + x);
      } else {
        fs.unlinkSync(dir + x);
      }
    });
  }
  if (rmSelf) {
    fs.rmdirSync(dir);
  }
  console.log(`Directory: ${dir} removed!`);
}
