// UI Design
//
/*

User to be able to select one or multiple interesting metrics, then be able to
walk through highest ranking DAs on the map, based on the average. Exact numbers and containing sub-division name should be listed upon selection as well.

User to be able to filter out DAs that are on a First Nations Reservation

(optional) User should be able to filter results by regional districts (census sub-division)
*/
const readableMetrics = {
  age_0to4_pct: "Probability that neighbours are aged 0-4",
  age_5to9_pct: "Probability that neighbours are aged 5-9",
  age_40to44_pct: "Probability that neighbours are aged 40-44",
  householdType_withChildren_pct: "Probability that neighbourhood households have children",
  housingType_singleDetached_pct: "Probability that a neighbourhood dwelling is Single Detached",
  householdIncome_100kPlus_pct: "Probability that neighbourhood households earn >$100k (gross)",
  familySize_couplesWithChildren_avg: "Average couples-with-children family size in the neighbourhood",
  motherTongue_english_pct: "Probability that neighbours' mother-tongue is English",
  ethnicOrigin_canadian_pct: "Probability that neighbours' ethnic origin is 'Canadian",
  ethnicOrigin_dutch_pct: "Probability that neighbours' ethnic origin is 'Dutch",
  ethnicOrigin_euro_pct: "Probability that neighbours' ethnic origin is 'European",
  religion_buddhist_pct: "Probability that neighbours are Buddhist",
  religion_christian_pct: "Probability that neighbours are Christian",
  highestDegree_bachelor_pct: "Probability that neighbours have earned a Bachelor's degree",
}
let censusData = []
let map
async function main() {
  initiatlizeMap()
  censusData = await getCensusData()
  populateMetricsSelect(censusData, 'metrics')
  populateCensusDivisionsSelect(censusData, 'census-divisions')
  document.getElementById('submit').addEventListener('click', handleButtonClick)
}
main()

// Data functions
async function getCensusData() {
  const censusData = await fetch("https://neighbourhood.gerbus.ca/census-data").then(response => response.json())
  return censusData
}
function sortCensusDataByMetrics(data, metrics) {
  const dataWithMetricsAverage = data.map(item => {
    const averagedMetricsValue = metrics.reduce((product, metric) => product * item[metric],1)
    return {
      ...item,
      averageMetrics: averagedMetricsValue
    }
  })
  var sortedData = dataWithMetricsAverage.sort(function(a,b) {
    if (a.averageMetrics > b.averageMetrics) {
      return -1; // Return -1 if a should come before b
    }
    if (a.averageMetrics < b.averageMetrics) {
      return 1; // Return 1 if a should come after b
    }
    return 0; // Return 0 if a and b are equal
  })
  return sortedData
}
function populateMetricsSelect(censusData, selectElementId) {
  const keys = Object.keys(censusData[0])
  const selectedKeys = keys.filter(key => {
    const split = key.split("_")
    if (split[0] === "ethnicOrigin") return false
    switch (split[split.length-1]) {
      case "avg":
        return true
      case "pct":
        return true
    }
    return false
  })

  const oldSelectElement = document.getElementById(selectElementId)
  const newSelectElement = oldSelectElement.cloneNode(false)

  selectedKeys.forEach(selectedKey => {
    const option = document.createElement('option')
    option.value = selectedKey
    option.textContent = readableMetrics[selectedKey]
    newSelectElement.appendChild(option)
  })

  const parentElement = oldSelectElement.parentNode
  parentElement.replaceChild(newSelectElement, oldSelectElement)

  document.getElementById("metrics").style.display = "table-row"
  document.getElementById("metrics-loader").style.display = "none"
}
function populateCensusDivisionsSelect(censusData, selectElementId) {
  const censusDivisions = [...new Set(censusData.map(item => item.CENSUS_DIVISION_NAME))].sort()

  const selectElement = document.getElementById(selectElementId)
  censusDivisions.forEach(censusDivision => {
    const option = document.createElement('option')
    option.value = censusDivision
    option.textContent = censusDivision
    if (censusDivision != null) {
      selectElement.appendChild(option)
    }
  })

  document.getElementById("census-divisions").style.display = "table-row"
  document.getElementById("census-divisions-loader").style.display = "none"
}
function populateLocationsSelect(data, selectElementId) {
  const oldSelectElement = document.getElementById(selectElementId)
  const newSelectElement = oldSelectElement.cloneNode(false)

  data.forEach(item => {
    const option = document.createElement('option')
    option.value = item.ALT_GEO_CODE
    option.textContent = item.CENSUS_DIVISION_NAME ? `${item.GEO_NAME} (${item.CENSUS_DIVISION_NAME})` : item.GEO_NAME
    newSelectElement.appendChild(option)
  })

  const parentElement = oldSelectElement.parentNode
  parentElement.replaceChild(newSelectElement, oldSelectElement)

  document.getElementById("location-count").textContent = data.length
}

// Handler functions
function handleParamsChange(data) {
  // Only care about Dissemination Areas
  const dataDAs = data.filter(item => item.GEO_LEVEL === "Dissemination area")

  // Use metrics to sort location list
  const selectedMetricsOptions = document.querySelectorAll(`#metrics option:checked`)
  const metrics = Array.from(selectedMetricsOptions).map(option => option.value)
  const sortedData = sortCensusDataByMetrics(dataDAs, metrics)

  // Use census divisions to filter location list
  const selectedCensusDivisionOptions = document.querySelectorAll('#census-divisions option:checked')
  const selectedCensusDivisions = Array.from(selectedCensusDivisionOptions).map(option => option.value)
  let filteredData = sortedData
  if (selectedCensusDivisions.length > 0) {
    filteredData = sortedData.filter(item => {
      let itemMatchesSelectedCensusDivision = false
      selectedCensusDivisions.forEach(selectedCensusDivision => {
        if (item.CENSUS_DIVISION_NAME === selectedCensusDivision) itemMatchesSelectedCensusDivision = true
      })
      return itemMatchesSelectedCensusDivision
    })
  }

  // Use lowerbound percentage to segment location list
  // const lowerBound = document.getElementById("lower-bound").value
  // let boundedData = filteredData
  // if (lowerBound !== "") {
  //   boundedData = filteredData.filter(item => 100 * item.averageMetrics >= parseInt(lowerBound))
  // }

  // Use result size to segment location list
  const numResults = document.getElementById("result-size").value
  // let finalData = boundedData
  let finalData = filteredData
  if (numResults !== "") {
    finalData = filteredData.slice(0,parseInt(filteredData.length * parseInt(numResults) / 100))
  }

  populateLocationsSelect(finalData, 'location')
}
function handleLocationChange() {
  // // Get the selected value from the select element
  // var selectedValue = document.getElementById('location').value
  // highlightGeos([selectedValue])
}
function handleButtonClick(e) {
  e.preventDefault()
  clearMap()

  // Locations are sorted and filtered as controls are adjusted
  const locations = Array.from(document.querySelectorAll(`#location option`))
  const ids = locations.map(option => option.value)

  highlightGeos(ids)
}

// Display functions
function initiatlizeMap() {
  // Initialize and display the map
  map = L.map('map').setView([53.9, -122.7], 5); // Center and zoom the map to BC
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}
function highlightGeos(idsArray) {
  // Display loading animation
  document.getElementById('map-overlay').style.display = "table-cell"

  // Fetch boundary data for ids
  fetch("https://neighbourhood.gerbus.ca/boundary-data", {
    method: "POST",
    body: JSON.stringify({
      ids: idsArray
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then(response => response.json())
    .then(data => {
      const total = data.length
      let count = 0
      let color = '#00f'
      data.forEach(item => {
        count++
        if (count < total/2) color = '#40d'
        if (count < total/4) color = '#80b'
        if (count < total/8) color = '#808'
        if (count < total/16) color = '#b08'
        if (count < total/32) color = '#d04'
        if (count < total/64) color = '#f00'
        const polygon = L.polygon(item.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          _geo_code: item.dauid
        })
        .bindTooltip(buildTooltip(item.dauid))
        .addTo(map)
        polygon.on('mouseover', function(e) {
          console.log(item.dauid)
        })
        //map.fitBounds(polygon.getBounds())
      })
    })
    .then(() => {
      document.getElementById('map-overlay').style.display = "none"
    })
}
function buildTooltip(dauid) {
  const da = censusData.find(censusItem => censusItem.ALT_GEO_CODE === dauid)

  // Build a tooltip that shows the relevant metrics plus a bit of meta
  const tooltipElement = document.getElementById('tooltip').cloneNode(true)
  tooltipElement.querySelectorAll('.DAID')[0].textContent = `ID: ${dauid}`
  tooltipElement.querySelectorAll('.division')[0].textContent = `Division: ${da.CENSUS_DIVISION_NAME}`

  // Display selected metrics
  const selectedMetricsOptions = document.querySelectorAll(`#metrics option:checked`)
  const metrics = Array.from(selectedMetricsOptions).map(option => option.value)
  metrics.forEach(metric => {
    const metricElement = tooltipElement.querySelectorAll('.metric')[0].cloneNode()
    const metricSplit = metric.split('_')
    let metricVal = da[metric]
    if (metricSplit[metricSplit.length-1] === "pct") {
      metricVal = Math.round(1000 * da[metric])/10 + "%"
    }

    metricElement.textContent = `${readableMetrics[metric]}: ${metricVal}`
    tooltipElement.appendChild(metricElement)
  })


  return tooltipElement
}
function clearMap() {
  map.eachLayer(function(layer){
    if (layer._path != null) {
      layer.remove()
    }
  });
}
