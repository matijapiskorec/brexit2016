
Install [minifier](https://www.npmjs.com/package/minifier)

```
npm install [-g] minifier
```

In folder static/js minify everything except functions.js:

```
minify jquery.min.js angular.min.js lodash.min.js bootstrap.min.js d3.v3.min.js dygraph-Brexit.js typeahead.bundle.js bootstrap-select.min.js bootstrap-slider.js > code.min.js
```

In folder static/css minify everything except base.css:

```
minify bootstrap.min.css bootstrap-select.min.css bootstrap-slider.css typeahead.css > code.min.css
```


