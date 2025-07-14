# studion-web-app

[![Vue.js](https://img.shields.io/badge/vue-2.3.4-green.svg)](https://vuejs.org)
[![Vue Style Guide](https://img.shields.io/badge/code_style-vue_official_style-brightgreen.svg)](https://vuejs.org/style-guide/)

StudiOn LMS Web Application

## Build Setup

```bash
# install dependencies
yarn install

# run postinstall script
yarn postinstall

# serve with hot reload at localhost:8080
yarn serve

# build for production with minification
yarn build

# lint all *.js and *.vue files
yarn lint

# run unit tests
yarn test
```

## i18n

This application uses an internationalization plugin called **vue-i18n**. This plugin uses JSON files to store its translations. These files should not be updated manually, with the exception of the default language file, which is `pt-br.json`. _(deprecated)_

Text insertions on components or in any other in-application content should be updated at `pt-br.json` and exported to a TSV file through a script called `i18n-extract` which is located at `./scripts`. The exported content is differential and will contain only the non-existent translations in the specified language. _(deprecated)_

```
$ ./scripts/i18-extract
Usage: i18n-extract <task> <language>
```

The exported TSV will contain the following: an expression/alias, the text representation in the default language (pt-br) and a blank space to fill in the translation. This file can be imported to record (on the JSON file) the newly translated terms on the desired language. _(deprecated)_

## File configs.json

File of SPA Setting Variables by Instance, below follows documentation of the operation of each of the items, update whenever a new variable is added: <br>

- [Studion.mx | Documentação técnica](https://docs.google.com/document/d/10gERKMTup0uxYId-xPXekTd9V73gqhexYYDx5ITU7OA/)

## References

- [Awesome Vue](https://github.com/vuejs/awesome-vue)
- [DDD project structure](https://blog.codecasts.com.br/arquitetura-de-projetos-vue-js-com-ddd-a2bc26817793)
- [SPA sample with Vue and Laravel](https://github.com/codecasts/spa-starter-kit)
- [TSV File Format](https://en.wikipedia.org/wiki/Tab-separated_values)
- [vue-i18n at Github](https://github.com/kazupon/vue-i18n)

### Development

SPA development environment has endpoint `/dev-icons` with the listing of all available icons. Before adding any icon to the project, see if it no longer exists. If not, add SVG to the `symbol-defs.svg` file and the `IconNames.json` listing.

## Documentations

- [Utilizando data-testid](./docs/data-testid.md)
- [Build em ambiente local](./docs/local-build.md)