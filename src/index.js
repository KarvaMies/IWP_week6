import "./styles.css";

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

const buildChart = async () => {
  const data = await getDataPost();
  //console.log(data);

  const areas = Object.keys(data.dimension.Alue.category.label);
  const labels = Object.values(data.dimension.Vuosi.category.label);
  const values = data.value;

  //console.log(areas);
  //console.log(labels);
  //console.log(values);

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

  const chartData = {
    labels: labels,
    datasets: areas
  };

  const chart = new frappe.Chart("#chart", {
    title: "Population growth of Finland",
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"]
  });
};

buildChart();

const getDataGet = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url);
  const data = await res.json();
  //console.log(data);
  return data;
};

const lolxd = async (municipality) => {
  const data = await getDataGet();
  //console.log(data)

  const municipalities = data.variables[1].valueTexts;
  let code;

  //console.log(municipality)
  //console.log(municipalities);
  //console.log(municipalities[165]);

  for (let i = 0; i < municipalities.length; i++) {
    if (municipalities[i].toLowerCase() === municipality) {
      code = data.variables[1].values[i];

      console.log(code + ": " + data.variables[1].valueTexts[i]);
    }
  }
};

/*
TODO - lisää lolxd-funktioon funktiokutsu buildChart(keyword ja saa se toimimaan)
eli hakutoiminto -> muuttaa POST-requestia -> etsii haettavan kunnan (rivi 39)
ja muista tsekata alussa, jos muuttuja.lenght === 0 -> koko suomen kuvaaja eli kuten nyt
*/

const submitButton = document.getElementById("submit-data");
submitButton.addEventListener("click", (event) => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const keyword = document.getElementById("input-area").value.toLowerCase();
  console.log(keyword);
  lolxd(keyword);
});
