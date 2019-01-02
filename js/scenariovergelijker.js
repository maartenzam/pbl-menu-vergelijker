let height = 160;
let width = 360;
let barHeight = 80;
let margin = {"top": 20, "bottom": 0, "left": 10, "right": 20}

let svgCo2Top = d3.select("#viz-co2-top")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
let svgLandTop = d3.select("#viz-land-top")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
let svgCo2Bottom = d3.select("#viz-co2-bottom")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${-margin.left}, ${margin.top})`);
let svgLandBottom = d3.select("#viz-land-bottom")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${-margin.left}, ${margin.top})`);

let scales = {};
scales.co2 = d3.scaleLinear()
    .range([0, width - margin.right - margin.left]);
scales.land = d3.scaleLinear()
    .range([0, width - margin.right - margin.left]);

let color = d3.scaleOrdinal(d3.schemeCategory10);

const colors = d3.scaleOrdinal()
    .range(["#439BD9", "#B8B87B"])
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

    let extents = {
        "co2": d3.extent(co2data, (d) => d.total),
        "land": d3.extent(landdata, (d) => d.total)
    }

    scales.co2.domain([0, extents["co2"][1]]);
    scales.land.domain([0, extents["land"][1]]);

    let stack = d3.stack()
        .keys(["zuivel", "rund", "varken", "kipei", "vis", "agf", "vetsnack", "drank", "graan", "zoet", "vegi"]);
    
    function draw(topbottom, scenario, impact){
        d3.select(`#total-${impact}-${topbottom}`).text(Math.round(getDietData(scenario, impact)[0].total));

        let svg = getSvg(topbottom, impact);

        svg.append("rect")
            .attr("x", scales[impact](0))
            .attr("width", scales[impact](extents[impact][1]))
            .attr("y", margin.top)
            .attr("height", barHeight)
            .style("fill", "#F4F3E8");
        let ticks = svg.selectAll("line.tick").data(extents[impact])
            .enter().append("g");

        ticks.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle))
            .attr("transform", (d) => `translate(${scales[impact](d)},${margin.top + barHeight + 12})`)
            .style("fill", "#A6CDEF");
        ticks.append("text")
            .attr("x", (d)  => scales[impact](d))
            .attr("y", margin.top + barHeight + 36)
            .style("fill", "#A6CDEF")
            .style("text-anchor", "middle")
            .text(function(d,i){
                if(i == 0){ return "min"; }
                if(i == 1){ return "max"; }
            });

        let current = svg.append("g");
        current.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle))
            .attr("transform", `translate(${scales[impact](getDietData(scenario, impact)[0].total)},${margin.top + barHeight + 12})`)
            .style("fill", "#A6CDEF");
        current.append("text")
            .attr("x", scales[impact](getDietData(scenario, impact)[0].total))
            .attr("y", margin.top + barHeight + 36)
            .style("fill", "#A6CDEF")
            .style("text-anchor", function(){
                if(impact == "co2"){ return "end"; }
                else{ return "middle"; }
            })
            .text("huidig");

        svg.append("text")
            .attr("id", function(){return `total-${impact}-${topbottom}`})
            .attr("class", "data-label")
            .attr("x", scales[impact](getDietData(scenario, impact)[0].total))
            .attr("y", 2)
            .style("text-anchor", "middle")
            .text(Math.round(getDietData(scenario, impact)[0].total));
        svg.append("path")
            .attr("d", d3.symbol().type(d3.symbolTriangle))
            .attr("id", function(){return `triangle-${impact}-${topbottom}`})
            .attr("transform", `translate(${scales[impact](getDietData(scenario, impact)[0].total)},${margin.top - 10}) rotate(180)`)
            .style("fill", "#2D6D96");


        svg.selectAll("rect.bar")
            .data(stack(getDietData(scenario, impact)))
            .enter().append('rect')
            .attr("class", "bar")
            .attr("y", margin.top)
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
        svg.selectAll("rect.bar").data(stack(getDietData(scenario, impact)))
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
            .attr("x", scales["co2"](getDietData(scenario, "co2")[0].total))
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
        d3.select("#triangle-co2-" + topbottom)
            .transition()
            .duration(1000)
            .attr("transform", `translate(${scales["co2"](getDietData(scenario, "co2")[0].total)},${margin.top - 10}) rotate(180)`);

        d3.select("#total-land-" + topbottom)
          .transition()
            .duration(1000)
            .attr("x", scales["land"](getDietData(scenario, "land")[0].total))
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
        d3.select("#triangle-land-" + topbottom)
            .transition()
            .duration(1000)
            .attr("transform", `translate(${scales["land"](getDietData(scenario, "land")[0].total)},${margin.top - 10}) rotate(180)`);
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