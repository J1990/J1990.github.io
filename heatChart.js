//https://www.d3-graph-gallery.com/graph/heatmap_style.html
//http://bl.ocks.org/curran/3094b37e63b918bab0a06787e161607b

dataForHeatChart = []
minCO2 = 0;
maxCO2 = 0;
minNO = 0;
maxNO = 0;

// set the dimensions and margins of the graph
var marginHeat = { top: 100, right: 50, bottom: 100, left: 50 },
    widthHeat = 180 - marginHeat.left - marginHeat.right,
    heightHeat = 300 - marginHeat.top - marginHeat.bottom;

// append the svg object to the body of the page
var heatChartSvg = d3.select(".heatChart")

//Read the data
function processHeatData() {

    heatChartSvg.selectAll('*').remove()

    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    var myGroups = d3.map(dataForHeatChart, function(d) { return d.group; }).keys()

    heatChartSvg.attr("width", widthHeat + marginHeat.left + marginHeat.right)
        .attr("height", heightHeat + marginHeat.top + marginHeat.bottom)
        .append("g")
        .attr("transform",
            "translate(" + marginHeat.left + "," + marginHeat.top + ")");

    // Build X scales and axis:
    var xHeat = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.05);
    heatChartSvg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + heightHeat + ")")
        .call(d3.axisBottom(xHeat).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    var yHeat = d3.scaleBand()
        .range([heightHeat, 0])
        .padding(0.05);
    heatChartSvg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(yHeat).tickSize(0))
        .select(".domain").remove()

    // Build color scale
    var myColorNO = d3.scaleSequential()
        .domain([maxNO, minNO])
        .interpolator(d3.interpolateInferno)


    var myColorCO2 = d3.scaleSequential()
        .domain([maxCO2, minCO2])
        .interpolator(d3.interpolateCool)


    // create a tooltip
    var tooltipHeat = d3.select(".tooltipHeat")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
        tooltipHeat
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    var mousemove = function(d) {
        tooltipHeat
            .html(function() {
                if (d.group == "NO") {
                    return "Nitrogen Oxide: " + d.value + " kilotonnes<br/>Year: " + selectedYear;
                } else if (d.group == "CO2") {
                    return "CO2: " + d.value + " kilotonnes<br/>Year: " + selectedYear;
                }
            })
            .style("left", (d3.mouse(this)[0] + 800) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
    }
    var mouseleave = function(d) {
        tooltipHeat
            .style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    // add the squares
    heatChartSvg.selectAll()
        .data(dataForHeatChart, function(d) { return d.group + ':' + d.variable; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return xHeat(d.group) + 50 })
        .attr("y", function(d) { return yHeat(d.variable) })
        .attr("rx", 20)
        .attr("ry", 20)
        .attr("width", xHeat.bandwidth())
        .attr("height", yHeat.bandwidth())
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .transition()
        .duration(2000)
        .style('fill', function(d) {
            if (d.group == 'NO') {
                return myColorNO(parseInt(d.value))
            } else if (d.group == 'CO2') {
                return myColorCO2(d.value)
            }
        })

    startXFoNoLegend = 225

    // Add a legend for the color values.
    var noLegend = heatChartSvg.selectAll(".legend")
        .data(myColorNO.ticks(5).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (startXFoNoLegend + 120 + (i + 1) * 20) + "," + 150 + ")"; });

    noLegend.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .style("fill", myColorNO);

    heatChartSvg.append("text")
        .attr("x", startXFoNoLegend + 145)
        .attr("y", 184)
        .text(parseInt(minNO));

    heatChartSvg.append("text")
        .attr("x", startXFoNoLegend + 304)
        .attr("y", 184)
        .text(parseInt(maxNO));

    heatChartSvg.append("text")
        .attr("class", "label")
        .attr("x", startXFoNoLegend)
        .attr("y", 160)
        .attr("dy", ".35em")
        .text("NO Kilotonnes");

    startXFoCO2Legend = 205

    //Add a legend for the color values.
    var co2Legend = heatChartSvg.selectAll(".legend")
        .data(myColorCO2.ticks(15).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + (startXFoCO2Legend + (i + 1) * 20) + "," + 201 + ")"; });

    co2Legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", myColorCO2);

    heatChartSvg.append("text")
        .attr("x", startXFoCO2Legend + 165)
        .attr("y", 238)
        .text(parseInt(minCO2));

    heatChartSvg.append("text")
        .attr("x", startXFoCO2Legend + 290)
        .attr("y", 238)
        .text(parseInt(maxCO2));

    heatChartSvg.append("text")
        .attr("class", "label")
        .attr("x", startXFoCO2Legend + 20)
        .attr("y", 210)
        .attr("dy", ".35em")
        .text("CO2 Kilotonnes");
}

//https://stackoverflow.com/questions/17438409/color-transition-in-d3-using-time-elapsed
function changeElementColor(d3Element, color) {
    d3Element
        .transition().duration(1000)
        .style("fill", color);
}

function showEmissionData() {

    var filteredData = yearlyEmissionData.filter(function(d) { return d.Year == selectedYear })

    minCO2 = d3.min(yearlyEmissionData, d => parseFloat(d.CO2))
    maxCO2 = d3.max(yearlyEmissionData, d => parseFloat(d.CO2))
    minNO = d3.min(yearlyEmissionData, d => parseFloat(d.NO))
    maxNO = d3.max(yearlyEmissionData, d => parseFloat(d.NO))

    dataForHeatChart = []

    dataForHeatChart.push({
        group: "NO",
        variable: "dummyVar",
        value: parseFloat(filteredData[0].NO)
    })

    dataForHeatChart.push({
        group: "CO2",
        variable: "dummyVar",
        value: parseFloat(filteredData[0].CO2)
    })

    processHeatData();


    // Add title to graph
    heatChartSvg.append("text")
        .attr("x", 50)
        .attr("y", -50)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Air Quality Index for Ireland for the year: " + selectedYear);

    // Add subtitle to graph
    heatChartSvg.append("text")
        .attr("x", 50)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("Nitrogen Oxide and Greenhouse gas emissions by Transport sector");
}