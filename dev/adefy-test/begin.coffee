# Adefy middleware testbed
#
# All coordinates are from the top-left corners!

window.currentScene = (engine) ->

  # APIKey, Physics active, duration
  engine.init "6nbzUrui13whi5P18JPKAnhBMqXciN4", true, 5000

  # Build logo
  #
  # Text actor definition form 1
  logo = new AJSTextActor "Adefy", 128
  #    = new AJSTextActor
  # str: "Adefy"
  # size: 128
  # fg: new engine.color3 255, 255, 255
  # bg: new engine.color3 0, 0, 0
  # font: TODO
  # psyx: null

  # Build sliding rectangles
  #          = new AJSRectangleActor 100, 100
  sliderLeft = new AJSRectangleActor
    width: engine.gfx.getWidth()
    height: engine.gfx.getHeight()
    color: new engine.color3 0, 229, 179
    position:
      x: engine.gfx.getWidth() * -1
      y: engine.gfx.getHeight() * 0.75
    # psyx: null

  #           = new AJSRectangleActor 100, 100
  sliderRight = new AJSRectangleActor
    width: engine.gfx.getWidth()
    height: engine.gfx.getHeight()
    color: new engine.color3 255, 241, 156
    position:
      x: engine.gfx.getWidth() * 1.5
      y: 0
    # psyx: null

  # Set gravity for the rectangles
  engine.psyx.setGravity
    x: 10
    y: 0

  # Register animations
  #
  # gine.animate -1, 1500, [ sliderLeft, sliderRight ], <x>, <y>, <cb>
  engine.animate
    delay: -1
    duration: 1500
    effected: sliderLeft
    type: "absolute"
    x: 0
    y: sliderLeft.getPosition().y
    # cb: ->

  engine.animate
    delay: -1
    duration: 1500
    effected: sliderRight
    type: "absolute"
    x: 0
    y: sliderRight.getPosition().y
    # cb: ->

  engine.animate
    delay: -1
    duration: 1200
    effected: logo
    type: "absolute"
    x: 0
    y: engine.gfx.getHeight() / 2
    # cb: ->

  # Trigger triangles
  triangleDef =
    color: null
    x:
      min: -40
      max: 0
    y:
      min: engine.gfx.getHeight() * 0.2
      max: engine.gfx.getHeight() * 0.5
    psyx:
      density: 1.0
      friction: 0.5
      restitution: 0.1
    angle: -90

  # delay (same as animate), def, count, inter-delay
  engine.scheduleCreation 1000, triangleDef, 500, 50

  engine.start()
