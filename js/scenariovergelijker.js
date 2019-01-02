let height = 100;
let width = 400;
let barHeight = 80;
let margin = {"top": 0, "bottom": 0, "left": 0, "right": 0}

let svgCo2Top = d3.select("#viz-co2-top")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    //.attr("transform", `translate(${margin.left}, ${margin.top})`);
let svgLandTop = d3.select("#viz-land-top")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    //.attr("transform", `translate(${margin.left}, ${margin.top})`);
let svgCo2Bottom = d3.select("#viz-co2-bottom")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    //.attr("transform", `translate(${-margin.left}, ${margin.top})`);
let svgLandBottom = d3.select("#viz-land-bottom")
    .attr("width", width)
    .attr("height", height)
    .append("g");
    //.attr("transform", `translate(${-margin.left}, ${margin.top})`);

let scales = {};
scales.co2 = d3.scaleLinear()
    .range([0, width - margin.left - margin.right]);
scales.land = d3.scaleLinear()
    .range([0, width - margin.left - margin.right]);

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

const catnamen = {
    "rund": "Rundvlees",
    "varken": "Varkensvlees",
    "zuivel": "Zuivel",
    "kipei": "Kippenvlees en eieren",
    "agf": "Aardappelen, groenten en fruit",
    "vetsnack": "Vetten, hartige sauzen, snacks",
    "drank": "Dranken",
    "graan": "Brood, graanproducten",
    "zoet": "Zoete producten en gebak",
    "vis": "Vis",
    "vegi": "Vegetarische producten, noten, peulvruchten"
}

let tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

d3.csv("data/co2-2018-12-14.csv", function(d) {
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
    d3.csv("data/land-2018-12-14.csv", function(d) {
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
    scales.land.domain([0, maxTotLand]);

    let stack = d3.stack()
        .keys(["zuivel", "rund", "varken", "kipei", "vis", "agf", "vetsnack", "drank", "graan", "zoet", "vegi"]);
    
    function draw(topbottom, scenario, impact){
        d3.select(`#total-${impact}-${topbottom}`).text(Math.round(getDietData(scenario, impact)[0].total));

        let svg = getSvg(topbottom, impact);

        //To replace by min, max, ... indicators
        /*let axis;
        if(leftright == "left"){
            axis = d3.axisLeft()
                .ticks(5)
                .tickSize(20)
                .tickPadding(10)
                .scale(scales[impact]);
        }
        if(leftright == "right"){
            axis = d3.axisRight()
                .ticks(5)
                .tickSize(20)
                .tickPadding(10)
                .scale(scales[impact]);
        }

        svg.append("g")
            .attr("transform", function(){
                if(leftright == "left"){
                    return "translate(40, 0)";
                }
                if(leftright == "right"){
                    return `translate(${width - 40}, 0)`
                }
            })
            .call(axis);
        svg.selectAll("g.tick line").style("stroke", "#cccccc");*/

        svg.selectAll("rect")
            .data(stack(getDietData(scenario, impact)))
            .enter().append('rect')
            .attr("y", height/2 - barHeight/2)
            .attr("x", (d) => scales[impact](d[0][0]))
            .attr("width", (d) => scales[impact](d[0][1]) - scales[impact](d[0][0]))
            .attr("height", barHeight)
            .style("fill", function(d) { return colors(dierplant[d.key])})
            .on("mouseover", function(d) {
                d3.select(this)
                    .style("stroke", "#00374D")
                    .style("stroke-width", 2)
                    .raise();
                tooltip
                    .html(`<h2>${catnamen[d.key]}</h2>
                    <p>${impact}: ${Math.round(d[0].data[d.key])}</p>`)
                    .transition()		
                    .duration(200)		
                    .style("opacity", 1)			
                    .style("left", (d3.event.pageX + 28) + "px")		
                    .style("top", (d3.event.pageY - 28) + "px");	
                })
                .on("mousemove", function(d) {		
                    tooltip	
                        .style("left", (d3.event.pageX + 28) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                    })					
              .on("mouseout", function(d) {	
                d3.select(this)
                    .style("stroke", "#ffffff")
                    .style("stroke-width", 1);	
                tooltip.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
    }

    draw("top", scenario, "co2");
    draw("bottom", scenario, "co2");
    draw("top", scenario, "land");
    draw("bottom", scenario, "land");

    function update(topbottom, scenario, impact){
        let svg = getSvg(topbottom, impact);
        svg.selectAll("rect").data(stack(getDietData(scenario, impact)))
            .transition().duration(1000)
            .attr("x", (d) => scales[impact](d[0][0]))
            .attr("width", (d) => scales[impact](d[0][1]) - scales[impact](d[0][0]));
    }

    d3.selectAll("select").on("change", function(){
        let topbottom = d3.select(this).attr("class");

        let scenario = d3.select("#menu-" + topbottom).node().value + "_" + d3.select("#verspil-" + topbottom).node().value + d3.select("#dierprod-" + topbottom).node().value + d3.select("#dierwelz-" + topbottom).node().value + d3.select("#plantprod-" + topbottom).node().value + d3.select("#bio-" + topbottom).node().value;

        update(topbottom, scenario, "co2");
        update(topbottom, scenario, "land");
        
        var format = d3.format("d");
        d3.select("#total-co2-" + topbottom)
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

        d3.select("#total-land-" + topbottom)
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

        function getSvg(topbottom, impact){
            if(topbottom == "top" && impact == "co2"){ return svgCo2Top; }
            if(topbottom == "top" && impact == "land"){ return svgLandTop; }
            if(topbottom == "bottom" && impact == "co2"){ return svgCo2Bottom; }
            if(topbottom == "bottom" && impact == "land"){ return svgLandBottom; }
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