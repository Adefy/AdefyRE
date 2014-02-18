####
## Using AdefyLib
####

a = new AJSRectangle
  psyx: true
  mass: 10
  friction: 0.3
  elasticity: 0.2
  w: 100
  h: 100
  position: new AJSVector2 200, 400
  color: new AJSColor3 255, 0, 0

b = new AJSRectangle
  psyx: true
  mass: 0
  friction: 0.2
  elasticity: 0.3
  w: 400
  h: 40
  position: new AJSVector2 300, 100

####
## Using ARE directly
####

fallBox = [
  -50, -50,
  -50,  50,
   50,  50,
   50, -50,
  -50, -50
]

groundBox = [
  -200, -20,
  -200,  20,
   200,  20,
   200, -20,
  -200, -20
]

box = new ARERawActor fallBox
ground = new ARERawActor groundBox

box.setRotation 60
box.setColor 255, 0, 0
ground.setRotation -5

box.setPosition
  x: 200
  y: 400

ground.setPosition
  x: 300
  y: 100

box.createPhysicsBody 10, 0.3, 0.2
ground.createPhysicsBody 0, 0.2, 0.3
