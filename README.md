# yano

Yano is a general utility library for interactive websites.




# Development Prereq

```
npm install --global typescript
npm install --global typedoc
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
and also run the examples project (basically npm start).


## Test
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


