
var findRegion = angular.module('findRegion', []);

findRegion.controller('findRegionCTRL', ['$scope', '$http', function ($scope, $http) {

    // Data on election regions
    $http({url: "../data/election_regions_locations.json", method: 'GET'}) 
      .success(function (data) {
        $scope.election_regions_locations = data;
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
findRegion.directive('findRegion', function ($parse) {
  return {
    restrict: 'E',
    replace: false,
    link: function (scope, element, attrs) {

      $(element).html(
        '<input id="find-region-input" type="text">' + 
        '<div id="find-region-list" style="max-height:200px;overflow-y:scroll;width:500px;"></div>'
      );

      scope.$watch('election_regions_locations', function (newData, oldData) {

        if (!newData) { return; }
        
        var election_regions_locations = newData;

        // TODO: Some other options which are probably not needed at this time...
        // threshold: 0.6, location: 0, distance: 100, maxPatternLength: 32

        var options = {
            caseSensitive: false,
            includeScore: false,
            shouldSort: true,
            keys: ["location","county"] // TODO: Maybe is better to search just by location?
          };

        var fuse = new Fuse(election_regions_locations, options);

        $('#find-region-input').on('keyup', function(e) {
            $('#find-region-list').empty();
            var result = fuse.search($(this).val());

            result.forEach( function(d) {
                $('#find-region-list').append(
                  '<p style="margin-bottom:0px;">' + d.location + ', ' + d.county + ', ' + d.election_region + '. izborna jedinica</p>'
                  );
              });

        });


      });


    }};

}); 

// // TODO: IT IS NOT POSSIBLE TO HAVE TO ANGULAR APPS IN THE SAME PAGE, SO YOU HAVE TO MANUALLY BOOTSTRAP THEM
// angular.bootstrap($('#find-region'),['findRegion']);
