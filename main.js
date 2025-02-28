// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

// 2.a: LOAD...
d3.csv("aircraft_incidents.csv").then(data => {
    console.log('data', data)
    // 2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d.Year = d["Row Labels"];
        delete d["Row Labels"];  
    });
    data.forEach(d => {
        d.Count = d["Count of Accident_Number"];
        delete d['Count of Accident_Number'];
    });
    
    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Year))
    .range([0, width - margin.left - margin.right]);

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Accidents) + 5]) 
    .range([height - margin.top - margin.bottom, 0]);

    // 4.a: PLOT DATA FOR CHART 1
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Define the line generator
    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.Count))
        .curve(d3.curveMonotoneX);

    // Append the line path
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);


    // 5.a: ADD AXES FOR CHART 1

    // 6.a: ADD LABELS FOR CHART 1


    // 7.a: ADD INTERACTIVITY FOR CHART 1
    


});