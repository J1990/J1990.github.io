//https://bl.ocks.org/d3indepth/e3b16f8ca441adfe4ffcd2f6d7b0bba5
//https://csetutorials.com/create-tooltip-mouseover-d3.html
var packLayout = d3.pack()
    .size([680, 680]);

var vehiclesData = null;
var selectedColumn = "year";
var selectedYear = 0;
var selectedVehicleType = "";
var selectedManufacturer = "";

var allYearsArray = []

var bubbleChartSvg = d3.select('.bubbleChart')

var yearDropdown = d3.select(".yearSelector")
    .on("change", onYearChange)

var tooltip = document.getElementById('tooltip');

function make(root) {

    bubbleChartSvg.selectAll('*').remove()

    var gBubbleChartSvg = bubbleChartSvg
        .append("g")
        .attr('transform', 'translate(' + 50 + ',' + 105 + ')')
        .call(d3.zoom().scaleExtent([1 / 2, 8]).on('zoom', zoomed))

    var legendSvg = bubbleChartSvg
        .append("g")
        .attr('transform', 'translate(' + 20 + ',' + 30 + ')')

    var nodes = root.descendants();

    var u = gBubbleChartSvg
        .selectAll('g.node')
        .data(nodes);

    var nodes = u.enter()
        .append('g')
        .classed('node', true)
        .attr('transform', function(d) {
            return 'translate(' + d.y + ',' + d.x + ')';
        });

    nodes.append('circle')
        .attr('r', function(d) {
            return d.r;
        })
        .attr('cursor', 'pointer')
        .attr('class', getStyleForBubble)
        .style('opacity', function(d) {
            if (d.depth == 4) {
                return 0.7
            } else if (d.depth == 2) {
                return 0.3
            } else {
                return 0.1
            }
        })
        .on('click', clicked)
        .on("mousemove", function(d) {

            if (d.data.Manufacturer != undefined) {
                tooltip.innerHTML = 'Manufacturer: ' + d.data.Manufacturer +
                    '<br/>' + 'Count: ' + d.data.Count +
                    '<br/>' + 'Year: ' + d.data.Year;
            } else {
                tooltip.innerHTML = 'Total Vehicles Count: ' + d.value +
                    '<br/>' + 'Year: ' + selectedYear;
            }

            var left = d3.event.pageX;
            var tooltipWidth = parseInt(tooltip.style.width, 10);
            var screenWidth = document.documentElement.clientWidth;
            if ((left + tooltipWidth) > screenWidth) {
                left = screenWidth - tooltipWidth - 20;
            }
            tooltip.style.left = left + 'px';
            tooltip.style.top = (d3.event.pageY + 20) + 'px';

            tooltip.style.opacity = 1;
        })
        .on("mouseout", function() {
            tooltip.style.opacity = 0;
        });

    nodes.each(function(d, i) {

        //Add Legend
        if (d.depth == 2) {
            legendSvg
                .append('circle')
                .attr('transform', function(d) {
                    return 'translate(' + 20 + ',' + ((i - 1) * 35) + ')';
                })
                .attr('cursor', 'pointer')
                .attr('r', 8)
                .attr('data-legend', d.data.key)
                .attr('class', function() { return getStyleForBubble(d); })
                .style('opacity', 0.8)
                .on('click', function() {
                    console.log(d.data.key);
                });

            legendSvg
                .append('g')
                .attr('transform', function(d) {
                    return 'translate(' + 35 + ',' + ((i - 1) * 36) + ')';
                })
                .on('click', function() {
                    console.log(d.data.key);
                })
                .append('text')
                .attr('cursor', 'pointer')
                .style('font-size', 14)
                .style('fill', 'black')
                .style('text-anchor', 'start')
                .text(function() { return getLegendText(d.data.key); });
        }
    });


    // Add title to graph
    bubbleChartSvg.append("text")
        .attr("x", 200)
        .attr("y", 30)
        .attr("text-anchor", "left")
        .style("font-size", "22px")
        .text("Newly registered vehicles in Ireland in " + selectedYear);

    // Add subtitle to graph
    bubbleChartSvg.append("text")
        .attr("x", 200)
        .attr("y", 50)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("Grouped by Vehicle Type and Manufacturer");
}


function dataLoaded(err, data) {

    var uniqueYears = {};

    data.forEach(function(d) {
        uniqueYears[d.Year] = d.Year;
    });

    for (var key in uniqueYears) {
        allYearsArray.push(parseInt(key));
    }
    allYearsArray.sort();

    allYearsArray.forEach(function(year) {
        yearDropdown.append("option")
            .attr("value", year)
            .text(year);
    })

    vehiclesData = data;

    selectedYear = yearDropdown.property("value")

    updateBubbleChart()
    loadEmissionData()
}

function zoomed() {
    this.setAttribute('transform', d3.event.transform)
}

function getStyleForBubble(d) {
    if (d.data.key == 'PassengerCar' || d.data.VehicleType == 'PassengerCar') {
        return 'car';
    } else if (d.data.key == 'HeavyCommercial' || d.data.VehicleType == 'HeavyCommercial') {
        return 'heavy';
    } else if (d.data.key == 'LightCommercial' || d.data.VehicleType == 'LightCommercial') {
        return 'light';
    } else if (d.data.key == 'BusesCoaches' || d.data.VehicleType == 'BusesCoaches') {
        return 'bus';
    }
}

function getLegendText(key) {
    if (key == 'PassengerCar') {
        return 'Passenger Cars'
    }
    if (key == 'HeavyCommercial') {
        return 'Heavy Commercial Vehicles'
    }
    if (key == 'LightCommercial') {
        return 'Light Commercial Vehicles'
    }
    if (key == 'BusesCoaches') {
        return 'Buses/Coaches'
    }
}

function clicked(d) {

    selectedManufacturer = "";
    selectedVehicleType = "";

    if (d.depth == 1) {
        selectedColumn = "year"
    } else if (d.depth == 2) {
        selectedColumn = "vehicleType"
        selectedVehicleType = d.data.key
    } else if (d.depth == 4) {
        selectedColumn = "manufacturer"
        selectedVehicleType = d.data.VehicleType
        selectedManufacturer = d.data.Manufacturer
    }

    updateLineChart()
}

function onYearChange(d) {
    // recover the option that has been chosen
    selectedYear = d3.select(this).property("value");
    // run the updateChart function with this selected option
    updateBubbleChart();

    selectedManufacturer = "";
    selectedVehicleType = "";
    selectedColumn = "year"
    updateLineChart();
    showEmissionData();
}

function updateBubbleChart() {

    var filteredData = vehiclesData.filter(function(d) { return d.Year == selectedYear })

    var nest = d3.nest()
        .key(function(d) { return d.Year; })
        .key(function(d) { return d.VehicleType; })
        .key(function(d) { return d.Manufacturer; })
        .entries(filteredData);

    nest = {
        key: 'root',
        values: nest
    };

    var dataHierarchy = d3.hierarchy(nest, function(d) {
        return d.values;
    }).sum(function(d) {
        return d.Count === undefined ? null : d.Count;
    });

    packLayout(dataHierarchy);
    make(dataHierarchy);
}

d3.csv('vehiclesGranular.csv', dataLoaded);