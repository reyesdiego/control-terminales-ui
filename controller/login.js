/**
 * Created by Diego Reyes on 1/23/14.
 */
function loginCtrl($scope, $rootScope, userFactory, $state, loginService, invoiceFactory){
	'use strict';
	$scope.entrando = false;

	if (loginService.getStatus()){
		$state.transitionTo('tarifario');
	}

	$scope.login = function(){
		$scope.entrando = true;
		userFactory.login($scope.email, $scope.password, function(data, error){
				if (error){
					$scope.entrando = false;
				} else {
					loginService.setInfo(data);
					loginService.setStatus(true);
					loginService.setType(data.role);
					loginService.setToken(data.token.token);
					data.acceso.push("reports");
					loginService.setAcceso(data.acceso);
					$state.transitionTo('tarifario');

					$rootScope.esUsuario = loginService.getType();
					$rootScope.terminal = loginService.getInfo();

					//En el login debe cargar las descripciones asociadas
					invoiceFactory.getDescriptionItem(function(data){
						$rootScope.itemsDescriptionInvoices = data.data;
					});

					//Si el rol es terminal, queda como filtro de si misma para las consultas
					//De lo contrario, dejo a BACTSSA como filtro por default
					if (data.role == 'terminal'){
						loginService.setFiltro(data.terminal);
					} else {
						loginService.setFiltro('BACTSSA');
						$rootScope.estiloTerminal = 'bactssa';
						$rootScope.filtroTerminal = 'BACTSSA';
					}

					// Carga el tema de la terminal
					if ($rootScope.terminal.terminal == 'BACTSSA'){
						$scope.switchTheme('cerulean')
					}
					if ($rootScope.terminal.terminal == 'TRP'){
						$scope.switchTheme('flaty')
					}
					if ($rootScope.terminal.terminal == 'TERMINAL4'){
						$scope.switchTheme('united')
					}
				}
			}
		)};

	$scope.switchTheme = function(title){
		var i, a;
		for(i=0; (a = document.getElementsByTagName("link")[i]); i++) {
			if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {
				a.disabled = a.getAttribute("title") != title;
			}
		}
	};
}
