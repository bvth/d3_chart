
var data = [];
var step = 2.9;
for(var i=0;i<500;i++){
    data.push(Math.random()*step+.25);
    step = step*0.97;
    if(step < 1){
        step = 2.9;
    }
}
var svgWidth = 1000;
var svgHeight = 500;

var margin = {top: 30, right: 40, bottom: 50, left: 60};

var width = svgWidth - margin.left - margin.right //900
    height = svgHeight - margin.top - margin.bottom; //420	

var yDomain = [0,3]
    xDomain = [0,15];

var refDomain = [0,data.length];

var r = 3;		

var red_warning = 2.6;
// create scale objects
var xAxisScale =d3.scaleLinear()
    .domain(xDomain)
    .range([0,width]);

var yAxisScale = d3.scaleLinear()
    .domain(yDomain)
    .range([height,0]);

// create axis objects
var xAxis = d3.axisBottom(xAxisScale)    
            .ticks((width + 2) / (height + 2) * 10)
            .tickSize(-height-3)
            .tickPadding(8);
var yAxis = d3.axisLeft(yAxisScale)
            .ticks(10)
            .tickSize(-width)
            .tickPadding(8);

// Zoom Function
var zoom = d3.zoom()
    .scaleExtent([0.001, 100])
    //.translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomFunction);

//Drag function
var drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

// Inner Drawing Space
var innerSpace = d3.select("body").select(".inner_space")
    .call(zoom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

//set clip-path
var clip = innerSpace.append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height);

var chartBody = innerSpace.append("g")
                    .attr("class","chart_body")
                    .attr("clip-path", "url(#clip)");

// append some dummy data
var lineData = d3.line()
            .x(function(d,i) { return xAxisScale(i) })
            .y(function(d) { return yAxisScale(d) });

var lines = chartBody.append("path")
            .datum(data)
            .attr("class","line chart")
            .attr("d", function(d){return lineData(d)});

//set reference line - warning level
var refData = d3.line()
    .x(function(d){return xAxisScale(d)})
    .y(function() { return yAxisScale(red_warning) });
var ref_line = chartBody.append("path")
            .datum(refDomain)
            .attr("class","line ref_line")
            .attr("d", function(d){return refData(d)})
            .call(drag);

// Draw Axis
var gX = innerSpace.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

var gY = innerSpace.append("g")
    .attr("class", "y axis")
    .call(yAxis);

warning_check();

function zoomFunction(){
    // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(xAxisScale)
    // var new_yScale = d3.event.transform.rescaleY(yAxisScale)
    var new_xAxisScale;
    //prevent from getting out of min value of X axis
    if (new_xScale.domain()[0]>=0)
        new_xAxisScale= d3.scaleLinear().domain([new_xScale.domain()[0],new_xScale.domain()[1]]).range([0,width]);
    else
        new_xAxisScale= d3.scaleLinear().domain([0,new_xScale.domain()[1]]).range([0,width]);
    // update axes
    gX.call(d3.axisBottom(new_xAxisScale)
            .ticks((width + 2) / (height + 2) * 10)
            .tickSize(-height-3)
            .tickPadding(8));
    //gY.call(yAxis.scale(yAxisScale));

    lineData.x(function(d,i) { return new_xAxisScale(i) });

    //update chart
    chartBody.select(".line.chart").attr("d", function(d){return lineData(d)});
    chartBody.select(".line.ref_line").attr("d", function(d){return refData(d)});

};


function dragstarted(d) {
    d3.select(this).classed("active", true);
}

function dragged(d) {
    console.log(red_warning);
    red_warning=yAxisScale.invert(d3.event.y);
    console.log(red_warning);
    if(red_warning<=yDomain[1] && red_warning>=yDomain[0])
        d3.select(this).attr("d", function(){return refData(d)});
}

function dragended(d) {
    d3.select(this).classed("active", false);
}

//check for values over limit
function warning_check(){
    for(var i=0;i<data.length;i++){
        if(data[i]>=red_warning){
            console.log("found");
            chartBody.append("path")
                .datum([i,i])
                .attr("class","line warning_indicator")
                .attr("storke-width",1.5)
                .attr("d", function(){return refData(yDomain[1])});
        }
    }
}