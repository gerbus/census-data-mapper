// UI Design
//
/*

User to be able to select one or multiple interesting metrics, then be able to
walk through highest ranking DAs on the map, based on the average. Exact numbers and containing sub-division name should be listed upon selection as well.

User to be able to filter out DAs that are on a First Nations Reservation

(optional) User should be able to filter results by regional districts (census sub-division)
*/
const readableMetrics = {
  highestDegree_bachelor_pct: "Neighbours have earned a Bachelor's degree",
  householdType_withChildren_pct: "Neighbourhood households have children",
  age_0to4_pct: "Neighbours are aged 0-4",
  age_5to9_pct: "Neighbours are aged 5-9",
  age_40to44_pct: "Neighbours are aged 40-44",
  motherTongue_english_pct: "Neighbours' mother-tongue is English",
  mostCommonSpokenLanguage_english_pct: "Neighbours' most spoken home language is English",
  householdIncome_100kPlus_pct: "Neighbourhood households earn >$100k (gross)",
  householdIncome_100k_to_125k_pct: "Neighbourhood households earn $100k-$125k (gross)",
  householdIncome_125k_to_150k_pct: "Neighbourhood households earn $125k-$150k (gross)",
  householdIncome_150k_to_200k_pct: "Neighbourhood households earn $150k-$200k (gross)",
  housingType_singleDetached_pct: "Neighbourhood dwellings are Single Detached type",
  ethnicOrigin_canadian_pct: "Neighbours' ethnic origin is 'Canadian",
  ethnicOrigin_dutch_pct: "Neighbours' ethnic origin is 'Dutch",
  ethnicOrigin_euro_pct: "Neighbours' ethnic origin is 'European",
  religion_buddhist_pct: "Neighbours are Buddhist",
  religion_christian_pct: "Neighbours are Christian",
  familySize_couplesWithChildren_avg: "Average size of couples-with-children families in the neighbourhood",
}
const mapColors = {
  bulk: '#1c7ec9',
  good: '#1cbbc9',
  better: '#5ec91c',
  best: '#c9c91c'
}
let censusData = []
let selectedData = []
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
  const censusData = await fetch(`${window.location.protocol}//${window.location.host}/census-data`).then(response => response.json())
  return censusData
}
function sortCensusDataBySelectedMetrics(data, selectedMetrics) {
  const dataWithMetricsAverage = data.map(item => {
    const sumMetricsValues = selectedMetrics.reduce((sum, metric) => sum + item[metric],0.0)
    return {
      ...item,
      averageMetrics: sumMetricsValues / selectedMetrics.length
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
function sortBoundaryData(data) {
  const idIndexMap = {};
  selectedData.forEach((item, index) => {
      idIndexMap[parseInt(item.ALT_GEO_CODE)] = index;
  });
  return data.sort((a,b) => {
    return idIndexMap[a.dauid] - idIndexMap[b.dauid]
  })
}
function populateMetricsSelect(censusData, selectElementId) {
  const keys = Object.keys(censusData[0])
  const keysToDisplay = keys.filter(key => {
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

  keysToDisplay.forEach(keyToDisplay => {
    const option = document.createElement('option')
    option.value = keyToDisplay
    option.textContent = readableMetrics[keyToDisplay]
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
    option.textContent = item.CENSUS_DIVISION_NAME ? `${item.GEO_NAME} (${item.CENSUS_DIVISION_NAME}) [${item.averageMetrics}]` : item.GEO_NAME
    newSelectElement.appendChild(option)
  })

  const parentElement = oldSelectElement.parentNode
  parentElement.replaceChild(newSelectElement, oldSelectElement)

  document.getElementById("location-count").textContent = data.length
}

// Handler functions
function handleParamsChange(data) {
  // Only care about neighbourhoods (Dissemination Areas)
  const dataDAs = data.filter(item => item.GEO_LEVEL === "Dissemination area")

  // Use metrics to sort neighbourhoods
  const selectedMetricsOptions = document.querySelectorAll(`#metrics option:checked`)
  const selectedMetrics = Array.from(selectedMetricsOptions).map(option => option.value)
  const sortedData = sortCensusDataBySelectedMetrics(dataDAs, selectedMetrics)

  // Use census divisions to filter location list
  const selectedCensusDivisionOptions = document.querySelectorAll('#census-divisions option:checked')
  const selectedCensusDivisions = Array.from(selectedCensusDivisionOptions).map(option => option.value)
  let filteredData = sortedData
  if (selectedCensusDivisions.length > 0) {
    filteredData = sortedData.filter(item => {
      let selectedCensusDivisionsContainItem = false
      selectedCensusDivisions.forEach(selectedCensusDivision => {
        if (item.CENSUS_DIVISION_NAME === selectedCensusDivision) selectedCensusDivisionsContainItem = true
      })
      return selectedCensusDivisionsContainItem
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

  //console.log(finalData.map(item => item.averageMetrics))
  selectedData = finalData
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
  const ids = selectedData.map(item => item.ALT_GEO_CODE)

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
  fetch(`${window.location.protocol}//${window.location.host}/boundary-data`, {
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
      const sortedData = sortBoundaryData(data)
      const total = sortedData.length
      let count = 0
      let color = '#00f'
      console.log(sortedData)
      sortedData.forEach(item => {
        count++
        if (count >= parseInt(total/2)) color = mapColors.bulk // 50%
        if (count < parseInt(total/2)) color = mapColors.good // 25%
        if (count < parseInt(total/4)) color = mapColors.better // 12.5%
        if (count < parseInt(total/8)) color = mapColors.best // 6.25%
        //if (count < parseInt(total/16)) color = mapColors.best // 6.25%
        const polygon = L.polygon(item.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          _geo_code: item.dauid
        })
        .bindTooltip(buildTooltip(item.dauid))
        .addTo(map)
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
  let sum = 0.0
  metrics.forEach(metric => {
    const metricElement = tooltipElement.querySelectorAll('.metric')[0].cloneNode()
    const metricSplit = metric.split('_')
    let metricVal = da[metric]
    sum += metricVal
    if (metricSplit[metricSplit.length-1] === "pct") {
      metricVal = Math.round(1000 * da[metric])/10 + "%"
    }

    metricElement.textContent = `${readableMetrics[metric]}: ${metricVal}`
    tooltipElement.appendChild(metricElement)
  })

  const averageString = Math.round(1000 * sum / metrics.length)/10 + "%"
  const metricElement = tooltipElement.querySelectorAll('.metric')[0].cloneNode()
  metricElement.textContent = `Average: ${averageString}`
  tooltipElement.appendChild(metricElement)

  return tooltipElement
}
function clearMap() {
  map.eachLayer(function(layer){
    if (layer._path != null) {
      layer.remove()
    }
  });
}
