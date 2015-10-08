"use strict"

/**
 * @ngdoc directive
 * @name mapComponent
 *
 * @description
 * карта и путь
 *
 * @element DIV
 * @priority 0
 * @param {array} wayPoints 
 * @param {array} center
 */

class MapComponent {

  constructor() {
    MapComponent.idCount = MapComponent.idCount || 0;

    this.scope = {
      wayPoints: "=",
      center:"="
    }

    this.onDragEndWayPoint = this.onDragEndWayPoint.bind(this)
  }

  /**
   * системный callback 
   * @param $scope
   * @param element
   * @param attr   
   */
  link($scope, element, attr) {
    this.$scope = $scope;
    
    //default value
    this.$scope.center=this.$scope.center||[55.56, 37.76];    

    //сгенерируем id если он не указан в шаблоне
    this.id = attr.id || "map-component-" + (MapComponent.idCount++);
    if (!attr.id) {
      element.attr("id", this.id);
      element[0].setAttribute("id", this.id); //сработает синхронно, в отличии от element.attr срабатывающегот асинхронно        
    }

    ymaps.ready(this.onYandexMapReady.bind(this)); //инициализируем карту            
  }

  /**
   * обработик события готовности yandex map 
   */
  onYandexMapReady() {
    //create map
    this.map = new ymaps.Map(this.id, {
      center: this.$scope.center,
      zoom: 7
    });
    
    //create point collection
    this.collection = new ymaps.GeoObjectCollection({}, {
      draggable: true // обьекты можно перемещать
    });
    
    this.map.geoObjects.add(this.collection);    
    this.$scope.$watch("wayPoints", this.update.bind(this), true);
    this.$scope.$watch("modePath", this.render.bind(this));
    
    //set center
    this.$scope.$watch("center", this.onChangeCenter.bind(this) );
    this.map.events.add('boundschange', this.onBoundChange.bind(this) );
  }
  
  /**
   * обработчик изменения center в ысщзу
   * позволяет устанавливать центр из вне
   */
  onChangeCenter(){
    if(this.boundChange) return this.boundChange=false;    
    this.map.setCenter(this.$scope.center)  
  }
  
  /**
   * обработчик перемещения карты
   * устанавливает центр
   */
  onBoundChange(e){        
    var newCenter=e.originalEvent.newCenter;
    this.$scope.$apply(()=>{
      this.boundChange=true;
      this.$scope.center = newCenter; 
    });    
  }  
  
  /**
   * обработик события dragend на placeholder
   */
  onDragEndWayPoint(e) {
    var target = e.originalEvent.target,
        pos = this.collection.indexOf(target),
        coordinates = target.geometry.getCoordinates();

    this.$scope.$apply(() => {
      this.$scope.wayPoints[pos].coordinates = coordinates;      
    });
    
  }
  

  /**
   * обновляет карту
   * @param actual - waayPoints после изменения
   * @param old - waayPoints после изменения   
   * @returns {MapComponent}
   */
  update(actual, old) { 
    //установим координаты новым точкам
    this.$scope.wayPoints.forEach((wayPoint)=>{
      wayPoint.coordinates=wayPoint.coordinates||this.$scope.center 
    })    
    this.render();
  }
  
  /**
   * перерисовывает геообьекты   
   */
  render() {
    var coordinates = this.$scope.wayPoints.map((item) => item.coordinates);

    if (this.polyline) this.map.geoObjects.remove(this.polyline);
    if (this.collection) this.collection.removeAll();    

    this.renderPoints(this.$scope.wayPoints);    
    this.renderPolyline(coordinates);
  }
  
  /**
   * отрисовывает все точки
   * @param wayPoints - массмив точек
   */
  renderPoints(wayPoints) {
    for (let i = 0; i < wayPoints.length; i++) {
      let placeMark = new ymaps.Placemark(wayPoints[i].coordinates, {
        balloonContent: wayPoints[i].address,
        iconContent: i + 1
      });

      placeMark.events.add("dragend", this.onDragEndWayPoint)
      this.collection.add(placeMark);
    }
  }
  
  /**
   * отрисовывает ломаные
   * @param coordinates - массив точек
   */
  renderPolyline(coordinates) {
    this.polyline = new ymaps.Polyline(coordinates);
    this.polyline.options.set({
        strokeColor: '#0000FF',
        strokeWidth: 3,
        opacity: 0.5
      }); 
    this.map.geoObjects.add(this.polyline);
  }  

  /**
   * Фабрика компонента
   * @param ...args - зависимости
   * @returns {MapComponent}
   */
  static factory(...args) {
    var instance = new MapComponent(...args);
    instance.link = MapComponent.prototype.link ? MapComponent.prototype.link.bind(instance) : instance.link;
    return instance;
  }
}

MapComponent.factory.$inject = [];
angular.module("mapComponent", []).directive("mapComponent", MapComponent.factory);