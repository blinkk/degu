# Development Yano


## Prerequisites
```
npm install --global typescript
npm install --global simplehttpserver # Optional, to preview docs
npm install --global typedoc
npm install --global surge # Optional, for publishing docs and examples
```

## Installation
```
npm install
```

## Common Development Commands
```
npm run dev

    The main dev command which basically build the project with tsc,
    and also run the examples project (basically npm start) and run ava
    (unit testing).

npm run test
npm run test -- --watch
    Run ava unit testing

npm run lint
    Lint project.
npm run lint-fix
    Auto fix lint issues.

npm run start
    Run the examples folder on localhost.

npm run build
npm run build -- --watch
    Build the project.  Compiles src folders into the release /lib folder

npm version patch
npm publish
   Publish a new version to npm.

npm run doc
  Build typedocs.  Builds into the /doc folder.

npm run doc-server
  Run a local srever to view the docs.

npm run publish-doc
  Publishes the docs to surge.io.
  Manually Run:$ surge --domain yano-js.surge.sh --project $PWD/docs/

```


### Development Practices / Guidelines

- Use [typedoc](https://typedoc.org/guides/doccomments/)
- Linting - tslint is used.  See tslinkt.json

When writing a class
- create an example in /examples.  The example should focus on just using that
  class and the rest should be vanilla JS if possible.  this is because when
  someone is trying to learn a library, it's really hard if the examples use a
  lot of methods and classes that are unfamiliar.  The exception would be
  for advanced examples.


### Testing with Ava
Tests use wonderful [ava](https://github.com/avajs/ava).

For typescript use for ava check out [this](https://github.com/avajs/ava/blob/master/docs/recipes/typescript.md)

[For general info on writing tests](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md)



### Project Structure
```
/docs      --> Project Docs
/examples  --> Examples
/lib       --> Compiled Yano JS lib
/src       --> Source files (typescript)
/webpack   --> Webpack configuration to run the local example project.
```

