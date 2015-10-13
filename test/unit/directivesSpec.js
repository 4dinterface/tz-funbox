describe('MapComponent', function() { 
  var elm, scope, $element, mapService;

  beforeEach(module('mapComponent'));

  beforeEach(inject(function($rootScope, $compile,mapManager) {    
    
    elm = angular.element(
      '<div id="map1" map-component class="col-md-9 full-height"></div>'
    );
        
    scope = $rootScope;
    $element=$compile(elm)(scope);

    var isolatedScope=$element.isolateScope();
    scope.$digest();

    mapService = mapManager.getServiceByName("map1");

  }));
  
  
  it("add wayPoint",function(){


    mapService.setCenter([12,12]);
    mapService.pushPoint("москва");

    mapService.setCenter([48,48]);
    mapService.pushPoint("барнаул");

    mapService.setCenter([38,48]);
    mapService.pushPoint("чита");
    mapService._instance.$scope.$digest();

    expect(mapService.wayPoints[0]).toEqual({
      address:"москва",
      coordinates:[12,12]
    });

    expect(mapService.wayPoints[1]).toEqual({
      address:"барнаул",
      coordinates:[48,48]
    });

    expect(mapService.wayPoints[2]).toEqual({
      address:"чита",
      coordinates:[38,48]
    });
  })

  it("delete wayPoint",function(){
     mapService.pushPoint("москва");
     mapService.pushPoint("барнаул");
     mapService.pushPoint("чита");
     
     mapService.removePoint(1);
    
     expect(mapService.wayPoints[0].address).toBe("москва");
     expect(mapService.wayPoints[1].address).toBe("чита");
  })
  
  it("move up wayPoint",function(){
     mapService.pushPoint("москва");
     mapService.pushPoint("барнаул");
     mapService.pushPoint("чита");
     
     mapService.movePointToIndex(2, 1);
    
     expect(mapService.wayPoints[0].address).toBe("москва");     
     expect(mapService.wayPoints[1].address).toBe("чита");
     expect(mapService.wayPoints[2].address).toBe("барнаул");
  })

    it("move down wayPoint",function(){
        mapService.pushPoint("москва");
        mapService.pushPoint("барнаул");
        mapService.pushPoint("чита");

        mapService.movePointToIndex(1, 3);

        expect(mapService.wayPoints[0].address).toBe("москва");
        expect(mapService.wayPoints[1].address).toBe("чита");
        expect(mapService.wayPoints[2].address).toBe("барнаул");
    })
});