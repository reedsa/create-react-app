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

function configureAppPackage(templateConfig, appPackage) {
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
    templatePath = findOrInstallTemplate(
      originalDirectory,
      template,
      useYarn,
      verbose
    );
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

  const installPath = getGlobalInstallPath(useYarn);

  if (installPath) {
    const templateInstallPath = path.join(
      installPath,
      'node_modules',
      template
    );

    if (findTemplateByPath(templateInstallPath)) {
      return templateInstallPath;
    }

    console.log(`Template not found. Attempting to install...`);
    console.log();

    const templateInstalled = installTemplateFromNpm(
      useYarn,
      template,
      verbose
    );

    if (templateInstalled) {
      if (findTemplateByPath(templateInstallPath)) {
        return templateInstallPath;
      }
    }
  }

  return;
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

function getGlobalInstallPath(useYarn) {
  console.log(`Finding global installation directory...`);
  console.log();

  const result = runCommand(
    useYarn,
    ['root', '--global'],
    ['global', 'dir'],
    null
  );

  if (result.status === 'success') {
    return result.text;
  }
}

function installTemplateFromNpm(useYarn, packageName, verbose) {
  console.log(`Installing ${packageName}...`);

  const result = runCommand(
    useYarn,
    ['install', '--global', verbose && '--verbose', packageName].filter(e => e),
    ['global', 'add', packageName]
  );

  const isInstalled = result.status === 'success';
  if (isInstalled) {
    console.log(`Installed!`);
    console.log();
  }

  return isInstalled;
}

function runCommand(
  useYarn,
  npmArgs,
  yarnArgs,
  options = { stdio: 'inherit' }
) {
  let command;
  let args;
  let installLocationArgs;

  if (useYarn) {
    command = 'yarnpkg';
    args = yarnArgs;
  } else {
    command = 'npm';
    args = npmArgs;
  }

  const proc = spawn.sync(command, args, options);
  if (proc.status !== 0) {
    return { status: 'error', text: `\`${command} ${args.join(' ')}\` failed` };
  }

  // Return output if available
  if (proc.stdout) {
    return { status: 'success', text: proc.stdout.toString().trim() };
  }

  return { status: 'success' };
}

module.exports.configureAppPackage = configureAppPackage;
module.exports.getTemplatePath = getTemplatePath;
module.exports.getTemplateConfig = getTemplateConfig;
