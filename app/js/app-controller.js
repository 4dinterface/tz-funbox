'use strict';
var app = angular.module('mapApp', ['mapComponent', 'ngSortable']);

app.controller('AppCtrl', function ($scope, $element) {

  /** точки маршрута **/
  $scope.wayPoints = [];

  /** активность режима пути **/
  $scope.modePath = false;

  /**
   * обработчик нажатия enter
   * @param {event} $event
   */
  $scope.keyDown = function ($event) {
    if ($event.keyCode == 13) {
      if ($event.target.value.replace(/ /g, "") !== "") $scope.wayPoints.push({
        address: $event.target.value
      });
      $event.target.value = "";
      $event.preventDefault();
    };
  };

  /**
   * обработчик кнопки удаления
   * @param {number} index
   * @param {event} $event   
   */
  $scope.remove = function (index, $event) {
    $scope.wayPoints.splice(index, 1);
    $event.stopPropagation();
  };
});
//# sourceMappingURL=app-controller.js.map