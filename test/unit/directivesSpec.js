// невижу особого смысла дублировать e2e тест

/*describe('ng-sortabla', function() { 
  var elm, scope,$element;

  //'beforeEach(module('mapApp'));
  beforeEach(module('ngSortable'));

  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element(
      '<ul class="list-group" id="address-list" ng-sortable="wayPoints">'+
        '<li class="list-group-item clearfix" ng-repeat="point in wayPoints track by $index" index="{{$index}}" >'+
          '<div style="padding-right:40px;"> {{point.address}} </div>'+
        '</li>'+                                                                                          
      '</ul>'
    );

    scope = $rootScope;
    $element=$compile(elm)(scope);
    
    scope.wayPoints=[
      {address:"Москва",coordinates:[1,2]},
      {address:"Барнаул",coordinates:[1,2]},
      {address:"Новосибирск",coordinates:[1,2]}
    ];
    
    var isolatedScope=$element.isolateScope();
    scope.$digest();
  }));
  
  
  it("",function(){
     $element.triggerHandler('mouseup');
     expect(1).toBe(1);  
  })
  
});*/