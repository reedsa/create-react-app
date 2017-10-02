# @reedsa/react-scripts

Extension of react-scripts to enable greater flexibility to use custom templates with creact-react-app.

### Basic Usage

Run create-react-app and set `--scripts-version` to use `@reedsa/react-scripts`.

```
create-react-app <app-name> --scripts-version @reedsa/react-scripts --internal-testing-template <template>
```

Jump to [Templates](#templates) for more information about using custom templates.

### Features

* Bootstrap projects from a template with a `package.json` tailored to your needs. Provides configuration of `dependencies`, `devDependencies`, `scripts` out of the box.
* `lint-staged` precommit hook support to run a code formatter or linter before commits are made to your project.
> For information on how to configure Prettier with a pre-commit hook [view these docs](https://github.com/prettier/prettier#pre-commit-hook).
* Use a template published on NPM or provide a relative path to a template directory

### Templates

A custom template can be used to bootstrap your project.

[Preconfigured templates](https://github.com/reedsa/create-react-app-templates) are available to get started on a new React project or help you create your own custom templates.

#### Using a Template

Set `--internal-testing-template <template>` in the create-react-app command with either the relative path to the template directory or the name of a template published on NPM. Without this flag create-react-app will use the default template.
> To use a template published on NPM you must include `--scripts-version @reedsa/react-scripts` in the command. The `--scripts-version` flag is required when a template configuration for a `package.json` defines anything other than `dependencies`.

### Create React App

This package includes scripts and configuration used by [Create React App](https://github.com/facebookincubator/create-react-app).<br>
Please refer to its documentation:

* [Getting Started](https://github.com/facebookincubator/create-react-app/blob/master/README.md#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.
