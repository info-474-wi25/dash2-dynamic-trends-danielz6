// Set up the SVG canvas dimensions
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Select the existing SVG in index.html
const svg = d3.select("#lineChart1")
    .append("g") 
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {
    console.log("Loaded Data:", data);
    console.log("Column Names:", Object.keys(data[0]));

//2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d.Year = +d["Row Labels"]; 
        d.Count = +d["Count of Accident_Number"]; 
    });
    data.sort((a, b) => a.Year - b.Year);

    console.log("Years:", data.map(d => d.Year)); 
    console.log("Counts:", data.map(d => d.Count));  

    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Count) / 8])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
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

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 150}, 10)`);
    
    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "steelblue");
    
    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text("Aircraft Incidents");

});
