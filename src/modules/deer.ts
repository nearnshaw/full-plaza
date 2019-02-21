
// Create path curve


// Distance for fireflies to fly away
const runAwayDistance = 5

// how many points on the curve
let curvePoints = 10

// Points in path
const point1 = new Vector3(8, 0, 8)
const point2 = new Vector3(8, 0, 22)
const point3 = new Vector3(22, 0, 22)
const point4 = new Vector3(22, 0, 8)

// Hang out points
const op1 = new Vector3(-4, 0, -4)
const op2 = new Vector3(-4, 0, 2)
const op3 = new Vector3(3, 0, 4)
const op4 = new Vector3(2.5, 0, -3.5)
// const op5 = new Vector3(1.3, 0, 0.6)
// const op6 = new Vector3(3, 0, 0)
// const op7 = new Vector3(1.7, 0, -0.3)
// const op8 = new Vector3(1.2, 0, -0.6)

const path1: Vector3[] = [point1, point2, point3, point4]



// Create a Catmull-Rom Spline curve. It that passes through all 4 points. The total number of points in the path is set by  `curvePoints`
let curvePath = Curve3.CreateCatmullRomSpline(path1, curvePoints, true).getPoints()

// Object that tracks user position and rotation
const camera = Camera.instance

const templateHangOutPoints: Vector3[] = [op1, op2, op3, op4]

export enum State {
 Idle,
 Walk,
 Look,
 Eat,
 Run
}

@Component('deerWalk')
export class DeerWalk {
  mainPath: Vector3[] = path1
  localPath: Vector3[] = [path1[0]]
  mainPathIndex: number = 0
  localPathIndex: number = 0
  hangOutPoints: Vector3[] = generateOrbit(templateHangOutPoints, this.mainPath[0])
  origin: Vector3 = this.hangOutPoints[0]
  target: Vector3 = this.hangOutPoints[1]
  //hangOutIndex: number = 0
  fraction: number = 0
}



const deers = engine.getComponentGroup(DeerWalk)

// store the current and last goal
@Component('behavior')
export class Behavior {
  state: State = State.Idle
  previousState: State = State.Idle
  timer: number = 1
  personalSpace : number = runAwayDistance * runAwayDistance
}


// Custom component to store rotational lerp data
@Component("rotateData")
export class RotateData {
  originRot: Quaternion = Quaternion.Euler(0,0,0)
  targetRot: Quaternion = Quaternion.Euler(0,0,0)
  fraction: number = 0
}

// Walk following the points in the path

export class DeerWalkAround {
  update(dt: number) {
    for (let deer of deers.entities) {
      let transform = deer.get(Transform)
      let walk = deer.get(DeerWalk)
      let behavior = deer.get(Behavior)
   
     if (behavior.state === State.Walk || behavior.state === State.Run){
      if (walk.fraction < 1) {
        if (behavior.state === State.Run){ dt *= 2}
        walk.fraction += dt
        transform.position = Vector3.Lerp(
          walk.origin,
          walk.target,  //.add(templateHangOutPoints[0]),
          walk.fraction
        )
      } else {   // if finished segment of path
        walk.localPathIndex += 1
        if( walk.localPathIndex < walk.localPath.length){
          walk.fraction = 0
          walk.origin = walk.target
          walk.target = walk.localPath[walk.localPathIndex]
        } else {   
          if (behavior.state === State.Run){
            walk.hangOutPoints = generateOrbit(templateHangOutPoints, walk.mainPath[walk.mainPathIndex])
          }
          behavior.state = State.Idle 
          walk.fraction = 1
          walk.origin = transform.position
          walk.target = transform.position
          log("arrived from walk") 
        }
                        
      }
     } else if (behavior.state === State.Look){
      behavior.state = State.Idle
     } else if (behavior.state === State.Idle){
       // random play animations / walk
       let newGoal = considerGoals(deer,[{state: State.Idle, odds:0.8}, {state: State.Walk, odds: 0.1},{state: State.Look, odds: 0.1}])

       if (newGoal == State.Walk){
        // calculate walk
        let targetIndex = Math.floor(Math.random() * walk.hangOutPoints.length)
        if (walk.hangOutPoints[targetIndex] == transform.position){ 
          behavior.state = State.Idle
        }
        walk.localPath = generateLocalPath(transform.position, transform.rotation, walk.hangOutPoints[targetIndex], templateHangOutPoints[targetIndex])
        walk.localPathIndex = 0
        walk.origin = walk.localPath[0]
        walk.target = walk.localPath[1]
        behavior.state = State.Walk
        walk.fraction = 0
       }
     
      }
     setAnimations(deer) 
    }
  }
}



// Rotate gradually with a spherical lerp
export class DeerRotateSystem {
  update(dt: number) {
    for (let deer of deers.entities){
      let transform = deer.get(Transform)
      let path = deer.get(DeerWalk)
      let rotate = deer.get(RotateData)
      let behavior = deer.get(Behavior)
      if( behavior.state === State.Walk || behavior.state === State.Run){
        rotate.fraction += dt/2
      }
      
      if (rotate.fraction >= 1) {
        
        rotate.originRot = transform.rotation
        let direction = path.target.subtract(path.origin)
        if (direction == Vector3.Zero()){
          rotate.targetRot = rotate.originRot
        } else {
          rotate.targetRot = Quaternion.LookRotation(direction)  
          rotate.fraction = 0 
        }
        
      }  
      transform.rotation = Quaternion.Slerp(
        rotate.originRot,
        rotate.targetRot,
        rotate.fraction
      )

      if (path.origin == path.target){
        log("origin = target " , path.target.subtract(path.origin).normalize() )
      }
    }
  }
}




// React and run to next point when the user gets close enough

export class SpookDeer {
  update(dt: number) {
    for (let deer of deers.entities) {
      let transform = deer.get(Transform)
      let walk = deer.get(DeerWalk)
      let behavior = deer.get(Behavior)

      if (behavior.state != State.Run ) {
   
        let dist = Vector3.DistanceSquared(transform.position, camera.position)
        //log(camera.position)
        if ( dist < behavior.personalSpace) {
          log("running!")
          behavior.state = State.Run
          walk.fraction = 0
          walk.origin = transform.position
          if (walk.mainPathIndex == 0){
            walk.mainPathIndex += 1
          } else if (walk.mainPathIndex == walk.mainPath.length -1){
            walk.mainPathIndex -= 1
          } else {
            let distNext = Vector3.DistanceSquared(walk.mainPath[walk.mainPathIndex+1], camera.position)
            let distPrev = Vector3.DistanceSquared(walk.mainPath[walk.mainPathIndex-1], camera.position)
            if (distNext > distPrev){
              walk.mainPathIndex += 1
            } else {
              walk.mainPathIndex -= 1
            }
          }  
          //let endDirection =  walk.mainPath[walk.mainPathIndex].subtract(transform.position).normalize()
          let endDirection = templateHangOutPoints[0]
          walk.localPath = generateLocalPath(transform.position, transform.rotation, walk.mainPath[walk.mainPathIndex], endDirection)
          walk.origin = walk.localPath[0]
          walk.target = walk.localPath[1]
          //walk.target = walk.mainPath[walk.mainPathIndex]
          // stop previous rotating
          deer.get(RotateData).fraction = 1
        }
       } 
    }
  }
}





function generateOrbit(template: Vector3[], center: Vector3){
  let resultArray = []
  for (let i = 0; i < template.length; i++){
    let randomVariation = Vector3.Zero()
    if (i != 0){
      let randomVariation = new Vector3(Math.random() , 0, Math.random())
    }   
    let newPos = center.add(template[i]).add(randomVariation)
    
    resultArray.push(newPos)
  }
  return resultArray
}

function generateLocalPath(currentPos: Vector3, currentDir: Quaternion, targetPos: Vector3, targetDir: Vector3 ){
  
  // get vector for starting direction
  // get vector for ending direction
  let startDirection = Vector3.Forward().rotate(currentDir)
  //let endDirection = targetDir.eulerAngles
  log("read dir: ", currentDir.eulerAngles, " dir I'm using: ", Quaternion.LookRotation(startDirection).eulerAngles  )

  let hermitePath = Curve3.CreateHermiteSpline(currentPos, startDirection, targetPos, targetDir, curvePoints).getPoints()
  log("new path: ", hermitePath)
  return hermitePath
}






// choose randomly between goal options
export function considerGoals(deer: Entity, goals: { state: State; odds: number }[]) {
  for (let i = 0; i < goals.length; i++) {
    if (Math.random() < goals[i].odds) {
      setDeerState(deer, goals[i].state)
      return goals[i].state
    }
  }
}

// set the values in the Behavior component
export function setDeerState(deer: Entity, state: State) {
  let behavior = deer.get(Behavior)
  behavior.previousState = behavior.state
  behavior.state = state
  log('new state: ' + state)
}

// set animations
export function setAnimations(deer: Entity) {
  let look = deer.get(Animator).getClip('Look')
  let idle = deer.get(Animator).getClip('Idle')
  let walk = deer.get(Animator).getClip('Walk')
  let run = deer.get(Animator).getClip('Run')
  let eat = deer.get(Animator).getClip('Eat')

  
  idle.playing = false
  walk.playing = false
  run.playing = false
  eat.playing = false
  //look.playing = false
  

  switch (deer.get(Behavior).state) {
    case State.Look:
      look.playing = true
      look.looping = false
      break
    case State.Run:
      run.play()
    case State.Walk:
      walk.play()
      break
    case State.Eat:
      eat.play()
      break
    case State.Idle:
      idle.play()
      break
  }
 
}

