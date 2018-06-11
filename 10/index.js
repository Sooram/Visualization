d3.json('flare.json').then(callback);

function callback(data) {
    var hierarchy = d3.hierarchy(data, function (d) {
      return d.children
    });
    hierarchy.sum(function (d) {
        return d.size;
      }) //size를 합하여 value를 계산
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value;
      }) // expr1 || expr2 일때 expr1이 falsy value면 다음 값을 뱉어냄
   
    var w = 600,
      h = 400;
    var margin = {
      top: 40,
      right: 10,
      bottom: 10,
      left: 10
    };
    var innerW = w - margin.right - margin.left,
        innerH = h - margin.top - margin.bottom,
        transitioning;

    var paddingTop = 16;
    var treemap = d3.treemap() //treemap을 위한 데이터 구조를 생성하는 generator
        .size([innerW, innerH])
        .paddingTop(paddingTop);

    hierarchy = treemap(hierarchy); //기존 hierarchy 구조를 전달
    console.log(hierarchy);

    var opacityDomain = d3.extent(hierarchy.leaves(), function(d){return d.value;}); // 말단 노드의 value값의 범위를 가져온다.
    var opacity = d3.scaleLinear().domain(opacityDomain).range([0.4, 1.0]);

    var x = d3.scaleLinear()
      .domain([0, innerW])
      .range([0, innerW]);
  
    var y = d3.scaleLinear()
      .domain([0, innerH])
      .range([0, innerH]);

    var svg = d3.select('body').append('svg')
        .attr('width', w)
        .attr('height', h)
        .append('g')
        .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

    var nameText = svg.append("g")
      .attr("class", "nameText")
      .style('cursor', 'pointer');
  
    nameText.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    var curr = hierarchy;
    display(hierarchy);

    function display(d) { 
        nameText
            .datum(d)
            .on("click", function(d) {
                console.log('curr ' + curr.data.name);
                if(d.parent) {
                    curr = d.parent;
                    console.log('p ' + curr.data.name);
                    var g2 = display(curr),
                        t1 = g1.transition().duration(750),
                        t2 = g2.transition().duration(750);
                    x.domain([curr.x0, curr.x1]);
                    y.domain([curr.y0, curr.y1]);

                    g2.selectAll("text").style("fill-opacity", 0);
        
                    // Transition to the new view.
                    t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
                    t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
                    t1.selectAll("rect").call(rect);
                    t2.selectAll("rect").call(rect);

                    t1.remove().each("end", function() {
                        svg.style("shape-rendering", "crispEdges");
                        transitioning = false;
                      });
                }
            })
        .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".nameText")
            .datum(d)
            .attr("class", "depth")
        
        var g = g1.selectAll("g")
            .data(d.children)
            .enter().append("g");
        g.filter(function(d) { return d.children; })
            .classed("children", true)
            .on("click", function(d) {
                console.log(d);
                curr = d;
                console.log('curr ' + curr.data.name);
                if(curr.children) {
                    var g2 = display(curr),
                        t1 = g1.transition().duration(750),
                        t2 = g2.transition().duration(750);
                    
                    var xMax = Number.NEGATIVE_INFINITY;
                    var xMin = Number.POSITIVE_INFINITY;
                    var yMax = Number.NEGATIVE_INFINITY;
                    var yMin = Number.POSITIVE_INFINITY;
                    curr.children.forEach(function(d) {
                        xMax = xMax < d.x1? d.x1 : xMax;
                        xMin = xMin > d.x0? d.x0 : xMin;
                        yMax = yMax < d.y1? d.y1 : yMax;
                        yMin = yMin > d.y0? d.y0 : yMin;
                    })
                    x.domain([xMin, xMax]);
                    y.domain([yMin, yMax]);

                    g2.selectAll("text").style("fill-opacity", 0);
        
                    // Transition to the new view.
                    t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
                    t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
                    t1.selectAll("rect").call(rect);
                    t2.selectAll("rect").call(rect);

                    t1.remove().each("end", function() {
                        svg.style("shape-rendering", "crispEdges");
                        transitioning = false;
                      });
                }
                
            });

        var children = g.selectAll(".child")
            .data(function(d) { return d.children || [d]; })
            .enter().append("g");
        children
            .append("rect")
                .attr("class", "child")
                .call(rect)
          .append("title")
            .text(function(d) { return d.data.name; });

        g.append("rect")
            .attr("class", "parent")
            // .attr('clip-path', 'url(#bar-clip)')
            .call(rect);    
        var t = g
        // .append('clipPath')
        //     .attr('id', 'bar-clip')
        .append("text")
            .attr("class", "ptext")
            .attr("dy", ".75em")
            
        t.append("tspan")
            .text(function(d) { return d.data.name; })
        t.call(text);

        g.selectAll("rect")
            .style("fill", 'steelblue');        
        
        return g;
    
    }

    function name(d) {
        return d.parent? name(d.parent) + "." + d.data.name : d.data.name;
    }

    function text(text) {
        text.selectAll("tspan")
            .attr("x", function(d) { return x(d.x0) + 6; })
        text.attr("x", function(d) { return x(d.x0) + 6; })
            .attr("y", function(d) { return y(d.y0) + 6; })
    }
    
    function rect(rect) {
        rect.attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0); })
            .attr("height", function(d) { return y(d.y1) - y(d.y0); })
            .style('fill-opacity', function(d){return opacity(d.value)})
            .style('stroke', '#ddd')
            .style('cursor', 'pointer');
    }
}