
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

    $scope.codeToEducation = {
        0: 'Primary education',
        1: 'Secondary education',
        2: 'University - bachelors degree',
        3: 'University - masters degree',
        4: 'University - doctoral degree'
    };

    $scope.codeToParty = {
        0: 'Conservative Party',
        1: 'Labour Party',
        2: 'Scottish National Party',
        3: 'Liberal Democrats',
        4: 'UK Independance Party',
        5: 'Other',
        6: 'I did not vote'
    };

    $scope.setRegion = function(d) {
      $scope.user_info.region = d;
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

    $scope.setEducation = function(education) {
      $scope.user_info.education = education;
      $scope.$apply();
    };

    $scope.setParty = function(party) {
      $scope.user_info.party = party;
      $scope.$apply();
    };

    // Get voting statistics
    $scope.getVotes = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.total_votes = data.global_votes;
          $scope.friends_votes = data.friends_votes;
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

    // TODO: TOKEN AUTHENTIFICATION IN ANGULAR:
    //       https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/
    //       https://docs.angularjs.org/api/ng/service/$http
    // TODO: TOKEN IS INJECTED BY SERVER INTO THE TEMPLATE, AND STORED IN document.cookie.
    
    // Send answers back to server
    $scope.sendAnswers = function(url,data) {
      $http({url: url, 
             data: data, 
             xsrfHeaderName: "CSRF-Token",
             xsrfCookieName: "csrf_token",
             method: 'POST'})
        .success(function (data, status, headers, config) {

          console.log("Successfully sent answers to server!");

          document.cookie = "csrf_token=" + data.token; // Update token

          // Because voting ended successfully we can retrieve all available statistics through individual api calls
          $('#results').show(1000);
          $scope.getFriendsData("api/friends/votes");
          $scope.getGlobalStatistics("api/global/votes");
          $scope.getRegionStatistics("api/regions/votes"); // We also have api/region/votes for votes in my region, but this is not neccessary anymore
          $scope.getVotesInTime("api/votes/in_time");

        })
        .error(function (data, status) {
          if (status === 405) { // Or 404!
            $scope.error = 'Database not available!';

            // TODO: Because this endpoint is not working we return csrf token here for testing.
            //       (Otherwise it goes in success callback.)
            document.cookie = "csrf_token=NewVersionOfTheSuperSecretToken123";

            // TODO: On production this goes into success callback!
            $('#results').show(1000);
            $scope.getVotes("../data/votes_users.json"); // api/friends/votes
            $scope.getVotesInTime("../data/votes_in_time.json"); // api/votes/in_time
            $scope.getVotesRegions("../data/votes_regions.json"); // api/regions/votes

          } else {
            $scope.error = 'Error: ' + status;
          }
        });
    };

    // Send answers to extra questions back to server
    $scope.sendAnswersExtra = function(url,data) {
      $http({url: url, 
             data: data, 
             xsrfHeaderName: "X-CSRF-Token",
             xsrfCookieName: "csrf_token",
             method: 'POST'})
        .success(function (data, status, headers, config) {
          document.cookie = "csrf_token=" + data.token; // Update token
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

          // If user voted already (a returning user who voted) show him all the statistics
          if ( data.vote && (data.meta1 || data.meta1==0 ) && 
               (data.meta2 || data.meta2==0 ) && !(typeof data.region === "undefined") ) {
            
            $('#results').show(1000);
            
            $scope.getVotes("../data/votes_users.json"); // api/global/votes // api/friends/votes
            $scope.getVotesInTime("../data/votes_in_time.json"); // /api/votes/in_time
            $scope.getVotesRegions("../data/votes_regions.json"); // /api/regions/votes
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
    // $scope.loadUserData("../data/new_user_info.json");
    // $scope.loadUserData("../data/user_info.json");

    // Load all data
    $scope.loadAllData = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.initial_user_info = data.user_info;
          $scope.constituency_region = data.constituency_region;

          $scope.error = ''; // clear the error messages

          // If user voted already then show him all the statistics
          if ( data.user_info.vote && (data.user_info.meta1 || data.user_info.meta1==0 ) && 
               (data.user_info.meta2 || data.user_info.meta2==0 ) && 
               !(typeof data.user_info.region === "undefined") ) {

            $('#results').show(1000);

            $scope.total_votes = data.votes_users.global_votes;
            $scope.friends_votes = data.votes_users.friends_votes;
            $scope.votes_in_time = data.votes_in_time;
            $scope.votes_regions = data.votes_regions;

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

    $scope.getVotesRegions = function(url) {
      $http({url: url, method: 'GET'})
        .success(function (data) {
          $scope.votes_regions = data;
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

    // Get data on constituency and their corresponding regions
    $scope.getConstituencyRegion = function(url) {
      $http({url: url, method: 'GET'})
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
    };

    // TODO: THIS SHOULD BE LOADED FROM SERVER WITH AJAX CALL!
    $scope.totalNumberOfVotes = Math.floor(Math.random()*10000);

}]);


// ONLY FOR TESTING: Buttons for mockup loading of user data
brexit.directive('loadUserData', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<button id="button-old-user" class="btn btn-lg btn-default">Old user</button>'
      );

      $("#button-old-user").click(function (e) {
        scope.loadUserData("../data/user_info.json"); // api/me/info
      });

    }};

}); 


// Whenever this element is preent on the page load user data in the global scope
brexit.directive('loadAllData', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      // scope.loadAllData("../data/all.json"); // api/all
      scope.loadAllData("../data/all_new.json"); // version for new user

    }};

}); 


brexit.directive('ageGroup', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<select id="question-age-group" class="selectpicker">'+
          '<option value="0">18-29 years</option>'+
          '<option value="1">30-39 years</option>'+
          '<option value="2">40-49 years</option>'+
          '<option value="3">50-59 years</option>'+
          '<option value="4">60+ years</option>'+
        '</select>'
      );

      $('#question-age-group').selectpicker({
        title: 'Choose your age group...'
      });

      $('#question-age-group').on('change', function(){
        scope.setAgeGroup($(this).find("option:selected").val());
      });

      scope.$watch('initial_user_info.age_group', function (newData, oldData) {
        if (!newData) { return; }
        $("#question-age-group").selectpicker('val', newData);
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
          '<button id="btn_remain" class="btn btn-lg btn-default" type="button" style="Width:120px;margin:10px 20px 10px 20px;">'+
            'Remain'+
          '</button>'+
          '<button id="btn_leave" class="btn btn-lg btn-default" style="Width:120px;margin:10px 20px 10px 20px;" type="button">'+ 
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
        '<h3>4. Estimate the precentage of votes that <span id="vote-label-meta1">your option</span> will get in <span id="region-label-meta1">your region</span> ON THE ACTUAL REFERENDUM.</h3>' +
        '<div class="slider-row">' +
        '<input id="question-meta1" type="text" data-slider-min="0"' + 
        ' data-slider-max="100" data-slider-step="1" data-slider-value="0" />' +
        '</div>' + 
        '<p id="meta-label1"></p>'
        );

      // NOTE: It is impossible to select values close to the tick marks, so that's why we left only 0% and 100%
      $("#question-meta1").slider({
        ticks: [0, 100],
        ticks_labels: ['0%','100%'],
        ticks_snap_bounds: 1
      }
      );

      $("#question-meta1").on('slideStop', function(e) {
        scope.setMeta1(e.value);
      });
      
      $("#question-meta1").on('change', function(e) {
        $('#meta-label1').text('You have chosen ' + e.value.newValue + '%.');
      });

      // // Set initial value to zero (this is also valid and can be submitted!)
      // scope.setMeta1(0);

     scope.$watchGroup(['user_info.vote','initial_user_info.vote'], function (newData, oldData) {

        if (!newData[0] && !newData[1]) { return; }

        var vote = newData[0] || newData[1];

        console.log('#vote-label-meta1 = ' + vote);

        var voteParsed = '<span style="color:' + 
                          (vote=='R' ? '#4575b4' : '#f11b1b') +
                         '">' + scope.codeToVote[vote].toUpperCase() + '</span>';

        $('#vote-label-meta1').html(voteParsed);

      });

      scope.$watchGroup(['user_info.region','initial_user_info.region'], function (newData, oldData) {

        if (!newData[0] && !newData[1]) { return; }

        var region = newData[0] || newData[1];

        // console.log('#region-label-meta1 = ' + scope.codeToRegion[region.region]);

        $('#region-label-meta1').html(scope.codeToRegion[region.region]);

      });

      scope.$watch('initial_user_info.meta1', function (newData, oldData) {

        if (!newData) { return; }

        $("#question-meta1").slider('setValue',newData);
        $('#meta-label1').text('You have chosen ' + newData + '%.');

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
        '<h3>5. Estimate the precentage of votes that <span id="vote-label-meta2">your option</span> will get in <span id="region-label-meta2">your region</span> ON THIS POLL.</h3>' +
        '<div class="slider-row">' +
        '<input id="question-meta2" type="text" data-slider-min="0"' + 
        ' data-slider-max="100" data-slider-step="1" data-slider-value="0" />' +
        '</div>' + 
        '<p id="meta-label2"></p>'
        );

      // NOTE: It is impossible to select values close to the tick marks, so that's why we left only 0% and 100%
      $("#question-meta2").slider({
        ticks: [0, 100],
        ticks_labels: ['0%','100%'],
        ticks_snap_bounds: 1
      }
      );

      $("#question-meta2").on('slideStop', function(e) {
        scope.setMeta2(e.value);
      });
      
      $("#question-meta2").on('change', function(e) {
        $('#meta-label2').text('You have chosen ' + e.value.newValue + '%.');
      });

      // // Set initial value to zero (this is also valid and can be submitted!)
      // scope.setMeta2(0);

     scope.$watchGroup(['user_info.vote','initial_user_info.vote'], function (newData, oldData) {

        if (!newData[0] && !newData[1]) { return; }

        var vote = newData[0] || newData[1];

        console.log('#vote-label-meta2 = ' + vote);

        var voteParsed = '<span style="color:' + 
                          (vote=='R' ? '#4575b4' : '#f11b1b') +
                         '">' + scope.codeToVote[vote].toUpperCase() + '</span>';

        $('#vote-label-meta2').html(voteParsed);

      });

      scope.$watchGroup(['user_info.region','initial_user_info.region'], function (newData, oldData) {

        if (!newData[0] && !newData[1]) { return; }

        var region = newData[0] || newData[1];

        // console.log('#region-label-meta2 = ' + scope.codeToRegion[region.region]);

        $('#region-label-meta2').html(scope.codeToRegion[region.region]);

      });

     scope.$watch('initial_user_info.meta2', function (newData, oldData) {

        if (!newData) { return; }

        $("#question-meta2").slider('setValue',newData);
        $('#meta-label2').text('You have chosen ' + newData + '%.');

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
        '<button id="button-vote" class="btn btn-lg btn-default">Submit answers</button>'
      );

      $("#button-vote").click(function (e) {

        // User has to change at least one question (from his previous session) in order to submit a new vote
        // And the vote for list must not be -1 because this means that he changed a region in the meantime

        // TODO: UNDER ONE SESSION, USER CAN SUBMIT AS MANY ANSWERS AS HE WANTS, EVEN IF THEY ARE ALL THE SAME! 
        // TODO: IF USER CHANGES HIS VOTE AND THEN RETURNS THE OLD VALUES BEFORE SUBMITTING, HE WILL BE ABLE TO SUBMIT ALTHOUGH ANSWERS ARE THE SAME!

        if ( (scope.user_info.age_group || scope.initial_user_info.age_group ) && // age_group should be defined
             ( !(typeof scope.user_info.region === "undefined") || !(typeof scope.initial_user_info.region === "undefined") ) && // region should be defined             
             (scope.user_info.vote || scope.initial_user_info.vote ) && // vote should be defined
             (scope.user_info.meta1 || scope.user_info.meta1==0 || scope.initial_user_info.meta1 || scope.initial_user_info.meta1==0 ) && // meta1 should be defined, but it could also be 0
             (scope.user_info.meta2 || scope.user_info.meta2==0 || scope.initial_user_info.meta2 || scope.initial_user_info.meta2==0 ) && // meta2 should be defined, but it could also be 0
             (scope.user_info.age_group || !(typeof scope.user_info.region === "undefined") || scope.user_info.vote || scope.user_info.meta1 || scope.user_info.meta1==0 || scope.user_info.meta2 || scope.user_info.meta2==0) // at least one new information, otherwise no use in voting
             ) {

          // All values which are not set by the user in this session should be taken from initialization
          var age_group = scope.user_info.age_group ? scope.user_info.age_group : scope.initial_user_info.age_group;
          var region = scope.user_info.region ? scope.user_info.region : scope.initial_user_info.region;
          var vote = scope.user_info.vote ? scope.user_info.vote : scope.initial_user_info.vote;
          var meta1 = scope.user_info.meta1 || scope.user_info.meta1==0 ? scope.user_info.meta1 : scope.initial_user_info.meta1;
          var meta2 = scope.user_info.meta2 || scope.user_info.meta2==0 ? scope.user_info.meta2 : scope.initial_user_info.meta2;

          var voteParsed = '<span style="color:' + 
                           (vote=='R' ? '#4575b4' : '#f11b1b') +
                           '">' + scope.codeToVote[vote].toUpperCase() + '</span>'

          var constituency = _.pluck(_.where(scope.constituency_region,{'code':region.code}), 'constituency');

          $('#current-vote-label').html('You vote to ' + voteParsed + ' (constituency "' + constituency + '", region "' + scope.codeToRegion[region.region] + '", age ' + scope.codeToAge[age_group] + ') and your percentages are ' + meta1 + '% and ' + meta2 + '%.');
          // $('#current-vote-label').html('You vote to ' + voteParsed + ' (constituency "' + region.constituency + '", region "' + scope.codeToRegion[region.region] + '", age ' + scope.codeToAge[age_group] + ') and your percentages are ' + meta1 + '% and ' + meta2 + '%.');
        
          user_vote({'vote': vote, 
                     'age_group': age_group,
                     'region': {'code':region.code,'region':region.region},
                     'meta1': meta1,
                     'meta2': meta2
                    });
        }
        else {
          $('#current-vote-label').html('<span style="color:red">Please fill in all the answers!</span>');
        }

      });

      var user_vote = function (d) {

        var constituency = _.pluck(_.where(scope.constituency_region,{'code':d.region.code}), 'constituency');
        console.log('You vote to ' + scope.codeToVote[d.vote] + ' (constituency "' + constituency + '", region "' + scope.codeToRegion[d.region.region] + '", age ' + scope.codeToAge[d.age_group] + ') and your percentages are ' + d.meta1 + '% and ' + d.meta2 + '%.');
        // console.log('You vote to ' + scope.codeToVote[d.vote] + ' (constituency "' + d.region.constituency + '", region "' + scope.codeToRegion[d.region.region] + '", age ' + scope.codeToAge[d.age_group] + ') and your percentages are ' + d.meta1 + '% and ' + d.meta2 + '%.');

        scope.sendAnswers("api/send_answers",d);

      }

    }};

}); 

brexit.directive('results', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

     scope.$watch('friends_votes', function (newData, oldData) {

        if (!newData) { return; }
        // var friends_data = newData;

        // $(element).show(1000); // We show the results in loadUserData() after successfull retrieval of user votes

        if ($('.rank').text()=="") {
          $('#span-reach').remove();
        }

        // If you have no friends we have to change the text
        if (Number($('.votes-friends').text())==0) {
          $('#friend-count-label').text('None of your friends yet voted on this application:-(');
        }
        
        // If no users came through your share we have to change the text
        if (Number($('.shares-friends').text())==0) {
          $('#reach-count-label').text('No users came to this application through one of your shares:-(');
        }

        // Format rank numbers
        var formatRankNumber = function(d) {
          var lastDigit = d.slice(-1);
          if (lastDigit=="1") {
            return d+"<sup>st</sup>";
          } else if (lastDigit=="2") {
            return d+"<sup>nd</sup>";
          } else {
            return d+"<sup>th</sup>";
          }
        };

        $('.rank-friends').html( formatRankNumber($('.rank-friends').text()) );
        $('.rank-shares').html( formatRankNumber($('.rank-shares').text()) );

        if ($('.rank-friends').text()=='N/A.') {
          $('#friend-rank-label').empty();
        }
        
        if ($('.rank-shares').text()=='N/A.') {
          $('#reach-rank-label').empty();
        }

      });

    }};

}); 


brexit.directive('questionExtra', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<h3>6. Your education</h3>'+
        '<select id="question-education" class="selectpicker">'+
          '<option value="0">Primary education</option>'+
          '<option value="1">Secondary education</option>'+
          '<option value="2">University - bachelor\'s degree</option>'+
          '<option value="3">University - master\'s degree</option>'+
          '<option value="4">University - doctoral degree</option>'+
        '</select>'+
        '<div style="height:5px;clear:both;"></div>' +
        '<h3>7. Who did you vote for at the 2015 UK general election?</h3>'+
        '<select id="question-party" class="selectpicker">'+
          '<option value="0">Conservative Party</option>'+
          '<option value="1">Labour Party</option>'+
          '<option value="2">Scottish National Party</option>'+
          '<option value="3">Liberal Democrats</option>'+
          '<option value="4">UK Independance Party</option>'+
          '<option value="5">Other</option>'+
          '<option value="6">I did not vote</option>'+
        '</select>'+
        '<div style="height:5px;clear:both;"></div>' +
        '<p id="vote-extra-label"></p>' +
        '<div style="height:5px;clear:both;"></div>' +
        '<button id="button-vote-extra" class="btn btn-lg btn-default">Submit extra answers</button>'+
        '<div style="height:5px;clear:both;"></div>'
      );

      $('#question-education').selectpicker({
        title: 'Choose your education...'
      });

      $('#question-education').on('change', function(){
        scope.setEducation($(this).find("option:selected").val());
      });

      $('#question-party').selectpicker({
        title: 'Choose your party...'
      });

      $('#question-party').on('change', function(){
        scope.setParty($(this).find("option:selected").val());
      });


      scope.$watch('initial_user_info.education', function (newData, oldData) {
        if (!newData) { return; }
        $("#question-education").selectpicker('val', newData);
        console.log('Initial education is set to ' + scope.codeToEducation[newData]);
      });

      scope.$watch('user_info.education', function (newData, oldData) {
        if (!newData) { return; }
        console.log('User choose education ' + scope.codeToEducation[newData]);
      });

      scope.$watch('initial_user_info.party', function (newData, oldData) {
        if (!newData) { return; }
        $("#question-party").selectpicker('val', newData);
        console.log('Initial party is set to ' + scope.codeToParty[newData]);
      });

      scope.$watch('user_info.party', function (newData, oldData) {
        if (!newData) { return; }
        console.log('User choose party ' + scope.codeToParty[newData]);
      });

      $("#button-vote-extra").click(function (e) {

        if ( scope.user_info.education || scope.initial_user_info.education || scope.user_info.party || scope.initial_user_info.party ) {

          // All values which are not set by the user in this session should be taken from initialization
          var education = scope.user_info.education ? scope.user_info.education : scope.initial_user_info.education;
          var party = scope.user_info.party ? scope.user_info.party : scope.initial_user_info.party;

          var extra_answers = {};
          extra_answers.user_id = user_id; // This is supposed to be injected into main login template.

          if ( !(typeof education === "undefined") ) {
            extra_answers.education = education;
          }
          if ( !(typeof party === "undefined") ) {
            extra_answers.party = party;
          }

          // Send answers to extra questiona back to the server
          scope.sendAnswersExtra("api/answer/extra",extra_answers);

          $('#vote-extra-label').html('Your answers are submitted!');

        } else {
          $('#vote-extra-label').html('<span style="color:red">Please fill in at least one answer before submitting!</span>');
        }

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

        var sum_of_votes = votes.R + votes.L;

        if (sum_of_votes >= 3) {

          var ratio_leave = votes.L / sum_of_votes;
          var ratio_remain = votes.R / sum_of_votes;

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

        var sum_of_votes = votes.R + votes.L;

        if (sum_of_votes >= 3) {

          var ratio_leave = votes.L / sum_of_votes;
          var ratio_remain = votes.R / sum_of_votes;

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
            .y(function(d) { return y(d.R); });

        var line_leave = d3.svg.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.L+40); });

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
        y.domain(d3.extent(data, function(d) { return Math.max(d.R,d.L); }));

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
            .data([{'label':'remain','color':'#4575b4'},{'label':'leave','color':'#d73027'}])
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
      '<input id="region-input" class="typeahead" type="text" placeholder="Start typing your constituency...">'
      );

      // TODO: For now we will load this through api/all, automatically after login
      // scope.getConstituencyRegion(attrs.url);

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
            display: function(d){return d.constituency + ' (region ' + scope.codeToRegion[d.region] + ')';},
            source: constituency_region,
              templates: {
                suggestion: function(d){return '<div><strong>' + d.constituency + '</strong> (region ' + scope.codeToRegion[d.region] + ')</div>';}
              }
          }).on('typeahead:selected', function(event, data){            
                console.log('Region set to ' + scope.codeToRegion[data.region] + ' (constituency ' + data.constituency + ')');   
                scope.setRegion(data);     
            });

      });

      // scope.$watch('initial_user_info.region', function (newData, oldData) {

      //   if (!newData) { return; }

      //   $('#region-input').data(newData);
      //   $('#region-input').val(newData.constituency + ' (region ' + scope.codeToRegion[newData.region] + ')');
        
      // });

      scope.$watchGroup(['constituency_region','initial_user_info.region'], function (newData, oldData) {

        if (!newData[0] || !newData[1]) { return; }

        // var constituency_region = newData[0];
        var region = {};

        region.code = newData[1].code;
        region.constituency = _.pluck(_.where(newData[0],{'code':newData[1].code}), 'constituency');;
        region.region = newData[1].region;

        // _.pluck(_.where(newData[0],{'code':newData[1].code}), 'constituency');

        // $('#region-input').data(newData);
        // $('#region-input').val(newData.constituency + ' (region ' + scope.codeToRegion[newData.region] + ')');
        
        $('#region-input').data(region);
        $('#region-input').val(region.constituency + ' (region ' + scope.codeToRegion[region.region] + ')');
      });

    }};

}); 



brexit.directive('mapStatistics', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      var region_selectors = {
        'C':'#North_East_England',
        'D':'#North_West_England',
        'E':'#Yorkshire_and_the_Humber',
        'F':'#East_Midlands',
        'G':'#West_Midlands',
        'H':'#East_of_England',
        'I':'#London',
        'J':'#South_East_England',
        'K':'#South_West_England, #path4481',
        'L':'#Wales',
        'M':'#shetlands-orkneys-frame, #g8329 path',
        'N':'#Northern_Ireland',
      };

      scope.$watch('votes_regions', function (newData, oldData) {

        if (!newData) { return; }

        var votes_regions = newData;

        d3.xml("../../data/UK_European_Parliament_constituency_plain_small_white_legend.svg", "image/svg+xml", function(error, xml) {
          if (error) throw error;

          $(element).html(xml.documentElement);

          var color = d3.scale.linear()
                      .domain([0, 50, 100])
                      .range(["#4575b4", "white", "#d73027"]);

          // _.map(votes_regions,function(d){d3.selectAll(region_selectors[d.region]).style('fill',color(d.percentage));});

          _.map(votes_regions, function(d){
      
              var ratio_leave = d.L / (d.R + d.L);
              var percentage_leave = Math.round(ratio_leave * 100);
              var percentage_remain = 100 - percentage_leave;

              d3.selectAll(region_selectors[d.region])
                .style('fill',color(percentage_leave));
          });

        });

      });


    }};

}); 


brexit.directive('predictions', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<p>' +
          '<b>Current chances of different voting results:</b>' +
          '<div id="div1" style="width:900px; height:150px;"></div>' +
        '</p>' +
        '<p>' +
          '<b>Timeline of the most probable result:</b>' +
          '<div id="div2" style="width:900px; height:250px;"></div>' +
        '</p>' +
        '<p>' +
          '<b>Timeline of probabilities for REMAIN and LEAVE:</b>' +
          '<div id="div3" style="width:900px; height:250px;"></div>' +
        '</p>'
      );

      var remainBlueShade = '#4575b4';
      var leaveRedShade = '#f11b1b';

      var m_names = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      // "../data/

      g1 = new Dygraph(
          document.getElementById("div1"),
          attrs.pathToData + "brexit-probability.csv", {
            drawCallback: function(g, is_initial) {
                if (!is_initial) {return;};
                // pronadji poziiju tocke Average
                var pozicija=0;
                for (var i = 0; i < g.rawData_.length; i++) {
                   if (!isNaN(g.layout_.points[2][i].canvasy)) {
                     pozicija=g.layout_.points[2][i].xval;
                     };
                };
                if (pozicija<50) {boja=remainBlueShade;}
                else {boja=leaveRedShade;}
                var r="";
                var l="";
                if (pozicija<=50.0) {r=" Result: REMAIN";}
                if (pozicija>=50.0) {l=" Result: LEAVE";}
                g.setAnnotations([{
                    series: 'Average',
                    x: pozicija+2,
                    shortText: 'Average votes for Brexit='+pozicija+'%'+r+l,
                    width: 200,
                    height: 50,
                    color: boja,
                    text: ''
                  }]);
                },
            colors: [remainBlueShade , leaveRedShade, 'black'],
            customBars: true,
            interactionModel: {},
            labelsSeparateLines: true,
            stepPlot : false,
            xlabel: 'Votes for Brexit',
            ylabel: 'Probability',
            valueRange: [0,25],
            dateWindow: [0.01, 100.01],
            xAxisHeight: 25,
            zoomCallback: function() {g.updateOptions({zoomRange: [0, 25]});},
            axes: {
              x: {
                xAxisLabelWidth: 90,
                drawGrid: false,
                valueFormatter: function(x) {
                  return 'Votes for Brexit = ' + x +'%';
                },
                axisLabelFormatter: function(x) {
                  return x + '%';
                },
                //pixelsPerLabel: 50,
              },
              y: {
                drawGrid: false,
                valueFormatter: function(val, opts, series_name, g_legend) {
                  if (series_name=='Average'){ return '';}
                  else {return ' <br/>Probability of this % of votes = '+Math.round(val*10)/10+'%';}
                },
                axisLabelFormatter: function(y) {
                  return y + '%';
                },
              },
            },
            //vertical bar at 50%
            underlayCallback: function(canvas, area, g) {
              var bottom_left = g.toDomCoords(49.9, 0);
              var top_right = g.toDomCoords(50.1, 100);

              var left = bottom_left[0];
              var right = top_right[0];

              canvas.fillStyle = "rgba(25, 25, 102, 0.2)";
              //canvas.fillRect(left, area.y, right - left, area.h);

            },
            // mark average
            series : {
                  'Average': {
                    strokeWidth: 0.0,
                    drawPoints: true,
                    pointSize: 4,
                    highlightCircleSize: 6
                  }
            },
          }
        );


      g2 = new Dygraph(
          document.getElementById("div2"),
          attrs.pathToData + "brexit-timeline.csv", {
            drawCallback: function(g, is_initial) {
                if (!is_initial) {return;};
                g.setVisibility(0, false);
                g.setVisibility(1, false);
                // pronadji poziciju zadnje tocke
                var pozicija=g.layout_.points[0][g.rawData_.length-1].xval+14*60*60*1000;
                var datum = new Date(pozicija).toISOString().slice(0,10);
                var value2 = g.layout_.points[0][g.rawData_.length-1].yval
                if (value2<50.0) {boja=remainBlueShade;}
                else {boja=leaveRedShade;}
                g.setAnnotations([
                {
                    series: 'Predicted % of votes for Brexit',
                    x: datum,
                    shortText: value2 + '% votes for Brexit',
                    width: 230,
                    height: 40,
                    color: boja,
                    text: '',
                    tickHeight: 0
                  }]);
            },
            colors: [remainBlueShade , leaveRedShade, 'black'],
            customBars: true,
            drawPoints: true,
            interactionModel: {},
            stepPlot : false,
            xlabel: '',
            ylabel: '',
            //labelsSeparateLines: true,
            valueRange: [20,80],
            dateWindow: [Date.parse("2016/06/12 12:00:00"), Date.parse("2016/06/24 12:00:00")],
            xAxisHeight: 25,
            yRangePad: 20,
            legend: 'always',
            labelsDivStyles: { 'textAlign': 'left' },
            axes: {
              x: {
                valueFormatter: function(x) {
                  return 'Date:' + new Date(x+14*60*60*1000).toISOString().slice(0,10)+'&nbsp;&nbsp;&nbsp;';
                },
                axisLabelFormatter: function(x) {
                  if (x.getDate()%2==0 && x.getDate()<23) {
                  return  Dygraph.zeropad(x.getDate()) + ' ' + m_names[x.getMonth()] + ' \'16';
                  } else { return '';}
                },
                pixelsPerLabel: 50,
                drawGrid: true,
                gridLineColor : "rgb(200,200,200)",
              },
              y: {
                valueFormatter: function(val, opts, series_name, g_legend) {
                  return '= ' + Math.round(val*10)/10+'%'+'&nbsp;&nbsp;&nbsp;';
                },
                axisLabelFormatter: function(y) {
                  return y + '%';
                },
                pixelsPerLabel: 20,
                drawGrid: true,
                gridLineColor : "rgb(200,200,200)",
              },

            },
          }
        );

      g3 = new Dygraph(
          document.getElementById("div3"),
          attrs.pathToData + "brexit-timeline.csv", {
            drawCallback: function(g, is_initial) {
                if (!is_initial) {return;};
                g.setVisibility(2, false);
                // pronadji poziciju zadnje tocke
                var pozicija=g.layout_.points[0][g.rawData_.length-1].xval+14*60*60*1000;
                var datum = new Date(pozicija).toISOString().slice(0,10);
                var value0 = g.layout_.points[0][g.rawData_.length-1].yval
                var value1 = g.layout_.points[1][g.rawData_.length-1].yval
                g.setAnnotations([
                  {
                    series: 'Probability of REMAIN',
                    x: datum,
                    shortText: value0 + '% probability of REMAIN',
                    width: 330,
                    height: 20,
                    color: remainBlueShade,
                    text: '',
                    tickHeight: 0
                  },
                  {
                    series: 'Probability of LEAVE',
                    x: datum,
                    shortText: value1 + '% probability of LEAVE',
                    width: 300,
                    height: 20,
                    color: leaveRedShade,
                    text: '',
                    tickHeight: 0
                  }]);
            },
            colors: [remainBlueShade , leaveRedShade, 'black'],
            customBars: true,
            drawPoints: true,
            interactionModel: {},
            stepPlot : false,
            xlabel: '',
            ylabel: '',
            //labelsSeparateLines: true,
            valueRange: [20,80],
            dateWindow: [Date.parse("2016/06/12 12:00:00"), Date.parse("2016/06/24 12:00:00")],
            xAxisHeight: 25,
            yRangePad: 20,
            legend: 'always',
            labelsDivStyles: { 'textAlign': 'left' },
            axes: {
              x: {
                valueFormatter: function(x) {
                  return 'Date:' + new Date(x+14*60*60*1000).toISOString().slice(0,10)+'&nbsp;&nbsp;&nbsp;';
                },
                axisLabelFormatter: function(x) {
                  if (x.getDate()%2==0 && x.getDate()<23) {
                  return  Dygraph.zeropad(x.getDate()) + ' ' + m_names[x.getMonth()] + ' \'16';
                  } else { return '';}
                },
                pixelsPerLabel: 50,
                drawGrid: true,
                gridLineColor : "rgb(200,200,200)",
              },
              y: {
                valueFormatter: function(val, opts, series_name, g_legend) {
                  return '= ' + Math.round(val*10)/10+'%'+'&nbsp;&nbsp;&nbsp;';
                },
                axisLabelFormatter: function(y) {
                  return y + '%';
                },
                pixelsPerLabel: 20,
                drawGrid: true,
                gridLineColor : "rgb(200,200,200)",
              },

            },
          }
        );

    }};

}); 