AdefyWebGL
=======

WebGL backend for the AdefyMiddleware, intended for testing ads in a browser
window before deploying to the AdefyLib android backend.

Development Setup [Important]
=============================
As usual, run `npm install` on the root directory after a fresh clone. As of 8/14/2013 grunt-lib-phantomjs throws an error with the phantomjs version that comes with it.

To fix this (and enable unit tests), go into node_modules/grunt-lib-phantomjs and change the version of phantomjs in package.json to ~1.8.1-1. Then go into grunt-lib-phantomjs's node_modules folder and delete phantomjs/. Finally, run `npm install` inside of grunt-lib-phantomjs's root directory. This will pull down phantomjs 1.8.1-1 and tests will work.

Documentation
=============
To generate the docs, run `codo`

Testing
=======
Mocha and Chai are used for unit testing within PhantomJS, info on running the tests is in the "Building" section. To manually run the tests on the commandline, execute the mocha task with `grunt mocha`

Building
========
AWGL uses Grunt for building and general task automation. There are currently two commonly used tasks:

`[grunt] full`
------------
Performs a full rebuild of AWGL, including the library itself, unit tests, and documentation. Tests are run as a last step.

`[grunt] dev`
-----------
Use this while working on AWGL. A connect server is set up at http://localhost:8080, with the root directory mapped to the root of AWGL.

Directories of interest:

* http://localhost:8080/build/test/test.html - Run the unit tests in your browser
* http://localhost:8080/doc/index.html - Documentation
* http://localhost:8080/dev/test.html - KitchenSink test

General Overview
================
To use AWGL, create a new instance of AWGLEngine, passing to it the path to the ad you want to render. The ad needs to be extracted and must provide a valid package.json.

The engine will verify the validity of the package.json, then start up a renderer, and execute the scenes in order.
