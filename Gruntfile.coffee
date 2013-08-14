module.exports = (grunt) ->

  # Output
  libName = "awgl.js"

  # Directories
  buildDir = "build"
  libDir = "lib"
  devDir = "dev"
  docDir = "doc"

  # Intermediate vars
  __coffeeFiles = {}
  __coffeeFiles["#{buildDir}/#{libName}"] =  [
    "#{libDir}/*.coffee"
    "#{libDir}/**/*.coffee"
  ]

  __coffeeFiles["#{devDir}/#{libName}"] = [
    "#{libDir}/*.coffee"
    "#{libDir}/**/*.coffee"
  ]

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      app:
        expand: true
        join: true
        options:
          bare: true
        files: __coffeeFiles

    watch:
      coffeescript:
        files: [
          "#{libDir}/**/*.coffee"
          "#{libDir}/*.coffee"
        ]
        tasks: ["coffee", "codo"]

    connect:
      server:
        options:
          port: 8080
          base: "./#{devDir}/"

    clean: [
      "./#{buildDir}/"
      "./#{docDir}/"
    ]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-clean"

  grunt.registerTask "codo", "build html documentation", ->
    done = this.async()
    require("child_process").exec "codo", (err, stdout) ->
      grunt.log.write stdout
      done err

  # Perform a full build
  grunt.registerTask "default", ["coffee"]
  grunt.registerTask "full", ["clean", "codo", "coffee"]
  grunt.registerTask "dev", ["connect", "watch"]
