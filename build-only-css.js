// import fs from 'fs';
// import path from 'path';
// import * as sass from 'sass';
// import { fileURLToPath } from 'url';
// import readline from 'readline';
// import chokidar from 'chokidar';

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// // Funkcja do zadawania pytań
// function askQuestion(query) {
//   return new Promise(resolve => rl.question(query, ans => resolve(ans)));
// }

// // Funkcja do kompilacji SCSS do CSS
// function compileSassToCss(sassFilePath, cssFilePath) {
//   const result = sass.compile(sassFilePath);
//   fs.writeFileSync(cssFilePath, result.css.toString());
//   console.log(`Kompilacja ${sassFilePath} do ${cssFilePath} zakończona.`);
// }

// async function buildCss() {
//   const projectFolder = await askQuestion('Który projekt chcesz skompilować? ');
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = path.dirname(__filename);
//   const basePath = path.join(__dirname, 'projects', projectFolder);

//   const scssPath = path.join(basePath, 'style.scss');
//   const cssPath = path.join(basePath, 'style.css');

//   if (fs.existsSync(scssPath)) {
//     compileSassToCss(scssPath, cssPath);
//   } else {
//     console.log(`Brak pliku SCSS dla projektu "${projectFolder}".`);
//   }

//   const listenChanges = (await askQuestion('Czy chcesz nasłuchiwać zmian w pliku SCSS? (tak/nie) ')).toLowerCase();

//   if (listenChanges === 'tak') {
//     // Importowanie pakietu 'chokidar' do monitorowania zmian w pliku SCSS
//     // const chokidar = require('chokidar');

//     // Utworzenie obiektu monitorującego zmiany w pliku SCSS
//     const watcher = chokidar.watch(scssPath, { persistent: true });

//     // Funkcja obsługująca zmiany w pliku SCSS
//     const handleChange = () => {
//       console.log(`Zmiany w pliku SCSS zostały wykryte. Rozpoczynam kompilację...`);
//       compileSassToCss(scssPath, cssPath);
//       console.log(`Kompilacja zakończona.`);
//     };

//     // Nasłuchiwanie zmian w pliku SCSS
//     watcher.on('change', handleChange);

//     console.log('Nasłuchiwanie zmian w pliku SCSS... Aby zakończyć, wciśnij Ctrl + C');
//   } else {
//     console.log('Nasłuchiwanie zmian w pliku SCSS wyłączone.');
//   }

//   rl.close();
// }

// buildCss();


import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import readline from 'readline';
import sass from 'sass';
// import open from 'open';
import { spawn } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, ans => resolve(ans)));
}

function compileSassToCss(sassFilePath, cssFilePath) {
  const result = sass.renderSync({ file: sassFilePath });
  fs.writeFileSync(cssFilePath, result.css);
  console.log(`Kompilacja ${sassFilePath} do ${cssFilePath} zakończona.`);
}
function openBrowser(url) {
  if (process.platform === 'win32') {
    spawn('cmd.exe', ['/c', 'start', url], { stdio: 'ignore' });
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore' });
  }
}

async function buildCss() {
  const projectFolder = await askQuestion('Który projekt chcesz skompilować? ');
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const basePath = path.join(__dirname, 'projects', projectFolder);

  const scssPath = path.join(basePath, 'style.scss');
  const cssPath = path.join(basePath, 'style.css');

  if (fs.existsSync(scssPath)) {
    compileSassToCss(scssPath, cssPath);

    const server = await createServer({
      root: basePath
    });

    server.listen(3000).then(() => {
      console.log('Serwer Vite uruchomiony na http://localhost:3000');
      openBrowser('http://localhost:3000/index.html');
    });

    const listenChanges = (await askQuestion('Czy chcesz nasłuchiwać zmian w pliku SCSS? (tak/nie) ')).toLowerCase();

    if (listenChanges === 'tak') {
      const watcher = fs.watch(scssPath, {}, () => {
        console.log(`Zmiany w pliku SCSS zostały wykryte. Rozpoczynam kompilację...`);
        compileSassToCss(scssPath, cssPath);
        console.log(`Kompilacja zakończona.`);
      });

      console.log('Nasłuchiwanie zmian w pliku SCSS... Aby zakończyć, wciśnij Ctrl + C');
    } else {
      console.log('Nasłuchiwanie zmian w pliku SCSS wyłączone.');
    }
  } else {
    console.log(`Brak pliku SCSS dla projektu "${projectFolder}".`);
  }

  rl.close();
}

buildCss();
