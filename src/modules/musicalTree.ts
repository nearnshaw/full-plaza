
@Component("alternatingNotes")
export class AlternatingNotes {

  notes: AudioSource[]
  nextNote: number 
  constructor(notes: AudioSource[]){
    this.notes = notes
    this.nextNote = 0
  }
}



// Create Audio objects
let AHighClip = new AudioClip('sounds/kalimbaAHigh.wav')
export let sourceAHigh = new AudioSource(AHighClip)
sourceAHigh.loop = false
let AHigh = new Entity()
AHigh.add(sourceAHigh)
engine.addEntity(AHigh)

let ALowClip = new AudioClip('sounds/kalimbaALow.wav')
export let sourceALow = new AudioSource(ALowClip)
sourceALow.loop = false
let ALow = new Entity()
ALow.add(sourceALow)
engine.addEntity(ALow)

let CHighClip = new AudioClip('sounds/kalimbaCHigh.wav')
export let sourceCHigh = new AudioSource(CHighClip)
sourceCHigh.loop = false
let CHigh = new Entity()
CHigh.add(sourceCHigh)
engine.addEntity(CHigh)

let CLowClip = new AudioClip('sounds/kalimbaCLow.wav')
export let sourceCLow = new AudioSource(CLowClip)
sourceCLow.loop = false
let CLow = new Entity()
CLow.add(sourceCLow)
engine.addEntity(CLow)

let EHighClip = new AudioClip('sounds/kalimbaEHigh.wav')
export let sourceEHigh = new AudioSource(EHighClip)
sourceEHigh.loop = false
let EHigh = new Entity()
EHigh.add(sourceEHigh)
engine.addEntity(EHigh)

let GLowClip = new AudioClip('sounds/kalimbaGLow.wav')
export let sourceGLow = new AudioSource(GLowClip)
sourceGLow.loop = false
let GLow = new Entity()
GLow.add(sourceGLow)
engine.addEntity(GLow)



export function playNote(fruit: Entity){
    let notes = fruit.get(AlternatingNotes)
    let playedNote = notes.notes[notes.nextNote]
    playedNote.playOnce()
    notes.nextNote +=1
    if (notes.nextNote > notes.notes.length - 1){
      notes.nextNote = 0
    }
  }