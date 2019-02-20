import { taoQuotes } from "./taoQuotes";

// quote component
@Component("quote")
export class Quote {
  timeLeft: number
  quoteIndex: number
  constructor(index: number, time: number){
    this.quoteIndex =index
    this.timeLeft = time
  }
}

// component group to hold all entities with a timeOut
export const quotes = engine.getComponentGroup(Quote)

export class ExpireQuotes {
  update(dt: number) {
    for (let q of quotes.entities){
      let quote = q.get(Quote)
      quote.timeLeft -= dt
      if (quote.timeLeft < 0){
        engine.removeEntity(q,true)
      }
    }
  }
}


let mapShape = new GLTFShape('models/Map.gltf') 



export function randomTaoQuote(){
    if (quotes.entities.length > 0){
      log("quote already exists")
      return
    }
    let index = Math.floor(Math.random() * taoQuotes.length)
    let quoteLength = (taoQuotes[index].length/ 10) + 2
    //log(taoQuotes[index].length)
  
    const quote = new Entity()
    quote.add(mapShape)
    quote.add(new Billboard(true, true, true))
    quote.add(
      new Transform({
        position: new Vector3(((71 - 58)*16)+ 8, 22, ((58-52)*16)- 5),   // 58-52 * 16   (0, 0) = (-71, 58) statue = (-58, 58)
        scale: new Vector3(1, 1, 1),
        rotation: Quaternion.Euler(180,0,0)
      })
    )
    quote.add(new Quote(index, quoteLength))
    engine.addEntity(quote)
  
    let text = new Entity()
    text.setParent(quote)
    text.add(new Transform({
      position: new Vector3(0, 0, 0.1),
      rotation: Quaternion.Euler(180,0,0)
    }))
    let quoteText = new TextShape(taoQuotes[index])
    quoteText.textWrapping = true
    quoteText.color = Color3.Black()
    quoteText.shadowColor = Color3.White()
    quoteText.shadowBlur = 50
    quoteText.width = 3
    quoteText.height = 3
    //quoteText.
    //quoteText.lineCount = 4
    text.add(quoteText)
    engine.addEntity(text)
  }

