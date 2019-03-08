
// Create path curve

// how many points on the curve
let curvePoints = 25

// Define the points through which the path must pass
const cpoint1 =  new Vector3((71-64)*16, 0.5, (58-51)*16)//new Vector3(4, 2, 3)
const cpoint2 = new Vector3(((71-63)*16 )+ 8, 0.5, ((58-51)*16) + 3 )  //new Vector3(8, 5, 2)
const cpoint3 = new Vector3(((71-62)*16 ), 3, (58-50)*16) //new Vector3(8, 6, 8)
const cpoint4 = new Vector3(((71-61)*16 )+ 10, 13, (58-51)*16) //new Vector3(2, 2, 7)
const cpoint5 = new Vector3(((71-61)*16) + 4, 4, ((58-52)*16) - 5) //new Vector3(2, 2, 7)

// Compile these points into an array
const cpoints = [cpoint1, cpoint2, cpoint3, cpoint4, cpoint5]

// Create a Catmull-Rom Spline curve. It that passes through all 4 points. The total number of points in the path is set by  `curvePoints`
let catmullPath = Curve3.CreateCatmullRomSpline(cpoints, curvePoints, true).getPoints()

// Custom component to store path and lerp data
@Component("pathData")
export class PathData {
  origin: number = 0
  target: number = 1
  path: Vector3[] = catmullPath
  fraction: number = 0
  constructor(path: Vector3[]){
    this.path = path
  }
}

// component group of all sharks
export const sharks = engine.getComponentGroup(PathData)

// Custom component to store rotational lerp data
@Component("rotateData")
export class RotateData {
  originRot: Quaternion
  targetRot: Quaternion
  fraction: number = 0
}

// Custom component to store current speed
@Component("swimSpeed")
export class SwimSpeed {
  speed: number = 0.5
}


// Lerp over the points of the curve
export class SwimPath {
  update() {
    for (let shark of sharks.entities){
      let transform = shark.get(Transform)
      let path = shark.get(PathData)
      let speed = shark.get(SwimSpeed)
      transform.position = Vector3.Lerp(
        path.path[path.origin],
        path.path[path.target],
        path.fraction
        )
      path.fraction += speed.speed/10
      if (path.fraction > 1) {
        path.origin = path.target
        path.target += 1
        if (path.target >= path.path.length-1) {
          path.target = 0
        }
        path.fraction = 0      
      }
     
    }
  }
}



// Change speed depending on how steep is the shark's path
export class UpdateSpeed {
  update() {
    for (let shark of sharks.entities){
        let speed = shark.get(SwimSpeed)
        let path = shark.get(PathData)
        let rot = shark.get(Transform).rotation.eulerAngles
      
        let angle = rot.y

        if (angle > 30){
            angle = 30
        } else if (angle < -30){
            angle = -30
        } 

      
        //   let depthDiff = (path.path[path.target].y - path.path[path.origin].y) * curvePoints
        //   if (depthDiff > 1){
        //     depthDiff = 1
        //   } else if (depthDiff < -1){
        //     depthDiff = 0.5
        //   }

        let depthDiff = (angle / 30) + 1.5    // from - 30 to 30 -> 0.5 to 2.5


        let clipSwim = shark.get(Animator).getClip("swim")
        clipSwim.weight = (depthDiff/2)   // 0.25 to 1.25

        
        
        clipSwim.speed = depthDiff + 0.5  //  1 to 3


        speed.speed = ((depthDiff * -0.5) + 2) // from  0.75 to 1.75
        //log("dd :" , depthDiff, " speed: " , speed.speed)
    }
  }
}



// Rotate gradually with a spherical lerp
export class RotateSystem {
  update(dt: number) {
    for (let shark of sharks.entities){
      let transform = shark.get(Transform)
      let path = shark.get(PathData)
      let rotate = shark.get(RotateData)
      let speed = shark.get(SwimSpeed)
      rotate.fraction +=  speed.speed/10

      if (rotate.fraction > 1) {
        rotate.fraction = 0
        rotate.originRot = transform.rotation
        let direction = path.path[path.target].subtract(path.path[path.origin]).normalize()
        rotate.targetRot = Quaternion.LookRotation(direction)
      }  
      transform.rotation = Quaternion.Slerp(
        rotate.originRot,
        rotate.targetRot,
        rotate.fraction
      )
    }
  }
}



// Add Shark model
let shark = new Entity()

shark.add(new Transform({
  position: new Vector3((71-64)*16, 0, (58-51)*16),     //  (-64, 58)
  scale: new Vector3(0.5, 0.5, 0.5)
}))
shark.add(new GLTFShape("models/Fish.gltf"))

shark.add(new Animator())

// Add animations
const clipSwim3 = new AnimationClip("Swim", {speed: 0.5, weight: 0.5})
shark.get(Animator).addClip(clipSwim3)

// Activate swim animation
clipSwim3.play()

// add a path data component
shark.add(new PathData(catmullPath))
shark.add(new RotateData())
shark.add(new SwimSpeed())

// Add shark to engine
engine.addEntity(shark)