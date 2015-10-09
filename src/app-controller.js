'use strict';
var app = angular.module('mapApp', ['mapComponent', 'ngSortable']);

app.controller('AppCtrl', function ($scope, mapManager) {

  /* сервис карты */
  var mapService=mapManager.getServiceByName("map1");
  
  /** точки маршрута **/
  this.wayPoints = mapService.wayPoints;    
  
  /**
   * обработчик нажатия enter
   * @param {event} $event
   */
  this.keyDown = function ($event) {
    if ($event.keyCode == 13) {      
      mapService.pushPoint($event.target.value);
      
      $event.target.value = ""
      $event.preventDefault();
    };
  };

  /**
   * обработчик кнопки удаления
   * @param {number} index
   * @param {event} $event   
   */
  this.remove = function (index, $event) {    
    mapService.removePoint(index);
    $event.stopPropagation();
  };
  

  /**
   * обработчик сортировки
   * @param {number} index
   * @param {event} $event   
   */  
  this.onSort = function(indexOld, insertIndex){
    mapService.movePointToIndex(indexOld, insertIndex);
  }
  
});