import "./styles.css";
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const municipalitiesMap = new Map();
let areaPopulation = [];
let labels = [];
let keyword = "";

const getDataPost = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery)
  });
  if (!res.ok) {
    return;
  }
  const data = await res.json();
  return data;
};

const buildChart = async (areaCode, name, newDataPoint) => {
  let title = "Population growth of Finland";

  if (typeof areaCode !== "undefined") {
    console.log("areaCode is not undefined");
    jsonQuery.query[1].selection.values.shift();
    jsonQuery.query[1].selection.values.push(areaCode);
  } else {
    console.log("areaCode is undefined");
  }

  const data = await getDataPost();

  const areas = Object.keys(data.dimension.Alue.category.label);
  if (newDataPoint === 0) {
    labels = Object.values(data.dimension.Vuosi.category.label);
  } else {
    labels.push(parseInt(labels[labels.length - 1], 10) + 1);
    areaPopulation.push(newDataPoint);
  }
  const values = data.value;

  areas.forEach((area, index) => {
    for (let i = 0; i < labels.length; i++) {
      areaPopulation.push(values[i * areas.length + index]);
    }
    areas[index] = {
      name: area,
      values: areaPopulation
    };
  });

  if (typeof name !== "undefined" && name !== "WHOLE COUNTRY") {
    title = "Population growth of " + name;
  }

  const chartData = {
    labels: labels,
    datasets: areas
  };

  const chart = new Chart("#chart", {
    title: title,
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"]
  });
};

const initializeMunicipalityData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url);
  const data = await res.json();

  for (let i = 0; i < data.variables[1].values.length; i++) {
    municipalitiesMap.set(
      data.variables[1].valueTexts[i].toLowerCase(),
      data.variables[1].values[i]
    );
  }

  console.log(municipalitiesMap);
};

const findArea = (municipality, newDataPoint) => {
  let areaCode;

  if (municipalitiesMap.has(municipality.toLowerCase())) {
    areaCode = municipalitiesMap.get(municipality.toLowerCase());
  } else {
    areaCode = "SSS";
    municipality = "Finland";
  }

  console.log("Municipality: " + municipality + "\nArea code: " + areaCode);
  if (newDataPoint === 0) {
    buildChart(areaCode, municipality, 0);
  }
  return [areaCode, municipality];
};

initializeMunicipalityData();
buildChart("SSS", "WHOLE COUNTRY", 0);

const submitButton = document.getElementById("submit-data");
submitButton.addEventListener("click", (event) => {
  event.preventDefault();

  keyword = document.getElementById("input-area").value;
  console.log();
  findArea(keyword);
});

const calculateDataPoint = document.getElementById("add-data");
calculateDataPoint.addEventListener("click", (event) => {
  event.preventDefault();

  let dataPoint = 0;
  let i = 1;
  for (i; i < areaPopulation.length; i++) {
    dataPoint += areaPopulation[i] - areaPopulation[i - 1];
  }
  dataPoint = Math.round(
    dataPoint / (i - 1) + areaPopulation[areaPopulation.length - 1]
  );
  const aCode = findArea(keyword, dataPoint);
  console.log(aCode);
  buildChart(aCode[0], aCode[1], dataPoint);
});
