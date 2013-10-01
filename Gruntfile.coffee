module.exports = (grunt) ->

  # Output
  libName = "awgl.js"
  productionName = "awgl-prod.min.js"
  productionNameFull = "awgl-prod-full.min.js"

  # Directories
  buildDir = "build"
  libDir = "lib"
  testDir = "test"
  devDir = "dev"
  docDir = "doc"
  cdnDir = "../www/awgl"
  production = "#{buildDir}/#{productionName}"
  productionFull = "#{buildDir}/#{productionNameFull}"

  productionConcatFull = [
    "#{devDir}/underscore.min.js"
    "#{devDir}/sylvester.js"
    "#{devDir}/mjax.min.js"
    "#{devDir}/glUtils.js"
    "#{devDir}/gl-matrix-min.js"
    "#{devDir}/cp.min.js"

    "#{devDir}/awgl.js"
  ]

  # Intermediate vars
  __awglOut = {}
  __awglOut["#{buildDir}/awgl-concat.coffee"] = [ "#{libDir}/AWGL.coffee" ]
  __awglOut["#{devDir}/awgl-concat.coffee"] = [ "#{libDir}/AWGL.coffee" ]

  __coffeeConcatFiles = {}

  # Build concat output
  __coffeeConcatFiles["#{buildDir}/#{libName}"] = "#{buildDir}/awgl-concat.coffee";

  # Dev concat output, used for browser testing
  __coffeeConcatFiles["#{devDir}/#{libName}"] = "#{buildDir}/awgl-concat.coffee";

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
  _uglify[production] = "#{buildDir}/#{libName}"
  _uglify[productionFull] = productionFull

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
      tests:
        expand: true
        options:
          bare: true
        files: __testFiles

    coffeelint:
      app: __coffeeFiles

    concat_in_order:
      lib:
        files: __awglOut
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
        tasks: ["concat_in_order", "coffeelint", "coffee", "mocha"]

    connect:
      server:
        options:
          port: 8082
          base: "./"

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
      cdn:
        files: [
          expand: true
          cwd: docDir
          src: [ "**" ]
          dest: "#{cdnDir}/doc"
        ,
          src: "#{buildDir}/awgl-prod.min.js"
          dest: "#{cdnDir}/awgl.js"
        ,
          src: "#{buildDir}/awgl-prod-full.min.js"
          dest: "#{cdnDir}/awgl-full.js"
        ]

    clean: [
      buildDir
      docDir
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

  grunt.registerTask "codo", "build html documentation", ->
    done = this.async()
    require("child_process").exec "codo", (err, stdout) ->
      grunt.log.write stdout
      done err

  # Perform a full build
  grunt.registerTask "default", ["concat_in_order", "coffee", "mocha"]
  grunt.registerTask "full", ["clean", "codo", "copy:test_page", "concat_in_order", "coffee", "mocha"]
  grunt.registerTask "dev", ["connect", "copy:test_page", "watch"]
  grunt.registerTask "deploy", [ "concat", "uglify" ]
  grunt.registerTask "cdn", [ "full", "deploy", "copy:cdn" ]