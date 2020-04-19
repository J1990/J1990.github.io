//https://bl.ocks.org/uredkar/71c3a0d93cc05527c83cdc12f9549ab3
//https://codepen.io/Asabeneh/pen/RZpYBo

var lineChartSvg = d3.select('.lineChart')

var yearsForLineChart = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
var yearlyEmissionData = null

// set the dimensions and margins of the graph
var margin = { top: 20, right: 40, bottom: 30, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y0 = d3.scaleLinear().range([height, 0]);
var y1 = d3.scaleLinear().range([height, 0]);
var y2 = d3.scaleLinear().range([height, 0]);

// define the 1st line
var valueline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y0(d.NO); });

// define the 2nd line
var valueline2 = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y1(d.CO2); });

// define the 2nd line
var valueline3 = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y2(d.Count); });

var selectedVehiclesChartTitle = '';

// Get the data
function updateLineChart() {

    lineChartSvg.selectAll('*').remove()

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    lineChartSvg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var dataForChart = []

    yearsForLineChart.forEach(function(y) {

        var vehicleCount = 0

        if (selectedColumn == "year") {

            var filteredVehicleData = vehiclesData.filter(function(d) { return d.Year == y })

            vehicleCount = d3.sum(filteredVehicleData, function(d) {
                return d.Count === undefined ? null : d.Count;
            });

            selectedVehiclesChartTitle = "Count of all type of vehicles from 2009 to 2017"

        } else if (selectedColumn == "vehicleType") {

            var filteredVehicleData = vehiclesData.filter(function(d) {
                return d.Year == y &&
                    d.VehicleType == selectedVehicleType
            })

            vehicleCount = d3.sum(filteredVehicleData, function(d) {
                return d.Count === undefined ? null : d.Count;
            });

            selectedVehiclesChartTitle = "Total count of " + getLegendText(selectedVehicleType) + " from 2009 to 2017"

        } else if (selectedColumn == "manufacturer") {
            var filteredVehicleData = vehiclesData.filter(function(d) {
                return d.Year == y &&
                    d.VehicleType == selectedVehicleType &&
                    d.Manufacturer == selectedManufacturer
            })

            vehicleCount = d3.sum(filteredVehicleData, function(d) {
                return d.Count === undefined ? null : d.Count;
            });

            selectedVehiclesChartTitle = "Total count of " + getLegendText(selectedVehicleType) + " by " + selectedManufacturer + " from 2009 to 2017"
        }

        var filteredEmissionData = yearlyEmissionData.filter(function(d) { return d.Year == y })
        dataForChart.push({
            Year: parseInt(y),
            NO: parseFloat(filteredEmissionData[0].NO),
            CO2: parseFloat(filteredEmissionData[0].CO2),
            Count: parseInt(vehicleCount)
        })
    });

    // Scale the range of the data
    x.domain(d3.extent(dataForChart, function(d) { return d.Year; }));
    y0.domain([d3.min(dataForChart, function(d) { return Math.min(d.NO); }) - 5, d3.max(dataForChart, function(d) { return Math.max(d.NO); }) + 5]);
    y1.domain([d3.min(dataForChart, function(d) { return Math.min(d.NO); }) - 1000, d3.max(dataForChart, function(d) { return Math.max(d.CO2); }) + 1000]);
    y2.domain([d3.min(dataForChart, function(d) { return Math.min(d.NO); }) - 5000, d3.max(dataForChart, function(d) { return Math.max(d.Count); }) + 5000]);

    paths = [];
    // Add the valueline path.
    paths[paths.length] = lineChartSvg.append("path")
        .data([dataForChart])
        .attr("class", "line")
        .attr("d", valueline);

    // Add the valueline2 path.
    paths[paths.length] = lineChartSvg.append("path")
        .data([dataForChart])
        .attr("class", "line")
        .style("stroke", "#ff7f0e")
        .attr("d", valueline2);

    // Add the valueline3 path.
    paths[paths.length] = lineChartSvg.append("path")
        .data([dataForChart])
        .attr("class", "line")
        .style("stroke", "#2ca02c")
        .attr("d", valueline3);

    // Add the X Axis
    lineChartSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add the Y0 Axis
    lineChartSvg.append("g")
        .attr("class", "axisSteelBlue")
        .call(d3.axisLeft(y0))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .style("text-anchor", "end")
        .style("font-size", "15px")
        .text("kilotonnes NOx");

    // Add the Y1 Axis
    lineChartSvg.append("g")
        .attr("class", "axisRed")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(y1))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 55)
        .style("text-anchor", "end")
        .style("font-size", "15px")
        .text("kilotonnes CO2");

    //Add the Y2 Axis
    lineChartSvg.append("g")
        .attr("class", "axisPurple")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisLeft(y2))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .style("text-anchor", "end")
        .style("font-size", "15px")
        .text("Vehicles Count");

    onChartMouseOver(dataForChart);

    // Add title to graph
    lineChartSvg.append("text")
        .attr("x", -20)
        .attr("y", -75)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .style("font-weight", "normal")
        .text("Air Quality Index vs Vehicles Count from 2009 to 2017");

    // Add subtitle to graph
    lineChartSvg.append("text")
        .attr("x", -20)
        .attr("y", -45)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "#2ca02c")
        .style("max-width", 400)
        .text(selectedVehiclesChartTitle);

    animateLines(paths)
}

function animateLines(paths) {

    paths.forEach(function(path) {

        var totalLength = [path.node().getTotalLength()]

        path
            .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
            .attr("stroke-dashoffset", totalLength[0])
            .transition()
            .duration(1000)
            .attr("stroke-dashoffset", 0);
    })
}

function emissionDataLoaded(err, data) {
    yearlyEmissionData = data;
    updateLineChart();

    showEmissionData();
}

function loadEmissionData() {
    d3.csv('emission.csv', emissionDataLoaded);
}

function onChartMouseOver(dataForChart) {

    var lines = document.getElementsByClassName("line");
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    color.domain(d3.keys(dataForChart[0]).filter(function(key) {
        return key != "Year";

    }))

    var map = []


    var NOValues = dataForChart.map(function(datum) {
        return {
            Year: datum.Year,
            NO: datum.NO
        }
    })

    var CO2Values = dataForChart.map(function(datum) {
        return {
            Year: datum.Year,
            CO2: datum.CO2
        }
    })

    var CountValues = dataForChart.map(function(datum) {
        return {
            Year: datum.Year,
            Count: datum.Count
        }
    })

    map.push({ name: 'NO', values: NOValues })
    map.push({ name: 'CO2', values: CO2Values })
    map.push({ name: 'Count', values: CountValues })

    var mouseG = lineChartSvg.append("g") // this the black vertical line to folow mouse
        .attr("class", "mouse-over-effects");

    mouseG.append("path")
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var mousePerLine = mouseG.selectAll(".mouse-per-line")
        .data(map)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 7)
        .style("stroke", function(d) {
            return color(d.name);
        })
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

    mouseG.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseout", function() {
            d3.select(".mouse-line").style("opacity", "0");
            d3.selectAll(".mouse-per-line circle").style("opacity", "0");
            d3.selectAll(".mouse-per-line text").style("opacity", "0")
        })
        .on("mouseover", function() {
            d3.select(".mouse-line").style("opacity", "1");
            d3.selectAll(".mouse-per-line circle").style("opacity", "1");
            d3.selectAll(".mouse-per-line text").style("opacity", "1")

        })
        .on("mousemove", function() {

            var mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                })

            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {
                    var xDate = Math.round(x.invert(mouse[0])),
                        bisect = d3.bisector(function(dataPoint) { return dataPoint.Year; }).right;
                    idx = bisect(d.values, xDate);

                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    while (true) {
                        target = Math.floor((beginning + end) / 2)
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target == beginning) && pos.x !== mouse[0]) {
                            break;
                        }

                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; // position found
                    }
                    d3.select(this).select("text")
                        .text(function() {

                            if (i == 0) {
                                return y0.invert(pos.y).toFixed(1)
                            } else if (i == 1) {
                                return y1.invert(pos.y).toFixed(1)
                            } else if (i == 2) {
                                return y2.invert(pos.y).toFixed(1)
                            }
                        })
                        .attr("fill", function(d) {
                            return color(d.name)
                        });
                    return "translate(" + mouse[0] + "," + pos.y + ")";

                });
        });
}