module.exports = (grunt) ->

  # Output
  libName = "awgl.js"

  # Directories
  buildDir = "build"
  libDir = "lib"
  devDir = "dev"
  docDir = "doc"

  # Intermediate vars
  __awglOut = {}
  __awglOut["#{buildDir}/build-concat.coffee"] = [ "#{libDir}/AWGL.coffee" ]
  __awglOut["#{devDir}/build-concat.coffee"] = [ "#{libDir}/AWGL.coffee" ]

  __coffeeFiles = {}
  __coffeeFiles["#{devDir}/#{libName}"] = "#{buildDir}/build-concat.coffee";
  __coffeeFiles["#{buildDir}/#{libName}"] = "#{buildDir}/build-concat.coffee";

  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    coffee:
      awgl:
        options:
          sourceMap: true
          bare: true
        cwd: "#{buildDir}"
        files: __coffeeFiles

    concat_in_order:
      awgl:
        files: __awglOut
        options:
          extractRequired: (path, content) ->

            workingDir = path.split "/"
            workingDir.pop()

            deps = @getMatches /\#\s\@depend\s(.*\.coffee)/g, content
            deps.forEach (dep, i) ->
              deps[i] = "#{workingDir.join()}/#{dep}"
              console.log "Got dep #{deps[i]}"

            return deps
          extractDeclared: (path) -> [path]
          onlyConcatRequiredFiles: true

    watch:
      coffeescript:
        files: [
          "#{libDir}/**/*.coffee"
          "#{libDir}/*.coffee"
        ]
        tasks: ["concat_in_order", "coffee", "codo"]

    connect:
      server:
        options:
          port: 8080
          base: "./"

    clean: [
      "./#{buildDir}/"
      "./#{docDir}/"
    ]

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-concat-in-order"

  grunt.registerTask "codo", "build html documentation", ->
    done = this.async()
    require("child_process").exec "codo", (err, stdout) ->
      grunt.log.write stdout
      done err

  # Perform a full build
  grunt.registerTask "default", ["concat_in_order", "coffee"]
  grunt.registerTask "full", ["clean", "codo", "concat_in_order", "coffee"]
  grunt.registerTask "dev", ["connect", "watch"]
