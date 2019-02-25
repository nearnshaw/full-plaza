import { ExpireQuotes, randomTaoQuote } from "./modules/taoStatue";
import { SwimPath, UpdateSpeed, RotateSystem, RotateData } from "./modules/fish";
import { AlternatingNotes, playNote, sourceAHigh, sourceALow, sourceEHigh, sourceGLow, sourceCHigh, sourceCLow } from "./modules/musicalTree";
import { SpookDeer, DeerWalkAround, DeerRotateSystem, DeerWalk, Behavior, DeerRotateData } from "./modules/deer";



// Instance the input object
const input = Input.instance


function spawnModel(model: string) {
  // create the entity
  const mesh = new Entity()

  // set a transform to the entity
  mesh.set(new Transform({ position: new Vector3(160, 0, 160) }))
  

  // set a shape to the entity
  mesh.set(new GLTFShape(model))

  // add the entity to the engine
  engine.addEntity(mesh)

  return mesh
}


//add models
const base = spawnModel("models/Base.gltf")
const colliders = spawnModel("models/Colliders.gltf")
const cubeA = spawnModel("models/CubeTempleA.gltf")
const cubeB = spawnModel("models/CubeTempleB.gltf")
const grass = spawnModel("models/Grass.gltf")
const roots = spawnModel("models/Roots.gltf")
const trees = spawnModel("models/Trees.gltf")
const smallTrees = spawnModel("models/SmallTrees.gltf")
const water = spawnModel("models/Water.gltf")
//const wumpus = spawnModel("models/Wumpus.gltf")

// animations
let cubeAClip = new AnimationClip("Armature_CubeTempleBAction")
let cubeAAnim = new Animator()
cubeAAnim.addClip(cubeAClip)
cubeA.add(cubeAAnim)
cubeAClip.play

let cubeBClip = new AnimationClip("Armature_CubeTempleBAction")
let cubeBAnim = new Animator()
cubeBAnim.addClip(cubeBClip)
cubeB.add(cubeBAnim)
cubeBClip.play



let grassClip = new AnimationClip("ArmatureAction")
let grassAnim = new Animator()
grass.add(grassAnim)
grassAnim.addClip(grassClip)
grassClip.play


let bigTreesClip = new AnimationClip("Armature_BigTreesAction")
let bigTreesAnim = new Animator()
trees.add(bigTreesAnim)
bigTreesAnim.addClip(bigTreesClip)
bigTreesClip.play

let smallTreesClip = new AnimationClip("Armature_BigTreesAction")
let smallTreesAnim = new Animator()
smallTrees.add(smallTreesAnim)
smallTreesAnim.addClip(smallTreesClip)
smallTreesClip.play

let waterClip = new AnimationClip("ArmatureAction")
let waterAnim = new Animator()
water.add(waterAnim)
waterAnim.addClip(waterClip)
waterClip.play

// Musical tree

let musicalTree = new Entity()
musicalTree.add(new Transform({
  position: new Vector3(0.3, 2.3, 0.2)
}))
engine.addEntity(musicalTree)

let fruit1 = new Entity()
fruit1.setParent(musicalTree)
fruit1.add(new Transform({
  position: new Vector3(0.3, 2.3, 0.2),
  scale: new Vector3(0.3, 0.3, 0.3)
}))
fruit1.add(new AlternatingNotes([sourceAHigh, sourceALow]))
fruit1.add(new GLTFShape("models/2.glb"))
fruit1.add(new OnClick(e => {
  log("fuit1 ")
  playNote(fruit1)
}))
engine.addEntity(fruit1)

let fruit2 = new Entity()
fruit2.setParent(musicalTree)
fruit2.add(new Transform({
  position: new Vector3(-1.2, 2, -0.2),
  scale: new Vector3(0.3, 0.3, 0.3)
}))
fruit2.add(new AlternatingNotes([sourceEHigh, sourceGLow]))
fruit2.add(new GLTFShape("models/2.glb"))
fruit2.add(new OnClick(e => {
  log("fuit2")
  playNote(fruit2)
}))
engine.addEntity(fruit2)

let fruit3 = new Entity()
fruit3.setParent(musicalTree)
fruit3.add(new Transform({
  position: new Vector3(0, 1.7, 1),
  scale: new Vector3(0.3, 0.3, 0.3)
}))
fruit3.add(new AlternatingNotes([sourceCHigh, sourceCLow]))
fruit3.add(new GLTFShape("models/2.glb"))
fruit3.add(new OnClick(e => {
  log("fuit3")
  playNote(fruit3)
}))
engine.addEntity(fruit3)


// Deer


// Add deer
let Deer = new Entity()
Deer.set(new Transform({
  position: new Vector3(5, 0, 5)
}))
Deer.get(Transform)
Deer.set(new GLTFShape("models/Deer.gltf"))
Deer.add(new DeerRotateData())
// add a path data component
Deer.set(new DeerWalk())
Deer.add(new Animator())
Deer.add(new Behavior())
let deerWalk = new AnimationClip("Walk")
Deer.get(Animator).addClip(deerWalk)
let deerIdle = new AnimationClip("Idle")
Deer.get(Animator).addClip(deerIdle)
let deerRun = new AnimationClip("Run")
Deer.get(Animator).addClip(deerRun)
let deerEat = new AnimationClip("Eat")
Deer.get(Animator).addClip(deerEat)
let deerLook = new AnimationClip("Look")
deerLook.looping = false
Deer.get(Animator).addClip(deerLook)
//deerWalk.play()
// Add to engine
engine.addEntity(Deer)


// let wumpusAnim = new AnimationClip("")
// wumpus.add(new Animator(wumpusAnim))

// Tao quotes
engine.addSystem(new ExpireQuotes())

// Swimming fish
engine.addSystem(new SwimPath(), 2)
engine.addSystem(new UpdateSpeed(), 1)
engine.addSystem(new RotateSystem(), 3)


// Deer
engine.addSystem(new SpookDeer())
engine.addSystem(new DeerRotateSystem(), 3)
engine.addSystem(new DeerWalkAround())



// button down event
input.subscribe("BUTTON_A_DOWN", e => {
  log(e.hit.meshName)
  if (e.hit.meshName == "GirlStatue"){
      log("tao quote")
      randomTaoQuote()
    }  
})



