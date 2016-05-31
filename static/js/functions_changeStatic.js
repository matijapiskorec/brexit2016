    // Static version
        function change(data) {

          /* ------- PIE SLICES -------*/
          var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(data), key);

          slice.enter()
            .insert("path")
            .style("fill", function(d) { return color(d.data.list); })
            .attr("class", "slice")
            .attr("d",arc);

          /* ------- TEXT LABELS -------*/

          var text = svg.select(".labels").selectAll("text")
            .data(pie(data), key);

          text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
              return d.data.list + ' (' + d.data.votes + ')';
            });

          function midAngle(d){
            return d.startAngle + (d.endAngle - d.startAngle)/2;
          }

          text
            .attr("transform", function(d) {
              var pos = outerArc.centroid(d);
              pos[0] = 0.85 * radius * (midAngle(d) < Math.PI ? 1 : -1);
              return "translate("+  pos +")";
            })
            .style("text-anchor", function(d){ 
              return midAngle(d) < Math.PI ? "start":"end"; 
            });

          /* ------- SLICE TO TEXT POLYLINES -------*/

          var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(data), key);
          
          polyline.enter()
            .append("polyline");

          polyline
            .attr("points", function(d){
              var pos = outerArc.centroid(d);
              pos[0] = radius * 0.80 * (midAngle(d) < Math.PI ? 1 : -1); // 0.80 finetunes horizontal distance
              return [arc.centroid(d), outerArc.centroid(d), pos];      
            });

        };