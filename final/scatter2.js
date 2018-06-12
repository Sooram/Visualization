//Define arguments 
var gdppc = {
    chartName: '#scatter1',
    xDomain: [0, 110000],
    valName: 'GDPPC',
    filterRange: [23000, 38000],
    x2DomainOffset: [1000, 2000],
    y2DomainOffset:[0.01, 0.005],
    fileName: './data/GDPPC.csv'
}

var gdp = {
    chartName: '#scatter2',
    xDomain: [0, 5000000],
    valName: 'GDP',
    filterRange: [1000000, 2200000],
    x2DomainOffset: [100000, 100000],
    y2DomainOffset:[0.01, 0.005],
    fileName: './data/GDP.csv'
}

makeChart(gdppc);
// makeChart(gdp);

function makeChart(args) {
    d3.csv(args.fileName, row).then(callback); /****/

    function row(d) { //row conversion function
        return { 
            country: d.Country,
            rankIdx: +d.IndexRank,
            index: +d.GlobalIndex,
            rankvalue: +d.ValueRank,
            value: +d.Value,
            region: d.Region,
        }  
    }

    function callback(data) {
        console.log(data);
        //Basic setting
        var w = 800, h = 300;
        var margin = {top:20, right:300, bottom: 30, left: 30};
        var innerW = w - margin.right - margin.left,
            innerH = h - margin.top - margin.bottom;

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeElastic);

        var svg = d3.select(args.chartName).append('svg')/****/
            .attr('width', w)
            .attr('height', h)
            .append('g')
            .attr('transform', 'translate('+ [margin.left, margin.top] + ')');
        
        svg.append('rect')
        .attr('width', innerW)
        .attr('height', innerH)
        .style('fill', 'white');

        //Set x, y, and color scales
        var x = d3.scaleLinear() 
            .domain(args.xDomain)/****/
            .range([0, innerW]);
        var y = d3.scaleLinear()
            .domain([0.5, 0.9])
            .range([innerH, 0]);
        var c = d3.scaleOrdinal()
            .domain(data.map(function(d){return d.region}))
            .range(d3.schemeCategory10);
        
        //Draw axis
        var xAxis = d3.axisBottom(x) 
            .tickSize(0) 
            .tickPadding(6); 
        var yAxis = d3.axisLeft(y)  
            .ticks(5)
            .tickSizeOuter(0)
        svg.append('g') 
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + [0, innerH] + ')') 
            .call(xAxis);
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis); 

        //Legend
        var chipHeight = 12; 
        var chipPadding = 2; 
        var legendHeight = 16;
        var legendPadding = 4;
        var legend = svg.append('g')
            .attr('class', 'legend-g')
            .attr('transform', 'translate(' + [innerW + 50, legendHeight]  +  ')')
            .selectAll('.legend')
            .data(c.domain()) 
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d,i){
                return 'translate(' + [0, i *(legendHeight + legendPadding)]+ ')'
            });

        legend.append('rect')
            .attr('y', chipPadding)
            .attr('width', chipHeight).attr('height', chipHeight)
            .style('fill', function(d){return c(d)})
            .style('opacity', 0.5);

        legend.append('text')
            .attr('x', chipPadding + chipHeight)
            .attr('y', chipPadding)
            .attr('dy', '.71em')
            .style('font-size', 10+ 'px')
            .text(function(d){return d});

        //Draw points
        var point = svg.selectAll('point')
            .data(data, function(d) {return d.country}).enter()
            .append('g').attr('class', 'point')
            
        point.append('circle')
            .attr('cx', function(d) {return x(d.value)})
            .attr('cy', function(d) {return y(d.index)})
            .attr('r', 4)
            .attr('fill', function(d) {return c(d.region)})
            .attr('opacity', 0.5)

        point.append('rect')
            .attr('class', 'box')
            .attr('x', function(d) {return x(d.value)})
            .attr('y', function(d) {return y(d.index)+10})
            .attr('width', 65)
            .attr('height', 25)
            .style('fill', 'white')
            .style('visibility', 'hidden');

        point.append('text')
            .style('visibility', 'hidden')
            .attr('class', 'details')
            .attr('x', function(d) {return x(d.value)})
            .attr('y', function(d) {return y(d.index)})
            .text(function(d) {return d.country})
            .attr('font-size', 15)
        .append('tspan')
            .style('visibility', 'hidden')
            .attr('class', 'details')
            .attr('x', function(d) {return x(d.value)})
            .attr('dy', 20)
            .text(function(d) { return args.valName +': ' + d.value; })/****/
            .attr('font-size', 10)
        .append('tspan')
            .style('visibility', 'hidden')
            .attr('class', 'details')
            .attr('x', function(d) {return x(d.value)})
            .attr('dy', 10)
            .text(function(d) { return 'index: ' + d.index; })
            .attr('font-size', 10);
        
        //Hide details when the white space is clicked
        svg.on('click', function(d) {
            point.selectAll('.details')
                .style('visibility', 'hidden');
            point.call(original);
            point.selectAll('.box').style('visibility', 'hidden');
        });

        //Show details when a point is clicked
        point.on('click', function (d) {  
            d3.event.stopPropagation();  
            point.selectAll('.details')
                .style('visibility', 'hidden');
            point.call(original);
            d3.select(this).selectAll('.details')
                .style('visibility', 'visible');
            d3.select(this).call(highlight);
        });

        //레전드 클릭 시 포인트 강조
        legend.on('click', function(d) {
            d3.event.stopPropagation();
            point.each(function(p) {
                var cur = d3.select(this);
                cur.selectAll('.details').style('visibility', 'hidden');
                cur.call(original);
                if(p.region == d) {
                    cur.call(highlight);
                }
            })
        })

        //////////////////////////////////////////////////////////////////////////////////////
        
        var max, min; 

        d3.select('#'+args.valName).on('click', function(d) {
            min =  args.filterRange[0];/****/
            max = args.filterRange[1];/****/

            var filtered = data.filter(d => d.value >= min && d.value <= max);
            console.log(filtered);

            //Set x and y domain again
            var x2 = d3.scaleLinear() 
                .domain([d3.min(filtered, function(d) {return d.value-args.x2DomainOffset[0]}), 
                    d3.max(filtered, function(d) {return d.value+args.x2DomainOffset[1]})]) /****/
                .range([0, innerW]);
            var y2 = d3.scaleLinear()
                .domain([d3.min(filtered, function(d) {return d.index-args.y2DomainOffset[0]}), 
                    d3.max(filtered, function(d) {return d.index+args.y2DomainOffset[1]})]) /****/
                .range([innerH, 0]);
            
            //Draw axis again
            var xAxis2 = d3.axisBottom(x2) 
                .tickSize(0) 
                .tickPadding(6); 
            var yAxis2 = d3.axisLeft(y2)  
                .ticks(5)
                .tickSizeOuter(0);
            svg.select('.x.axis')
                .transition(t) 
                .call(xAxis2);
            svg.select('.y.axis')
                .transition(t) 
                .call(yAxis2);

            //Remove unrelevant points and relocate relevant ones
            point.each(function(d) {
                if(d.value < min || d.value > max) {
                    d3.select(this)
                        .transition(t)
                        .attr('transform', function(d){
                            return 'translate('+ [x2(d.value)-x(d.value), y2(d.index)-y(d.index)] + ')'
                        })
                        .remove();
                }
                else {
                    var cur = d3.select(this)
                    cur.transition(t)
                        .attr('transform', function(d){
                            return 'translate('+ [x2(d.value)-x(d.value), y2(d.index)-y(d.index)] + ')'
                        })
                        .select('text')
                            .transition(t)
                            .style('visibility', 'visible');
                    if(d.country == 'Korea, Rep.') {
                        cur.call(highlight);
                    }
                }
            });

            //Overwrite svg.onClick event(Show only country names)
            svg.on('click', function(d) {
                point.select('.details')
                    .style('visibility', 'visible');
                point.selectAll('tspan')
                    .style('visibility', 'hidden');

                point.call(original);
                point.each(function(p) {
                    if(p.country == 'Korea, Rep.') {
                        d3.select(this).call(highlight);
                    }
                })
            })

            //Overwrite point.onClick event(Show details when a point is clicked
            point.on('click', function (d) {
                d3.event.stopPropagation();
                d3.select(this).selectAll('.details')
                    .style('visibility', 'visible');
                d3.select(this).call(highlight);
            });

            point.on('mouseenter', function(d) {
                point.filter(function(p) {return d.country === p.country})
                    .classed('hover', true);
                d3.select(this).selectAll('.details')
                    .style('visibility', 'visible');
                d3.select(this).call(highlight);
                d3.select(this).select('.box').style('visibility', 'visible');
            }).on('mouseleave', function(d) {
                var hover = point.filter(function() {
                    return d3.select(this).classed('hover')
                }).classed('hover', false);
                if(d.country != 'Korea, Rep.') {
                    hover.call(original);
                }
                hover.selectAll('tspan')
                    .style('visibility', 'hidden');
                point.selectAll('.box').style('visibility', 'hidden');
            });

            //Overwrite legend.onClick event
            legend.on('click', function(d) {
                d3.event.stopPropagation();
                point.each(function(p) {
                    d3.select(this).call(original);
                    if(p.region == d || p.country == 'Korea, Rep.') {
                        d3.select(this).call(highlight);
                    }
                })
            });

            //Draw avg line
            var avg = d3.mean(filtered, function(d) {return d.index});
            svg.append("line")
                .attr("x1", 0)
                .attr("y1", y2(avg))
                .attr("x2", innerW)
                .attr("y2", y2(avg))
                .attr("stroke-width", 2)
                .attr("stroke", "black")
                .style("stroke-dasharray", ("3, 3"))
                .style('opacity', 0.6);
            svg.append('text')
                .attr('x', innerW+5)
                .attr('y', y2(avg))
                .attr('dy', ".35em")
                .text('avg')
                .attr('font-size', 10);
        });//End of clicking zoom event

        //Get back to the origianl chart when the name is clicked    
        d3.select('#gdppcName').on('click', function(d) {
            console.log('clicked');
            d3.select(args.chartName).select('svg').remove();
            d3.csv(args.fileName, row).then(callback);
        });

        //////////////////////////////////////////////////////////////////////////////////////

        function highlight(selection) {
            selection.select('circle').attr('r', 6).style('opacity', 1);
            return selection;
        }
        function original(selection) {
            selection.select('circle').attr('r', 4).style('opacity', 0.5);
            return selection;
        }
    }//End of callback
}//End of makeChart