import * as program from 'commander';
import * as path from 'path';
import * as shell from 'shelljs';
import { Component } from './component';
import { Generator } from './generator';
import { Properties } from './properties';
import { commitToGit, exit, installDependencies, notifyOfUpdate, nutmegDir, pkg } from './utils';

notifyOfUpdate();

program.command('new <component-name> [property:type...]', 'generate a Web Component')
       .option('--cli-source <location>', 'install @nutmeg/cli dependency from local or github')
       .option('--seed-source <location>', 'install @nutmeg/seed dependency from local or github')
       .option('--no-dependencies', 'skip installing dependencies');

program.parse(process.argv);

const seedVersion = pkg.dependencies['@nutmeg/seed'];
const component = new Component(program.args[0]);
const workingDir = path.resolve(process.cwd());
const requestedProperties = program.args.slice(1);
const properties = new Properties(requestedProperties);
const generator = new Generator(nutmegDir, workingDir, component.tag);
const data = {
  cliSource: program.cliSource || pkg.version,
  seedSource: program.seedSource || seedVersion,
  seedVersion,
  name: component.name,
  primitiveTypes: properties.primitiveTypes,
  properties,
  tag: component.tag,
};

exit('Component name must be in format of `foo-bar`', !component.valid);
exit(`Directory "${component.tag}" already exists`, generator.destinationDirExists);
exit('Properties must be in format of `name:type`', !properties.valid);

generator.execute(data)
  .then(() => {
    shell.cd(component.tag);
    commitToGit();
    installDependencies({ withDependencies: program.dependencies });
    console.log(`🎉 Component generated`);
    console.log(`🌱 Run \`npm start\` from ${component.tag} to start building`);
  })
  .catch((error: object) => {
    return console.error(`Copy failed: ${error}`);
  });