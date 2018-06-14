function row(d) { //row conversion function
    return {
      year: +d.Year, 
      rank: +d.Rank, 
      value: +d.Korea,
      avg: +d.AVG
    }  
}
  
function callback(data) {
    //Arrange data
    data.sort(function (a, b) {
        return a.year - b.year;
    });
    console.log(data);

    //Basic setting
    var w = 450, h = 300;
    var margin = {top:20, right:100, bottom: 20, left: 30};
    var innerW = w - margin.right - margin.left,
        innerH = h - margin.top - margin.bottom;

    var svg = d3.select('#progress').append('svg')
        .attr('width', w)
        .attr('height', h)
        .append('g')
        .attr('transform', 'translate('+ [margin.left, margin.top] + ')');

    //Set x and y scales
    var x = d3.scalePoint() 
        .domain(data.map(function(d){return d.year})) 
        .range([0, innerW]);
    var y = d3.scaleLinear()
        .domain([0.6, d3.max(data, function(d){return d.value})])
        .range([innerH, 0]);
    x.padding(0.2);

    //Draw bars
    var bar = svg.selectAll('rect.bar')
            .data(data)
        .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', innerH);
    bar.attr('x', function(d) {
            return x(d.year); 
        })
        .attr('y', function(d) {
            return y(d.value);
          })
        .attr('height', function(d){return innerH - y(d.value);})
        .attr('fill', 'steelblue')
        .attr('opacity', 0.5)

    //Draw the line
    var line = d3.line()
        .x(function(d){return x(d.year)+10})
        .y(function(d){return y(d.value)});

    svg.append('path')
        .datum(data) 
        .attr('class', 'line')
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .attr('d', line);
    
    //Draw axis
    var xAxis = d3.axisBottom(x) 
      .tickSize(0) 
      .tickPadding(6); 
    var yAxis = d3.axisLeft(y)  
      .ticks(5)
      .tickSizeOuter(0)
    svg.append('g') 
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + [10, innerH] + ')') 
      .call(xAxis);
    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis); 

    // Tooltip
    bar.on('mouseenter', function(d) {
        var hover = bar.filter(function(p) {return d.year === p.year})
            .classed('hover', true);
        var tooltip = svg.selectAll('.tooltip')
            .data(hover.data())
        tooltip.enter().append('text')
            .attr('class', 'tooltip')
            .merge(tooltip)
            .attr('x', function(d){return x(d.year)-10})
            // .attr('dx', '.35em')
            .attr('y', function(d){return y(d.value)})
            .style('visibility', 'visible')
            .text(function(d){return d.value})
        }).on('mouseleave', function() {
            var hover = bar.filter(function() {
                return d3.select(this).classed('hover')
        }).classed('hover', false);
    
    svg.selectAll('.tooltip')
        .style('visibility', 'hidden');
    });

    /////////////////////////////////////////////////////////////////////////////////
    var t = d3.transition()
            .duration(800)
            .ease(d3.easeElastic);

    d3.select('#avg').on('click', function(d) {
        //Set y domain again
        y.domain([0.6, d3.max(data, function(d) {return d.avg})]);
                    
        //Draw y axis again
        var yAxis2 = d3.axisLeft(y)  
            .ticks(5)
            .tickSizeOuter(0);
        svg.select('.y.axis')
            .transition(t) 
            .call(yAxis2);

        //Draw bars for avg
        var barAvg = svg.selectAll('rect.barAvg')
            .data(data)
            .enter().append('rect')
            .attr('class', 'barAvg')
            .attr('x', function(d) {return x(d.year)})
            .attr('y', innerH)
            .attr('width', 20)
            .attr('height', innerH);
        barAvg.transition(t)
            .attr('x', function(d) {return x(d.year)})
            .attr('y', function(d) {return y(d.avg)})
            .attr('height', function(d){return innerH - y(d.avg);})
            .attr('fill', 'steelblue')
            .attr('opacity', 0.3);

        barAvg.on('mouseenter', function(d) {
            var hover = barAvg.filter(function(p) {return d.year === p.year})
                .classed('hover', true);
            var tooltip = svg.selectAll('.tooltip')
                .data(hover.data())
            tooltip.enter().append('text')
                .attr('class', 'tooltip')
                .merge(tooltip)
                .attr('x', function(d){return x(d.year)-10})
                // .attr('dx', '.35em')
                .attr('y', function(d){return y(d.avg)})
                .style('visibility', 'visible')
                .text(function(d){return d.avg})
                .append('tspan')
                .attr('class', 'tooltip')
                // .merge(tooltip)
                .attr('x', function(d){return x(d.year)-10})
                // .attr('dx', '.35em')
                .attr('y', function(d){return y(d.value)})
                .style('visibility', 'visible')
                .text(function(d){return d.value});
            }).on('mouseleave', function() {
                var hover = barAvg.filter(function() {
                    return d3.select(this).classed('hover')
            }).classed('hover', false);

        svg.selectAll('.tooltip')
            .style('visibility', 'hidden');
        });

        //Draw bars again
        bar.each(function(d) {
            d3.select(this).transition(t)
                .attr('y', function(d) {return y(d.value)})
                .attr('height', function(d) {return innerH - y(d.value)});
        });
        svg.select('.line').remove();
        svg.selectAll('.barHi').remove();
        svg.selectAll('.barLow').remove();

        //Legend
        var legendVals = ['Avg', 'Kor'];
        var legendOpc = [0.3, 0.5]
        var chipHeight = 12; 
        var chipPadding = 2; 
        var legendHeight = 16;
        var legendPadding = 4;
        var legend = svg.append('g')
            .attr('class', 'legend-g')
            .attr('transform', 'translate(' + [innerW + 50, legendHeight]  +  ')')
            .selectAll('.legend')
            .data(legendVals) 
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d,i){
                return 'translate(' + [0, i *(legendHeight + legendPadding)]+ ')'
            });

        legend.append('rect')
            .attr('y', chipPadding)
            .attr('width', chipHeight).attr('height', chipHeight)
            .style('fill', 'steelblue')
            .style('opacity', function(d, i){return legendOpc[i]})
            // .style('opacity', 0.5);

        legend.append('text')
            .attr('x', chipPadding + chipHeight)
            .attr('y', chipPadding)
            .attr('dy', '.71em')
            .style('font-size', 10+ 'px')
            .text(function(d){return d});
    });//End of avg clicked

    d3.select("#hilow").on("click", function(d) {
        console.log('hilow');
        //Set y domain again
        y.domain([0.4, 0.9]);
        
        //Draw y axis again
        yAxis2 = d3.axisLeft(y)  
            .ticks(5)
            .tickSizeOuter(0);
        svg.select('.y.axis')
            .transition(t) 
            .call(yAxis2);
        
        //Draw bars again
        bar.each(function(d) {
            d3.select(this).transition(t)
                .attr('y', function(d) {return y(d.value)})
                .attr('height', function(d) {return innerH - y(d.value)});
        });

        //Draw highest and lowest lines
        d3.csv("/data/Hilow.csv", row2).then(callbackHi);
        function callbackHi(data) {
            svg.select('.line').remove();
            svg.selectAll('.barAvg').remove();

            //Draw bars for hi
            var barHi = svg.selectAll('rect.barHi')
                .data(data)
                .enter().append('rect')
                .attr('class', 'barHi')
                .attr('x', function(d) {return x(d.year)})
                .attr('y', innerH)
                .attr('width', 20)
                .attr('height', innerH);
            barHi.transition(t)
                .attr('x', function(d) {return x(d.year)})
                .attr('y', function(d) {return y(d.hi)})
                .attr('height', function(d){return innerH - y(d.hi);})
                .attr('fill', 'steelblue')
                .attr('opacity', 0.3);

            //Draw bars for hi
            var barLow = svg.selectAll('rect.barLow')
                .data(data)
                .enter().append('rect')
                .attr('class', 'barLow')
                .attr('x', function(d) {return x(d.year)})
                .attr('y', innerH)
                .attr('width', 20)
                .attr('height', innerH);
            barLow.transition(t)
                .attr('x', function(d) {return x(d.year)})
                .attr('y', function(d) {return y(d.low)})
                .attr('height', function(d){return innerH - y(d.low);})
                .attr('fill', 'steelblue')
                .attr('opacity', 0.8);

            barHi.on('mouseenter', function(d) {
                var hover = barHi.filter(function(p) {return d.year === p.year})
                    .classed('hover', true);
                var tooltip = svg.selectAll('.tooltip')
                    .data(hover.data())
                tooltip.enter().append('text')
                    .attr('class', 'tooltip')
                    .merge(tooltip)
                    .attr('x', function(d){return x(d.year)-10})
                    // .attr('dx', '.35em')
                    .attr('y', function(d){return y(d.low)})
                    .style('visibility', 'visible')
                    .text(function(d){return d.low})
                    .append('tspan')
                    .attr('class', 'tooltip')
                    // .merge(tooltip)
                    .attr('x', function(d){return x(d.year)-10})
                    // .attr('dx', '.35em')
                    .attr('y', function(d){return y(d.hi)})
                    .style('visibility', 'visible')
                    .text(function(d){return d.hi});
                }).on('mouseleave', function() {
                    var hover = barHi.filter(function() {
                        return d3.select(this).classed('hover')
                }).classed('hover', false);
                svg.selectAll('.tooltip')
                .style('visibility', 'hidden');
            });
        }

        function row2(d) {
            return {
                year: +d.Year,
                hi: +d.Iceland,
                low: +d.Yemen
            }
        }
    
    })//End of hilow clicked

    d3.select('#progressName').on('click', function(d) {
        svg.selectAll('rect.barAvg').remove();
        svg.selectAll('.barHi').remove();
        svg.selectAll('.barLow').remove();
        svg.selectAll('.line').remove();
        svg.selectAll('.legend-g').remove();
        y.domain([0.6, d3.max(data, function(d){return d.value})]);
        //Draw y axis again
        yAxis2 = d3.axisLeft(y)  
            .ticks(5)
            .tickSizeOuter(0);
        svg.select('.y.axis')
            .transition(t) 
            .call(yAxis2);

        //Draw bars again
        bar.each(function(d) {
            d3.select(this).transition(t)
                .attr('y', function(d) {return y(d.value)})
                .attr('height', function(d) {return innerH - y(d.value)});
        });

        //Draw the line
        line = d3.line()
            .x(function(d){return x(d.year)+10})
            .y(function(d){return y(d.value)});

        svg.append('path')
            .datum(data) 
            .attr('class', 'line')
            .style('fill', 'none')
            .style('stroke', 'steelblue')
            .attr('d', line);
    });//End of progress name clicked
    
}//End of callback

d3.csv("/data/Progress-over-time-AVG.csv", row).then(callback);