"use strict"

class MapComponent {

  constructor() {
    MapComponent.idCount = MapComponent.idCount || 0;

    this.scope = {
      wayPoints: "=",
      modePath: "="
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
      center: [55.56, 37.76],
      zoom: 7
    });

    //create point collection
    this.collection = new ymaps.GeoObjectCollection({}, {
      draggable: true // и их можно перемещать
    });
    this.map.geoObjects.add(this.collection);


    this.$scope.$watch("wayPoints", this.update.bind(this), true);
    this.$scope.$watch("modePath", this.render.bind(this));
  }

  /**
   * обработик события dragend на placeholder
   */
  onDragEndWayPoint(e) {
    var target = e.originalEvent.target,
      pos = this.collection.indexOf(target),
      coordinates = target.geometry.getCoordinates();

    ymaps.geocode(coordinates, {
      results: 1
    }).then((res) => {
      var obj = res.geoObjects.get(0),
        detail = obj.properties.get('metaDataProperty').GeocoderMetaData;

      this.$scope.$apply(() => {
        this.$scope.wayPoints[pos].coordinates = coordinates;
        this.$scope.wayPoints[pos].address = detail.text;
      });
    });
  }

  /**
   * обновляет карту
   * @param actual - waayPoints после изменения
   * @param old - waayPoints после изменения   
   * @returns {MapComponent}
   */
  update(actual, old) {
    if (old && actual.length > old.length) {
      ymaps.geocode(actual[actual.length - 1].address, {
        results: 1
      }).then((res) => {
        if (!res || !res.geoObjects.get(0)) return;
        var coord = res.geoObjects.get(0).geometry.getCoordinates();

        this.$scope.$apply(() => {
          this.map.setCenter(coord);
          actual[actual.length - 1].coordinates = coord;
          actual[actual.length - 1].goodAddress = true;
        });
      })
    } else {
      this.render(actual);
    }
  }

  /**
   * перерисовывает геообьекты   
   */
  render() {
    var wayPoints = this.$scope.wayPoints.filter((point) => point.coordinates),
      coordinates = wayPoints.map((item) => item.coordinates);

    if (this.polyline) this.map.geoObjects.remove(this.polyline);
    if (this.path) this.map.geoObjects.remove(this.path);
    if (this.collection) this.collection.removeAll();

    this.renderPoints(wayPoints);

    //путь или линия рисуются только в случае если все точки найдены
    if (this.$scope.wayPoints.length == wayPoints.length) {
      if (this.$scope.modePath) this.renderRoute(wayPoints, coordinates)
      else this.renderPolyline(wayPoints, coordinates);
    }
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
   * @param wayPoints - массмив точек
   */
  renderPolyline(wayPoints, coordinates) {
    this.polyline = new ymaps.Polyline(coordinates);
    this.polyline.options.set({
        strokeColor: '#0000FF',
        strokeWidth: 3,
        opacity: 0.5
      }); 
    this.map.geoObjects.add(this.polyline);
  }

  /**
   * отрисовывает путь
   * @param wayPoints - массмив точек
   * @param coordinates - массив координат  
   */
  renderRoute(wayPoints, coordinates) {
    ymaps.route(coordinates).then((route) => {
      this.path = route.getPaths();

      this.path.options.set({
        strokeColor: '#00FF00',
        strokeWidth: 2
      });
      this.map.geoObjects.add(this.path);
    });
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