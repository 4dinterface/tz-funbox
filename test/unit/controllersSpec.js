'use strict';

/* jasmine specs for controllers */
describe('AppController', function() {
  
  beforeEach(module('mapApp'));

   it('add empty string', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AppCtrl', {$scope:scope});

    ctrl.addWayPoint("");
    expect(ctrl.wayPoints.length).toEqual(0);
  }));
  
  it('add spacebar', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AppCtrl', {$scope:scope});

    ctrl.addWayPoint("   ");
    expect(ctrl.wayPoints.length).toEqual(0);
  }));

  it('add point', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AppCtrl', {$scope:scope});

    ctrl.addWayPoint("Москва");
    expect(ctrl.wayPoints.length).toEqual(1);
  }));
  
  it('add 2 waypoint', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AppCtrl', {$scope:scope});

    ctrl.addWayPoint("Москва");
    ctrl.addWayPoint("Новосибирск");
    expect(ctrl.wayPoints.length).toEqual(2);    
    expect(ctrl.wayPoints[0].address).toEqual("Москва");
    expect(ctrl.wayPoints[1].address).toEqual("Новосибирск");    
  }));
  
  
  it('remove way points', inject(function($controller) {
    var scope = {},
        ctrl = $controller('AppCtrl', {$scope:scope});

    ctrl.addWayPoint("Москва");
    ctrl.addWayPoint("Новосибирск");
    ctrl.addWayPoint("Колывань");
    
    ctrl.removeWayPoint(2);
    expect(ctrl.wayPoints.length).toEqual(2);
    expect(ctrl.wayPoints[0].address).toEqual("Москва");
    expect(ctrl.wayPoints[1].address).toEqual("Новосибирск");
    
    
    ctrl.removeWayPoint(0);
    expect(ctrl.wayPoints.length).toEqual(1);
    expect(ctrl.wayPoints[0].address).toEqual("Новосибирск");
    
    
    ctrl.removeWayPoint(0);
    expect(ctrl.wayPoints.length).toEqual(0);            
  }));

  
});
