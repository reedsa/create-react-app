// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const spawn = require('react-dev-utils/crossSpawn');

function configureAppPackage(appPackage, templateConfig) {
  appPackage.dependencies = Object.assign(
    {},
    appPackage.dependencies,
    templateConfig.dependencies
  );

  appPackage.devDependencies = Object.assign(
    {},
    appPackage.devDependencies,
    templateConfig.devDependencies
  );

  appPackage.scripts = Object.assign(
    {},
    appPackage.scripts,
    templateConfig.scripts
  );

  appPackage['lint-staged'] = Object.assign(
    {},
    appPackage['lint-staged'],
    templateConfig['lint-staged']
  );

  return appPackage;
}

function getTemplateConfig(templatePath, ownPath) {
  const templateDependenciesPath = templatePath
    ? path.resolve(templatePath, '.template.dependencies.json')
    : path.join(ownPath, 'template', '.template.dependencies.json');

  if (fs.existsSync(templateDependenciesPath)) {
    return require(templateDependenciesPath);
  }
}

function getTemplatePath(
  template,
  appName,
  ownPath,
  originalDirectory,
  useYarn,
  verbose
) {
  let templatePath;
  if (!template) {
    templatePath = path.join(ownPath, 'template');
  } else {
    try {
      templatePath = findOrInstallTemplate(
        originalDirectory,
        template,
        useYarn,
        verbose
      );
    } catch (e) {
      throw new Error(e.message);
    }
  }

  if (templatePath) {
    console.log(`Creating ${appName} using template ${template}...`);
    console.log();

    return templatePath;
  }
}

// Determine the location where the template resides
function findOrInstallTemplate(originalDirectory, template, useYarn, verbose) {
  console.log(`Finding template ${template}...`);
  console.log();

  // Check if template is an absolute or relative path
  if (
    path.isAbsolute(template) ||
    template.split(path.sep)[0] === '.' ||
    template.split(path.sep)[0] === '..'
  ) {
    let templatePath = path.resolve(originalDirectory, template);

    if (findTemplateByPath(templatePath)) {
      return templatePath;
    } else {
      return;
    }
  }

  const templateInstallPath = path.resolve(originalDirectory, 'temp');
  const templatePath = path.resolve(
    templateInstallPath,
    'node_modules',
    template
  );

  if (findTemplateByPath(templatePath)) {
    return templatePath;
  }

  console.log(`Template not found. Attempting to install...`);
  console.log();

  let templateInstalled = false;
  try {
    templateInstalled = installTemplateFromNpm(
      useYarn,
      template,
      templateInstallPath,
      verbose
    );
  } catch (e) {
    throw new Error(e.message);
  }

  if (templatePath) {
    if (findTemplateByPath(templatePath)) {
      return templatePath;
    }
  }
}

function findTemplateByPath(path) {
  console.log(`Searching for template...`);
  console.log();

  const templateExists = fs.existsSync(path);
  if (templateExists) {
    console.log(`Template found! Using files from ${path}`);
    console.log();
  }

  return templateExists;
}

function installTemplateFromNpm(useYarn, packageName, installPath, verbose) {
  console.log(`Installing ${packageName}...`);

  let command, args;

  if (useYarn) {
    command = 'yarnpkg';
    args = ['global', 'add', packageName, '--global-folder', installPath];
  } else {
    command = 'npm';
    args = [
      'install',
      '--prefix',
      installPath,
      verbose && '--verbose',
      packageName,
    ].filter(e => e);
  }

  try {
    runCommand(command, args, { stdio: 'inherit' });
  } catch (e) {
    throw new Error(e.message);
  }

  console.log(`Installed!`);
  console.log();

  return true;
}

function cleanup(originalDirectory) {
  const templateInstallPath = path.resolve(originalDirectory, 'temp');
  fs.removeSync(templateInstallPath);
}

function runCommand(command, args, options) {
  console.log(`Executing command \`${command} ${args.join(' ')}\``);

  const proc = spawn.sync(command, args, options);
  if (proc.status !== 0) {
    //return { status: 'error', text: `\`${command} ${args.join(' ')}\` failed` };
    throw new Error(`\`${command} ${args.join(' ')}\` failed`);
  }

  // Return output if available
  if (proc.stdout) {
    return proc.stdout.toString().trim();
  }
}

module.exports.configureAppPackage = configureAppPackage;
module.exports.getTemplatePath = getTemplatePath;
module.exports.getTemplateConfig = getTemplateConfig;
module.exports.cleanup = cleanup;
