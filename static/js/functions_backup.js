
var sabor2015 = angular.module('sabor2015', []);

sabor2015.controller('sabor2015ctrl', ['$scope', '$http', function ($scope, $http) {

    $scope.user_info = {};

    $scope.setRegion = function(region) {
      $scope.user_info.vote_region = region;
      $scope.$apply();
    };

    $scope.setList = function(list) {
      $scope.user_info.vote_list = list;
      $scope.$apply();
    };

    $scope.setMeta = function(meta) {
      $scope.user_info.vote_meta = meta;
      $scope.$apply();
    };

    $scope.setParties = function(parties) {
      $scope.user_info.vote_parties = parties;
      $scope.$apply();
    };

    // Generic function for retrieving data
    $scope.getData = function(url) {
      $http(url)
        .success(function (data) {
          $scope.masterData = data;
          $scope.error = ''; // clear the error messages

        })
        .error(function (data, status) {
          if (status === 404) {
            $scope.error = 'Database not available!';
          } else {
            $scope.error = 'Error: ' + status;
          }
        });
    };

    // Generic function for retrieving data
    $scope.getFriendsData = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.friends_data = data;
          $scope.error = ''; // clear the error messages

        })
        .error(function (data, status) {
          if (status === 404) {
            $scope.error = 'Database not available!';
          } else {
            $scope.error = 'Error: ' + status;
          }
        });
    };

    // Following data is retrieved as soon as the web page loads
    // We could retrieve it through server's filesystem or through rest call
    // For retrieving from server's filesystem, depending on server's configuration you can also retrieve compressed json: user_info.json.gz

    // Data on user
    $scope.loadUserData = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.initial_user_info = data;
          $scope.error = ''; // clear the error messages

          if (data.returning_user) {
            $('#results').show(1000);
            $scope.getFriendsData("../data/friends_data.json");
          }

        })
        .error(function (data, status) {
          if (status === 404) {
            $scope.error = 'Database not available!';
          } else {
            $scope.error = 'Error: ' + status;
          }
      });
    };

    // // Data on user
    // $http({url: "../data/new_user_info.json", method: 'GET'}) // Mockup for new user (has {"returning_user": false})
    // // $http({url: "../data/user_info.json", method: 'GET'}) // Mockup for returning user (has {"returning_user": true})
    //   .success(function (data) {
    //     $scope.initial_user_info = data;
    //     $scope.error = ''; // clear the error messages

    //     if (data.returning_user) {
    //       $('#results').show(1000);
    //       $scope.getFriendsData("../data/friends_data.json");
    //     }

    //   })
    //   .error(function (data, status) {
    //     if (status === 404) {
    //       $scope.error = 'Database not available!';
    //     } else {
    //       $scope.error = 'Error: ' + status;
    //     }
    //   });

    // Data on political parties
    $http({url: "../data/parties.json", method: 'GET'}) 
      .success(function (data) {
        $scope.parties = data;
        $scope.error = ''; // clear the error messages
      })
      .error(function (data, status) {
        if (status === 404) {
          $scope.error = 'Database not available!';
        } else {
          $scope.error = 'Error: ' + status;
        }
      });

    // Data on election regions and lists in them
    $http({url: "../data/election_regions.json", method: 'GET'}) 
      .success(function (data) {
        $scope.election_regions = data;
        $scope.error = ''; // clear the error messages
      })
      .error(function (data, status) {
        if (status === 404) {
          $scope.error = 'Database not available!';
        } else {
          $scope.error = 'Error: ' + status;
        }
      });

    // Data on election regions
    $http({url: "../data/regions.json", method: 'GET'}) 
      .success(function (data) {
        $scope.regions = data;
        $scope.error = ''; // clear the error messages
      })
      .error(function (data, status) {
        if (status === 404) {
          $scope.error = 'Database not available!';
        } else {
          $scope.error = 'Error: ' + status;
        }
      });

}]);


// Buttons for mockup loading of user data
sabor2015.directive('loadUserData', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<button id="button-new-user" class="btn btn-lg btn-default">Novi korisnik</button>' + 
        '<button id="button-old-user" class="btn btn-lg btn-default">Stari korisnik</button>'
      );

      $("#button-new-user").click(function (e) {
        scope.loadUserData("../data/new_user_info.json");
      });

      $("#button-old-user").click(function (e) {
        scope.loadUserData("../data/user_info.json");
      });

    }};

}); 


sabor2015.directive('regions', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      // size="2" is a workaround so that first option is not automatically selected
      // https://github.com/davidstutz/bootstrap-multiselect/issues/129
      $(element).html(
        '<select id="question-region" size="2"></select>'
      );

      scope.$watch('regions', function (newData, oldData) {

        if (!newData) { return; }

        var regions = newData; // regions is also in controller scope

        regions.forEach( function(d) {
            $('#question-region').append(
              '<option value="' + d.id + '">' + d.label + '</option>'
              );
          });

        $("#question-region").multiselect({
          nonSelectedText: 'Odaberite izbornu jedinicu...',
          onChange: function(option, checked, select) {
            scope.setRegion($(option).val());
            }
        });

      });

      scope.$watchGroup(['regions','initial_user_info.vote_region'], function (newData, oldData) {

        if (!newData[0] || !newData[1]) { return; }
        $("#question-region").multiselect('select', newData[1]);

        console.log('Inicijalna izborna jedinica je postavljena na ' + newData[1]);
      });

      scope.$watch('user_info.vote_region', function (newData, oldData) {

        if (!newData) { return; }

        console.log('Korisnik je odabrao izbornu jedinicu ' + newData);
      });

    }};

}); 


sabor2015.directive('questionList', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      // size="2" is a workaround so that first option is not automatically selected
      // https://github.com/davidstutz/bootstrap-multiselect/issues/129
      $(element).html(
        '<select id="question-list" size="2"></select> ' + 
        '<div id="selected-list-label"></div>'
      );

      $("#question-list").multiselect({
        nonSelectedText: 'Prije izbora stranke odaberite izbornu jedinicu!',
        onChange: function(option, checked, select) {
            scope.setList($(option).val());
          }
      });

      // var election_regions;

      // Build dropdown menu for parties based on chosen election region
      var buildMenuLists = function (vote_region) {
          $('#question-list').empty();
          var parties_in_region = scope.election_regions.filter(function(d){return _.includes(d.regions,Number(vote_region));});
          parties_in_region.forEach( function(d) {
              $('#question-list').append(
                '<option value="' + d.party_id + '">' + d.short_name + '</option>'
                );
            });
          $("#question-list").multiselect('setOptions',{
            nonSelectedText: 'Odaberite stranku iz izborne jedinice ' + vote_region + '...'
          });
          $('#question-list').multiselect('rebuild');
      }

      var updateSelectedListLabel = function(vote_list) {
          $('#selected-list-label').empty();
          $('#selected-list-label').append('Odabrali ste sljedeću listu stranaka:')
          var temp_parties = _.pluck(_.where(scope.election_regions,{'party_id':Number(vote_list)}), 'party');
          var parties = temp_parties[0].split(',').map(function(d){return d.trim();});

          parties.forEach( function(d) {
              $('#selected-list-label').append(
                '<p style="margin-bottom:0px;">' + d + '</p>'
                );
            });
      }

      scope.$watchGroup(['election_regions','initial_user_info.vote_region','initial_user_info.vote_list'], function (newData, oldData) {

        if ( !newData[0] || !newData[1] || !newData[2]) { return; }
        
        // election_regions = newData[0]; // new
        buildMenuLists(newData[1]); // new
        updateSelectedListLabel(newData[2]);
        
        $("#question-list").multiselect('select', newData[2]);

        console.log('Inicijalna izborna jedinica za koju je korisnik glasao je ' + newData[1] + ' pa smo izgradili izbornik lista. Korisnik je glasao za stranku ' + newData[2]);

      });

      scope.$watch('user_info.vote_region', function (newData, oldData) {

        if ( !newData ) { return; }
        buildMenuLists(newData);

        // We have to reset the vote for list to some default value because that list maybe doesn't exist in the new region.
        // scope.setList("4");  // THIS GIVES ERRORS BECAUSE THE CHANGE PROPAGATES ALL THE WAY TO CALCULATION OF LABEL FOR LIST OF PARTIES
        // scope.setList("-1"); // This gives error for reasons unknown to me.
        scope.user_info.vote_list = "-1"; // This works.

        $('#selected-list-label').empty();
        console.log('Ups, netko je postavio novu izbornu jedinicu (' + newData + '), moramo resetirati liste!');

      });

      scope.$watch('user_info.vote_list', function (newData, oldData) {

        if ( !newData ) { return; }
        if (newData==-1) { return; } // This means that vote got reset after choosing new region, do nothing.
        updateSelectedListLabel(newData);
        console.log('Korisnik je odabrao listu ' + newData + ' iz ' + scope.user_info.vote_region + ' izborne jedinice.');

      });

    }};

}); 


sabor2015.directive('questionMeta', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div class="slider-row">' +
          '<input id="question-meta" type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="0"/>' +
        '</div>'
      );

      $("#question-meta").slider({
          ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80,90, 100],
          ticks_labels: ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
          ticks_snap_bounds: 1
        }
      );

      $("#question-meta").on('slideStop', function(e) {
        console.log(e.value);
        scope.setMeta(e.value);
      });
      

     scope.$watch('initial_user_info.vote_meta', function (newData, oldData) {

        if (!newData) { return; }

        $("#question-meta").slider('setValue',newData);

        console.log('Inicijalna vrijednost meta pitanja je ' + newData);
      });

    }};

}); 


sabor2015.directive('buttonVote', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div style="height:5px;clear:both;"></div>' +
        '<p id="current-vote-label"></p>' +
        '<div style="height:5px;clear:both;"></div>' +
        '<button id="button-vote" class="btn btn-lg btn-default">Glasaj</button>'
      );

      $("#button-vote").click(function (e) {

        // User has to change at least one question (from his previous session) in order to submit a new vote
        // And the vote for list must not be -1 because this means that he changed a region in the meantime

        // TODO: UNDER ONE SESSION, USER CAN SUBMIT AS MANY ANSWERS AS HE WANTS, EVEN IF THEY ARE ALL THE SAME! 
        // TODO: IF USER CHANGES HIS VOTE AND THEN RETURNS THE OLD VALUES BEFORE SUBMITTING, HE WILL BE ABLE TO SUBMIT ALTHOUGH ANSWERS ARE THE SAME!

        if ( (scope.user_info.vote_region || scope.initial_user_info.vote_region ) && // region should be defined
             (scope.user_info.vote_list || scope.initial_user_info.vote_list ) && scope.user_info.vote_list!=-1 && // list should be defined and not reset (-1)
             (scope.user_info.vote_meta || scope.user_info.vote_meta==0 || scope.initial_user_info.vote_meta || scope.initial_user_info.vote_meta==0 ) && // meta should be defined, but it could also be 0
             (scope.user_info.vote_region || scope.user_info.vote_list || scope.user_info.vote_meta || scope.user_info.vote_meta==0 ) // at least one new information, otherwise no use in voting
             ) {

          // All values which are not set by the user in this session should be taken from initialization
          var region = scope.user_info.vote_region ? scope.user_info.vote_region : scope.initial_user_info.vote_region;
          var list = scope.user_info.vote_list ? scope.user_info.vote_list : scope.initial_user_info.vote_list;
          var meta = scope.user_info.vote_meta || scope.user_info.vote_meta==0 ? scope.user_info.vote_meta : scope.initial_user_info.vote_meta;

          var list_name = _.pluck(_.where(scope.election_regions,{'party_id':Number(list)}), 'short_name');
          $('#current-vote-label').text('Glasali ste za izbornu listu ' + list_name + ' (' + region + ' izborna jedinica) i predviđate da će dobiti ' + meta + '% glasova na izborima.');
        
          user_vote({'list': list, 
                     'meta': meta,
                     'region': region
                    });
        }
        else {
          $('#current-vote-label').html('<span style="color:red">Molim vas odgovorite na sva tri pitanja!</span>');
        }

      });

      var user_vote = function (d) {

        var list_name = _.pluck(_.where(scope.election_regions,{'party_id':Number(d.list)}), 'party');
        console.log('Glasali ste za stranku ' + list_name + ' (' + d.region + ' izborna jedinica) i predviđate da će dobiti ' + d.meta + ' glasova na izborima.');

        $('#results').show(1000);
        scope.getFriendsData("../data/friends_data.json");

        // // TODO: Here goes ajax call!
        // var data = 'vote=' + vote_value;
        // $.ajax({
        //   url: "/vote/",
        //   type: "POST",
        //   data: data,
        //   cache: true,
        //   success: function (data, textStatus, jqXHR) {
        //     current_vote = data;
        //     change_btn_vote_style(current_vote);
        //     change_vote_msg(current_vote);
        //     draw_results();
        //   },
        //   complete: function (jqXHR, textStatus) {},
        //   error: function (jqXHR, textStatus, errorThrown) {}
        // });

      }

    }};

}); 


sabor2015.directive('results', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

     scope.$watch('friends_data', function (newData, oldData) {

        if (!newData) { return; }

        $(element).show(1000);

      });

    }};

}); 


sabor2015.directive('statisticsOfFriends', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

     scope.$watch('friends_data', function (newData, oldData) {

        if (!newData) { return; }

        var friends_data = newData;

        // This could go outside watch but then we have problems with duplication of text labels...

        $(element).html(
          '<div id="statistics-of-friends"></div>'
        );

        var margin = { top: 100, right: 20, bottom: 50, left: 150 },
            width = 700 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        
        var x = d3.scale.linear().range([width, 0]);
        var y = d3.scale.ordinal().rangeRoundBands([0, height], .1);

        // TODO: Find better way to assign colors to parties!
        var color = d3.scale.ordinal()
          .range([d3.rgb(165,0,38), d3.rgb(244,109,67), d3.rgb(254,224,144), d3.rgb(116,173,209), d3.rgb(49,54,149)]);
        
        var xAxis = d3.svg.axis()
          .scale(x)
          .ticks(10, "%")
          .orient("top");

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

        $("#statistics-of-friends").empty();
        
        var svg = d3.select("#statistics-of-friends").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // ... up to here.

        x.domain([1.1*d3.max(friends_data.map(function(d){return d.votes;})),0]);
        y.domain(friends_data.map(function(d){return d.party;}));
        
        svg.append("g")
            .attr("class", "x axis")
            .call(xAxis)
        .append("text")
            .attr("x", width/2)
            .attr("dy", "-30px")
            .style("text-anchor", "center")
            .text("postotak glasova");
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        d3.selectAll(".axis text").style("font-size","15px");

        svg.selectAll(".bar")
            .data(friends_data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("width", function(d) { return x(d.votes); })
            .attr("y", function(d) { return y(d.party); })
            .attr("height", y.rangeBand())
            .attr("fill", "steelblue")
            .transition()
            .duration(1500)
            .attrTween("width", function (d) {
              return d3.interpolate(0, x(d.votes));
            });
        
        svg.selectAll(".bar-text")
           .data(friends_data)
        .enter().append("text")
            .attr("x", function(d) { return x(d.votes); })
            .attr("y", function(d) { return y(d.party); })
            .attr("dx",20)
            .attr("dy",15)
            .attr("text-anchor", "middle")
            .transition()
            .duration(1500)
            .tween("text", 
              function(d) {
                  var i = d3.interpolate(this.textContent, Math.round(d.votes*100));
                  return function(t) {
                      this.textContent = Math.round(i(t)) + "%";
                      };
              })
            .attrTween("x", function (d) {
              return d3.interpolate(0, x(d.votes));
            });

      });

    }};

}); 


sabor2015.directive('questionExtra', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
          '<select id="question-parties" multiple="multiple"></select>' +
          '<div style="height:5px;clear:both;"></div>' +
          '<p id="selected-parties-label"></p>' +
          '<div style="height:5px;clear:both;"></div>' +
          '<button id="button-vote-parties" class="btn btn-lg btn-default">Glasaj</button>'
        );

      // $("#question-parties").multiselect({
      //   nonSelectedText: 'Prije izbora stranke odaberite izbornu jedinicu!',
      //   onChange: function(option, checked, select) {
      //       scope.setList($(option).val());
      //     }
      // });

      var updateSelectedPartiesLabel = function(vote_parties) {

          if (vote_parties.length!=0) {
            var selected_parties_names = vote_parties.map(function(d){return _.pluck(_.where(scope.parties,{'id':Number(d)}),'name')[0];});
            $('#selected-parties-label').text('Sljedeće stranke simpatizirate: ');
            selected_parties_names.forEach(function(d) {
               $('#selected-parties-label').append('<p style="margin-bottom:0px;">' + d + '</p>');
            });
          }
          else {
            $('#selected-parties-label').html('<span style="color:red">Molim vas odaberite barem jednu stranku koju simpatizirate!</span>');
          }
      }

      $("#button-vote-parties").click(function (e) {

          if (scope.user_info.vote_parties.length!=0) {
            user_vote_extra({'parties': scope.user_info.vote_parties});
            updateSelectedPartiesLabel(scope.user_info.vote_parties);
          }
          else {
            $('#selected-parties-label').html('<span style="color:red">Molim vas odaberite barem jednu stranku koju simpatizirate!</span>');
          }

          // // We can fetch selected parties in onChange callback of multiselect, but it's better to do it directly here.
          // var selected_parties = [];
          // $('#question-parties option:selected').each(function(i,d){
          //     selected_parties.push($(this).val()); // If we want text then use $(this).text()
          // });

          // if (selected_parties.length!=0) {
          //   var selected_parties_names = selected_parties.map(function(d){return _.pluck(_.where(scope.parties,{'id':Number(d)}),'name')[0];});
          //   $('#current-vote-extra-label').text('Sljedeće stranke simpatizirate: ');
          //   selected_parties_names.forEach(function(d) {
          //      $('#current-vote-extra-label').append('<p style="margin-bottom:0px;">' + d + '</p>');
          //   });

          //   user_vote_extra({'parties': selected_parties});
          // }
          // else {
          //   $('#current-vote-extra-label').html('<span style="color:red">Molim vas odaberite barem jednu stranku koju simpatizirate!</span>');
          // }

      });

     var user_vote_extra = function (d) {

        console.log('Simpatizirate sljedeće stranke: ' + d.parties );

        // TODO: Here goes ajax call!

      }

      var buildMenuParties = function(parties) {

        parties.forEach( function(d) {
            $('#question-parties').append(
              '<option value="' + d.id + '">' + d.name + '</option>'
              );
          });

        $("#question-parties").multiselect({
          maxHeight: 200,
          enableCaseInsensitiveFiltering: true,
          onChange: function(option, checked, select) {
            var selected_parties = [];
            $('#question-parties option:selected').each(function(i,d){
                selected_parties.push($(this).val()); // If we want text then use $(this).text()
            });
            scope.setParties(selected_parties);
          },
          buttonText: function(options, select) {
            if (options.length === 0) {
                return 'Odaberite stranke koje simpatizirate...';
            }
            else 
            if (options.length===1) {
                return  '1 stranka odabrana';
            }
            else if (options.length===2 || options.length===3) {
                return  options.length + ' stranke odabrane';
            }
            else {
                return options.length + ' stranki odabranih';
            }
          }
        });

      };

      scope.$watch('parties', function (newData, oldData) {

        if (!newData) { return; }

        buildMenuParties(newData);
        
        // newData.forEach( function(d) {
        //     $('#question-parties').append(
        //       '<option value="' + d.id + '">' + d.name + '</option>'
        //       );
        //   });

        // $("#question-parties").multiselect({
        //   maxHeight: 200,
        //   enableCaseInsensitiveFiltering: true,
        //   buttonText: function(options, select) {
        //     if (options.length === 0) {
        //         return 'Odaberite stranke koje simpatizirate...';
        //     }
        //     else 
        //     if (options.length===1) {
        //         return  '1 stranka odabrana';
        //     }
        //     else if (options.length===2 || options.length===3) {
        //         return  options.length + ' stranke odabrane';
        //     }
        //     else {
        //         return options.length + ' stranki odabranih';
        //     }
        //   }
        // });


      });

      // For returning users, after login we update the state of all questions based on what we retrieved from database.
      scope.$watchGroup(['regions','initial_user_info.vote_parties'], function (newData, oldData) {

        if (!newData[0] || !newData[1]) { return; }
        $('#question-parties').multiselect('select', newData[1]);
        updateSelectedPartiesLabel(newData[1]);

        console.log('Inicijalne stranke koje se simpatiziraju su ' + newData[1]);
      });


    }};

}); 

