/**
 * Created by artiom on 12/03/15.
 */

myapp.controller("searchController", ['$scope', 'generalCache', 'contenedoresCache', 'generalFunctions', function($scope, generalCache, contenedoresCache, generalFunctions){
	$scope.status = {
		open: true
	};
	$scope.maxDate = new Date();
	$scope.listaContenedoresGates = contenedoresCache.get('contenedoresGates');
	$scope.listaContenedoresTurnos = contenedoresCache.get('contenedoresTurnos');
	$scope.listaBuques = generalCache.get('buques');
	$scope.listaViajes = [];

	$scope.$on('tengoViajes', function(event, data){
		$scope.listaViajes = data;
	});
	$scope.openDate = function(event){
		generalFunctions.openDate(event);
	};
	$scope.hitEnter = function(evt){
		if(angular.equals(evt.keyCode,13))
			$scope.$emit('cambioFiltro');
	};
	$scope.buqueSelected = function(selected){
		if (angular.isDefined(selected)){
			$scope.model.buqueNombre = selected.originalObject.buque;
			var i = 0;
			selected.originalObject.viajes.forEach(function(viaje){
				var objetoViaje = {
					'id': i,
					'viaje': viaje
				};
				$scope.listaViajes.push(objetoViaje);
				i++;
			});
		}
	};
	$scope.viajeSelected = function(selected){
		if (angular.isDefined(selected)){
			$scope.model.viaje = selected.title;
			$scope.filtrado('viaje', selected.title);
		}
	};
	$scope.containerSelected = function (selected) {
		if (angular.isDefined(selected)) {
			$scope.model.contenedor = selected.title;
			$scope.filtrado('contenedor', selected.title);
		}
	};
	$scope.filtrado = function(filtro, contenido){

		$scope.model[filtro] = contenido;
		if (filtro == 'buqueNombre') {
			if (contenido != ''){
				var i = 0;
				$scope.listaBuques.forEach(function(buque){
					if (buque.buque == contenido){
						buque.viajes.forEach(function(viaje){
							var objetoViaje = {
								'id': i,
								'viaje': viaje
							};
							$scope.listaViajes.push(objetoViaje);
							i++;
						})
					}
				});
			} else {
				$scope.model.viaje = '';
			}
		}
		if ($scope.model.fechaInicio > $scope.model.fechaFin && $scope.model.fechaFin != ''){
			$scope.model.fechaFin = new Date($scope.model.fechaInicio);
			$scope.model.fechaFin.setDate($scope.model.fechaFin.getDate() + 1);
		}
		$scope.$emit('cambioFiltro', $scope.listaViajes);
	};

	$scope.cargaPorFiltros = function () {
		$scope.$emit('cambioFiltro');
	};
}]);