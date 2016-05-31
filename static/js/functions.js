
var brexit = angular.module('brexit', []);

brexit.controller('brexitCtrl', ['$scope', '$http', function ($scope, $http) {

    $scope.user_info = {};

    $scope.codeToRegion = {
          'C': 'North East England',
          'D': 'North West England',
          'E': 'Yorkshire and Humberside',
          'F': 'East Midlands',
          'G': 'West Midlands',
          'H': 'East of England',
          'I': 'Greater London',
          'J': 'South East England',
          'K': 'South West England',
          'L': 'Wales',
          'M': 'Scotland',
          'N': 'Northern Ireland'
        };

    $scope.codeToAge = {
        0: '18-29 years',
        1: '30-39 years',
        2: '40-49 years',
        3: '50-59 years',
        4: '60+ years'
    };

    $scope.codeToVote = {
        'R': 'remain',
        'L': 'leave'
    };

    $scope.setRegion = function(d) {
      $scope.user_info.region = d;
      $scope.$apply();
    };

    $scope.setPostcode = function(d) {
      $scope.user_info.postcode = d;
      $scope.$apply();
    };

    $scope.setPostcodeCheck = function(d) {
      $scope.postcode_check = d;
      $scope.$apply();
    };

    $scope.setAgeGroup = function(age_group) {
      $scope.user_info.age_group = age_group;
      $scope.$apply();
    };

    $scope.setVote = function(vote) {
      $scope.user_info.vote = vote;
      $scope.$apply();
    };

    $scope.setMeta1 = function(meta1) {
      $scope.user_info.meta1 = meta1;
      $scope.$apply();
    };

    $scope.setMeta2 = function(meta2) {
      $scope.user_info.meta2 = meta2;
      $scope.$apply();
    };

    // Generic function for retrieving data
    $scope.getTotalVotes = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.total_votes = data;
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

    $scope.getFriendsVotes = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.friends_votes = data;
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

    // TODO: TOKEN IS INJECTED BY SERVER INTO THE TEMPLATE, AND STORED IN document.cookie.
    $scope.sendAnswers = function(url,data) {
      $http({url: url, 
             data: data, 
             xsrfHeaderName: "CSRF-Token",
             xsrfCookieName: "csrf_token",
             method: 'POST'})
        .success(function (data, status, headers, config) {
          // TODO: Maybe here we should request data on friends and global statistics?
          console.log("Successfully sent answers to server!");
        })
        .error(function (data, status) {
          if (status === 405) { // Or 404!
            $scope.error = 'Database not available!';
            // TODO: Because this endpoint is not working we return csrf token here for testing.
            //       (Otherwise it goes in success callback.)
            document.cookie = "csrf_token=NewVersionOfTheSuperSecretToken123";
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
          
          $scope.postcode_check = false; // We probably loaded postcode but we still have to check it.

          if (data.returning_user) {
            $('#results').show(1000);
            $scope.getVotesInTime("../data/votes_in_time.json");
            $scope.getTotalVotes("../data/total_votes.json");
            $scope.getFriendsVotes("../data/friends_votes.json");
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

    // TODO: This is loaded even on the welcome page. Maybe this is not neccessary?
    $scope.loadUserData("../data/new_user_info.json");
    // $scope.loadUserData("../data/user_info.json");


    // Data on votes in time
    $scope.getVotesInTime = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.votes_in_time = data;
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

    // TODO: THIS SHOULD BE LOADED FROM SERVER WITH AJAX CALL!
    $scope.totalNumberOfVotes = Math.floor(Math.random()*10000);

    // Get data on constituency and their corresponding regions
    $http({url: "../data/constituency_region.json", method: 'GET'})
      .success(function (data) {
        $scope.constituency_region = data;
        $scope.error = ''; // clear the error messages
      })
      .error(function (data, status) {
        if (status === 404) {
          $scope.error = 'Database not available!';
        } else {
          $scope.error = 'Error: ' + status;
        }
    });

    $scope.getPostalCodes = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.postcodes_region_lookup = data;
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

    $scope.checkPostalCode = function(postcode) {
      $http({url: 'http://api.postcodes.io/postcodes/' + postcode, method: 'GET'})
        .success(function (data) {
          // data.status: 200 (OK), 400 (bad request), 404 (not found), 500 (server error)
          // data.result: true, false
          $scope.postcode_check = {'postcode':postcode,'status':data.status};
          // $scope.postcode_check.postcode = postcode;
          // $scope.postcode_check.status = data.status;
          //$scope.$apply();
          // console.log('Postcode ' + postcode + ' confirmed!');
          $scope.error = ''; // clear the error messages
          // console.log($scope.postcode_check);
        })
        .error(function (data, status) {
          $scope.postcode_check = {'postcode':postcode,'status':status};
          // $scope.postcode_check.postcode = postcode;
          // $scope.postcode_check.status = status;
          //$scope.$apply();
          $scope.error = 'Error: ' + status;
          // console.log($scope.postcode_check);
        });
    };


}]);


// Buttons for mockup loading of user data
brexit.directive('loadUserData', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<button id="button-old-user" class="btn btn-lg btn-default">Old user</button>'
      );

      $("#button-old-user").click(function (e) {
        scope.loadUserData("../data/user_info.json");
      });

    }};

}); 


brexit.directive('ageGroup', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      // size="2" is a workaround so that first option is not automatically selected
      // https://github.com/davidstutz/bootstrap-multiselect/issues/129
      $(element).html(
        '<select id="question-age-group" size="2">'+
          '<option value="0">18-29 years</option>'+
          '<option value="1">30-39 years</option>'+
          '<option value="2">40-49 years</option>'+
          '<option value="3">50-59 years</option>'+
          '<option value="4">60+ years</option>'+
        '</select>'
      );

      $("#question-age-group").multiselect({
        nonSelectedText: 'Choose your age group...',
        onChange: function(option, checked, select) {
          scope.setAgeGroup($(option).val());
          }
      });

      scope.$watch('initial_user_info.age_group', function (newData, oldData) {

        if (!newData) { return; }
        $("#question-age-group").multiselect('select', newData);

        console.log('Initial age group is set to ' + newData);
      });

      scope.$watch('user_info.age_group', function (newData, oldData) {
        if (!newData) { return; }
        console.log('User choose age group ' + newData);
      });

    }};

}); 


brexit.directive('questionReferendum', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
          '<button id="btn_remain" class="btn btn-large btn-default" type="button" style="Width:120px;font-size:x-large;margin:10px 20px 10px 20px;">'+
            'Remain'+
          '</button>'+
          '<button id="btn_leave" class="btn btn-large btn-default" style="Width:120px;font-size:x-large;margin:10px 20px 10px 20px;" type="button">'+
            'Leave'+
          '</button>'
      );

      $("#btn_remain").click(function (e) {
        scope.setVote('R');
      });

      $("#btn_leave").click(function (e) {
        scope.setVote('L');
      });

      $('#btn_remain').hover(function () {
        if (scope.user_info.vote != 'R' && scope.initial_user_info.vote != 'R') {
          $(this).removeClass('btn-default');
          $(this).addClass('btn-primary');
        }
      }, function () {
        if (scope.user_info.vote != 'R' && scope.initial_user_info.vote != 'R') {
          $(this).removeClass('btn-primary');
          $(this).addClass('btn-default');
        }
      });

      $('#btn_leave').hover(function () {
        if (scope.user_info.vote != 'L' && scope.initial_user_info.vote != 'L') {
          $(this).removeClass('btn-default');
          $(this).addClass('btn-danger');
        }
      }, function () {
        if (scope.user_info.vote != 'L' && scope.initial_user_info.vote != 'L') {
          $(this).removeClass('btn-danger');
          $(this).addClass('btn-default');
        }
      });

      // var switchVoteButton = function(newData, oldData) {
      //   // if (newData == 'R' || newData == 'R') {
      //   if (newData == 'R') {
      //     $('#btn_remain').removeClass('btn-default');
      //     $('#btn_remain').addClass('btn-primary');
      //   // } else if (newData == 'L' || newData == 'L') {
      //   } else if (newData == 'L') {
      //     $('#btn_leave').removeClass('btn-default');
      //     $('#btn_leave').addClass('btn-danger');
      //   }

      //   if (oldData == 'R') {
      //     $('#btn_remain').removeClass('btn-primary');
      //     $('#btn_remain').addClass('btn-default');
      //   } else if (oldData == 'L') {
      //     $('#btn_leave').removeClass('btn-danger');
      //     $('#btn_leave').addClass('btn-default');
      //   }
      // };

      var switchVoteButton = function(newData, oldData) {

        $('#btn_remain').removeClass('btn-primary');
        $('#btn_leave').removeClass('btn-danger');

        $('#btn_remain').addClass('btn-default');
        $('#btn_leave').addClass('btn-default');

        if (newData == 'R') {
          $('#btn_remain').removeClass('btn-default');
          $('#btn_remain').addClass('btn-primary');
        } else if (newData == 'L') {
          $('#btn_leave').removeClass('btn-default');
          $('#btn_leave').addClass('btn-danger');
        }

        // if (oldData == 'R') {
        //   $('#btn_remain').removeClass('btn-primary');
        //   $('#btn_remain').addClass('btn-default');
        // } else if (oldData == 'L') {
        //   $('#btn_leave').removeClass('btn-danger');
        //   $('#btn_leave').addClass('btn-default');
        // }
      };

      scope.$watch('initial_user_info.vote', function (newData, oldData) {
        if ( !newData ) { return; }
        console.log('User choose vote ' + newData);
        switchVoteButton(newData, oldData);
      });

      scope.$watch('user_info.vote', function (newData, oldData) {
        if ( !newData ) { return; }
        console.log('User choose vote ' + newData);
        switchVoteButton(newData, oldData);
      });


    }};

}); 


brexit.directive('questionMeta1', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div class="slider-row">' +
        '<input id="question-meta1" type="text" data-slider-min="0"' + 
        ' data-slider-max="100" data-slider-step="1" data-slider-value="0" />' +
        '</div>' + 
        '<p id="meta-label1"></p>'
        );

      $("#question-meta1").slider({
        ticks: [0, 25, 50, 75, 100],
        ticks_labels: ['0%', '25%', '50%', '75%', '100%'],
        ticks_snap_bounds: 1
      }
      );

      $("#question-meta1").on('slideStop', function(e) {
        scope.setMeta1(e.value);
      });
      
      $("#question-meta1").on('change', function(e) {
        $('#meta-label1').text('You had chosen ' + e.value.newValue + '%.');
      });

     scope.$watch('initial_user_info.meta1', function (newData, oldData) {

        if (!newData) { return; }

        $("#question-meta1").slider('setValue',newData);
        $('#meta-label1').text('You had chosen ' + newData + '%.');

        console.log('Initial value of meta question 1 is ' + newData);
      });

    }};

}); 


brexit.directive('questionMeta2', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div class="slider-row">' +
        '<input id="question-meta2" type="text" data-slider-min="0"' + 
        ' data-slider-max="100" data-slider-step="1" data-slider-value="0" />' +
        '</div>' + 
        '<p id="meta-label2"></p>'
        );

      $("#question-meta2").slider({
        ticks: [0, 25, 50, 75, 100],
        ticks_labels: ['0%', '25%', '50%', '75%', '100%'],
        ticks_snap_bounds: 1
      }
      );

      $("#question-meta2").on('slideStop', function(e) {
        scope.setMeta2(e.value);
      });
      
      $("#question-meta2").on('change', function(e) {
        $('#meta-label2').text('You had chosen ' + e.value.newValue + '%.');
      });

     scope.$watch('initial_user_info.meta2', function (newData, oldData) {

        if (!newData) { return; }

        $("#question-meta2").slider('setValue',newData);
        $('#meta-label2').text('You had chosen ' + newData + '%.');

        console.log('Initial value of meta question 2 is ' + newData);
      });

    }};

}); 


brexit.directive('buttonVote', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div style="height:5px;clear:both;"></div>' +
        '<p id="current-vote-label"></p>' +
        '<div style="height:5px;clear:both;"></div>' +
        '<button id="button-vote" class="btn btn-lg btn-default">Vote</button>'
      );

      $("#button-vote").click(function (e) {

        // User has to change at least one question (from his previous session) in order to submit a new vote
        // And the vote for list must not be -1 because this means that he changed a region in the meantime

        // TODO: UNDER ONE SESSION, USER CAN SUBMIT AS MANY ANSWERS AS HE WANTS, EVEN IF THEY ARE ALL THE SAME! 
        // TODO: IF USER CHANGES HIS VOTE AND THEN RETURNS THE OLD VALUES BEFORE SUBMITTING, HE WILL BE ABLE TO SUBMIT ALTHOUGH ANSWERS ARE THE SAME!

        if ( (scope.user_info.age_group || scope.initial_user_info.age_group ) && // age_group should be defined
             (scope.user_info.postcode || scope.initial_user_info.postcode ) && 
             (scope.postcode_check.status == 200) && // postcode should be validated through postcode.io
             (scope.user_info.region || scope.initial_user_info.region ) && // ( !(typeof scope.user_info.region === "undefined") || !(typeof scope.initial_user_info.region === "undefined") ) && // region should be defined
             (scope.user_info.vote || scope.initial_user_info.vote ) && // vote should be defined
             (scope.user_info.meta1 || scope.user_info.meta1==0 || scope.initial_user_info.meta1 || scope.initial_user_info.meta1==0 ) && // meta1 should be defined, but it could also be 0
             (scope.user_info.meta2 || scope.user_info.meta2==0 || scope.initial_user_info.meta2 || scope.initial_user_info.meta2==0 ) && // meta2 should be defined, but it could also be 0
             (scope.user_info.age_group || !(typeof scope.user_info.region === "undefined") || scope.user_info.vote || scope.user_info.meta1 || scope.user_info.meta1==0 || scope.user_info.meta2 || scope.user_info.meta2==0) // at least one new information, otherwise no use in voting
             ) {

          // All values which are not set by the user in this session should be taken from initialization
          var age_group = scope.user_info.age_group ? scope.user_info.age_group : scope.initial_user_info.age_group;
          var region = scope.user_info.region ? scope.user_info.region : scope.initial_user_info.region;
          var postcode = scope.user_info.postcode ? scope.user_info.postcode : scope.initial_user_info.postcode;
          var vote = scope.user_info.vote ? scope.user_info.vote : scope.initial_user_info.vote;
          var meta1 = scope.user_info.meta1 || scope.user_info.meta1==0 ? scope.user_info.meta1 : scope.initial_user_info.meta1;
          var meta2 = scope.user_info.meta2 || scope.user_info.meta2==0 ? scope.user_info.meta2 : scope.initial_user_info.meta2;

          var voteParsed = '<span style="color:' + 
                           (vote=='R' ? '#4575b4' : '#f11b1b') +
                           '">' + scope.codeToVote[vote].toUpperCase() + '</span>'

          // $('#current-vote-label').text('You vote to ' + vote + ' (constituency "' + region.constituency + '" (region "' + region.region + '"), age ' + age_group + ') and your percentages are ' + meta1 + '% and ' + meta2 + '%.');
          $('#current-vote-label').html('You vote to ' + voteParsed + ' (postcode ' + postcode + ', region "' + scope.codeToRegion[region] + '", age ' + scope.codeToAge[age_group] + ') and your percentages are ' + meta1 + '% and ' + meta2 + '%.');
        
          user_vote({'vote': vote, 
                     'age_group': age_group,
                     'region': region,
                     'postcode': postcode,
                     'meta1': meta1,
                     'meta2': meta2
                    });
        }
        else {
          $('#current-vote-label').html('<span style="color:red">Please fill in all the answers and check the validity of postcode!</span>');
        }

      });

      var user_vote = function (d) {

        // var list_name = _.pluck(_.where(scope.election_regions,{'list_id':Number(d.list)}), 'parties');
        // console.log('You vote to ' + d.vote + ' (constituency "' + d.region.constituency + '" (region "' + d.region.region + '"), age ' + d.age_group + ') and your percentages are ' + d.meta1 + '% and ' + d.meta2 + '%.');
        console.log('You vote to ' + scope.codeToVote[d.vote] + ' (postcode ' + d.postcode + ', region "' + scope.codeToRegion[d.region] + '", age ' + scope.codeToAge[d.age_group] + ') and your percentages are ' + d.meta1 + '% and ' + d.meta2 + '%.');

        scope.sendAnswers("api/send_answers",d);

        $('#results').show(1000);
        scope.getVotesInTime("../data/votes_in_time.json");

        scope.getTotalVotes("../data/total_votes.json");
        scope.getFriendsVotes("../data/friends_votes.json");

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

brexit.directive('results', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

     scope.$watch('friends_data', function (newData, oldData) {

        if (!newData) { return; }
        var friends_data = newData;

        $(element).show(1000);

        $('#total-votes-friends').text(
          friends_data.map(function(d){return d.votes})
                      .reduce(function(prev,curr){return curr + prev;},0)
        );

        if ($('.rank').text()=="") {
          $('#span-reach').remove();
        }

        // TODO: DATA ON TOTAL VOTES SHOULD BE LOADED IN CONTROLER AND APPROPRIATE WATCH PUT SOMEWHERE HERE! 
        $('#total-votes').text("555");

      });

    }};

}); 


brexit.directive('percentageTotal', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div id="percentage-total"></div>'
      );


     scope.$watch('total_votes', function (newData, oldData) {

        if (!newData) { return; }
        var votes = newData;

        $("#percentage-total").empty();

         var width = 300,
            height = 300,
            radius = Math.min(width, height) / 2;

        var color_remain = d3.rgb(69, 117, 180);
        var color_leave = d3.rgb(241, 27, 27);
        var color_empty = d3.rgb(200, 200, 200);

       var svg = d3.select("#percentage-total").append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var arc_zero = d3.svg.arc()
          .innerRadius(radius - 0.45 * radius)
          .outerRadius(radius - 0.05 * radius)
          .startAngle(0);

        var path_zero = svg.append("path")
          .datum({
            endAngle: 2 * Math.PI
          })
          .attr("fill", color_empty)
          .attr("d", arc_zero)
          .classed("prazan");

        var sum_of_votes = votes.remain + votes.leave;

        if (sum_of_votes >= 3) {

          var ratio_leave = votes.leave / sum_of_votes;
          var ratio_remain = votes.remain / sum_of_votes;

          var percentage_leave = Math.round(ratio_leave * 100);
          var percentage_remain = 100 - percentage_leave;

          var arc = d3.svg.arc()
            .innerRadius(radius - 0.45 * radius)
            .outerRadius(radius - 0.05 * radius);

          var remain_arc = svg.append("path")
            .datum({
              startAngle: 2 * Math.PI,
              endAngle: 2 * Math.PI
            })
            .attr("fill", color_remain)
            .attr("d", arc)
            .transition()
            .duration(2000)
            .attrTween("d", function (d) {
              var interpolate = d3.interpolate(d.endAngle, ratio_leave * 2 * Math.PI);
              return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
              }
            });

          var leave_arc = svg.append("path")
            .datum({
              startAngle: 0,
              endAngle: 0
            })
            .attr("fill", color_leave)
            .attr("d", arc)
            .transition()
            .duration(1500)
            .attrTween("d", function (d) {
              var interpolate = d3.interpolate(d.endAngle, ratio_leave * 2 * Math.PI);
              return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
              }
            });

          svg.append("text")
            .attr("dy", ".75em")
            .attr("y", -0.15 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_remain)
            .text("0")
            .transition()
            .duration(2000)
            .tween("text",
              function () {
                var i = d3.interpolate(this.textContent, Math.round(percentage_remain));
                return function (t) {
                  this.textContent = "REMAIN " + Math.round(i(t)) + "%";
                };
              });

          svg.append("text")
            .attr("dy", ".75em")
            .attr("y", 0.05 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_leave)
            .text("0")
            .transition()
            .duration(2000)
            .tween("text",
              function () {
                var i = d3.interpolate(this.textContent, Math.round(percentage_leave));
                return function (t) {
                  this.textContent = "LEAVE " + Math.round(i(t)) + "%";
                };
              });

        } else {

          svg.append("text")
            .attr("y", -0.15 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_empty)
            .text("Not enough");

          svg.append("text")
            .attr("y", 0.05 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_empty)
            .text("data for");

          svg.append("text")
            .attr("y", 0.25 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_empty)
            .text("friends:-(");
        }


      });

    }};

}); 


brexit.directive('percentageFriends', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div id="percentage-friends"></div>'
      );


     scope.$watch('friends_votes', function (newData, oldData) {

        if (!newData) { return; }
        var votes = newData;

        $("#percentage-friends").empty();

         var width = 300,
            height = 300,
            radius = Math.min(width, height) / 2;

        var color_remain = d3.rgb(69, 117, 180);
        var color_leave = d3.rgb(241, 27, 27);
        var color_empty = d3.rgb(200, 200, 200);

       var svg = d3.select("#percentage-friends").append("svg")
          .attr("width", width)
          .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var arc_zero = d3.svg.arc()
          .innerRadius(radius - 0.45 * radius)
          .outerRadius(radius - 0.05 * radius)
          .startAngle(0);

        var path_zero = svg.append("path")
          .datum({
            endAngle: 2 * Math.PI
          })
          .attr("fill", color_empty)
          .attr("d", arc_zero)
          .classed("prazan");

        var sum_of_votes = votes.remain + votes.leave;

        if (sum_of_votes >= 3) {

          var ratio_leave = votes.leave / sum_of_votes;
          var ratio_remain = votes.remain / sum_of_votes;

          var percentage_leave = Math.round(ratio_leave * 100);
          var percentage_remain = 100 - percentage_leave;

          var arc = d3.svg.arc()
            .innerRadius(radius - 0.45 * radius)
            .outerRadius(radius - 0.05 * radius);

          var remain_arc = svg.append("path")
            .datum({
              startAngle: 2 * Math.PI,
              endAngle: 2 * Math.PI
            })
            .attr("fill", color_remain)
            .attr("d", arc)
            .transition()
            .duration(2000)
            .attrTween("d", function (d) {
              var interpolate = d3.interpolate(d.endAngle, ratio_leave * 2 * Math.PI);
              return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
              }
            });

          var leave_arc = svg.append("path")
            .datum({
              startAngle: 0,
              endAngle: 0
            })
            .attr("fill", color_leave)
            .attr("d", arc)
            .transition()
            .duration(1500)
            .attrTween("d", function (d) {
              var interpolate = d3.interpolate(d.endAngle, ratio_leave * 2 * Math.PI);
              return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
              }
            });

          svg.append("text")
            .attr("dy", ".75em")
            .attr("y", -0.15 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_remain)
            .text("0")
            .transition()
            .duration(2000)
            .tween("text",
              function () {
                var i = d3.interpolate(this.textContent, Math.round(percentage_remain));
                return function (t) {
                  this.textContent = "REMAIN " + Math.round(i(t)) + "%";
                };
              });

          svg.append("text")
            .attr("dy", ".75em")
            .attr("y", 0.05 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_leave)
            .text("0")
            .transition()
            .duration(2000)
            .tween("text",
              function () {
                var i = d3.interpolate(this.textContent, Math.round(percentage_leave));
                return function (t) {
                  this.textContent = "LEAVE " + Math.round(i(t)) + "%";
                };
              });

        } else {

          svg.append("text")
            .attr("y", -0.15 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_empty)
            .text("Not enough");

          svg.append("text")
            .attr("y", 0.05 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_empty)
            .text("data for");

          svg.append("text")
            .attr("y", 0.25 * radius)
            .attr("x", 0)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "22px")
            .attr("fill", color_empty)
            .text("friends:-(");
        }


      });

    }};

}); 



brexit.directive('votesInTime', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

     scope.$watch('votes_in_time', function (newData, oldData) {

        if (!newData) { return; }

        var data = newData;

        data.forEach(function(d) {
          d.time = d3.time.format("%Y-%m-%d %H:%M:%S").parse(d.time);
        });

        data.sort(function(a,b){return a.time-b.time;});

        var margin = {top: 20, right: 20, bottom: 50, left: 50},
            width = 600 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(d3.time.day)
            .tickFormat(d3.time.format("%e.%m."))
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line_remain = d3.svg.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.remain); });

        var line_leave = d3.svg.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.leave+40); });

        $(element).html(
          '<div id="votes-in-time"></div>'
        );

        $("#votes-in-time").empty();

        var svg = d3.select("#votes-in-time").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, function(d) { return d.time; }));
        y.domain(d3.extent(data, function(d) { return Math.max(d.remain,d.leave); }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text")
            .attr("x", width/2) // .attr("dy", ".71em")
            .attr("dy", "3em")
            .style("text-anchor", "middle")
            .text("date");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)") //.attr("y", 10)
            .attr("x", height/2)
            .attr("dx", "-6.5em")
            .attr("dy", "-3.5em")
            .style("text-anchor", "end")
            .text("Total number of votes");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .style("stroke", "#d73027")
            .attr("d", line_remain);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .style("stroke", "#4575b4")
            .attr("d", line_leave);


        // draw legend
        var legend = svg.selectAll(".legend")
            .data([{'label':'remain','color':'#d73027'},{'label':'leave','color':'#4575b4'}])
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + (height-110 - i*20) + ")"; });

        // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d){return d.color;});

        // draw legend text
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d.label;});

      });

    }};

}); 



brexit.directive('findRegion', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
      '<input id="region-input" class="typeahead" type="text" placeholder="Postal code">'
      );


      scope.$watch('constituency_region', function (newData, oldData) {

        if (!newData) { return; }
        
        var constituency_region = newData;

         var constituency_region = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('constituency'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: newData
          });

          $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
          },
          {
            name: 'constituency_region',
            //display: 'region',
            display: function(d){return d.constituency + ' (region ' + d.region + ')';},
            source: constituency_region,
              templates: {
                suggestion: function(d){return '<div><strong>' + d.constituency + '</strong> (region ' + d.region+ ')</div>';}
              }
          }).on('typeahead:selected', function(event, data){            
                console.log('Region set to ' + data.region + ' (constituency ' + data.constituency + ')');   
                scope.setRegion(data);     
            });

      });

      scope.$watch('initial_user_info.region', function (newData, oldData) {

        if (!newData) { return; }

        $('#region-input').data(newData);
        $('#region-input').val(newData.constituency + ' (region ' + newData.region+ ')');
        
      });

    }};

}); 


brexit.directive('findRegion2', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<div class="col-xs-8">'+
          '<div class="input-group">' +
            '<input id="region-input2" type="text" class="form-control" placeholder="Start typing your postal code..." maxlength="7">' +
            '<span class="input-group-btn">' +
              '<button id="button-check-postcode" class="btn btn-sm btn-default">Check postcode</button>' +
            '</span>' +
          '</div>' +
          '<p id="postcode-validity-label"></p>' +
          '<p id="region-label"></p>' +
        '</div>'
      );


      $("#button-check-postcode").click(function (e) {
        scope.checkPostalCode($("#region-input2").val().toUpperCase().replace(/ /g, ''));
      });

      scope.getPostalCodes(attrs.url);

      scope.$watch('postcodes_region_lookup', function (newData, oldData) {

        if (!newData) { return; }

        var postcodes_region_lookup = newData;

        $("#region-input2").on('keyup', function(e) {

          $('#region-label').empty();
          $('#postcode-validity-label').empty();
          scope.setRegion(0);

          // Postcodes are usually written in uppercase and with whitespaces, so we compensate for that
          var postcode_parsed = $("#region-input2").val().toUpperCase().replace(/ /g, '');

          scope.setPostcode(postcode_parsed);
          scope.setPostcodeCheck(false);

          var temp = postcodes_region_lookup;
          for (var i=0; i < postcode_parsed.length; i++) { 
            if (!(typeof temp[postcode_parsed.charAt(i)] === "undefined")) {
              // If partial postcode corresponds to one unique region
              // NOTE: As we don't have full lookup table for all postcodes, we cannot know whether
              // the whole postcode is valid, just that the first part leads to uniquelly defined region!
              if ( !$.isPlainObject(temp[postcode_parsed.charAt(i)]) && !(typeof temp[postcode_parsed.charAt(i)] === "undefined") ) {
                $('#region-label').text('Suggested region for postcode ' + postcode_parsed + ' is "' + scope.codeToRegion[temp[postcode_parsed.charAt(i)]] + '". Please check the validity of postcode before your submission.');
                scope.setRegion(temp[postcode_parsed.charAt(i)]);
                break;
              // If partial postcode does not lead to uniquelly defined region continue search.
              // NOTE: As we don't have full lookup table for all postcodes, we cannot know whether
              // this postcode is actually invalid, just that we didn't find a match.
              } else {
                temp = temp[postcode_parsed.charAt(i)];
              } 
            } else {
              break;
            }
          }

        });
      
      });

      scope.$watch('initial_user_info.region', function (newData, oldData) {

        if (!newData) { return; }

        // $('#region-label').text('Your region is ' + scope.codeToRegion[newData] + '.');
        $('#region-label').text('Your postcode is ' + scope.initial_user_info.postcode + ' and your region is "' + scope.codeToRegion[newData] + '". Please check the validity of postcode before your submission.');
        
      });

      scope.$watch('initial_user_info.postcode', function (newData, oldData) {

        if (!newData) { return; }

        $("#region-input2").val(newData)
        
      });

      scope.$watch('postcode_check', function (newData, oldData) {

        if (!newData) { return; }

        var postcode_check = newData;

        // If status is false clear the label
        if (!postcode_check.status) {
          $('#postcode-validity-label').empty();
          return;
        }

        // postcode_check.status: 200 (OK), 400 (bad request), 404 (not found), 500 (server error)
        // postcode_check.result: true, false

        var glyphiconOk = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
        var glyphiconRemove = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';

        if (postcode_check.status == 200) {
          $('#postcode-validity-label').html('<p>Postcode ' + postcode_check.postcode + ' is valid!  ' + glyphiconOk + '</p>');
          // if (postcode_check.result = true) {
          //   $('#region-label').text('Postcode is valid!');
          // } else {
          //   $('#region-label').text('Postcode is not valid! :-(');
          // }
        } else if (postcode_check.status == 404) {
            // $('#postcode-validity-label').text('Sorry, postcode ' + postcode_check.postcode + ' is not valid!');
            // $('#postcode-validity-label').append($('<p>').html(glyphiconRemove));
            $('#postcode-validity-label').html('<p>Sorry, postcode ' + postcode_check.postcode + ' is not valid!  ' + glyphiconRemove + '</p>');
        } else if (postcode_check.status == 400) {
            $('#postcode-validity-label').html('<p>Sorry, postcode ' + postcode_check.postcode + ' is not found!  ' + glyphiconRemove + '</p>');
        } else if (postcode_check.status == 500) {
            $('#postcode-validity-label').html('<p>Sorry, there is an error at performing postcode validation!  ' + glyphiconRemove + '</p>');
        }

      });


    }};

}); 


brexit.directive('mapStatistics', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      var votes_regions = [
        {'region':'North East England','percentage':78},
        {'region':'North West England','percentage':54},
        {'region':'Yorkshire and Humberside','percentage':12},
        {'region':'East Midlands','percentage':45},
        {'region':'West Midlands','percentage':65},
        {'region':'East of England','percentage':34},
        {'region':'Greater London','percentage':85},
        {'region':'South East England','percentage':24},
        {'region':'South West England','percentage':73},
        {'region':'Scotland','percentage':56},
        {'region':'Wales','percentage':15},
        {'region':'Northern Ireland','percentage':32}
      ];

      var region_selectors = {
        'North East England':'#North_East_England',
        'North West England':'#North_West_England',
        'Yorkshire and Humberside':'#Yorkshire_and_the_Humber',
        'East Midlands':'#East_Midlands',
        'West Midlands':'#West_Midlands',
        'East of England':'#East_of_England',
        'Greater London':'#London',
        'South East England':'#South_East_England',
        'South West England':'#South_West_England, #path4481',
        'Scotland':'#shetlands-orkneys-frame, #g8329 path',
        'Wales':'#Wales',
        'Northern Ireland':'#Northern_Ireland',
      };


      d3.xml("../../data/UK_European_Parliament_constituency_plain_small_white_legend.svg", "image/svg+xml", function(error, xml) {
        if (error) throw error;

        $(element).html(xml.documentElement);

        var color = d3.scale.linear()
                    .domain([0, 50, 100])
                    .range(["#4575b4", "white", "#d73027"]);

        _.map(votes_regions,function(d){d3.selectAll(region_selectors[d.region]).style('fill',color(d.percentage));})

      });


    }};

}); 
