  var csv2015;
  var csv2016;
  var csv2017;
  var csv2018;
  var mapjson;
  var regionColors = []; //['#FAEBD7','#CD853F','#8EE5EE','#FFE4E1','#00BFFF','#C0FF3E','#FFF5EE','#FF7F24','#FFFF00','#7FFFD4'];
  regionColors['Oceania'] = '#FAEBD7';
  regionColors['Asia'] = '#00BFFF';
  regionColors['South America'] = '#CD853F';
  regionColors['Europe'] = '#FFE4E1';
  regionColors['Africa'] = '#C0FF3E';
  regionColors['North America'] = '#8EE5EE';
  var countriesColor = ["#5CACEE", "#FF8C00", "#FF4500", "#A020F0", "#B3EE3A"];
  var selectRegions = ['Oceania', 'Asia', 'South America', 'Europe', 'Africa', 'North America'];
  var yearData;
  var selectCountry = "China";
  var isPressCtrl = false;
  var selectCountries = [];
  setKeyEventListener();
  loadData();
  initYearConsole();

  Array.prototype.remove = function(obj) {
      for (var i = 0; i < this.length; i++) {
          var temp = this[i];
          if (!isNaN(obj)) { //是数字
              temp = i;
          }
          if (temp == obj) {
              for (var j = i; j < this.length; j++) {
                  this[j] = this[j + 1];
              }
              this.length = this.length - 1;
          }
      }
  }

  function initYearConsole() {
      $(".year").click(function() {
          $(".year").attr("class", "year");
          $(this).attr("class", "year select-year");
          let curYear = $(this).attr("data-value");
          if (curYear == 2015) {
              yearData = csv2015;
          } else if (curYear == 2016) {
              yearData = csv2016;
          } else if (curYear == 2017) {
              yearData = csv2017;
          } else if (curYear == 2018) {
              yearData = csv2018;
          }
          changYear();
      });
  }

  function loadData() {
      d3.csv("data/2015.csv").then(function(data) {
          csv2015 = data;
          yearData = csv2015;
          if (loadSuccess()) start();
      });
      d3.csv("data/2016.csv").then(function(data) {
          csv2016 = data;
          if (loadSuccess()) start();
      });
      d3.csv("data/2017.csv").then(function(data) {
          csv2017 = data;
          if (loadSuccess()) start();
      });
      d3.csv("data/2018.csv").then(function(data) {
          csv2018 = data;
          if (loadSuccess()) start();
      });
      d3.json("data/world-countries.json").then(function(json) {
          json.features = json.features.filter(function(value, key) {
              return value.properties.name != 'Antarctica'; //过滤南极洲
          });
          mapjson = json;
          if (loadSuccess()) start();
      });
  }

  function loadSuccess() {
      return csv2015 != null && csv2016 != null && csv2017 != null && csv2018 != null && mapjson != null;
  }

  function start() {
      drawMap();
      initCountryRank();
      drawCountryRadar();
      drawLineChart();
      drawRegionBar(0);
      drawScatterChart(0);
  }
  //年份控制逻辑函数
  function changYear() {
      drawMap();
      initCountryRank();
      drawCountryRadar();
      drawRegionBar(0);
      drawScatterChart(0);
      $(".scatter-select .select-selected-value").text("健康分数-幸福分数");
      $(".box-region-bar-select .select-selected-value").text("Happiness Score");
      $(".select-item").attr("class", "select-item");
      $(".select-item:first").attr("class", "select-item select-item-selected");
      d3.select(".bar-chart").remove();
      if ($(".select-year").attr("data-value") == 2018) {
          $(".box-scatter .select-item[data-value='2']").hide();
          $(".box-region-bar .select-item[data-value='3']").hide();
      } else {
          $(".box-scatter .select-item[data-value='2']").show();
          $(".box-region-bar .select-item[data-value='3']").show();
      }

  }

  function showCountryInfo() {
      initCountryRank();
      drawCountryRadar();
      drawLineChart();

      function drawColorTip() {

          d3.select(".countries-color-tip").select("svg").remove();
          if (selectCountries.length == 0) return;
          let svg = d3.select(".countries-color-tip")
              .append("svg")
              .attr("width", "260")
              .attr("height", 40)
              .style("margin-top", "10px")

          svg.selectAll("rect")
              .data(selectCountries)
              .enter()
              .append("rect")
              .attr("x", function(d, i) {
                  return i % 3 * 90;
              })
              .attr("y", function(d, i) {
                  return parseInt(i / 3) * 20 + 5;
              })
              .attr("fill", function(d, i) {
                  return countriesColor[i];
              })

              .attr("width", function(d, i) { //每个矩形的宽度 
                  return 10;
              })
              .attr("height", function(d, i) { //每个矩形的宽度 
                  return 10;
              });
          svg.selectAll("text")
              .data(selectCountries)
              .enter()
              .append("text")
              .attr("x", function(d, i) {
                  return i % 3 * 90 + 20;
              })
              .attr("y", function(d, i) {
                  return parseInt(i / 3) * 20 + 13;
              })
              .text(function(d, i) {
                  return selectCountries[i];
              })
              .attr("fill", "white")
              .style("font-size", "10px");
      }
      drawColorTip();
  }

  function setKeyEventListener() {
      $(document).keydown(function(event) {
          if (event.keyCode == 17) {
              isPressCtrl = true;
          } else {
              isPressCtrl = false;
          }
      });
      $(document).keyup(function(event) {
          if (event.keyCode == 17) {
              isPressCtrl = false;
          }
      });
  }
  /*
   
   上述JS代码是加载数据，start函数开始可视化操作
   */



  //画饼状图
  function drawPie(originData, getAttr) {
      d3.select(".box-pie").select("svg").remove();

      function Region(country) {
          this.name = country.Region;
          this.avgValue = parseFloat(getAttr(country));
          this.num = 1;
          this.sum = yearData.filter(function(value, key) { return value.Region == country.Region }).length;
          this.countries = [country];
          this.addCountry = function(country) {
              this.countries.push(country);
              this.avgValue = ((this.avgValue * this.num) + parseFloat(getAttr(country))) / (this.num + 1);
              this.num += 1;
          }
      }
      var data = [];
      for (let i = 0; i < originData.length; i++) {
          var country = originData[i];
          var flag = false;
          for (let j = 0; j < data.length; j++) {
              if (data[j].name == country.Region) {
                  data[j].addCountry(country);
                  flag = true;
                  break;
              }
          }
          if (!flag) {
              data.push(new Region(country));
          }
      }
      data.sort(function(val1, val2) {
          return val2.num - val1.num;
      });
      if (data.length == 0) return;
      //上面代码初始化数据
      var width = 300;
      var height = 300;
      var innerR = 50;
      var outterR = innerR + 90;
      var svg = d3.select(".box-pie")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", "svg-pie");



      var pie = d3.pie()
          .sort(null)
          .value(function(d) {
              return d.num;
          });
      var pieData = pie(data);

      var bg = svg.append("g").attr("class", "bgWrapper");
      bg.append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("stroke", "white")
          .attr("fill", "transparent")
          .attr("r", innerR)
          .style("pointer-events", "none");
      bg.append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("stroke", "white")
          .attr("fill", "transparent")
          .attr("r", outterR)
          .style("pointer-events", "none");

      if (pieData.length!= 1){

          bg.selectAll("path")
              .data(pieData)
              .enter()
              .append("path")
              .attr("d", function(d, i) {

                  var path = d3.path();

                  var x0 = width / 2;
                  var y0 = height / 2;

                  var x1 = x0 + Math.sin(d.startAngle) * innerR;
                  var y1 = y0 - Math.cos(d.startAngle) * innerR;
                  path.moveTo(x1, y1);

                  var x2 = x0 + Math.sin(d.startAngle) * outterR;
                  var y2 = y0 - Math.cos(d.startAngle) * outterR;

                  path.lineTo(x2, y2);
                  return path.toString();
              })
              .style("stroke", "white")
              .style("stroke-width", 1);
      }

      bg.append("text")
          .attr("x", width / 2 - 15)
          .attr("y", height / 2 + 5)
          .attr("class", "Proportion")
          .attr("stroke", "white")
          .text(parseInt(pieData[0].data.num / originData.length * 100) + "%");


      var pieWrapper = svg.append("g").attr("class", "pieWrapper");
      var arcs = pieWrapper.selectAll("g")
          .data(pieData)
          .enter()
          .append("g")
          .attr("class", "arc")
          .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");


      arcs.append("path")
          .attr("fill", function(d, i) {
              return regionColors[data[i].name];
          })
          .attr("d", function(d) {

              var v = d.data;
              var r = (outterR - innerR) * v.num / v.sum;
              var arc = d3.arc()
                  .innerRadius(innerR)
                  .outerRadius(innerR + r);
              return arc(d);
          })
          .attr("stroke", "white")
          .on("mousemove", function(d, i) {
              bg.select(".Proportion").remove();
              bg.append("text")
                  .attr("x", width / 2 - 15)
                  .attr("y", height / 2 + 5)
                  .attr("class", "Proportion")
                  .attr("stroke", "white")
                  .text(parseInt(d.data.num / originData.length * 100) + "%");

              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('占' + d.data.name + '比重为' + (d.data.num / d.data.sum).toFixed(2));

              d3.select(this).attr('fill', 'rgba(255,99,71)');
              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px");


          })
          .on("mouseout", function(d, i) {
              d3.select(this).attr('fill', regionColors[d.data.name]);
              d3.select(".tooltip").style('display', 'none');
          });



  }
  /**
  画散点图
  **/
  function drawScatterChart(value) {
      function keys(d) {
          return d.Country;
      }

      function drawColorTip() {
          d3.select(".box-scatter").select("svg").remove();
          let svg = d3.select(".box-scatter")
              .select(".color-tip")
              .append("svg")
              .attr("width", "260")
              .attr("height", 40);
          var i = 0;

          for (var index in regionColors) {

              svg.append("circle")
                  .attr("cx", function(d) {
                      return i % 3 * 60 + 20;
                  })
                  .attr("cy", function(d) {
                      return parseInt(i / 3) * 20 + 10;
                  })
                  .attr("fill", function(d) {
                      if (selectRegions.indexOf(index) != -1) {
                          return regionColors[index];
                      } else {
                          return "black";
                      }
                  })
                  .attr("r", 5)
                  .attr("data", index)
                  .on("click", function(d, i) {
                      //点击事件
                      var name = d3.select(this).attr("data");
                      if (selectRegions.indexOf(name) != -1) {
                          selectRegions.remove(name);
                          d3.select(this).attr("fill", "black");
                      } else {
                          selectRegions.push(name);
                          d3.select(this).attr("fill", regionColors[name]);
                      }
                      drawScatterChart(value);
                  });

              svg.append("text")
                  .attr("x", i % 3 * 60 + 30)
                  .attr("y", parseInt(i / 3) * 20 + 13)
                  .text(index)
                  .attr("fill", "white")
                  .style("font-size", "10px");
              i = i + 1;
          }
      }

      function getXAttr(country) {
          if (value == 0) return country.Health;
          else if (value == 1) return country.Economy;
          else if (value == 2) return country.Family;
          else if (value == 3) return country.Freedom;
          else if (value == 4) return country.Trust;
          else if (value == 5) return country.Generosity;
      }

      function getXTitle() {
          if (value == 0) return "健康分数";
          else if (value == 1) return "人均GDP分数";
          else if (value == 2) return "家庭满足分数";
          else if (value == 3) return "自由分数";
          else if (value == 4) return "腐败感知分数";
          else if (value == 5) return "慷慨分数";
      }
      drawColorTip();
      var width = 600;
      var height = 400;
      var data = yearData.filter(function(value, key) { return selectRegions.indexOf(value.Region) != -1 });


      var scatterWrapper = d3.select(".svg-scatterWrapper");

      var svg;
      var circlesWrapper;
      if ($(".svg-scatterWrapper svg").length != 0) {
          svg = scatterWrapper.select("svg");
          circlesWrapper = svg.select(".circlesWrapper");

          svg.select(".axis").remove();
          svg.select(".xTitle").remove();
      } else {
          svg = scatterWrapper.append("svg")
              .attr("width", width)
              .attr("height", height + 40)
              .attr("class", "svg-scatter");
          circlesWrapper = svg.append("g").attr("class", "circlesWrapper");

      }
      var xAxisScale = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return parseFloat(getXAttr(d)); })])
          .range([0, (width - 60)]); //设置输出范围 

      var xAxis = d3.axisBottom()
          .scale(xAxisScale);

      var yAxisScale = d3.scaleLinear()
          .domain([10, 0])
          .range([0, (height - 70)]); //设置输出范围     


      var yAxis = d3.axisLeft()
          .scale(yAxisScale);

      svg.append("g") // 分组（group）元素
          .call(xAxis) // 在g元素上利用call函数调用xAxis
          .attr("class", "axis")
          .attr("transform", "translate(" + 50 + "," + (height - 40) + ")");

      // 调用y轴
      svg.append("g") // 分组（group）元素
          .call(yAxis) // 在g元素上利用call函数调用xAxis
          .attr("class", "yxis")
          .attr("transform", "translate(" + 50 + "," + 30 + ")");

      var xText = svg.append("text")
          .attr("x", "290")
          .attr("y", "410")
          .attr("class", "xTitle")
          .text(getXTitle())
          .style("letter-spacing", "5px");

      var yText = svg.append("text")
          .attr("x", "150")
          .attr("y", "-10")
          .text("幸福分数")
          .attr("class", "yTitle")
          .attr("transform", "rotate(90)")
          .style("letter-spacing", "5px");

      circlesWrapper
          .call(d3.brush() // Add the brush feature using the d3.brush function
              .extent([
                  [50, 30],
                  [width, height - 40]
              ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
              .on("start brush", function() {
                  var extent = d3.event.selection;
                  var x0 = extent[0][0],
                      x1 = extent[1][0],
                      y0 = extent[0][1],
                      y1 = extent[1][1];
                  var selectData = data.filter(function(value, key) {
                      cx = xAxisScale(getXAttr(value)) + 50;
                      cy = yAxisScale(value.HappinessScore) + 30;
                      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
                  });
                  drawPie(selectData, getXAttr);

              }) // Each time the brush selection changes, trigger the 'updateChart' function
          )

      var circles = circlesWrapper.selectAll("circle").data(data, keys);



      circles.enter()
          .append("circle")
          .merge(circles) //整合已存在的circle
          .on("mousemove", function(d, i) {

              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('国家名： ' + d.Country + '<br/>' + '幸福分数为' + d.HappinessScore +
                  '<br/>' + getXTitle() + '为' + getXAttr(d));

              d3.select(this).attr('fill', 'rgba(255,99,71)');
              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
          })
          .on("mouseout", function(d, i) {
              d3.select(this).attr('fill', regionColors[d.Region]);
              d3.select(".tooltip").style('display', 'none');
          })
          .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .attr("cx", function(d) {
              return xAxisScale(getXAttr(d)) + 50;
          })
          .attr("cy", function(d) {
              return yAxisScale(d.HappinessScore) + 30;
          })
          .attr("fill", function(d) {
              return regionColors[d.Region];
          })
          .attr("r", 5)


      circles.exit()
          .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .attr("cx", function(d) {
              return 0;
          })
          .style("opacity", 0)
          .attr("cy", function(d) {
              return 0;
          }).remove();

  }
  //////////////////////////////////////////////////////////////////////////////////////////////////
  /**
   画条形图
  **/
  function drawBar(countries, color) {
      d3.select(".bar-chart").remove();
      var data = countries.slice(0, 10);
      data.sort(function(val1, val2) {
          return val2.HappinessScore - val1.HappinessScore;
      });
      //生成对应数据
      //生成svg
      var width = 300;
      var height = data.length * 35 + 30;
      var svg = d3.select(".svg-bar")
          .append("svg")
          .attr("width", "100%")
          .attr("height", height + 40)
          .attr("class", "bar-chart");

      var xAxisScale = d3.scaleLinear()
          .domain([0, 10])
          .range([0, (width - 50)]); //设置输出范围 

      var yAxisScale = d3.scaleBand()
          .domain(data.map(function(element) { return element.Country }))
          .range([0, (height)])
          .paddingInner(1)
          .paddingOuter(1);

      var xAxis = d3.axisTop()
          .scale(xAxisScale);

      var yAxis = d3.axisLeft()
          .scale(yAxisScale);

      svg.append("g") // 分组（group）元素
          .call(xAxis) // 在g元素上利用call函数调用xAxis
          .attr("class", "axis")
          .attr("transform", "translate(" + 45 + "," + 30 + ")");

      // 调用y轴
      svg.append("g") // 分组（group）元素
          .call(yAxis) // 在g元素上利用call函数调用xAxis
          .attr("class", "yxis")
          .attr("transform", "translate(" + 45 + "," + 30 + ")");

      svg.select(".yxis")
          .selectAll("text")
          .attr("font-size", "7")
          .attr("fill", "white")
          .style("stroke-width", "1");
      svg.select(".axis")
          .selectAll("text")
          .attr("font-size", "10")
          .attr("fill", "white")
          .style("stroke-width", "1");
      //上面生成坐标轴

      var yScale = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([0, height])
          .paddingInner(1)
          .paddingOuter(1);


      var barWrapper = svg.append("g")
          .attr("class", "barWrapper");


      barWrapper.selectAll("rect") //选择了空集
          .data(data) //绑定dataSet
          .enter() //返回enter部分
          .append("rect") //数据中每个值，添加p元素
          .attr("fill", function(d, i) {
              return color;
          }) //设置颜色
          .attr("x", 0) //设置矩形左上角X坐标
          .attr("y", function(d, i) {
              return yScale(i) + 18;
          }) //设置矩形左上角Y坐标
          .attr("width", function(d) {
              return xAxisScale(d.HappinessScore); //设置每个条形的宽度
          })
          .attr("height", function(d) {
              return 20; //设置每个条形的高度
          })
          .attr("transform", "translate(" + 46 + "," + 0 + ")")
          .on("mousemove", function(d, i) {

              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('国家名： ' + d.Country + '<br/>' + '幸福分数为' + d.HappinessScore);

              d3.select(this).attr('fill', 'rgba(255,99,71)');
              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
          })
          .on("mouseout", function(d, i) {
              d3.select(this).attr('fill', color);
              d3.select(".tooltip").style('display', 'none');
          });
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //画区域信息
  function drawRegionBar(keyAttr) {

      function getAttr(country) {
          if (keyAttr == 0) {
              return parseFloat(country.HappinessScore);
          } else if (keyAttr == 1) {
              return parseFloat(country.Health);
          } else if (keyAttr == 2) {
              return parseFloat(country.Economy);
          } else if (keyAttr == 3) {
              return parseFloat(country.Family);
          } else if (keyAttr == 4) {
              return parseFloat(country.Freedom);
          } else if (keyAttr == 5) {
              return parseFloat(country.Trust);
          } else if (keyAttr == 6) {
              return parseFloat(country.Generosity);
          }
      }

      function keys(d) {
          return d.name;
      }

      function Region(country) {
          this.name = country.Region;
          this.value = getAttr(country);
          this.maxValue = getAttr(country);
          this.sum = 1;
          this.countries = [country];
          this.maxValueCountryName = country.Country;
          this.addCountry = function(country) {
              if (getAttr(country) == 0) return;
              this.countries.push(country);
              this.value = ((this.value * this.sum) + getAttr(country)) / (this.sum + 1);
              this.sum += 1;
              if (this.maxValue < getAttr(country)) {
                  this.maxValue = getAttr(country);
                  this.maxValueCountryName = country.Country;
              }
          }
      }

      var data = [];
      for (let i = 0; i < yearData.length; i++) {
          var country = yearData[i];
          var flag = false;
          for (let j = 0; j < data.length; j++) {
              if (data[j].name == country.Region) {
                  data[j].addCountry(country);
                  flag = true;
                  break;
              }
          }
          if (!flag) {
              data.push(new Region(country));
          }
      }
      var width = 350;
      var height = 350;
      var xAxisScale = d3.scaleBand()
          .range([0, (width - 50)])
          .domain(data.map(function(element) { return element.name }))
          .paddingInner(1);

      var yAxisScale = d3.scaleLinear()
          .domain([10, 0])
          .range([0, (height - 50)]); //设置输出范围     


      var xScale = d3.scaleBand()
          .domain(d3.range(data.length))
          .range([0, (width - 50)])
          .paddingInner(1)
          .paddingOuter(1);

      var svg = d3.select(".reigon-bar-div").select("svg");

      if ($(".reigon-bar-div svg").length != 0) {
          var bars = svg.selectAll("rect");
          bars.data(data, keys)
              .transition()
              .duration(500)
              .ease(d3.easeLinear)
              .attr("x", function(d, i) {
                  return xScale(i); //设置矩形左上角X坐标
              })
              .attr("y", function(d, i) {
                  return yAxisScale(d.value) + 30; //设置矩形左上角Y坐标
              })
              .attr("width", function(d) {
                  return 25; //设置每个条形的宽度
              })
              .attr("height", function(d) {
                  return height - 20 - yAxisScale(d.value) - 30; //设置每个条形的高度
              });

          var circles = svg.selectAll("circle");
          circles.data(data, keys)
              .transition()
              .duration(500)
              .ease(d3.easeLinear)
              .attr("cx", function(d, i) {
                  return xScale(i) + 12;
              })
              .attr("cy", function(d, i) {
                  return yAxisScale(d.maxValue) + 30;
              });
          return;
      }
      //上面代码初始化数据

      svg = d3.select(".reigon-bar-div")
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("class", "svg-bar");

      var xAxis = d3.axisBottom()
          .scale(xAxisScale);


      var yAxis = d3.axisLeft()
          .scale(yAxisScale);

      svg.append("g") // 分组（group）元素
          .call(xAxis) // 在g元素上利用call函数调用xAxis
          .attr("class", "axis")
          .attr("transform", "translate(" + 25 + "," + (height - 20) + ")");

      // 调用y轴
      svg.append("g") // 分组（group）元素
          .call(yAxis) // 在g元素上利用call函数调用xAxis
          .attr("class", "yxis")
          .attr("transform", "translate(" + 25 + "," + 30 + ")");
      svg.select(".axis").selectAll(".tick").remove();


      var barWrapper = svg.append("g")
          .attr("class", "barWrapper");


      barWrapper.selectAll("rect") //选择了空集
          .data(data, keys) //绑定dataSet
          .enter() //返回enter部分
          .append("rect") //数据中每个值，添加p元素
          .attr("fill", function(d, i) {
              return regionColors[d.name];
          }) //设置颜色
          .attr("x", function(d, i) {

              return xScale(i); //设置矩形左上角X坐标
          })
          .attr("y", function(d, i) {
              return yAxisScale(d.value) + 30; //设置矩形左上角Y坐标
          })
          .attr("width", function(d) {
              return 25; //设置每个条形的宽度
          })
          .attr("height", function(d) {
              return height - 20 - yAxisScale(d.value) - 30; //设置每个条形的高度
          })
          .on("mousemove", function(d, i) {

              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('洲名： ' + d.name + '<br/>' + '分数为' + d.value.toFixed(2));

              d3.select(this).attr('fill', 'rgba(255,99,71)');
              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
          })
          .on("mouseout", function(d, i) {
              d3.select(this).attr('fill', regionColors[d.name]);
              d3.select(".tooltip").style('display', 'none');
          });


      var circleWrapper = svg.append("g")
          .attr("class", "circleWrapper");

      circleWrapper.selectAll("circle") //选择了空集
          .data(data, keys) //绑定dataSet
          .enter() //返回enter部分
          .append("circle") //数据中每个值，添加p元素
          .attr("cx", function(d, i) {
              return xScale(i) + 12;
          })
          .attr("cy", function(d, i) {
              return yAxisScale(d.maxValue) + 30;
          })
          .attr("fill", function(d) {
              return regionColors[d.name];
          })
          .attr("r", 4)
          .on("mousemove", function(d, i) {

              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('国家名： ' + d.maxValueCountryName + '<br/>' + '分数为' + d.maxValue.toFixed(2));

              d3.select(this).attr('fill', 'rgba(255,99,71)');
              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
          })
          .on("mouseout", function(d, i) {
              d3.select(this).attr('fill', regionColors[d.name]);
              d3.select(".tooltip").style('display', 'none');
          });
  }
  //////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //画折线图
  function drawLineChart() {
      if (selectCountries.length == 0) {
          d3.select(".box-linechart").select('.title').text("Happiness Scores of " + selectCountry);
      } else {
          d3.select(".box-linechart").select('.title').text("Happiness Scores of Some");
      }



      var colors = ["#5CACEE", "#FF8C00", "#FF4500", "#A020F0", "#B3EE3A"];
      var originData = [];
      if (selectCountries.length == 0) {
          originData.push(selectCountry);
      } else {
          originData = selectCountries;
      }
      var data = [];

      for (var i = 0; i < originData.length; i++) {

          var name = originData[i];
          var iData;
          var iArr = [];
          var o = {};
          o['x'] = 0;
          o['y'] = 0;
          iArr.push(o);

          var o = {};
          iData = csv2015.filter(function(value, key) { return value.Country == name; })[0];
          o['x'] = 2015;
          o['y'] = iData['HappinessScore'];
          iArr.push(o);

          var o = {};
          iData = csv2016.filter(function(value, key) { return value.Country == name; })[0];
          o['x'] = 2016;
          o['y'] = iData['HappinessScore'];
          iArr.push(o);

          var o = {};
          iData = csv2017.filter(function(value, key) { return value.Country == name; })[0];
          o['x'] = 2017;
          o['y'] = iData['HappinessScore'];
          iArr.push(o);

          var o = {};
          iData = csv2018.filter(function(value, key) { return value.Country == name; })[0];
          o['x'] = 2018;
          o['y'] = iData['HappinessScore'];

          iArr.push(o);
          iArr.name = name;
          data.push(iArr);
      }
      //上面代码初始化数据
      //创造SVG
      var svg;

      var width = 320;
      var height = 320;

      var xAxisScale = d3.scaleBand()
          .range([0, (width - 50)])
          .domain(data[0].map(function(element) { return element.x }))
          .paddingInner(1);

      var yAxisScale = d3.scaleLinear()
          .domain([10, 0])
          .range([0, (height - 50)]); //设置输出范围    
      if ($(".svg-linechart svg").length == 0) {

          svg = d3.select(".svg-linechart")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("class", "line-chart");


          var xAxis = d3.axisBottom()
              .scale(xAxisScale);


          var yAxis = d3.axisLeft()
              .scale(yAxisScale);

          svg.append("g") // 分组（group）元素
              .call(xAxis) // 在g元素上利用call函数调用xAxis
              .attr("class", "axis")
              .attr("transform", "translate(" + 20 + "," + (height - 20) + ")");

          // 调用y轴
          svg.append("g") // 分组（group）元素
              .call(yAxis) // 在g元素上利用call函数调用xAxis
              .attr("class", "yxis")
              .attr("transform", "translate(" + 20 + "," + 30 + ")");

      } else {
          svg = d3.select(".svg-linechart").select("svg");
      }

      //曲线盒子
      var linecharWrappers = svg.selectAll(".linecharWrapper").data(data);

      linecharWrappers.select("path")
          .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .attr("d", function(d, i) {
              var x0 = 20;
              var y0 = height - 20;

              var yScale = d3.scaleLinear()
                  .domain([0, 10])
                  .range([0, (height - 50)]);
              var xScale = xAxisScale;

              var path = d3.path();
              for (let i = 1; i < d.length; i++) {
                  if (i == 1) {
                      let x = x0 + xScale(d[i].x);
                      let y = y0 - yScale(d[i].y);
                      path.moveTo(x, y);
                  } else {
                      let x = x0 + xScale(d[i].x);
                      let y = y0 - yScale(d[i].y);
                      path.lineTo(x, y);
                      path.moveTo(x, y);
                  }
              }
              return path.toString();
          })
          .style("stroke", function(d, i) { return colors[i]; });


      //上面代码创建坐标轴，下面绘画曲线
      linecharWrappers.enter()
          .append("g")
          .attr("class", "linecharWrapper")
          .append("path")
          .attr("class", "linechartArea")
          .attr("d", function(d, i) {
              var x0 = 20;
              var y0 = height - 20;

              var yScale = d3.scaleLinear()
                  .domain([0, 10])
                  .range([0, (height - 50)]);
              var xScale = xAxisScale;

              var path = d3.path();
              for (let i = 1; i < d.length; i++) {
                  if (i == 1) {
                      let x = x0 + xScale(d[i].x);
                      let y = y0 - yScale(d[i].y);
                      path.moveTo(x, y);
                  } else {
                      let x = x0 + xScale(d[i].x);
                      let y = y0 - yScale(d[i].y);
                      path.lineTo(x, y);
                      path.moveTo(x, y);
                  }
              }
              return path.toString();
          })
          .style("stroke", function(d, i) { return colors[i]; })
          .style("stroke-width", 3)
          .on("mousemove", function(d, i) {
              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('国家名： ' + d.name);

              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
          })
          .on("mouseout", function(d, i) {
              d3.select(".tooltip").style('display', 'none');
          });
      linecharWrappers.exit().remove();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //画雷达
  function drawCountryRadar() {
      if (selectCountries.length == 0) {
          d3.select(".box-radar").select('.title').text("Data Affecting " + selectCountry + "'s Happiness");
      } else {
          d3.select(".box-radar").select('.title').text("Data Affecting " + "Some's Happiness");
      }

      var radarconfig = {
          width: 320,
          height: 320,
          fill_opacity: 0.1,
          levels: 5, //多少个同心圆
          slicenum: 5, //多少个切片
          labelFactor: 1.25,
          maxR: 120,
          strokeWidth: 2,
          angleSlice: Math.PI * 2 / 5
      }
      var allAxis = ['HappinessScore', 'Health', 'Freedom', 'Trust', 'Generosity'];

      ////创造数据
      var originData;
      if (selectCountries.length != 0) {
          originData = yearData.filter(function(value, key) {
              return selectCountries.indexOf(value.Country) != -1;
          });
          for (let i = 0; i < selectCountries.length; i++) {
              for (let j = 0; j < originData.length; j++) {
                  if (selectCountries[i] == originData[j].Country) {
                      var temp = originData[i];
                      originData[i] = originData[j];
                      originData[j] = temp;
                      break;
                  }
              }
          }
      } else {
          originData = yearData.filter(function(value, key) {
              return value.Country == selectCountry;
          });
      }

      var data = [];
      for (var j = 0; j < originData.length; j++) {
          var iData = originData[j];
          var arr = [];
          for (let i in iData) {
              if (!allAxis.includes(i)) continue;
              let o = {};
              o['axis'] = iData[i]; //即添加了key值也赋了value值 o[i] 相当于o.name 此时i为变量
              arr.push(o);
          }
          arr.color = countriesColor[j];
          data.push(arr);
      }
      data.sort(function(a, b) {
          return b[0].axis - a[0].axis;
      });
      //范围尺
      var rScale = d3.scaleLinear()
          .range([0, radarconfig.maxR])
          .domain([0, 1]);

      var svg;
      var g;
      if ($(".svg-radar svg").length == 0) {
          //创造SVG
          var width = radarconfig.width;
          var height = radarconfig.height;
          svg = d3.select(".svg-radar")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("class", "china-radar");
          //雷达的区域
          g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");


          //这段加上下面一段代码才会出现同心圆
          var filter = g.append('defs').append('filter').attr('id', 'glow'),
              feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
              feMerge = filter.append('feMerge'),
              feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
              feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

          //背景坐标svg
          var axisGrid = g.append("g").attr("class", "axisWrapper");

          axisGrid.selectAll(".levels")
              .data(d3.range(1, radarconfig.levels + 1).reverse())
              .enter()
              .append("circle")
              .attr("class", "gridCircle")
              .attr("r", function(d, i) { return radarconfig.maxR / radarconfig.levels * d; })
              .style("fill", "#CDCDCD")
              .style("stroke", "#CDCDCD")
              .style("fill-opacity", radarconfig.fill_opacity)
              .style("filter", "url(#glow)");

          //上面两端代码出现圆形背景
          /////
          /////
          //出现百分比文字
          axisGrid.selectAll(".axisLabel")
              .data(d3.range(1, radarconfig.levels + 1).reverse())
              .enter().append("text")
              .attr("class", "axisLabel")
              .attr("x", 0)
              .attr("y", function(d) { return -d * radarconfig.maxR / radarconfig.levels; })
              .attr("dy", "0.4em")
              .style("font-size", "10px")
              .attr("fill", "#ffffffaa")
              .text(function(d, i) {
                  return 100 * d / radarconfig.levels + "%";
              });

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
              .attr("x2", function(d, i) { return radarconfig.maxR * Math.cos(radarconfig.angleSlice * i - Math.PI / 2); })
              .attr("y2", function(d, i) { return radarconfig.maxR * Math.sin(radarconfig.angleSlice * i - Math.PI / 2); })
              .attr("class", "line")
              .style("stroke", "#ffffffaa")
              .style("stroke-width", "1px");

          //每个轴的名字
          axis.append("text")
              .attr("class", "legend")
              .style("font-size", "10px")
              .attr("text-anchor", "middle")
              .attr("dy", "0em")
              .attr('fill', "#ffffffaa")
              .attr("x", function(d, i) { return (radarconfig.maxR + 10) * Math.cos(radarconfig.angleSlice * i - Math.PI / 2); })
              .attr("y", function(d, i) { return (radarconfig.maxR + 20) * Math.sin(radarconfig.angleSlice * i - Math.PI / 2); })
              .text(function(d) { return d });

          //显示数据图

      } else {
          svg = d3.select(".svg-radar").select("svg");
          g = svg.select("g");
      }

      //Create a wrapper for the blobs  
      var blobWrappers = g.selectAll(".radarWrapper").data(data);

      blobWrappers.select("path").style("fill", function(d, i) { return d.color; })
          .transition()
          .duration(500)
          .ease(d3.easeLinear)
          .attr("d", function(d, i) {
              console.log("dsfsdfasd");
              var path = d3.path();
              for (let i = 0; i < d.length; i++) {
                  if (i == 0) {
                      let x = d[i].axis / 10 * radarconfig.maxR * Math.cos(radarconfig.angleSlice * i - Math.PI / 2);
                      let y = d[i].axis / 10 * (radarconfig.maxR) * Math.sin(radarconfig.angleSlice * i - Math.PI / 2);
                      path.moveTo(x, y);
                  } else {
                      let x = d[i].axis * radarconfig.maxR * Math.cos(radarconfig.angleSlice * i - Math.PI / 2);
                      let y = d[i].axis * (radarconfig.maxR) * Math.sin(radarconfig.angleSlice * i - Math.PI / 2);
                      path.lineTo(x, y);

                  }
              }
              path.closePath();
              return path.toString();
          });

      blobWrappers.enter()
          .append("g")
          .attr("class", "radarWrapper")
          .append("path")
          .attr("class", "radarArea")
          .style("fill", function(d, i) { return d.color; })
          .style("fill-opacity", 0.9)
          .on("mousemove", function(d, i) {
              d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0.1);
              d3.select(this).transition().duration(200).style("fill-opacity", 0.9);
          })
          .on("mouseout", function(d, i) {
              d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0.9);
          })
          .attr("d", function(d, i) {
              var path = d3.path();
              for (let i = 0; i < d.length; i++) {
                  if (i == 0) {
                      let x = d[i].axis / 10 * radarconfig.maxR * Math.cos(radarconfig.angleSlice * i - Math.PI / 2);
                      let y = d[i].axis / 10 * (radarconfig.maxR) * Math.sin(radarconfig.angleSlice * i - Math.PI / 2);
                      path.moveTo(x, y);
                  } else {
                      let x = d[i].axis * radarconfig.maxR * Math.cos(radarconfig.angleSlice * i - Math.PI / 2);
                      let y = d[i].axis * (radarconfig.maxR) * Math.sin(radarconfig.angleSlice * i - Math.PI / 2);
                      path.lineTo(x, y);

                  }
              }
              path.closePath();
              return path.toString();
          });


      blobWrappers.exit().remove();

  }
  //显示国家排序
  function initCountryRank() {
      if (selectCountries.length == 0) {
          d3.select(".box-china").select('.title').text("//      " + selectCountry + " Happiness Rank" + "      //");
          for (var i = 0; i < yearData.length; ++i) {
              //获取国家名
              var country = yearData[i].Country;
              if (country == selectCountry) {
                  d3.select(".box-china").select('p').text(yearData[i].HappinessRank);
                  break;
              }
          }
      } else {
          d3.select(".box-china").select('.title').text("//      " + "Some Countries Happiness Rank" + "      //");
          d3.select(".box-china").select('p').text("");
          for (let j = 0; j < selectCountries.length; j++) {
              var temp = yearData.filter(function(value, key) { return value.Country == selectCountries[j]; })[0];
              if (d3.select(".box-china").select('p').text() == "") {
                  d3.select(".box-china").select('p').text(temp.HappinessRank);
              } else {
                  d3.select(".box-china").select('p').text(d3.select(".box-china").select('p').text() + "," + temp.HappinessRank);
              }
          }
      }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
  //画地图函数
  function drawMap() {
      d3.select(".global-map").select("svg").remove();
      //初始化happinessScore变量
      for (var j = 0; j < mapjson.features.length; ++j) {
          mapjson.features[j].properties.happinessScore = parseFloat(0);
      }
      for (var i = 0; i < yearData.length; ++i) {
          //获取国家名
          var country = yearData[i].Country;
          //获取对应的幸福分数
          var happinessScore = yearData[i].HappinessScore;
          //在GeoJSON中找到相应的州
          for (var j = 0; j < mapjson.features.length; ++j) {
              var jsonCountry = mapjson.features[j].properties.name;
              if (country == jsonCountry || (country == "United States" && jsonCountry == "United States of America")) {
                  //把幸福数据值复制到json中
                  mapjson.features[j].properties.happinessScore = happinessScore;
                  //停止循环JSON数据
                  break;
              }
          }
      }
      //颜色选择
      var color = d3.scaleLinear()
          .range(["rgb(0,255,255)", "rgb(255,170,0)"])
          .domain([
              1, 10
          ]);
      //绑定数据并为每一个GeoJSON feature创建一个路径
      //SVG的宽度和高度
      var w = 600;
      var h = 450;

      //定义地图的投影
      var projection = d3.geoMercator()
          .translate([w / 2, h / 1.5])
          .scale([90]);

      //定义路径生成器
      var path = d3.geoPath()
          .projection(projection);

      //创建SVG元素
      var svg = d3.select(".global-map")
          .append("svg")
          .attr("class", "map")
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
          .attr('stroke', 'rgba(255,255,255,1)')
          .attr('stroke-width', 1)
          .on("mousemove", function(d, i) {
              if (d.properties.happinessScore == 0) return;

              d3.select(".tooltip").style('display', 'block');
              d3.select(".tooltip").html('国家名： ' + d.properties.name + '<br/>' + '幸福分数为' + d.properties.happinessScore);

              d3.select(this).attr('fill', 'rgba(255,99,71)');
              d3.select(".tooltip").style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY) + "px")
          })
          .on("mouseout", function(d, i) {
              var value = d.properties.happinessScore;
              if (selectCountries.indexOf(d.properties.name) != -1 ||
                  (selectCountries.indexOf("United States") != -1 && d.properties.name == "United States of America")) return;
              if (value) {
                  d3.select(this).attr('fill', color(value));
              } else {
                  d3.select(this).attr('fill', "#ccc");
              }

              d3.select(".tooltip").style('display', 'none');
          })
          .on("click", function(d, i) {
              //点击事件
              if (d.properties.happinessScore == 0) return;
              var tempSelect = d.properties.name;
              if (tempSelect == "United States of America") tempSelect = "United States";
              if (isPressCtrl) {
                  if (selectCountries.length < 5) {
                      d3.select(this).attr('fill', 'rgba(255,99,71)');
                      selectCountries.push(tempSelect);
                      tempSelect = undefined;
                  }
              } else if (!isPressCtrl && selectCountries.length != 0) {
                  selectCountries = [];
                  drawMap();
                  selectCountry = d.properties.name;
                  if (selectCountry == "United States of America") selectCountry = "United States";
              } else {
                  selectCountries = [];
                  selectCountry = d.properties.name;
                  if (selectCountry == "United States of America") selectCountry = "United States";
              }
              showCountryInfo();
          });

  }