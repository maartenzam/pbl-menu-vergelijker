var height = 160;
var width = d3.select(".vizcontainer").node().getBoundingClientRect().width;
var barHeight = 80;
var margin = {"top": 20, "bottom": 0, "left": 10, "right": 20}

var svgCo2Top = d3.select("#viz-co2-top")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svgLandTop = d3.select("#viz-land-top")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svgCo2Bottom = d3.select("#viz-co2-bottom")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svgLandBottom = d3.select("#viz-land-bottom")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var scales = {};
scales.co2 = d3.scaleLinear()
    .range([0, width - margin.right - margin.left]);
scales.land = d3.scaleLinear()
    .range([0, width - margin.right - margin.left]);

var colors = d3.scaleOrdinal()
    .range(["#439BD9", "#B8B87B"])
    .domain(["Dierlijk", "Plantaardig"]);

var dierplant = {
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

var catnamen = {
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

var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

d3.csv("data/co2-2019-02-13.csv", function(co2data) {
    d3.csv("data/land-2019-02-13.csv", function(landdata) {
        co2data.forEach(function(d){
            d.scenario = d.scenario,
            d.zuivel = +d.zuivel*365/1000,
            d.rund = +d.rund*365/1000,
            d.varken = +d.varken*365/1000,
            d.kipei = +d.kipei*365/1000,
            d.agf = +d.agf*365/1000,
            d.vetsnack = +d.vetsnack*365/1000,
            d.drank = +d.drank*365/1000,
            d.graan = +d.graan*365/1000,
            d.zoet = +d.zoet*365/1000,
            d.vis = +d.vis*365/1000,
            d.vegi = +d.vegi*365/1000,
            d.total = +d.total*365/1000
        });

        landdata.forEach(function(d){
            d.scenario = d.scenario,
            d.zuivel = +d.zuivel*365,
            d.rund = +d.rund*365,
            d.varken = +d.varken*365,
            d.kipei = +d.kipei*365,
            d.agf = +d.agf*365,
            d.vetsnack = +d.vetsnack*365,
            d.drank = +d.drank*365,
            d.graan = +d.graan*365,
            d.zoet = +d.zoet*365,
            d.vis = +d.vis*365,
            d.vegi = +d.vegi*365,
            d.total = +d.total*365
        });

        var scenario = "basis_aaaaa";

        var extents = {
            "co2": d3.extent(co2data, function(d) { return d.total; }),
            "land": d3.extent(landdata, function(d) { return d.total; })
        }
    
        scales.co2.domain([0, extents["co2"][1]]);
        scales.land.domain([0, extents["land"][1]]);
    
        var stack = d3.stack()
            .keys(["zuivel", "rund", "varken", "kipei", "vis", "agf", "vetsnack", "drank", "graan", "zoet", "vegi"]);
        
        function draw(topbottom, scenario, impact){
            d3.select("#total-" + impact + "-" + topbottom).text(Math.round(getDietData(scenario, impact)[0].total));
    
            var svg = getSvg(topbottom, impact);
    
            svg.append("rect")
                .attr("x", scales[impact](0))
                .attr("width", scales[impact](extents[impact][1]))
                .attr("y", margin.top)
                .attr("height", barHeight)
                .style("fill", "#f2f2f2");
            
            //Current label
            var current = svg.append("g");
            current.append("path")
                .attr("d", d3.symbol().type(d3.symbolTriangle))
                .attr("transform", "translate(" + scales[impact](getDietData(scenario, impact)[0].total) + "," + (margin.top + barHeight + 12) + ")")
                .style("fill", "#A6CDEF");
            current.append("text")
                .attr("x", scales[impact](getDietData(scenario, impact)[0].total))
                .attr("y", margin.top + barHeight + 36)
                .style("fill", "#A6CDEF")
                .style("text-anchor", function(){
                    if(impact == "co2"){ return "end"; }
                    else{ return "middle"; }
                })
                .text("Huidig menu");
            
            //Selected scenario label
            svg.append("text")
                .attr("id", "total-" + impact + "-" + topbottom)
                .attr("class", "data-label")
                .attr("x", scales[impact](getDietData(scenario, impact)[0].total))
                .attr("y", 2)
                .style("text-anchor", "middle")
                .text(Math.round(getDietData(scenario, impact)[0].total));
            svg.append("path")
                .attr("d", d3.symbol().type(d3.symbolTriangle))
                .attr("id", "triangle-" + impact + "-" + topbottom)
                .attr("transform", "translate(" + scales[impact](getDietData(scenario, impact)[0].total) + "," + (margin.top - 10) + ") rotate(180)")
                .style("fill", "#2D6D96");
                
            svg.selectAll("rect.bar")
                .data(stack(getDietData(scenario, impact)))
                .enter().append('rect')
                .attr("class", "bar")
                .attr("id", function(d){return topbottom + "-" + impact + "-" + d.key})
                .attr("y", margin.top)
                .attr("x", function(d){ return scales[impact](d[0][0]); })
                .attr("width", function(d) { return scales[impact](d[0][1]) - scales[impact](d[0][0]); })
                .attr("height", barHeight)
                .style("fill", function(d) { return colors(dierplant[d.key])})
                .on("mouseover", function(d) {
                    d3.select(this)
                        .style("stroke", "#00374D")
                        .style("stroke-width", 2)
                        .raise();
                    tooltip
                        .html(function(){
                            var units = "m²";
                            if(impact == "co2"){
                                units = "kg"
                            }
                            return "<p>" + catnamen[d.key] + "</p><p>" + Math.round(d[0].data[d.key]) + " " + units + "</p>"
                        })
                        .transition()		
                        .duration(200)		
                        .style("opacity", 1)			
                        .style("left", (d3.event.pageX + 28) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                    })
                    .on("mousemove", function() {		
                        tooltip	
                            .style("left", (d3.event.pageX + 28) + "px")		
                            .style("top", (d3.event.pageY - 28) + "px");	
                        })					
                  .on("mouseout", function() {	
                    d3.select(this)
                        .style("stroke", "#ffffff")
                        .style("stroke-width", 1);	
                    tooltip.transition()		
                        .duration(500)		
                        .style("opacity", 0);
                    d3.selectAll("line.axis").raise();	
                });
                //0 label + axis
                svg.append("text")
                    .attr("x", scales[impact](0))
                    .attr("y", margin.top + barHeight + 36)
                    .style("text-anchor", "middle")
                    .style("fill", "#439BD9")
                    .text(0);
                svg.append("line")
                    .attr("class", "axis")
                    .attr("x1", scales[impact](0))
                    .attr("x2", scales[impact](0))
                    .attr("y1", 0)
                    .attr("y2", margin.top + barHeight + 18)
                    .style("stroke", "#13374B");
        }
    
        draw("top", scenario, "co2");
        draw("bottom", scenario, "co2");
        draw("top", scenario, "land");
        draw("bottom", scenario, "land");
    
        function update(topbottom, scenario, impact){
            var svg = getSvg(topbottom, impact);
            stack(getDietData(scenario, impact)).forEach(function(el){
                svg.select("rect#" + topbottom + "-" + impact + "-" + el.key)
                .on("mouseover", function() {
                    d3.select(this)
                        .style("stroke", "#00374D")
                        .style("stroke-width", 2)
                        .raise();
                    tooltip
                        .html(function(){
                            var units = "m²";
                            if(impact == "co2"){
                                units = "kg"
                            }
                            return "<p>" + catnamen[el.key] + "</p><p>" + Math.round(el[0].data[el.key]) + " " + units + "</p>"
                        })
                        .transition()		
                        .duration(200)		
                        .style("opacity", 1)			
                        .style("left", (d3.event.pageX + 28) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                    })
                    .transition().duration(1000)
                    .attr("x", function(){ return scales[impact](el[0][0]); })
                    .attr("width", function() { return scales[impact](el[0][1]) - scales[impact](el[0][0]); });
            })
        }
    
        d3.selectAll("select").on("change", function(){
            var topbottom = d3.select(this).attr("class");
    
            //Construct selected scenario id
            var scenario = d3.select("#menu-" + topbottom).node().value + "_" + d3.select("#verspil-" + topbottom).node().value + d3.select("#dierprod-" + topbottom).node().value + d3.select("#dierwelz-" + topbottom).node().value + d3.select("#plantprod-" + topbottom).node().value + d3.select("#bio-" + topbottom).node().value;
    
            update(topbottom, scenario, "co2");
            update(topbottom, scenario, "land");
            
            var format = d3.format("d");
            //Animate number
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
            //Animate translation of number
            d3.select("#triangle-co2-" + topbottom)
                .transition()
                .duration(1000)
                .attr("transform", "translate(" + scales['co2'](getDietData(scenario, 'co2')[0].total) + "," + (margin.top - 10) + ") rotate(180)");
    
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
                .attr("transform", "translate(" + scales['land'](getDietData(scenario, 'land')[0].total) + "," + (margin.top - 10) + ") rotate(180)");
        });
    
        function getSvg(topbottom, impact){
            if(topbottom == "top" && impact == "co2"){ return svgCo2Top; }
            if(topbottom == "top" && impact == "land"){ return svgLandTop; }
            if(topbottom == "bottom" && impact == "co2"){ return svgCo2Bottom; }
            if(topbottom == "bottom" && impact == "land"){ return svgLandBottom; }
        }
    
        function getDietData(scen, impact){
            var filteredData;
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
    });
});