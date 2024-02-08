import { createSignal, onCleanup } from "solid-js";

import logo from './logo.svg';
import styles from './App.module.css';
import {faker} from '@faker-js/faker'


function App() {
  const height = 250
  const width = 365

  const buyers = Array(1000).fill().map( buyer => {
    return faker.person.firstName()
  })

  const tierOnes = ["Ford", "Honda", "Volkswagen"]
  const surfaces = ["web", "dealership", "word of mouth", "social"]

  const [currentTierOne, setCurrentTierOne] = createSignal(randomItem(tierOnes))
  const [focusedBuyer, setFocusedBuyer] = createSignal("")
  const [currentView, setCurrentView] = createSignal("timeline")

  const purchaseChains = Array(100).fill().map( purchaseChain => {
    const brand = randomItem(tierOnes)

    //skew the data
    let age

    switch(brand){
      case "Ford": 
        age = faker.number.int({min: 14, max: 60})
        break
      case "Honda":
        age = faker.number.int({min: 16, max: 80})
        break
      case "Volkswagen":
        age =  faker.number.int({min: 20, max: 95})
        break
      default:
        age = faker.number.int({min: 16, max: 80})
        break
    }
    const purchase = {
      buyer: faker.person.firstName(),
      buyerAge: age,
      isPurchase: Math.random() > 0.2 ? true : false,
      // date: faker.date.past({years: 1, refDate: '2023-01-01T00:00:00.000Z'}),
      dummyDate: Math.floor(Math.random() * 365),
      brand: brand
    }
    
    const touchpoints = Array(Math.floor(Math.random() * 14) + 2).fill()
      .map( touchpoint => {
        return {
          buyer: purchase.buyer,
          // date: faker.date.between({from: '2022-01-01T00:00:00.000Z', to: purchase.date}),
          dummyDate: Math.floor(Math.random() * purchase.dummyDate),
          surface: randomItem(surfaces),
          brand: randomItem(tierOnes),
          leadAttributionId: faker.string.numeric(5)
        }
      })
      .sort((a, b) => {
        if(a.dummyDate < b.dummyDate) {
          return -1
        } else if(a.dummyDate > b.dummyDate){
          return 1
        } else { return 0 }
      })

    const chain = [...touchpoints, purchase]
    return chain
  })

  function handleRadio(event){
    setCurrentTierOne(event.target.value)
  }

  function handleViewRadio(event){ 
    setCurrentView(event.target.value)
  }

  function handleBuyerHover(event){
    if(currentView() == "timeline") {
      setFocusedBuyer(event.target.id)
    }
  }
  
  return (
    <div>
      <div class={styles.controls}>
        <fieldset>
          <legend>Choose a Tier One manufacturer</legend>
          {tierOnes.map(company => (
            <div>
              <input type="radio" name="tierOne" id={company} value={company} checked={company == currentTierOne()}
                onchange={handleRadio}
              />
              <label for={company}>{company}</label>
            </div>
            // probably wants an 'all' option
          ))}
          <div>
            <input type="radio" name="tierOne" id="all" value="all" disabled/>
            <label for="all" id={styles.allLabel}>All</label>
          </div>
        </fieldset>
        <fieldset>
          <legend>View</legend>
          <div>
            <input type="radio" name="view" id="timeline" value="timeline" checked={currentView() == "timeline"} onchange={handleViewRadio}/>
            <label for="timeline">Timeline</label>
          </div>
          <div>
            <input type="radio" name="view" id="watershed" value="watershed" checked={currentView() == "watershed"} onchange={handleViewRadio}/>
            <label for="watershed">Watershed</label>
          </div>
        </fieldset>
      </div>
      <div class={styles.graphFrame}>
        <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg">
          {purchaseChains
            .filter(chain => chain[chain.length-1].brand == currentTierOne())
            .map((chain) => {

            let colorScaleFactor = 3
            let purchase = chain[chain.length-1]
            let greyValue = (purchase.buyerAge)*colorScaleFactor

            let yScale = 10
            let touchpointCoords = ""
            for(var i = 0; i < chain.length; i++){
              let y = i*yScale
              touchpointCoords += chain[i].dummyDate + "," + y + " "
            }

            let translateY = height - (chain.length * yScale)

            let translateX = 0
            

            let rotate = 0
            if(currentView() == "watershed"){
              translateX = width - purchase.dummyDate - 10
              translateY -= height/2
              rotate = "-35"
            }

            let stroke = "gray"
            let strokeWidth = 1 

            if(focusedBuyer() == purchase.buyer) { 
              stroke = "orange"
              strokeWidth = 2
            }

            if(!purchase.isPurchase){
              stroke = "red"
            }

            return (
              <g id={purchase.buyer} 
                transform={
                  "translate(" + translateX + " " + translateY 
                  + ") rotate(" + rotate + "," + purchase.dummyDate + "," + (chain.length - 1) * yScale + ")"} 
                onMouseOver={handleBuyerHover}>

                <polyline points={touchpointCoords} fill="none" stroke={stroke} stroke-opacity="0.5" stroke-width={strokeWidth}></polyline>
                <circle id={purchase.buyer} fill={
                  "rgb(" + greyValue + ","
                    + greyValue+ ","
                    + greyValue + ")"} 
                  stroke={stroke} cx={purchase.dummyDate} cy={(chain.length-1) * yScale} r="5"></circle>
                {/* <text x={purchase.dummyDate} y={145} class={styles.small}>{purchase.buyer}</text> */}
              </g>
            )
          })}
        </svg>
        <div>
          <dl>
            <dt>
              <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" class="legendCircle">
                <circle cx="6" cy="6" fill="black" r="5"></circle>
              </svg>
              </dt>
            <dd>younger buyer</dd>
            <dt>
              <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" class="legendCircle">
                <circle cx="6" cy="6" fill="gray" r="5"></circle>
              </svg>
              </dt>
            <dd>older buyer</dd>
          </dl>
        </div>
      </div>
      <table>
        <caption>Raw data for 100 buyer journeys</caption>
        <tbody>
          <tr class="header">
            <th>Buyer</th>
            <th>Age</th>
            <th>Tier One</th>
            <th>Contact type</th>
          </tr>
          {purchaseChains.map( chain => {
            return chain.map( touchpoint => {
              return (<tr 
                class={touchpoint.isPurchase ? styles.purchase : null}>
                <td>{touchpoint.buyer}</td>
                <td>{
                  touchpoint.dummyDate
                }</td>
                <td>{touchpoint.brand}</td>
                <td>{touchpoint.surface}</td>
              </tr>
              )
            })
          })} 
        </tbody>
      </table>
    </div>
  );
}

function randomItem(someArray) {
  return someArray[Math.floor(Math.random() * someArray.length)]
}

export default App;
