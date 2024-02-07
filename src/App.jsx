import logo from './logo.svg';
import styles from './App.module.css';
import {faker} from '@faker-js/faker'


function App() {
  const buyers = Array(100).fill().map( buyer => {
    return faker.person.firstName()
  })

  const tierOnes = ["Ford", "Honda", "Volkswagen"]

  const sales = buyers
    .map((buyer, index) => {
      if(index < 75) {
        return {
          buyer: buyer,
          date: faker.date.past({years: 2}),
          brand: randomItem(tierOnes)
        }
      } else {
        return {
          buyer: buyer,
          date: null,
          brand: undefined
        }
      }
    })

  const surfaces = ["online", "offline", "dealership"]
  const touchpoints = Array(1000).fill().map( touchpoint => {
    const touch = {
      buyer: randomItem(buyers),
      date: faker.date.past({years: 2}),
      surface: randomItem(surfaces),
      brand: randomItem(tierOnes),
      leadAttributionId: faker.number.int(20000),
      isPurchase: Math.random() > 0.9 ? true : false
    }

    if(touch.isPurchase){
      buyers.splice(buyers.indexOf(touch.buyer), 1)
      touch.surface = "dealership"
    }

    return touch
  })

  const chains = touchpoints.filter(touch => touch.isPurchase).map( sale => {
    const touches = touchpoints
      .filter(touch => 
        touch.buyer == sale.buyer && 
        touch.date != sale.date
      ) // not great
      .sort((a, b) => {
        if(a.date < b.date) {
          return -1
        } else if(a.date > b.date){
          return 1
        } else { return 0}
      
      })
    return [...touches, sale]
  })
  
  console.log(chains)
  
  return (
    <div>
      <div>
        <svg width="200" height="600" xmlns="http://www.w3.org/2000/svg">
          {chains.map((chain, chainIndex) => {
            let chainpoints = ""
            
            console.log(chainpoints)

            for(var i = chain.length-1; i>=0; i--){
              let x = 50
              if(chain[i].surface == "offline") x = 45
              if(chain[i].surface == "online") x = 55

              chainpoints += x + "," + (chainIndex*10+(chain.length-i)*10) + " "
            }
            console.log(chainpoints)
            return (
              <g>
              <polyline points={chainpoints} fill="none" stroke="black" stroke-opacity="0.5"></polyline>
              <circle fill="red" stroke="none" cx="50" cy={chainIndex*10} r="3"></circle>
              </g>
            )
          })}
        </svg>
      </div>
      <table>
        {touchpoints.map( touchpoint => (
          <tr 
            class={touchpoint.isPurchase ? styles.purchase : null}>
            <td>{touchpoint.buyer}</td>
            <td>{
              touchpoint.date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) // extract to an Intl.DateTimeFormat
            }</td>
            <td>{touchpoint.brand}</td>
            <td>{touchpoint.surface}</td>
          </tr>
        ))}
      </table>
    </div>
  );
}

function randomItem(someArray) {
  return someArray[Math.floor(Math.random() * someArray.length)]
}

export default App;
