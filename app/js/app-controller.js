'use strict';
var app = angular.module('mapApp', ['mapComponent', 'ngSortable']);

app.controller('AppCtrl', function ($scope) {

  /** точки маршрута **/
  this.wayPoints = [];

  /** активность режима пути **/
  this.modePath = false;

  /**
   * добавит точку маршруту 
   * @param {string} value - аддресс точки маршрута
   */
  this.addWayPoint = function (value) {
    if (value.replace(/ /g, "") == "") return;
    this.wayPoints.push({
      address: value
    });
  };

  /**
   * удалит точку по порядковому номеру
   * @param {event} $event
   */
  this.removeWayPoint = function (index) {
    this.wayPoints.splice(index, 1);
  };

  /**
   * обработчик нажатия enter
   * @param {event} $event
   */
  this.keyDown = function ($event) {
    if ($event.keyCode == 13) {
      this.addWayPoint($event.target.value);
      $event.target.value = "";
      $event.preventDefault();
    };
  };

  /**
   * обработчик кнопки удаления
   * @param {number} index
   * @param {event} $event   
   */
  this.remove = function (index, $event) {
    this.removeWayPoint(index);
    $event.stopPropagation();
  };
});
//# sourceMappingURL=app-controller.js.map