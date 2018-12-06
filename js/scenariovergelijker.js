let height = 250;
let width = 100;
let barWidth = 80;

let svgCo2Left = d3.select("#viz-co2-left")
    .attr("width", width)
    .attr("height", height)
    .append("g");
let svgLandLeft = d3.select("#viz-land-left")
    .attr("width", width)
    .attr("height", height)
    .append("g");
let svgCo2Right = d3.select("#viz-co2-right")
    .attr("width", width)
    .attr("height", height)
    .append("g");
let svgLandRight = d3.select("#viz-land-right")
    .attr("width", width)
    .attr("height", height)
    .append("g");

let scales = {};
scales.co2 = d3.scaleLinear()
    .range([height, 0]);
scales.land = d3.scaleLinear()
    .range([height, 0]);

let color = d3.scaleOrdinal(d3.schemeCategory10);

const colors = d3.scaleOrdinal()
    .range(["#0087BE", "#A2A448"])
    .domain(["Dierlijk", "Plantaardig"]);

const dierplant = {
    "rund": "Dierlijk",
    "varken": "Dierlijk",
    "zuivel": "Dierlijk",
    "kipei": "Dierlijk",
    "agf": "Plantaardig",
    "vetsnack": "Plantaardig",
    "drank": "Plantaardig",
    "graan": "Plantaardig",
    "zoet": "Plantaardig",
    "vis": "Dierlijk",
    "vegi": "Plantaardig"
}

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

    scales.co2.domain([0, maxTotCO2]);
    scales.land.domain([maxTotLand, 0]);

    let stack = d3.stack()
        .keys(["zuivel", "rund", "varken", "kipei", "agf", "vetsnack", "drank", "graan", "zoet", "vis", "vegi"]);
    
    function draw(leftright, scenario, impact){
        d3.select(`#total-${impact}-${leftright}`).text(Math.round(getDietData(scenario, impact)[0].total));

        let svg = getSvg(leftright, impact);

        svg.selectAll("rect")
            .data(stack(getDietData(scenario, impact)))
            .enter().append('rect')
            .attr("x", width/2 - barWidth/2)
            .attr("y", function(d) { 
                if(impact == "land"){
                    return scales[impact](d[0][0]);
                }
                else{
                    return scales[impact](d[0][1]); 
                }
            })
            .attr("height", function(d) {
                if(impact == "land"){
                    return scales[impact](d[0][1]) - scales[impact](d[0][0]);
                }
                else{
                    return scales[impact](d[0][0]) - scales[impact](d[0][1]);
                }
            })
            .attr("width", barWidth)
            .style("fill", function(d) { return colors(dierplant[d.key])});
    }

    draw("left", scenario, "co2");
    draw("right", scenario, "co2");
    draw("left", scenario, "land");
    draw("right", scenario, "land");

    function update(leftright, scenario, impact){
        let svg = getSvg(leftright, impact);
        svg.selectAll("rect").data(stack(getDietData(scenario, impact)))
            .transition().duration(1000)
            .attr("y", function(d) { 
                if(impact == "land"){
                    return scales[impact](d[0][0]);
                }
                else{
                    return scales[impact](d[0][1]); 
                }
            })
            .attr("height", function(d) {
                if(impact == "land"){
                    return scales[impact](d[0][1]) - scales[impact](d[0][0]);
                }
                else{
                    return scales[impact](d[0][0]) - scales[impact](d[0][1]);
                }
            });
    }

    d3.selectAll("select").on("change", function(){
        let leftright = d3.select(this).attr("class");

        let scenario = d3.select("#menu-" + leftright).node().value + "_" + d3.select("#verspil-" + leftright).node().value + d3.select("#dierprod-" + leftright).node().value + d3.select("#dierwelz-" + leftright).node().value + d3.select("#plantprod-" + leftright).node().value + d3.select("#bio-" + leftright).node().value;

        update(leftright, scenario, "co2");
        update(leftright, scenario, "land");
        
        var format = d3.format("d");
        d3.select("#total-co2-" + leftright)
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

        d3.select("#total-land-" + leftright)
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

        });

        function getSvg(leftright, impact){
            if(leftright == "left" && impact == "co2"){ return svgCo2Left; }
            if(leftright == "left" && impact == "land"){ return svgLandLeft; }
            if(leftright == "right" && impact == "co2"){ return svgCo2Right; }
            if(leftright == "right" && impact == "land"){ return svgLandRight; }
        }

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
    })
});