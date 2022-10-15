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

const buildChart = async (areaCode, name) => {
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
  const labels = Object.values(data.dimension.Vuosi.category.label);
  const values = data.value;

  areas.forEach((area, index) => {
    let areaPopulation = [];
    for (let i = 0; i < labels.length; i++) {
      areaPopulation.push(values[i * areas.length + index]);
    }
    areas[index] = {
      name: area,
      values: areaPopulation
    };
  });

  if (typeof name !== "undefined") {
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

const getDataGet = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const findArea = async (municipality) => {
  const data = await getDataGet();

  const municipalities = data.variables[1].valueTexts;
  let areaCode;

  for (let i = 0; i < municipalities.length; i++) {
    if (municipalities[i].toLowerCase() === municipality.toLowerCase()) {
      areaCode = data.variables[1].values[i];

      console.log(areaCode + ": " + data.variables[1].valueTexts[i]);
      break;
    }
  }
  if (typeof areaCode === "undefined") {
    areaCode = "SSS";
    municipality = "Finland";
  }

  console.log("Municipality: " + municipality + "\nArea code: " + areaCode);
  buildChart(areaCode, municipality);
};

buildChart();

const submitButton = document.getElementById("submit-data");
submitButton.addEventListener("click", (event) => {
  event.preventDefault();
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const keyword = document.getElementById("input-area").value;
  console.log();
  findArea(keyword);
});
