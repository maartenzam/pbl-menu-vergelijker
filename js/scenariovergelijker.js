let height = 400;
let width = 400;
let barWidth = 80;

let svg = d3.select("#viz")
    .attr("width", width)
    .attr("height", height)
    .append("g");
let svgLand = d3.select("#viz-land")
    .attr("width", width)
    .attr("height", height)
    .append("g");

let yCo2 = d3.scaleLinear()
    .range([height, 0]);
let yLand = d3.scaleLinear()
    .range([height, 0]);

let color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv("data/co2.csv", function(d) {
    return {
        scenario: d.scenario,
        zuivel: +d.zuivel*365/1000,
        rund: +d.rund*365/1000,
        varken: +d.varken*365/1000,
        kipei: +d.kipei*365/1000,
        agf: +d.agf*365/1000,
        vetsnack: +d.vetsnack*365/1000,
        drank: +d.drank*365/1000,
        graan: +d.graan*365/1000,
        zoet: +d.zoet*365/1000,
        vis: +d.vis*365/1000,
        vegi: +d.vegi*365/1000,
        total: +d.total*365/1000
    };
}).then(function(co2data) {
    d3.csv("data/land.csv", function(d) {
    return {
        scenario: d.scenario,
        zuivel: +d.zuivel*365,
        rund: +d.rund*365,
        varken: +d.varken*365,
        kipei: +d.kipei*365,
        agf: +d.agf*365,
        vetsnack: +d.vetsnack*365,
        drank: +d.drank*365,
        graan: +d.graan*365,
        zoet: +d.zoet*365,
        vis: +d.vis*365,
        vegi: +d.vegi*365,
        total: +d.total*365
    };
}).then(function(landdata) {

    let scenario = "basis_aaaaa";
    let maxTotCO2 = d3.max(co2data, (d) => d.total);
    let maxTotLand = d3.max(landdata, (d) => d.total);

    yCo2.domain([0, maxTotCO2]);
    yLand.domain([0, maxTotLand]);

    function getDietData(scen, impact){
        let filteredData;
        if(impact == "co2"){
            filteredData = co2data.filter(function(el){
                return el.scenario == scen;
            })
        }
        if(impact == "land"){
            filteredData = landdata.filter(function(el){
                return el.scenario == scen;
            })
        }
        return filteredData;
    }

    d3.select("#totalCO2").text(Math.round(getDietData(scenario, "co2")[0].total));
    d3.select("#totalLand").text(Math.round(getDietData(scenario, "land")[0].total));

    d3.select("#legend").selectAll("span").data(["zuivel", "rund", "varken", "kipei", "agf", "vetsnack", "drank", "graan", "zoet", "vis", "vegi"])
        .enter().append("span")
        .attr("class", "legend-item")
        .text((d) => d + " ")
        .style("background-color", (d) => color(d));

    let stack = d3.stack()
        .keys(["zuivel", "rund", "varken", "kipei", "agf", "vetsnack", "drank", "graan", "zoet", "vis", "vegi"]);

    let rectsCo2 = svg.selectAll("rect")
        .data(stack(getDietData(scenario, "co2")))
        .enter().append('rect')
        .attr("x", width/2 - barWidth/2)
        .attr("y", function(d) { return yCo2(d[0][1]); })
        .attr("height", function(d) { return yCo2(d[0][0]) - yCo2(d[0][1]); })
        .attr("width", barWidth)
        .style("fill", function(d) { return color(d.key)});

    let rectsLand = svgLand.selectAll("rect.land")
        .data(stack(getDietData(scenario, "land")))
        .enter().append('rect')
        .attr("x", width/2 - barWidth/2)
        .attr("y", function(d) { return yLand(d[0][1]); })
        .attr("height", function(d) { return yLand(d[0][0]) - yLand(d[0][1]); })
        .attr("width", barWidth)
        .style("fill", function(d) { return color(d.key)});

    d3.selectAll("select").on("change", function(){
        let scenario = d3.select("#menu").node().value + "_" + d3.select("#verspil").node().value + d3.select("#dierprod").node().value + d3.select("#dierwelz").node().value + d3.select("#plantprod").node().value + d3.select("#bio").node().value;
        
        rectsCo2.data(stack(getDietData(scenario, "co2")))
            .transition().duration(1000)
            .attr("y", function(d) { return yCo2(d[0][1]); })
            .attr("height", function(d) { return yCo2(d[0][0]) - yCo2(d[0][1]); });

        rectsLand.data(stack(getDietData(scenario, "land")))
            .transition().duration(1000)
            .attr("y", function(d) { return yLand(d[0][1]); })
            .attr("height", function(d) { return yLand(d[0][0]) - yLand(d[0][1]); });
        
        var format = d3.format("d");
        d3.select("#totalCO2")
          .transition()
            .duration(1000)
            .on("start", function repeat() {
              d3.active(this)
                  .tween("text", function() {
                    var that = d3.select(this),
                        i = d3.interpolateNumber(that.text(), getDietData(scenario, "co2")[0].total);
                    return function(t) { that.text(format(i(t))); };
                  })
                .transition()
                  .delay(1500)
                  .on("start", repeat);
            });

        d3.select("#totalLand")
          .transition()
            .duration(1000)
            .on("start", function repeat() {
              d3.active(this)
                  .tween("text", function() {
                    var that = d3.select(this),
                        i = d3.interpolateNumber(that.text(), getDietData(scenario, "land")[0].total);
                    return function(t) { that.text(format(i(t))); };
                  })
                .transition()
                  .delay(1500)
                  .on("start", repeat);
            });
        })
    })
});