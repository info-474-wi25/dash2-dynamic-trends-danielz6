// / Set up the SVG canvas dimensions
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Select the existing SVG in index.html
const svg = d3.select("#lineChart1")
    .append("g") 
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

let xScale, yScale, flattenedData;
// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {
    console.log("Loaded Data:", data);
    console.log("Column Names:", Object.keys(data[0]));

//2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d.Year = new Date(d["Event_Date"]).getFullYear(); 
        d.Make = d["Make"]
    }); 
    data.sort((a, b) => a.Year - b.Year);
    const aggregatedData = Array.from(
        d3.rollup(data, v => v.length, d => d.Year, d => d.Make),
        ([year, makeMap]) => {
            return Array.from(makeMap, ([make, count]) => ({
                Year: +year,
                Make: make,
                Count: count
            }));
        }
    ).flat();
    console.log("Aggregated Data:", aggregatedData);
    flattenedData = aggregatedData; 
    // 3.a: SET SCALES FOR CHART 1
    xScale = d3.scaleLinear()
        .domain(d3.extent(aggregatedData, d => d.Year))
        .range([0, width]);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(aggregatedData, d => d.Count)])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Count))
        .curve(d3.curveMonotoneX);
    
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Number of Incidents");

        updateChart("all");
        

});
document.addEventListener("DOMContentLoaded", function() {
    d3.select("#categorySelect").on("change", function() {
      var selectedMake = d3.select(this).property("value");
      updateChart(selectedMake);
    });
});

function updateChart(selectedMake) {
    if (selectedMake === "all") {
        const totalByYear = d3.rollup(
            flattenedData,
            v => d3.sum(v, d => d.Count),
            d => d.Year
        );
        selectedMakeData = Array.from(totalByYear, ([year, count]) => ({ Year: +year, Count: count }));
    } else {
        selectedMakeData = flattenedData.filter(d => d.Make === selectedMake);
    }

    const [minYear, maxYear] = xScale.domain();
    const fullSeries = d3.range(minYear, maxYear + 1).map(year => {
        const entry = selectedMakeData.find(d => d.Year === year);
        return { Year: year, Count: entry ? entry.Count : 0 };
    });
    
    console.log("Full Series for", selectedMake, ":", fullSeries);
    
    const newMax = d3.max(fullSeries, d => d.Count);
    yScale.domain([0, newMax]);
    
    svg.select("g.y-axis")
       .transition()
       .duration(500)
       .call(d3.axisLeft(yScale));
    
    svg.selectAll("path.data-line").remove();
    svg.selectAll(".trendline").remove();
    
    svg.selectAll("path.data-line")
      .data([selectedMakeData]) 
      .enter()
      .append("path")
      .attr("class", "data-line")
      .attr("d", d3.line()
          .x(function(d) { return xScale(d.Year); })
          .y(function(d) { return yScale(d.Count); })
          .curve(d3.curveMonotoneX)
      )
      .style("stroke", "steelblue")
      .style("fill", "none")
      .style("stroke-width", 2);
    }