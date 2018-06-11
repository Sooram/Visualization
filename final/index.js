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
    var w = 400, h = 300;
    var margin = {top:20, right:20, bottom: 20, left: 30};
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

    d3.select('#worldAvg').on('click', function(d) {
        var t = d3.transition()
            .duration(800)
            .ease(d3.easeElastic);

        //Set y domain again
        y.domain([0.4595, 0.878]); 
           
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

        svg.select('path').remove();

        //Draw rank line
        var y2 = d3.scaleLinear()
            .domain([100, 1])
            .range([innerH, 0]); 
        
        var rankLine = d3.line()
            .x(function(d){return x(d.year)+10})
            .y(function(d){return y2(d.rank)});
        svg.append('path')
            .datum(data) 
            .attr('class', 'line')
            .style('fill', 'none')
            .style('stroke', 'steelblue')
            .attr('transform', 'translate(0,' + -150 + ')')
            .attr('d', rankLine)

        var point = svg.selectAll('point')
            .data(data, function(d) {return d.country}).enter()
            .append('g').attr('class', 'point')
        
        point.append('circle')
            .attr('cx', function(d) {return x(d.year)+10})
            .attr('cy', function(d) {return y2(d.rank)-150})
            .attr('r', 1)
            .attr('visibility', 'hidden')
            
        point.append('text')
            .attr('class', 'label')
            .attr('x', function(d){return x(d.year)+10})
            .attr('y', function(d){return y2(d.rank)})
            .attr('transform', 'translate(0,' + -150 + ')')
            .text(function(d) {return d.rank});
            
    });
}

d3.csv("/data/Progress-over-time-AVG.csv", row).then(callback);