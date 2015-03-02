/**
 * Created by Diego Reyes on 1/29/14.
 */
(function() {
	myapp.controller('pricelistCtrl', function($rootScope, $scope, priceFactory, loginService) {
		'use strict';
		// Variable para almacenar la info principal que trae del factory
		$scope.pricelist = [];
		$scope.filteredPrices = [];
		$scope.tasas = false;
		$scope.reverse = true;
		$scope.predicate = '';
		$scope.itemsPerPage = 10;
		$scope.hayError = false;
		$scope.mensajeResultado = $rootScope.mensajeResultado;

		$scope.$on('cambioPagina', function(event, data){
			$scope.currentPage = data;
		});

		$scope.$on('errorInesperado', function(){
			$scope.hayError = true;
			$scope.mensajeResultado = $rootScope.mensajeResultado;
		});

		$scope.cargaPricelist = function(){
			priceFactory.getPrice(loginService.getFiltro(), $scope.tasas, function (data) {
				if (data.status == 'OK'){
					$scope.pricelist = data.data;
					$scope.pricelist.forEach(function(tarifa){
						if (angular.isDefined($scope.arrayUnidades[tarifa.unit])){
							tarifa.unit = $scope.arrayUnidades[tarifa.unit];
						}
						if (!angular.isDefined(tarifa.topPrices[0].price || tarifa.topPrices[0].price == null)){
							tarifa.orderPrice = 0;
						} else {
							tarifa.orderPrice = tarifa.topPrices[0].price;
						}
					});
					$scope.totalItems = $scope.pricelist.length;
				} else {
					$scope.hayError = true;
					$rootScope.mensajeResultado = {
						titulo: 'Tarifario',
						mensaje: 'Se ha producido un error al cargar los datos del tarifario.',
						tipo: 'panel-danger'
					};
				}
			});
		};

		$scope.ordenarPor = function(filtro){
			if ($scope.predicate == filtro){
				$scope.reverse = !$scope.reverse;
			}
			$scope.predicate = filtro;
		};

		$scope.cargaPricelist();
	});
})();