  var csv2015;
  var csv2016;
  var csv2017;
  var csv2018;
  var csv2019;
  var mapjson;
  var csvname;
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
    d3.csv("data/name.csv").then(function(data) {
      csvname=data;
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
    return csv2015!=null&&csv2016!=null&&csv2017!=null&&csv2018!=null&&csv2018!=null&&mapjson!=null&&csvname!=null;
  }
  function engToChinese(name){
    for(let i=0;i<csvname.length;i++){
      if(csvname[i].English==name){
        return csvname[i].Chinese;
      }
    }
  }
  function start(){
    drawMap();
    initChinaRank();
    drawChinaRadar();
    drawLineChart();
    drawPie();
    }
  /*
   
   上述JS代码是加载数据，start函数开始可视化操作

   */
   //画条形图
   /**

   **/
   function drawBar(regionName,color){
    d3.select(".bar-chart").remove();
    var data=[];
    for(let i=0;i<csv2015.length;i++){
      var temp=csv2015[i];
      if(temp.Region==regionName){
        data.push(temp);
      }
      if(data.length==10) {
        break;
      }
    }
    data.sort(function(val1,val2){
        return val2.HappinessScore-val1.HappinessScore;
    });
    //生成对应数据
    //生成svg
    var width=300;
    var height=data.length*35+30;
    var svg = d3.select(".svg-bar")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height+40)
    .attr("class", "bar-chart");

    var xAxisScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0,(width-50)]);  //设置输出范围 

    var yAxisScale = d3.scaleBand()
        .domain(data.map(function(element) {return element.Country}))
        .range([0, (height)])
        .paddingInner(1)
        .paddingOuter(1);   

    var xAxis = d3.axisTop()
        .scale(xAxisScale);

    var yAxis = d3.axisLeft()
        .scale(yAxisScale);

    svg.append("g")  // 分组（group）元素
         .call(xAxis)  // 在g元素上利用call函数调用xAxis
         .attr("class","axis")
         .attr("transform","translate(" + 45+ "," + 30 +")") ;        

        // 调用y轴
    svg.append("g")  // 分组（group）元素
         .call(yAxis)  // 在g元素上利用call函数调用xAxis
         .attr("class","yxis")
         .attr("transform","translate(" + 45+ "," + 30 +")") ;  

    svg.select(".yxis")
      .selectAll("text")
      .attr("font-size","7")
      .attr("fill","white")
      .style("stroke-width","1"); 
    svg.select(".axis")
      .selectAll("text")
      .attr("font-size","10")
      .attr("fill","white")
      .style("stroke-width","1");    
    //上面生成坐标轴

    var yScale = d3.scaleBand()
        .domain(d3.range(data.length))
        .range([0, height])
        .paddingInner(1)
        .paddingOuter(1);  

     console.log(yScale);   
    var barWrapper = svg.append("g")
        .attr("class", "barWrapper");


    barWrapper.selectAll("rect")       //选择了空集
    .data(data)        //绑定dataSet
    .enter()                  //返回enter部分
    .append("rect")       //数据中每个值，添加p元素
    .attr("fill",function (d,i) {
        return color;
        }) //设置颜色
    .attr("x",0)                            //设置矩形左上角X坐标
    .attr("y",function (d,i) {
        return yScale(i)+18;
        })                            //设置矩形左上角Y坐标
    .attr("width", function(d){
        return xAxisScale(d.HappinessScore);       //设置每个条形的宽度
    })
    .attr("height", function(d){
     return 20;//设置每个条形的高度
    })
    .attr("transform","translate(" + 46+ "," + 0 +")")
    .on("mousemove", function(d,i) { 

        d3.select(".tooltip").style('display','block');
        d3.select(".tooltip").html('国家名： '+d.Country+'<br/>'+'幸福分数为'+d.HappinessScore);

        d3.select(this).attr('fill', 'rgba(255,99,71)');
        d3.select(".tooltip").style("left",(d3.event.pageX)+"px")
        .style("top",(d3.event.pageY)+"px")
      })
    .on("mouseout",function(d,i){
      d3.select(this).attr('fill', color);
      d3.select(".tooltip").style('display','none');
    });    

  }
   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //画饼状图
  function drawPie(){
    function Region(name,happiness){
      this.name=name;
      this.avgHappiness=parseFloat(happiness);
      this.sum=1;
      this.addCountry=function(tempHappiness){
         this.avgHappiness=((this.avgHappiness*this.sum)+parseFloat(tempHappiness))/(this.sum+1);
         this.sum+=1;
      }
    }
    var data=[];
    for(let i=0;i<csv2015.length;i++){
        var country=csv2015[i];
        var flag=false;
        for(let j=0;j<data.length;j++){
            if(data[j].name==country.Region){
              data[j].addCountry(country.HappinessScore);
              flag=true;
              break;
            }
        }
        if(!flag){
            data.push(new Region(country.Region,country.HappinessScore));
        }
    }
    data.sort(function(val1,val2){
        return val2.avgHappiness-val1.avgHappiness;
    });
   // console.log(data);
    //上面代码初始化数据
    var width=200;
    var height=200;
    var svg = d3.select(".svg-pie")
    .append("svg")
    .attr("width", width)
    .attr("height",height)
    .attr("class", "pie")
    ;

    var piedata=data.map(function(element) {return element.avgHappiness;});
    var colors=['#FAEBD7','#CD853F','#8EE5EE','#FFE4E1','#00BFFF','#C0FF3E','#FFF5EE','#FF7F24','#FFFF00','#7FFFD4'];
    var arc = d3.arc()
        .innerRadius(width/3)
        .outerRadius(width/2);    
    //显示圆饼    
    var arcs = svg.selectAll("g")
      .data(d3.pie()(piedata))  // 经过转换后的数据
      .enter()
      .append("g")
      .attr("class", "arc")
      .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");  

    arcs.append("path")
     .attr("fill", function(d, i) {
        return colors[i];
     })
     .attr("d", arc)
     
     .on("mousemove", function(d,i) { 
        d3.select("html").style("cursor","pointer");
      })
     .on("mouseout",function(d,i){
        d3.select("html").style("cursor","default");
      })
     .on("click", function (d,i) {
        //点击事件
        drawBar(data[i].name,colors[i]);
      });


     //显示百分比文字
     arcs.append("text")
     .attr("transform", function(d) {

           return "translate(" + arc.centroid(d) + ")";    // 弧中心坐标
       })
       .attr("text-anchor", "middle")
       .attr("fill",'black') 
       .style("font-size", "10px")   
       .style("pointer-events","none")
       .text(function(d,i) {
        return (d.data/(d3.sum(piedata))*100).toFixed(1)+"%"; //显示地区文字
    });    

    divs=d3.select(".piecolortip").selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .style("display","block")
    ;

    divs.append("div")
    .style("width","14px")
    .style("height","14px")
    .style("display","inline-block")
    .style("vertical-align","middle")
    .style("background-color",function(d,i){
      return colors[i];
    });
    divs.append("div")
    .style("color","white")
    .style("font-size", "10px") 
    .style("display","inline-block")
    .style("height","10px")
    .style("text-align","center")
    .style("line-height","10px")
    .style("margin-left","20px")
    .html(function(d,i){
      return d.name;
    }); 

  } 
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //画折线图
  function drawLineChart(){
     var data=[];

     var chinadata;
    
     var o = {};
     o['x']=0;
     o['y']=0;
     data.push(o);

     var o = {};
     chinadata=csv2015.filter( function(value, key) {return value.Country == 'China'; })[0];
     o['x']=2015;
     o['y']=chinadata['HappinessScore'];
     data.push(o);

     var o = {};
     chinadata=csv2016.filter( function(value, key) {return value.Country == 'China'; })[0];
     o['x']=2016;
     o['y']=chinadata['HappinessScore'];
     data.push(o);

     var o = {};
     chinadata=csv2017.filter( function(value, key) {return value.Country == 'China'; })[0];
     o['x']=2017;
     o['y']=chinadata['HappinessScore'];
     data.push(o);

     var o = {};
     chinadata=csv2018.filter( function(value, key) {return value.Country == 'China'; })[0];
     o['x']=2018;
     o['y']=chinadata['HappinessScore'];
     data.push(o);

  

     //上面代码初始化数据
     //创造SVG
    var width=320;
    var height=320;
    var svg = d3.select(".svg-linechart")
    .append("svg")
    .attr("width", width)
    .attr("height",height)
    .attr("class", "line-chart");


    var xAxisScale = d3.scaleBand()
        .range([0, (width-50)])
        .domain(data.map(function(element) {return element.x}))
        .paddingInner(1);

    var yAxisScale = d3.scaleLinear()
        .domain([10, 0])
        .range([0,(height-50)]);  //设置输出范围     

    var xAxis = d3.axisBottom()
        .scale(xAxisScale);


    var yAxis = d3.axisLeft()
        .scale(yAxisScale);

    svg.append("g")  // 分组（group）元素
         .call(xAxis)  // 在g元素上利用call函数调用xAxis
         .attr("class","axis")
         .attr("transform","translate(" + 20+ "," + (height-20) +")") ;        

        // 调用y轴
    svg.append("g")  // 分组（group）元素
         .call(yAxis)  // 在g元素上利用call函数调用xAxis
         .attr("class","yxis")
         .attr("transform","translate(" + 20+ "," + 30 +")") ;   


  //曲线盒子
    var g = svg.append("g")
    .attr("class", "linecharWrapper");
    //上面代码创建坐标轴，下面绘画曲线
    g.append("path")
      .attr("class", "linechartArea")
      .attr("d", function(d,i) {
      var x0=20;
      var y0=height-20;

      var yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0,(height-50)]);  
      var xScale=xAxisScale;

      var path = d3.path();
      for(let i=1;i<data.length;i++){
        if(i==1) {
          let x=x0+xScale(data[i].x);
          let y=y0-yScale(data[i].y);
          path.moveTo(x, y);
        } else{
          let x=x0+xScale(data[i].x);
          let y=y0-yScale(data[i].y);
          path.lineTo(x, y);
        }
      }
       return path.toString();
    })
    .style("fill", function(d,i) { return '#ff5555'; })
    .style("fill-opacity", 0.7);

   }
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //画雷达
   function drawChinaRadar(){
    var radarconfig={
        width: 320,
        height: 320,
        fill_opacity: 0.1,
        levels: 5,//多少个同心圆
        slicenum: 5,//多少个切片
        labelFactor: 1.25,
        maxR: 120,
        strokeWidth: 2, 
        angleSlice : Math.PI * 2 / 5
        }
    var allAxis=['HappinessScore','Health','Freedom','Trust','Generosity'];

    ////创造数据
    var chinadata=csv2015.filter( function(value, key) {
          return value.Country == 'China'; //只选中国
        })[0];
    var data = [];
    var arr = [];
    for (let i in chinadata) {
      if(!allAxis.includes(i)) continue; 
      let o = {};
      o['axis'] = chinadata[i]; //即添加了key值也赋了value值 o[i] 相当于o.name 此时i为变量
      arr.push(o);
      } 
    data.push(arr);
      
    //范围尺
    var rScale = d3.scaleLinear()
    .range([0, radarconfig.maxR])
    .domain([0, 1]);

    
    //创造SVG
    var width=radarconfig.width;
    var height=radarconfig.height;
    var svg = d3.select(".svg-radar")
    .append("svg")
    .attr("width", width)
    .attr("height",height)
    .attr("class", "china-radar");
    //雷达的区域
    var g = svg.append("g").attr("transform", "translate(" + width/2+ "," + width/2 +")");

    
    //这段加上下面一段代码才会出现同心圆
    var filter = g.append('defs').append('filter').attr('id','glow'),
    feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
    feMerge = filter.append('feMerge'),
    feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
    feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

    //背景坐标svg
    var axisGrid = g.append("g").attr("class", "axisWrapper");

    axisGrid.selectAll(".levels")
    .data(d3.range(1,radarconfig.levels+1).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function(d, i){return radarconfig.maxR/radarconfig.levels*d;})
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", radarconfig.fill_opacity)
    .style("filter" , "url(#glow)");

    //上面两端代码出现圆形背景
    /////
    /////
    //出现百分比文字
    axisGrid.selectAll(".axisLabel")
    .data(d3.range(1,radarconfig.levels+1).reverse())
    .enter().append("text")
    .attr("class", "axisLabel")
    .attr("x", 0)
    .attr("y", function(d){return -d*radarconfig.maxR/radarconfig.levels;})
    .attr("dy", "0.4em")
    .style("font-size", "10px")
    .attr("fill", "#ffffffaa")
    .text(function(d,i) {
      return 100*d/radarconfig.levels+"%"; }
      );

     //每个元素的父盒子
     var axis = axisGrid.selectAll(".axis")
     .data(allAxis)
     .enter()
     .append("g")
     .attr("class", "axis");
    //每个轴的线
    axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function(d, i){ return  radarconfig.maxR*Math.cos(radarconfig.angleSlice*i - Math.PI/2); })
    .attr("y2", function(d, i){ return radarconfig.maxR* Math.sin(radarconfig.angleSlice*i - Math.PI/2); })
    .attr("class", "line")
    .style("stroke", "#ffffffaa")
    .style("stroke-width", "1px");

    //每个轴的名字
    axis.append("text")
    .attr("class", "legend")
    .style("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("dy", "0em")
    .attr('fill',"#ffffffaa")
    .attr("x", function(d, i){ return (radarconfig.maxR+10)* Math.cos(radarconfig.angleSlice*i - Math.PI/2); })
    .attr("y", function(d, i){ return (radarconfig.maxR+20)* Math.sin(radarconfig.angleSlice*i - Math.PI/2); })
    .text(function(d){return d}) ;

    //显示数据图

    
    
  //Create a wrapper for the blobs  
  var blobWrapper = g.selectAll(".radarWrapper")
  .data(data)
  .enter()
  .append("g")
  .attr("class", "radarWrapper");
  
  //Append the backgrounds  
  blobWrapper
  .append("path")
  .attr("class", "radarArea")
  .attr("d", function(d,i) { 
    var path = d3.path();
    for(let i=0;i<d.length;i++){
      if(i==0) {
        let x=d[i].axis/10*radarconfig.maxR*Math.cos(radarconfig.angleSlice*i - Math.PI/2);
        let y=d[i].axis/10*(radarconfig.maxR)* Math.sin(radarconfig.angleSlice*i - Math.PI/2);
        path.moveTo(x, y);
      } else{
        let x=d[i].axis*radarconfig.maxR*Math.cos(radarconfig.angleSlice*i - Math.PI/2);
        let y=d[i].axis*(radarconfig.maxR)* Math.sin(radarconfig.angleSlice*i - Math.PI/2);
        path.lineTo(x, y);
       }
     }
    return path.toString();
   })
  .style("fill", function(d,i) { return '#ff5555'; })
  .style("fill-opacity", 0.7);
  
}
  //显示中国排序
  function initChinaRank(){
    for (var i = 0; i < csv2015.length; ++i) {
          //获取国家名
          var country = csv2015[i].Country;
          if (country=='China') {
            d3.select(".box-china").select('p').text(csv2015[i].HappinessRank);
            break;
          }
        }
    }
   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
  //画地图函数
  function drawMap(){
      //初始化happinessScore变量
      for(var j = 0; j < mapjson.features.length; ++j){
        mapjson.features[j].properties.happinessScore =parseFloat(0);
      }
      for (var i = 0; i < csv2015.length; ++i) {
          //获取国家名
          var country = csv2015[i].Country;
          //获取对应的幸福分数
          var happinessScore = csv2015[i].HappinessScore;
          //在GeoJSON中找到相应的州
          for (var j = 0; j < mapjson.features.length; ++j) {
            var jsonCountry = mapjson.features[j].properties.name;
            if (country == jsonCountry||(country=="United States"&&jsonCountry=="United States of America")) {
                  //把幸福数据值复制到json中
                  mapjson.features[j].properties.happinessScore = happinessScore;
                  //停止循环JSON数据
                  break;
                }
              }
            }
       //颜色选择
       var color = d3.scaleLinear()
       .range(["rgb(0,255,255)","rgb(255,170,0)"])
       .domain([
        1,10
        ]);
      //绑定数据并为每一个GeoJSON feature创建一个路径
      //SVG的宽度和高度
      var w = 600;
      var h = 450;

      //定义地图的投影
      var projection = d3.geoMercator()
      .translate([w/2, h/1.5])
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
                //根据快乐值设置颜色
                var value = d.properties.happinessScore;
                if (value) {
                  return color(value);
                } else {
                  return "#ccc";
                }
              })
      .on("mousemove", function(d,i) { 
        if(d.properties.happinessScore==0) return;

        d3.select(".tooltip").style('display','block');
        d3.select(".tooltip").html('国家名： '+d.properties.name+'<br/>'+'幸福分数为'+d.properties.happinessScore);

        d3.select(this).attr('fill', 'rgba(255,99,71)');
        d3.select(".tooltip").style("left",(d3.event.pageX)+"px")
        .style("top",(d3.event.pageY)+"px")
      })
      .on("mouseout",function(d,i){
       var value = d.properties.happinessScore;
       if (value) {
        d3.select(this).attr('fill', color(value));
      } else {
        d3.select(this).attr('fill', "#ccc");
      }

      d3.select(".tooltip").style('display','none');
    })
      .attr('stroke', 'rgba(255,255,255,1)')
      .attr('stroke-width', 1);
    }


