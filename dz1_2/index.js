const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);
const copyFile = promisify(fs.copyFile);
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

rl.question('Write your entry directory> ', (entryAnswer) => {
  if (entryAnswer !== '') entry = entryAnswer;
  rl.question('Write your output directory> ', (outputAnswer) => {
    if (entryAnswer !== '') output = outputAnswer;
    main();
  });
});

async function main () {
  try {
    await readDir(entry);
    await copyFiles(files, output);
    if (remove) {
      await removeDir(entry);
    }
    await rl.close();
  } catch (err) {
    console.log(err);
  }
}

async function readDir (dir) {
  const subDirs = await readdir(dir);
  const arrFiles = await Promise.all(subDirs.map(async (subdir) => {
    const res = path.join(dir, subdir);
    return (await stat(res)).isDirectory() ? readDir(res) : res;
  }));
  arrFiles.forEach((items) => {
    if (typeof items !== typeof undefined) {
      return files.push({ name: items.substr(items.lastIndexOf('\\') + 1), path: dir });
    }
  });
}

async function createDir (dir) {
  if (!fs.existsSync(dir)) {
    await mkdir(path.join(dir))
      .then(() => console.log(`Directory: ${dir} create successfully!`))
      .catch(err => console.log(err));
  }
}

async function copyFiles (files, dir) {
  await createDir(dir);
  await Promise.all(
    files.map(async (file) => {
      await createDir(path.join(dir, file.name[0]));
      const entry = path.join(file.path, file.name);
      const output = path.join(dir, file.name[0], file.name);
      await copyFile(entry, output)
        .then(() => console.log(`File: ${output} copied and sorted!`))
        .catch(err => console.log(err));
    })
  );
}

async function removeDir (dir) {
  if (await stat(dir)) {
    const files = await readdir(dir);
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file);
        (await stat(filePath)).isDirectory()
          ? await removeDir(filePath)
          : await unlink(filePath);
      })
    );
    await rmdir(dir)
      .then(() => console.log(`Directory: ${dir} removed!`))
      .catch(err => console.log(err));
  }
}
