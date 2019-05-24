# yano

Yano is a general utility library for interactive websites.

Docs: yano-js.surge.sh



# Development Prereq

```
npm install --global typescript
npm install --global simplehttpserver # Optional, to preview docs
npm install --global typedoc
npm install --global surge # Optional, for publishing docs and examples
```


# Installation
```
npm install
```

# Development
```
npm run dev
```

The dev command will basically do typescript watch (tsc -w)
and also run the examples project (basically npm start) and run jest (unit testing).



## Test
Test use wonderful [ava](https://github.com/avajs/ava).

For typescript use for ava check out [this](https://github.com/avajs/ava/blob/master/docs/recipes/typescript.md)

[For general info on writing tests](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md)

```
npm run test
npm run test -- --watch

```

## Run Examples project
```
npm run start
```



## Build

```
npm run build
npm run build -- --watch
```


## Publish
```
npm publish
```


# Docs
Docs use typedoc.  See https://typedoc.org/
```
npm run doc
npm run doc-server # To view docs in on local server.
```

Publishing Docs
```
npm run publish-doc

or manually:
surge --domain yano-js.surge.sh --project $PWD/docs/

```

# Project Structure
The project was setup using mostly
https://michalzalecki.com/creating-typescript-library-with-a-minimal-setup/.

Project source exists in /src and compiles out to /lib/.

Jest is used for testing.  Jest will used the compiled spec file in /lib/
for testing..


```
/docs      --> Project Docs
/examples  --> Examples
/lib       --> Compiled Yano JS lib
/src       --> Source files (typescript)
/webpack   --> Webpack configuration to run the local example project.
```


