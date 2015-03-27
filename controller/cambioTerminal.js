/**
 * Created by artiom on 17/03/15.
 */

myapp.controller('cambioTerminalCtrl', ['$rootScope', '$scope', 'cacheFactory', '$state', 'authFactory', 'loginService', '$timeout', 'generalFunctions', function($rootScope, $scope, cacheFactory, $state, authFactory, loginService, $timeout, generalFunctions){

	$scope.max = 80;
	$scope.progreso = 0;
	$scope.mostrarMensaje = 'Actualizando datos de la aplicación...';
	$scope.porcentaje = 0;

	$scope.$on('progreso', function(e, mensaje){
		$scope.progreso += 10;
		$scope.porcentaje = ($scope.progreso * 100 / $scope.max).toFixed();
	});

	$scope.cerrarSesion = function(){
		$rootScope.cargandoCache = false;
		$scope.hayError = true;
		$scope.barType = 'progress-bar-danger';
		$scope.mostrarMensaje = 'Se ha producido un error...';
		authFactory.logout();
		$rootScope.esUsuario = '';
		$rootScope.filtroTerminal = '';
		$scope.volver();
	};

	$scope.volver = function(){
		$timeout(function(){
			if ($scope.progreso > 0){
				$scope.progreso -= 10;
				$scope.mostrarMensaje = 'Cerrando sesiónn';
				$scope.volver();
			} else {
				$state.transitionTo('login');
			}
		}, 1000);
	};

	$rootScope.cargandoCache = true;

	if ($rootScope.cambioTerminal){
		$rootScope.cambioTerminal = false;
		cacheFactory.cambioTerminal()
			.then(function(){
				$timeout(function(){
					$rootScope.cargandoCache = false;
					$state.transitionTo($rootScope.previousState);
				}, 500)
			},
			function(){
				$scope.cerrarSesion();
			})
	} else {
		$scope.max = 30;
		cacheFactory.cargaMemoryCache()
			.then(function(){
				$timeout(function(){
					$rootScope.cargandoCache = false;
					$state.transitionTo($rootScope.previousState);
				}, 500)
			},
			function(){
				$scope.cerrarSesion();
			})
	}

}]);
