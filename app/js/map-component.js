"use strict";
var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mapModule = angular.module("mapComponent", []);

/**
 * @ngdoc directive
 * @name *
 *
 * @description
 * карта и путь
 *
 * @element DIV
 * @priority 0
 * @param {array} wayPoints 
 * @param {array} center
 */

var MapComponent = (function () {
  function MapComponent(mapManager) {
    _classCallCheck(this, MapComponent);

    MapComponent.idCount = MapComponent.idCount || 0;
    this.scope = {}; //в этой версии всё взаимодействие идёт через сервис

    this.onDragEndWayPoint = this.onDragEndWayPoint.bind(this);
    this.mapManager = mapManager;
  }

  /**
   * системный callback 
   * нужно зарегистрироватьinstance с именем взятым из id до срабатывания контролёра
   * @param $scope
   * @param element
   * @param attr   
   */

  _createClass(MapComponent, [{
    key: "compile",
    value: function compile($element, attr) {
      var _this = this;

      this.id = attr.id;

      //сгенерируем id если он не указан в шаблоне   
      if (!this.id) {
        this.id = "map-component-" + MapComponent.idCount++;
        $element.attr("id", this.id);
      }
      //зарегистрируем instace директивы в менеджере
      this.mapService = this.mapManager.registerInstance(this.id, this);

      return {
        pre: function pre($scope) {
          _this.$scope = $scope;

          // за центр и координаты целиком и полностью отвечает сервис,
          // это позволяет использовать сервис в контролёре приложения не дожидаясь инициализации директивы с картой
          _this.$scope.center = _this.mapService.center;
          _this.$scope.wayPoints = _this.mapService.wayPoints;

          ymaps.ready(_this.onYandexMapReady.bind(_this)); //инициализируем карту

          //удалим сервис если удаляется директива
          _this.$scope.$on('$destroy', function () {
            _this.mapManager.unregisterInstance(_this.id);
          });
        }
      };
    }

    /**
     * обработик события готовности yandex map 
     */
  }, {
    key: "onYandexMapReady",
    value: function onYandexMapReady() {
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
      this.$scope.$watch("wayPoints", this.render.bind(this), true);

      //set center
      this.$scope.$watch("center", this.onChangeCenter.bind(this));
      this.map.events.add('boundschange', this.onBoundChange.bind(this));
    }

    /**
     * обработчик изменения center в ысщзу
     * позволяет устанавливать центр из вне
     */
  }, {
    key: "onChangeCenter",
    value: function onChangeCenter() {
      if (this.boundChange) return this.boundChange = false;
      this.map.setCenter(this.$scope.center);
    }

    /**
     * обработчик перемещения карты
     * устанавливает центр
     */
  }, {
    key: "onBoundChange",
    value: function onBoundChange(e) {
      var _this2 = this;

      var newCenter = e.originalEvent.newCenter;
      this.$scope.$apply(function () {
        _this2.boundChange = true;
        _this2.$scope.center[0] = newCenter[0];
        _this2.$scope.center[1] = newCenter[1];
      });
    }

    /**
     * обработик события dragend на placeholder
     */
  }, {
    key: "onDragEndWayPoint",
    value: function onDragEndWayPoint(e) {
      var _this3 = this;

      var target = e.originalEvent.target,
          index = this.collection.indexOf(target);

      this.$scope.$apply(function () {
        _this3.$scope.wayPoints[index].coordinates = target.geometry.getCoordinates();
      });
    }

    /**
     * перерисовывает геообьекты   
     */
  }, {
    key: "render",
    value: function render() {
      var coordinates = this.$scope.wayPoints.map(function (item) {
        return item.coordinates;
      });

      if (this.polyline) this.map.geoObjects.remove(this.polyline);
      if (this.collection) this.collection.removeAll();

      this.renderPoints(this.$scope.wayPoints);
      this.renderPolyline(coordinates);
    }

    /**
     * отрисовывает все точки
     * @param wayPoints - массмив точек
     */
  }, {
    key: "renderPoints",
    value: function renderPoints(wayPoints) {
      for (var i = 0; i < wayPoints.length; i++) {
        var placemark = new ymaps.Placemark(wayPoints[i].coordinates, {
          balloonContent: wayPoints[i].address,
          iconContent: i + 1
        });

        placemark.events.add("dragend", this.onDragEndWayPoint);
        this.collection.add(placemark);
      }
    }

    /**
     * отрисовывает ломаные
     * @param coordinates - массив точек
     */
  }, {
    key: "renderPolyline",
    value: function renderPolyline(coordinates) {
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
  }], [{
    key: "factory",
    value: function factory() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var instance = new (_bind.apply(MapComponent, [null].concat(args)))();
      instance.link = MapComponent.prototype.link ? MapComponent.prototype.link.bind(instance) : instance.link;
      return instance;
    }
  }]);

  return MapComponent;
})();

MapComponent.factory.$inject = ["mapManager"];
mapModule.directive("mapComponent", MapComponent.factory);

/**
 * Сервис реализует API директивы
 *
 */

var MapService = (function () {

  /**
   * конструктор сервиса
   * @param directiveInstance
   */

  function MapService(directiveInstance) {
    _classCallCheck(this, MapService);

    this._instance = directiveInstance;
    this.wayPoints = [];
    this.center = [55.75, 37.6];
  }

  /**
   * @ngdoc service
   * @name mapManager
   *
   * @description
   * Менеджер серивисов обеспечивает регистрацию, получение и удаление сервисов директив
   */

  /** 
   * Добавляет точку 
   * @param {string}
   **/

  _createClass(MapService, [{
    key: "pushPoint",
    value: function pushPoint(name) {
      this.wayPoints.push({
        address: name,
        coordinates: this.center.splice(0)
      });
    }

    /** 
     * удаляет точку 
     * @param {number} index
     **/
  }, {
    key: "removePoint",
    value: function removePoint(index) {
      this.wayPoints.splice(index, 1);
    }

    /** 
     * перемещает точку со старого индекса на новый
     * @param {number} oldPos текущий индекс точки
     * @param {number} newPos индекс для вставки
     */
  }, {
    key: "movePointToIndex",
    value: function movePointToIndex(oldPos, newPos) {
      var removePos = oldPos > newPos ? oldPos + 1 : oldPos;
      this.wayPoints.splice(newPos, 0, this.wayPoints[oldPos]);
      this.wayPoints.splice(removePos, 1);
    }
  }, {
    key: "setCenter",
    value: function setCenter(center) {
      this.center[0] = center[0];
      this.center[1] = center[1];
    }
  }]);

  return MapService;
})();

mapModule.factory('mapManager', function () {
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
  };
});

/* точки пути */

/* инстанс директивы */
//# sourceMappingURL=map-component.js.map