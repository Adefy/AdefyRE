module.exports = (grunt) ->

  buildDir = "build"
  libDir = "lib"

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      app:
        expand: true
        join: true
        options:
          bare: true
        files:
          "build/awgl.js": [ "#{libDir}/*.coffee", "#{libDir}/**/*.coffee" ]
          "test/awgl.js": [ "#{libDir}/*.coffee", "#{libDir}/**/*.coffee" ]
    watch:
      coffeescript:
        files: [ "#{libDir}/**/*.coffee", "#{libDir}/*.coffee" ]
        tasks: ["coffee"]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "clean", "delete build directory", ->
    done = this.async()
    require("child_process").exec "rm #{buildDir} -rf", (err, stdout) ->
      grunt.log.write stdout
      done err

  grunt.registerTask "mkbuilddir", "create build folder", ->
    done = this.async()
    require("child_process").exec "mkdir #{buildDir}", (err, stdout) ->
      grunt.log.write stdout
      done err

  # Perform a full build
  grunt.registerTask "default", ["coffee"]
  grunt.registerTask "full", ["clean", "mkbuilddir", "coffee"]
