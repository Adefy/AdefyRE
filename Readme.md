    Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved

Adefy Rendering Engine
======================
Browser rendering engine for Adefy GLAds through AdefyJS.

Development Setup
=================
* `npm install`
* `bower install`
* ???
* PROFIT

To fix this (and enable unit tests), go into node_modules/grunt-lib-phantomjs and change the version of phantomjs in package.json to ~1.8.1-1. Then go into grunt-lib-phantomjs's node_modules folder and delete phantomjs/. Finally, run `npm install` inside of grunt-lib-phantomjs's root directory. This will pull down phantomjs 1.8.1-1 and tests will work.

Testing
=======
Mocha and Chai are used for unit testing within PhantomJS. To manually run the tests on the commandline, execute the mocha task with `grunt mocha`

Building
========
ARE uses Grunt for building and general task automation. There are currently two commonly used tasks:

`[grunt] full`
------------
Performs a full rebuild of ARE, readying the library for deployment.

`[grunt] dev`
-----------
Use this while working on ARE, opens up a server is set up at http://localhost:8082 mapped to dev/
