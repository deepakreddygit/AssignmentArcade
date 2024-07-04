const { zoom } = d3;
const scatterMargin = { top: 60, right: 100, bottom: 60, left: 70 },
      scatterWidth = 960 - scatterMargin.left - scatterMargin.right,
      scatterHeight = 600 - scatterMargin.top - scatterMargin.bottom;
const scatterSvg = d3.select("#scatterplot")
  .append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
  .append("g")
    .attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`);
// X-Axis
scatterSvg.append("text")
    .attr("text-anchor", "end")
    .attr("x", scatterWidth / 2 + scatterMargin.left)
    .attr("y", scatterHeight + scatterMargin.top + -10)
    .style("font-weight", "bold")
    .text("Weight");
// Y-Axis 
scatterSvg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -scatterMargin.left + 20)
    .attr("x", -scatterHeight / 2)
    .text("MPG")
    .style("font-weight", "bold");
// Title for the Scatter Plot
scatterSvg.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Scatter Plot of Weight vs MPG")
    .style("font-weight", "bold");
    const scatterZoom = d3.zoom()
    .scaleExtent([1, 10]) 
    .on("zoom", zoomed);
scatterSvg.call(scatterZoom);
function zoomed(event) {
    const { transform } = event;
    scatterSvg.selectAll(".dot")
        .transition()
        .duration(200)
        .attr("r", d => 5 * transform.k);

    // Reset the zoom transform when zooming is reset
    if (transform.k === 1 && transform.x === 0 && transform.y === 0) {
        scatterSvg.selectAll(".dot")
            .transition()
            .duration(200) 
            .attr("r", 5); 
    }
}
const barMargin = { top: 40, right: 20, bottom: 100, left: 70 },
      barWidth = 9200 - barMargin.left - barMargin.right,
      barHeight = 500 - barMargin.top - barMargin.bottom;
const barSvg = d3.select("#barchart")
  .append("svg")
    .attr("width", barWidth + barMargin.left + barMargin.right)
    .attr("height", barHeight + barMargin.top + barMargin.bottom)
  .append("g")
    .attr("transform", `translate(${barMargin.left},${barMargin.top})`);
// X-Axis
barSvg.append("text")
    .attr("class", "x axis-label")
    .attr("text-anchor", "start")
    .attr("x", 0) 
    .attr("y", barHeight + barMargin.top + 60) 
    .text("Car Model") 
    .style("font-weight", "bold"); 
// Y-Axis 
barSvg.append("text")
.attr("class", "y axis-label")
.attr("text-anchor", "end")
.attr("transform", "rotate(-90)")
.attr("y", -barMargin.left + 20) 
.attr("x", -barHeight / 2)
.style("font-size", "14px")
.text("Weight")
.style("font-weight", "bold");
// Title 
barSvg.append("text")
    .attr("class", "chart-title")
    .attr("x", 0) 
    .attr("y", -barMargin.top + 20) 
    .attr("text-anchor", "start") 
    .style("font-size", "16px")
    .text("Distribution of Car Weights"); 
//tooltip
const tooltip = d3.select("#tooltip");
// Load data 
d3.csv("a1-cars.csv").then(data => {
    // Parse and prepare the data
    data.forEach(d => {
        d.MPG = +d.MPG;
        d.Weight = +d.Weight;
    });
    // Scatter plot scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Weight))
        .range([0, scatterWidth]);
        const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.MPG))
        .range([scatterHeight, 0]);
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.Origin));
    // Bar chart scales 
    const xBarScale = d3.scaleBand()
        .domain(data.map(d => d.Car))
        .range([0, barWidth])
        .paddingInner(0.9) 
    .paddingOuter(0.9);
    let selectedAttribute = "Weight"; 
    const yBarScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[selectedAttribute])])
        .range([barHeight, 0]);


    scatterSvg.append("g")
        .attr("transform", `translate(0,${scatterHeight})`)
        .call(d3.axisBottom(xScale));
    scatterSvg.append("g")
        .call(d3.axisLeft(yScale));
barSvg.append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .call(d3.axisBottom(xBarScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-1em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-90)");
barSvg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xBarScale(d.Car))
    .attr("y", d => yBarScale(d[selectedAttribute]))
    .attr("width", xBarScale.bandwidth() * 1.8)
    .attr("height", d => barHeight - yBarScale(d[selectedAttribute]))
    .attr("fill", d => {
        if (d.Origin === "American") return "rgb(31, 119, 180)";
        else if (d.Origin === "European") return "rgb(255, 127, 14)";
        else if (d.Origin === "Japanese") return "rgb(44, 160, 44)";
        else return "gray";
    })
    .on("mouseover", (event, d) => {
    
        tooltip.style("opacity", 1)
            .html(`Car: ${d.Car}<br>${selectedAttribute}: ${d[selectedAttribute]}`)
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`);
    })
    .on("mouseout", () => {
      
        tooltip.style("opacity", 0);
    });
    barSvg.append("g")
        .call(d3.axisLeft(yBarScale));
    scatterSvg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.Weight))
            .attr("cy", d => yScale(d.MPG))
            .attr("r", 5)
            .style("fill", d => colorScale(d.Origin))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Car: ${d.Car}<br>MPG: ${d.MPG}<br>Weight: ${d.Weight}<br>Origin: ${d.Origin}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
barSvg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xBarScale(d.Car))
    .attr("y", d => yBarScale(d[selectedAttribute]))
    .attr("width", xBarScale.bandwidth())
    .attr("height", d => barHeight - yBarScale(d[selectedAttribute]))
    .attr("fill", "steelblue")
window.updateBarChart = function(newAttribute) {
  selectedAttribute = newAttribute;
  // Update Y-axis
  barSvg.select(".y.axis-label")
      .text(selectedAttribute)
      .style("font-weight", "bold");
  // Update title
  barSvg.select(".chart-title")
      .text(`Distribution of ${selectedAttribute}`)
      .style("font-weight", "bold");
  yBarScale.domain([0, d3.max(data, d => d[selectedAttribute])]);
// Y-axis
  barSvg.selectAll(".bar")
      .data(data)
      .transition()
      .duration(750)
      .attr("y", d => yBarScale(d[selectedAttribute]))
      .attr("height", d => barHeight - yBarScale(d[selectedAttribute]));

  barSvg.select(".y-axis")
      .transition()
      .duration(750)
      .call(d3.axisLeft(yBarScale));
};
    document.getElementById('attributeSelector').addEventListener('change', function() {
        updateBarChart(this.value);
    });
    //brush
const scatterBrush = d3.brush()
.extent([[0, 0], [scatterWidth, scatterHeight+100]])
.on("brush end", brushed);
function brushed(event) {
const selection = event.selection;
if (selection) {
    const [[x0, y0], [x1, y1]] = selection;
    const filteredData = data.filter(d =>
        xScale(d.Weight) >= x0 && xScale(d.Weight) <= x1 &&
        yScale(d.MPG) >= y0 && yScale(d.MPG) <= y1);
    // Update bar chart 
    updateBarChartWithData(filteredData);
    updateLineChartWithData(filteredData);
   
} else {
    updateBarChartWithData(data);
}
}
function updateBarChartWithData(filteredData) {
  const bars = barSvg.selectAll(".bar")
      .data(filteredData, d => d.Car); 
  bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xBarScale(d.Car))
      .attr("width", xBarScale.bandwidth())
      .attr("y", barHeight) 
      .attr("height", 0) 
      .attr("fill", "steelblue") 
      .merge(bars) 
      .transition().duration(750)
      .attr("y", d => yBarScale(d[selectedAttribute]))
      .attr("height", d => barHeight - yBarScale(d[selectedAttribute]));
  bars.exit().transition().duration(750)
      .attr("y", barHeight) 
      .attr("height", 0) 
      .remove(); 
}
//brushing
document.getElementById('toggleBrush').addEventListener('change', function() {
if (this.checked) {
    scatterSvg.append("g")
        .attr("class", "brush")
        .call(scatterBrush);
} else {
    scatterSvg.select(".brush").remove();
    updateBarChartWithData(data);
    updateLineChartWithData(data); 
}
});
const legend = scatterSvg.append("g")
.attr("class", "legend")
.attr("transform", `translate(${scatterWidth - 120}, 20)`)
.style("font-size", "12px");

colorScale.domain().forEach(function(d, i) {
let legendRow = legend.append("g")
    .attr("transform", `translate(0, ${i * 20})`);

legendRow.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", colorScale(d));

legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .text(d);
});
function appendLegend(svg, width, colorScale) {
  const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100}, 20)`)
      .style("font-size", "12px");

  colorScale.domain().forEach(function(d, i) {
      const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", colorScale(d));

      legendRow.append("text")
          .attr("x", 20)
          .attr("y", 10)
          .text(d);
  });
}

//LINE CHART
    const lineMargin = { top: 40, right: 20, bottom: 70, left: 70 },
        lineWidth = 960 - lineMargin.left - lineMargin.right,
        lineHeight = 300 - lineMargin.top - lineMargin.bottom;
    const lineSvg = d3.select("#linechart")
        .append("svg")
        .attr("width", lineWidth + lineMargin.left + lineMargin.right)
        .attr("height", lineHeight + lineMargin.top + lineMargin.bottom)
        .append("g")
        .attr("transform", `translate(${lineMargin.left},${lineMargin.top})`);
    // X-Axis
    lineSvg.append("text")
        .attr("text-anchor", "end")
        .attr("x", lineWidth / 2 + lineMargin.left)
        .attr("y", lineHeight + lineMargin.top + 30)
        .style("font-weight", "bold")
        .text("Model Year");
    // Y-Axis 
    lineSvg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -lineMargin.left + 20)
        .attr("x", -lineHeight / 2)
        .text("MPG")
        .style("font-weight", "bold");
    // Title 
    lineSvg.append("text")
        .attr("x", lineWidth / 2)
        .attr("y", -lineMargin.top + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Trends in MPG Over Years")
        .style("font-weight", "bold");
    const xLineScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d["Model Year"]))
        .range([0, lineWidth]);
    const yLineScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.MPG))
        .range([lineHeight, 0]);
    const line = d3.line()
        .x(d => xLineScale(d["Model Year"]))
        .y(d => yLineScale(d.MPG));
    lineSvg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
    //  x axis 
    lineSvg.append("g")
        .attr("transform", `translate(0, ${lineHeight})`)
        .call(d3.axisBottom(xLineScale));
    //  y axis
    lineSvg.append("g")
        .call(d3.axisLeft(yLineScale));
    const tooltip = d3.select("#tooltip");

    lineSvg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xLineScale(d["Model Year"]))
        .attr("cy", d => yLineScale(d.MPG))
        .attr("r", 4)
        .style("fill", d => {
            if (d.Origin === "American") return "rgb(31, 119, 180)";
            else if (d.Origin === "European") return "rgb(255, 127, 14)";
            else if (d.Origin === "Japanese") return "rgb(44, 160, 44)";
            else return "gray";
        })
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Car: ${d.Car}<br>MPG: ${d.MPG}<br>Model Year: ${d["Model Year"]}`)
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
function updateLineChartWithData(filteredData) {
    lineSvg.selectAll(".line").remove();
    const line = d3.line()
      .x(d => xLineScale(d["Model Year"]))
      .y(d => yLineScale(d.MPG));
  
    lineSvg.append("path")
      .datum(filteredData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  }
  const lineZoom = zoom()
  .scaleExtent([1, 10])
  .on("zoom", zoomed);

lineSvg.call(lineZoom);

function zoomed(event) {
    const { transform } = event;
 
    lineSvg.selectAll(".line, .dot")
        .attr("transform", transform); 
 

    lineSvg.selectAll(".dot")
        .attr("r", 4 / transform.k);
 

    lineSvg.selectAll(".x.axis-label, .y.axis-label, .chart-title")
        .attr("transform", `scale(${1 / transform.k}) translate(${transform.x},${transform.y})`); 

    if (transform.k === 1 && transform.x === 0 && transform.y === 0) {
        lineSvg.selectAll(".line, .dot").attr("transform", null); 
        lineSvg.selectAll(".dot").attr("r", 4); 
        lineSvg.selectAll(".x.axis-label, .y.axis-label, .chart-title").attr("transform", null); 
    }
 }
 
        // Defining legend
        const barLegendData = [
            { label: "American", color: "rgb(31, 119, 180)" },
            { label: "European", color: "rgb(255, 127, 14)" },
            { label: "Japanese", color: "rgb(44, 160, 44)" }
        ];
        const barLegend = d3.select("#barchart-container").append("svg")
            .attr("width", 120)
            .attr("height", 80)
            .append("g")
            .attr("transform", "translate(10, 10)");
        
        barLegend.selectAll("rect")
            .data(barLegendData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => d.color);
        
        barLegend.selectAll("text")
            .data(barLegendData)
            .enter().append("text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d.label)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
        
        //  legend 
        const lineLegendData = [
            { label: "American", color: "rgb(31, 119, 180)" },
            { label: "European", color: "rgb(255, 127, 14)" },
            { label: "Japanese", color: "rgb(44, 160, 44)" }
        ];
        const lineLegend = d3.select("#linechart-container").append("svg")
            .attr("width", 120)
            .attr("height", 80)
            .append("g")
            .attr("transform", "translate(10, 10)");
        
        lineLegend.selectAll("rect")
            .data(lineLegendData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => d.color);
        
        lineLegend.selectAll("text")
            .data(lineLegendData)
            .enter().append("text")
            .attr("x", 15)
            .attr("y", (d, i) => i * 20 + 9)
            .text(d => d.label)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");


   
}).catch(error => {
    console.error("Error loading the data: ", error);
});



