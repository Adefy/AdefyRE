module.exports = (grunt) ->

  # Output
  libName = "are.js"
  productionName = "are-prod.js"
  productionNameMin = "are-prod.min.js"
  productionNameFull = "are-prod-full.js"
  productionNameFullMin = "are-prod-full.min.js"

  # Directories
  buildDir = "build"
  libDir = "lib"
  testDir = "test"
  devDir = "dev"
  production = "#{buildDir}/#{productionName}"
  productionMin = "#{buildDir}/#{productionNameMin}"
  productionFull = "#{buildDir}/#{productionNameFull}"
  productionFullMin = "#{buildDir}/#{productionNameFullMin}"

  productionConcatFull = [
    "#{devDir}/components/underscore/underscore.js"
    "#{devDir}/components/chipmunk/cp.min.js"
    "#{devDir}/js/EWGL_math.js"
    "#{devDir}/js/inkyEWGL.js"
    "#{devDir}/are.js"
  ]

  # Intermediate vars
  __areOut = {}
  __areOut["#{buildDir}/are-concat.coffee"] = [ "#{libDir}/are.coffee" ]
  __areOut["#{devDir}/are-concat.coffee"] = [ "#{libDir}/are.coffee" ]

  __coffeeConcatFiles = {}

  # Build concat output
  __coffeeConcatFiles["#{buildDir}/#{libName}"] = "#{buildDir}/are-concat.coffee";

  # Dev concat output, used for browser testing
  __coffeeConcatFiles["#{devDir}/#{libName}"] = "#{buildDir}/are-concat.coffee";

  # 1 to 1 compiled files, for unit tests
  __coffeeFiles = [
    "#{libDir}/*.coffee"
    "#{libDir}/**/*.coffee"
  ]
  __testFiles = {}
  __testFiles["#{buildDir}/test/spec.js"] = [ "#{buildDir}/test/spec.coffee" ]

  __testOut = {}
  __testOut["#{buildDir}/test/spec.coffee"] = ["#{testDir}/tests.coffee"]

  _uglify = {}
  _uglify[productionMin] = "#{buildDir}/#{libName}"
  _uglify[productionFullMin] = productionFull

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      concat:
        options:
          sourceMap: true
          bare: true
        cwd: buildDir
        files: __coffeeConcatFiles
      lib:
        expand: true
        options:
          bare: true
        src: __coffeeFiles
        dest: buildDir
        ext: ".js"
      libDev:
        expand: true
        options:
          bare: true
        src: __coffeeFiles
        dest: devDir
        ext: ".js"
      tests:
        expand: true
        options:
          bare: true
        files: __testFiles

    coffeelint:
      app: __coffeeFiles

    concat_in_order:
      lib:
        files: __areOut
        options:
          extractRequired: (path, content) ->

            workingDir = path.split "/"
            workingDir.pop()
            workingDir = workingDir.join().replace /,/g, "/"

            deps = @getMatches /\#\s\@depend\s(.*\.coffee)/g, content
            deps.forEach (dep, i) ->
              deps[i] = "#{workingDir}/#{dep}"

            return deps
          extractDeclared: (path) -> [path]
          onlyConcatRequiredFiles: true
      tests:
        files: __testOut
        options:
          extractRequired: (path, content) ->

            workingDir = path.split "/"
            workingDir.pop()
            workingDir = workingDir.join().replace /,/g, "/"

            deps = @getMatches /\#\s\@depend\s(.*\.coffee)/g, content
            deps.forEach (dep, i) ->
              deps[i] = "#{workingDir}/#{dep}"

            return deps
          extractDeclared: (path) -> [path]
          onlyConcatRequiredFiles: true

    watch:
      coffeescript:
        files: [
          "#{libDir}/**/*.coffee"
          "#{libDir}/*.coffee"
          "#{testDir}/**/*.coffee"
          "#{testDir}/*.coffee"
        ]
        tasks: ["clean", "concat_in_order", "coffee", "mocha", "concat", "uglify"]

    connect:
      server:
        options:
          port: 8082
          base: "./dev"

    mocha:
      all:
        src: [ "#{buildDir}/#{testDir}/test.html" ]
        options:
          bail: false
          log: true
          reporter: "Nyan"
          run: true

    copy:
      test_page:
        files: [
          expand: true
          cwd: "#{testDir}/env"
          src: [ "**" ]
          dest: "#{buildDir}/#{testDir}"
        ]

    clean: [
      buildDir
    ]

    # Production concat
    concat:
      options:
        stripBanners: true
      distFull:
        src: productionConcatFull
        dest: productionFull

    uglify:
      options:
        preserveComments: false
        banner: "/* Copyright © 2013 Spectrum IT Solutions Gmbh - All Rights Reserved */\n"
      production:
        files: _uglify

  grunt.loadNpmTasks "grunt-coffeelint"
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-concat-in-order"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-mocha"

  grunt.registerTask "default", ["concat_in_order", "coffee", "mocha"]
  grunt.registerTask "full", [
    "clean"
    "copy:test_page"
    "concat_in_order"
    "coffee"
    "mocha"
    "concat"
    "uglify"
  ]
  grunt.registerTask "dev", ["connect", "copy:test_page", "watch"]
