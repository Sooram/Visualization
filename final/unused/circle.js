function callbackKorea(data) {
    // var indices = data[0];
    var index = [+data[0].globalIndex, +data[0].economic, +data[0].educational, +data[0].health, +data[0].political];
    var name = ['Total Index', 'Economic participation and opportunity', 'Educational attainment', 'Health and survival', 'Political empowerment']
    console.log(index);
    
    //Basic setting
    var w = 600, h = 200;
    var margin = {top:20, right:30, bottom: 50, left: 30};
    var innerW = w - margin.right - margin.left,
        innerH = h - margin.top - margin.bottom;

    var svg = d3.select('#koreaIndex').append('svg')
        .attr('width', w)
        .attr('height', h)
        .append('g')
        .attr('transform', 'translate('+ [margin.left, margin.top] + ')');

    
    //Set x and r scales
    var x = d3.scalePoint() 
        .domain(index.map(function(d){return index.indexOf(d)})) 
        .range([0, innerW]);
    var r = d3.scaleLinear()
        .domain([0, 1])
        .range([0, 50]);
    x.padding(0.2);

    //Draw circles
    var circle = svg.selectAll('circle.man')
        .data(index)
        .enter().append('circle')
        .attr('class', 'man')
        .attr('cx', function(d) {return x(index.indexOf(d))})
        .attr('cy', r(1))
        .attr('r', r(1))
        .attr('fill', '#009688')
        .attr('opacity', '0.2');

    //1에서 시작해서 줄어드는 에니매이션
    svg.selectAll('circle.woman')
        .data(index).enter()
        .append('circle')
            .attr('class', 'woman')
            .attr('cx', function(d) {return x(index.indexOf(d))})
            .attr('cy', function(d) {return r(1)*2-r(d)})
            .attr('r', function(d) {return r(d)})
            .attr('fill', '#83d0c9');

    //name of each circle
    svg.selectAll('text')
        .data(name).enter()
        .append('text')
        .attr('x', function(d) {return x(name.indexOf(d))})
        .attr('y', innerH)
        .attr('width', 100)
        .attr('font-size', '13px')
        .attr('text-anchor', 'middle')
        .text(function(d) {return d})
        .call(wrap);

    function wrap(text) {
        text.each(function() {
            var text = d3.select(this);
            var words = text.text().split(/\s+/).reverse();
            var lineHeight = 20;
            var width = parseFloat(text.attr('width'));
            var y = parseFloat(text.attr('y'));
            var x = text.attr('x');
            var anchor = text.attr('text-anchor');
        
            var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('text-anchor', anchor);
            var lineNumber = 0;
            var line = [];
            var word = words.pop();
    
            while (word) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    lineNumber += 1;
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text.append('tspan').attr('x', x).attr('y', y + lineNumber * lineHeight).attr('anchor', anchor).text(word);
                }
                word = words.pop();
            }
        });
    }

    // Tooltip
    d3.selectAll('circle')
    .on('mouseenter', function(d) {
        var hover = circle.filter(function(p) {return index.indexOf(d) === index.indexOf(p)})
            .classed('hover', true);
        var formatDecimal = d3.format(".1f");
        var tooltip = svg.selectAll('.tooltip')
            .data(hover.data());
        tooltip.enter().append('text')
            .attr('class', 'tooltip')
            .merge(tooltip)
            .attr('x', function(d){return x(index.indexOf(d))})
            .attr('y', function(d){return r(1)*2-r(d)*2})
            .style('visibility', 'visible')
            .text(function(d){return formatDecimal(d*100)+'%'})
        }).on('mouseleave', function() {
            var hover = circle.filter(function() {
                return d3.select(this).classed('hover')
        }).classed('hover', false);
    
    svg.selectAll('.tooltip')
        .style('visibility', 'hidden');
    });
}

d3.csv("/data/Category.csv").then(callbackKorea);