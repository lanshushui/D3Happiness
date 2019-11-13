var csv2015;
var csv2016;
var csv2017;
var csv2018;
var csv2019;
var mapjson;
loadData();
function loadData(){
    d3.csv("data/2015.csv").then(function(data) {
      csv2015=data;
      if(loadSuccess()) start();
    });
    d3.csv("data/2016.csv").then(function(data) {
      csv2016=data;
      if(loadSuccess()) start();
    });
    d3.csv("data/2017.csv").then(function(data) {
      csv2017=data;
      if(loadSuccess()) start();
    });
    d3.csv("data/2018.csv").then(function(data) {
      csv2018=data;
      if(loadSuccess()) start();
    });
    d3.csv("data/2019.csv").then(function(data) {
      csv2019=data;
      if(loadSuccess()) start();
    });             
    d3.json("data/world-countries.json").then(function(json) {
       json.features= json.features.filter( function(value, key) {
        return value.properties.name != 'Antarctica'; //过滤南极洲
         });
        mapjson=json;
        if(loadSuccess()) start();
    });   
}
function loadSuccess(){
    return csv2015!=null&&csv2016!=null&&csv2017!=null&&csv2018!=null&&csv2018!=null&&mapjson!=null;
}

function start(){
    drawMap();
}
/*
 
 上述JS代码是加载数据，start函数开始可视化操作

*/
//画地图函数
function drawMap(){
    //绑定数据并为每一个GeoJSON feature创建一个路径
    //SVG的宽度和高度
    var w = 600;
    var h = 600;

    //定义地图的投影
    var projection = d3.geoMercator()
    .translate([w/2, h/2])
    .scale([90]);

    //定义路径生成器
    var path = d3.geoPath()
    .projection(projection);

    //创建SVG元素
    var svg = d3.select(".global-map")
    .append("svg")
    .attr("class","map")
    .attr("width", w)
    .attr("height", h);

    //画地图
    svg.selectAll("path")
    .data(mapjson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", function(d) {
             return "#ccc";
        })
    .on("mouseover", function(d,i) {  
      d3.select(this).attr('fill', 'rgba(2,2,139,0.61)');
    })
    .on("mouseout",function(d,i){
      d3.select(this).attr('fill', 'rgba(128,124,139,0.61');
    })
    .attr('stroke', 'rgba(255,255,255,1)')
    .attr('stroke-width', 1);
}
