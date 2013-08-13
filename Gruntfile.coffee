module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      app:
        expand: true
        join: true
        options:
          bare: true
        files:
          "build/awgl.js": [ "lib/*.coffee", "lib/**/*.coffee" ]
          "test/awgl.js": [ "lib/*.coffee", "lib/**/*.coffee" ]
    watch:
      coffeescript:
        files: [ "lib/**/*.coffee", "lib/*.coffee" ]
        tasks: ["coffee"]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask "clean", "delete build directory", ->
    done = this.async()
    require("child_process").exec "rm " + buildDir + " -rf", (err, stdout) ->
      grunt.log.write stdout
      done err

  grunt.registerTask "mkbuilddir", "create build folder", ->
    done = this.async()
    require("child_process").exec "mkdir " + buildDir, (err, stdout) ->
      grunt.log.write stdout
      done err

  # Perform a full build
  grunt.registerTask "prepare", ["clean", "mkbuilddir"]
  grunt.registerTask "full", ["prepare", "coffee"]
  grunt.registerTask "default", ["coffee"]
