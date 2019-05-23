module.exports = {
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
    "globals": {
      "ts-jest": {
        "tsConfigFile": "tsconfig.json"
      }
    },
   "testRegex": '/src/.*.spec.(js|ts|tsx)?$'
}
