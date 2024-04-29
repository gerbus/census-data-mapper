// todo:


// Processing Census Data
// 0. Get census data from Census Canada (https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/download-telecharger.cfm?Lang=E)
// 1. Run filter-csv-by-characteristic-ids on csv saved from census canada. Cuts the size of the data down significantly for subsequent processing, by selecting a subset of characteristics. Outputs a new (filtered) csv (canada-census-2021-bc-filtered.csv)
// 2. Run transform-csv-to-json on csv from above. Massages the data into a more workable json format. Outputs a json file (canada-census-2021-bc-filtered.json)
// 3. Run calculate-derived-metrics-and-save on json file above. Calculates percentages and adds to the data and data model. Outputs new json file and a csv file (canada-census-2021-bc-derived.*)
// 4. After this, need to upload canada-census-2021-bc-derived.json to server.
//    cd data
//    scp canada-census-2021-bc-derived.json gerbus@gerbus.ca:/gerbus.ca/node/census-data-mapper/server/assets/canada-census-2021-bc-derived.json


// Processing Boundary Data
// 0. Get boundary file data from census canda
// 1. Run transform-gml-to-json on boundary file data from census canada. Pulls out the posList for each DGUID (ALT_GEO_CODE), converts that to an array of coordinates for each DGUID. Outputs json file.
// 2. After this, need to upload to server
//    scp canada-census-2021-boundary-data.json gerbus@gerbus.ca:/gerbus.ca/node/census-data-mapper/server/assets/canada-census-2021-boundary-data.json
