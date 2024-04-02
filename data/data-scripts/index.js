// todo:


// Processing Census Data
// 1. Run filter-csv-by-characteristic-ids on csv saved from census canada. Cuts the size of the data down significantly for subsequent processing, by selecting a subset of characteristics. Outputs a new (filtered) csv.
// 2. Run transform-csv-to-json on csv from above. Massages the data into a more workable json format. Outputs a json file.
// 3. Run calculate-derived-metrics-and-save on json file above. Calculates percentages and adds to the data and data model. Outputs new json file and a csv file.


// Processing Boundary Data
// 1. Run transform-gml-to-json on boundary file data from census canada. Pulls out the posList for each DGUID (ALT_GEO_CODE), converts that to an array of coordinates for each DGUID. Outputs json file.
