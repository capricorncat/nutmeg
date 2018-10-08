import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import * as updateNotifier from 'update-notifier';
import * as pkg from '../package.json';

const silent = true;

function tsconfigPath(workingDir: string): string {
  const modernPath = path.resolve(workingDir, 'tsconfig.production.json');
  return fs.existsSync(modernPath) ? modernPath : path.resolve(workingDir, 'tsconfig.json')
}

function notifyOfUpdate() {
  updateNotifier({ pkg }).notify({ defer: true });
}

function isNutmegComponent(workingDir: string): boolean {
  try {
    const { dependencies } = loadPackageJson(workingDir);
    return dependencies && dependencies.hasOwnProperty('@nutmeg/seed');
  } catch(e) {
    return false;
  }
}

function loadPackageJson(dir: string): { dependencies: {}, main: string } {
  const packagePath = path.resolve(dir, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath).toString());
}


function exit(message: string, condition = true): void {
  if (condition) {
    console.error(message);
    process.exit(1);
  }
}

function commitToGit(): void {
  shell.exec('git init', { silent });
  shell.exec('git add .', { silent });
  shell.exec('git commit -m "Initial commit from @nutmeg/cli"', { silent });
  console.log('🗄️  Commiting files to initial Git repository');
}

function installDependencies(options: { withDependencies: boolean }): void {
  if (!options.withDependencies) {
    console.log('📦 Skipping dependencies');
  } else {
    console.log(`🎁 Installing dependencies`);
    shell.exec('npm install', { silent });
  }
}

/** Copied from @nutmeg/seed. Make changes there. */
export function attributeNameFromProperty(name :string): string {
  return name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

/** Copied from @nutmeg/seed. Make changes there. */
export function propertyNameFromAttribute(name :string): string {
  if (name.includes('-')) {
    return name.toLowerCase().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  } else {
    return name;
  }
}

export { commitToGit, exit, installDependencies, isNutmegComponent, loadPackageJson, notifyOfUpdate, tsconfigPath, };