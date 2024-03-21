import fs from 'fs';
import path from 'path';
import sass from 'sass';
import { fileURLToPath } from 'url';
import readline from 'readline';

const allSites = ['beko.com', 'msh', 'terg', 'euro', 'maxe'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funkcja do zadawania pytań
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, ans => resolve(ans)));
}

function copyHtmlToNetworkFolders(basePath, networks) {
  const htmlTemplatePath = path.join(basePath, 'index.html');
  networks.forEach(net => {
    const networkHtmlPath = path.join(basePath, net, 'index.html');
    fs.copyFileSync(htmlTemplatePath, networkHtmlPath);
    console.log(`Kopiowanie ${htmlTemplatePath} do ${networkHtmlPath} zakończone.`);
  });
}

// Funkcja do kompilacji SCSS do CSS
function compileSassToCss(sassFilePath, cssFilePath) {
  const result = sass.compile(sassFilePath);
  fs.writeFileSync(cssFilePath, result.css);
  console.log(`Kompilacja ${sassFilePath} do ${cssFilePath} zakończona.`);
}

// Funkcja do budowania projektów
async function buildSite() {
  const projectFolder = await askQuestion('Który projekt chcesz skompilować? ');
  const network = await askQuestion(`Dla której sieci chcesz skompilować projekt ${projectFolder}? `);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const basePath = path.join(__dirname, 'projects', projectFolder);

  // Utworzenie katalogu projektowego, jeśli nie istnieje
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  const networks = network === 'all' ? allSites : [network];

  networks.forEach(net => {
    const networkPath = path.join(basePath, net);

    // Utwórz folder sieci, jeśli nie istnieje
    if (!fs.existsSync(networkPath)) {
      fs.mkdirSync(networkPath, { recursive: true });
    }

    const scssPath = path.join(basePath, 'style.scss');
    const cssPath = path.join(networkPath, 'style.css');

    // Przed kompilacją, upewnij się, że plik SCSS istnieje
    if (fs.existsSync(scssPath)) {
      compileSassToCss(scssPath, cssPath);
    } else {
      console.log(`Brak pliku SCSS dla projektu "${projectFolder}".`);
    }
  });
  copyHtmlToNetworkFolders(basePath, networks);
}

// Obsługa argumentów z linii poleceń
const args = [process.env.SITE, process.env.NETWORK];

if (args.length !== 2) {
  console.log('Proszę podać nazwę folderu projektu i nazwę sieci lub "all".');
  process.exit(1);
}

// const [projectFolder, network] = args;
buildSite().then(() => rl.close());
