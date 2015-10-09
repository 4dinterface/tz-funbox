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

  constructor(mapManager) {
    MapComponent.idCount = MapComponent.idCount || 0;
    this.scope = {}

    this.onDragEndWayPoint = this.onDragEndWayPoint.bind(this);   
    this.mapManager=mapManager;
  }
  
  /**
   * системный callback 
   * нужно зарегистрироватьinstance с именем взятым из id до срабатывания контролёра
   * @param $scope
   * @param element
   * @param attr   
   */
  compile($element, attr){
    this.id=attr.id;
    
    //сгенерируем id если он не указан в шаблоне    
    if (!this.id) {
      this.id="map-component-" + (MapComponent.idCount++);
      $element.attr("id",this.id);            
    }
    this.mapService=this.mapManager.registerInstance(this.id,this);

        
    return {
      pre:($scope)=>  {
        this.$scope = $scope;
        this.$scope.center = this.mapService.center;
        this.$scope.wayPoints = this.mapService.wayPoints;
        ymaps.ready(this.onYandexMapReady.bind(this)); //инициализируем карту

        //удалим сервис если удаляется директива
        this.scope.$on('$destroy', ()=>{
          this.mapManager.unregisterInstance(this.id);
        });
      }           
    }

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
    this.$scope.$watch("center", this.onChangeCenter.bind(this));
    this.map.events.add('boundschange', this.onBoundChange.bind(this));
  }

  /**
   * обработчик изменения center в ысщзу
   * позволяет устанавливать центр из вне
   */
  onChangeCenter() {
    if (this.boundChange) return this.boundChange = false;
    this.map.setCenter(this.$scope.center)
  }

  /**
   * обработчик перемещения карты
   * устанавливает центр
   */
  onBoundChange(e) {
    var newCenter = e.originalEvent.newCenter;
    this.$scope.$apply(() => {
      this.boundChange = true;
      this.$scope.center[0] = newCenter[0];
      this.$scope.center[1] = newCenter[1];
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




class MapService {
  /* точки пути */
  wayPoints;

  center;

  /* инстанс директивы */
  _instance;

  /**
   * конструктор сервиса
   * @param directiveInstance
   */
  constructor(directiveInstance) {
    this.wayPoints = [];
    this.center=[55.56, 37.76];
    this._instance = directiveInstance;
  }

  /** 
   * Добавляет точку 
   * @param {string}
   **/
  pushPoint(name) {
    this.wayPoints.push({
      address:name,
      coordinates:[
        this.center[0],
        this.center[1]
      ]
    });
  }

  /** 
   * удаляет точку 
   * @param {number} index
   **/
  removePoint(index) {
    this.wayPoints.splice(index, 1);
  }

  /** 
   * перемещает точку со старого индекса на новый
   * @param {number} oldPos текущий индекс точки
   * @param {number} newPos индекс для вставки
   */
  movePointToIndex(oldPos, newPos) {
    var removePos = oldPos > newPos ? oldPos + 1 : oldPos;
    this.wayPoints.splice(newPos, 0, this.wayPoints[oldPos]);
    this.wayPoints.splice(removePos, 1);
  }

  setCenter(center) {
    this.center[0]=center[0];
    this.center[1]=center[1];
  }
  
}


MapComponent.factory.$inject = ["mapManager"];



angular.module("mapComponent", [])
  .directive("mapComponent", MapComponent.factory)

  /**
   * @ngdoc service
   * @name mapManager
   *

   * @description
   * Менеджер серивисов обеспечивает регистрацию, получение и удаление сервисов директив
   */
  .factory('mapManager', function () {
    var services = {};

    function registerInstance(name, directiveInstance) {
      if (!name || !directiveInstance) throw "некорректная регистрация";
      services[name] = new MapService(directiveInstance);
      return services[name];
    };

    function unregisterInstance(name) {
      delete services[name];
    };

    function getServiceByName(name) {
      if (!(name in services)) {
        throw "нет сервиса с именем: " + name;
      }
      return services[name];
    };

    return {
      registerInstance: registerInstance,
      unregisterInstance: unregisterInstance,
      getServiceByName: getServiceByName
    }

  })