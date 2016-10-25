/**
 * Created by Artiom on 14/03/14.
 */

myapp.controller('navigationCtrl', ['$scope', '$rootScope', '$state', 'loginService', 'authFactory', 'generalFunctions', '$timeout', 'notify', '$filter',
	function($scope, $rootScope, $state, loginService, authFactory, generalFunctions, $timeout, notify, $filter) {

		$scope.isCollapsed = true;

		notify.config({
			duration: 20000,
			position: 'left',
			maximumOpen: 4
		});

		$scope.colaNotificaciones = [];
		$scope.notificacionesMáximasPantalla = 4;
		$scope.iniciarChequeo = true;

		$rootScope.esUsuario = '';
		$rootScope.terminal = '';
		$scope.acceso = '';
		$scope.grupo = '';
		$rootScope.filtroTerminal = '';

		$scope.cerrarMenu = function(){
			if (!$scope.isCollapsed) $scope.isCollapsed = true;
		};

		$scope.irA = function(){
			if (!$rootScope.cargandoCache) {
				if (loginService.getStatus()){
					$state.transitionTo($state.current.name);
					$state.reload();
				} else {
					$state.transitionTo('login');
				}
			}
		};

		if (loginService.getStatus()){
			$rootScope.esUsuario = loginService.getType();
			$rootScope.terminal = loginService.getInfo();
			$rootScope.grupo = loginService.getGroup();
			//Esta carga se realiza en el caso de haber actualizado la página
			if (loginService.getType() == 'agp'){
				$rootScope.filtroTerminal = loginService.getFiltro();
			}
		}

		$scope.$on('terminoLogin', function(){
			$rootScope.esUsuario = loginService.getType();
			$rootScope.terminal = loginService.getInfo();
			$rootScope.grupo = loginService.getGroup();
			//Esta carga se realiza en el caso de haber actualizado la página
			if (loginService.getType() == 'agp'){
				$rootScope.filtroTerminal = loginService.getFiltro();
			}
		});

		$scope.$watch(function(){
			$scope.acceso = $rootScope.esUsuario;
			$scope.terminal = $rootScope.terminal;
			$scope.grupo = $rootScope.grupo;
		});

		$scope.switchMoneda = function(){
			if ($rootScope.moneda == 'PES'){
				$rootScope.moneda = 'DOL';
			} else if ($rootScope.moneda == 'DOL'){
				$rootScope.moneda = 'PES';
			}
		};

		$scope.setearTerminal = function(terminal){
			console.log('hola');
			if ($rootScope.filtroTerminal != terminal){
				$rootScope.setEstiloTerminal(terminal);
				$state.reload();
			}
		};

		$scope.tieneAcceso = function(aguja){
			return generalFunctions.in_array(aguja, $scope.rutas);
		};

		$scope.imprimirVista = function(){
			window.print();
		};

		$scope.procesarNotificacion = function(ruta, template, titulo, terminal){
			var clase = 'cg-notify-' + terminal;
			if ($state.current.name != ruta){
				switch (ruta){
					case 'turnos':
						$rootScope.appointmentNotify++;
						break;
					case 'gates':
						$rootScope.gateNotify++;
						break;
					case 'invoices':
						$rootScope.invoiceNotify++;
				}
			} else if($rootScope.verNotificaciones) {
				if ($scope.notificacionesMáximasPantalla > 0){
					notify({
						messageTemplate: template,
						title: titulo,
						classes: clase,
						onClose: $scope.liberarNotificacion,
						scope: $scope
					});
					$scope.notificacionesMáximasPantalla--;
				} else {
					var notificacion = {
						messageTemplate: template,
						title: titulo,
						clase: clase
					};
					$scope.colaNotificaciones.push(notificacion);
					if ($scope.iniciarChequeo){
						$scope.iniciarChequeo = false;
						$scope.chequearNotificaciones();
					}
				}
			}
		};

		$scope.$on('socket:appointment', function (ev, data) {
			if (loginService.getStatus()){
				if (data.status === 'OK') {
					var turno = data.data;
					var nuevoTurnoTemplate;
					if (turno.terminal == loginService.getFiltro()){
						nuevoTurnoTemplate = '<span><strong>Tipo:</strong> <a href ng-click="notificacionDetalle(\'mov\', \'' + turno.mov + "')\">" + turno.mov + "</a> - <strong>Fecha:</strong> <a href ng-click=\"notificacionDetalle('fechaTurno', {inicio:'" + turno.inicio + "', fin:'" + turno.fin + "'})\">" + $filter('date')(turno.inicio,'dd/MM/yyyy','-0300' ) + "</a><br>De " + $filter('date')(turno.inicio, 'HH:mm', '-0300') + " a " + $filter('date')(turno.fin, 'HH:mm', '-0300') + "<br><strong>Buque:</strong> <a href ng-click=\"notificacionDetalle('buqueNombre', '" + turno.buque + "')\">" + turno.buque + "</a> - <strong>Viaje:</strong> " + turno.viaje + "<br><strong>Contenedor:</strong> <a href ng-click=\"notificacionDetalle('contenedor','" + turno.contenedor + "')\">" + turno.contenedor + '</a><br><a href ng-click="notificacionDetalle(\'turno\', {inicio:\'' + turno.inicio + '\', fin: \'' + turno.fin + '\', mov: \'' + turno.mov + '\', buque: \'' + turno.buque + '\', contenedor: \'' + turno.contenedor + '\'})">Ver turno</a></span>';
					} else {
						nuevoTurnoTemplate = '<span><a href ng-click="setearTerminal(\'' + turno.terminal + '\')"><strong>Tipo:</strong> ' + turno.mov + " - <strong>Fecha:</strong> " + $filter('date')(turno.inicio,'dd/MM/yyyy','-0300' ) + "<br>De " + $filter('date')(turno.inicio, 'HH:mm', '-0300') + " a " + $filter('date')(turno.fin, 'HH:mm', '-0300') + "<br><strong>Buque:</strong> " + turno.buque + " - <strong>Viaje:</strong> " + turno.viaje + "<br><strong>Contenedor:</strong> " + turno.contenedor + '</a>';
					}
					if (loginService.getType() == 'agp'){
						$scope.procesarNotificacion('turnos', nuevoTurnoTemplate, 'Nuevo Turno ' + turno.terminal, turno.terminal);
					} else {
						if (turno.terminal == loginService.getFiltro()){
							$scope.procesarNotificacion('turnos', nuevoTurnoTemplate, 'Nuevo Turno', turno.terminal);
						}
					}
				}
			}
		});

		$scope.$on('socket:gate', function (ev, data) {
			if (loginService.getStatus()){
				if (data.status === 'OK') {
					var gate = data.data;
					var nuevoGateTemplate;
					if (gate.terminal == loginService.getFiltro()){
						if (gate.mov != 'PASO'){
							nuevoGateTemplate = '<span><strong>Tipo: </strong>' + gate.mov + ' - <strong>Fecha: </strong>' + $filter('date')(gate.gateTimestamp, 'dd/MM/yyyy HH:mm', '-0300') + '<br><strong>Buque: </strong><a href ng-click="notificacionDetalle(\'buqueNombre\', \'' + gate.buque + '\')">' + gate.buque + '</a> - <strong>Viaje: </strong>' + gate.viaje + '<br><strong>Contenedor: </strong><a href ng-click="notificacionDetalle(\'contenedor\', \'' + gate.contenedor + '\')">' + gate.contenedor + '</a><br><a href ng-click="notificacionDetalle(\'gate\', {fecha: \'' + gate.gateTimestamp + '\', buque: \'' + gate.buque + '\', contenedor: \'' + gate.contenedor + '\'})">Ver gate</a>';
						} else {
							nuevoGateTemplate = '<span><strong>Tipo: </strong>' + gate.mov + ' - <strong>Fecha: </strong>' + $filter('date')(gate.gateTimestamp, 'dd/MM/yyyy HH:mm', '-0300');
						}
					} else {
						if (gate.mov != 'PASO'){
							nuevoGateTemplate = '<span><a href ng-click="setearTerminal(\'' + gate.terminal + '\')"><strong>Tipo: </strong>' + gate.mov + ' - <strong>Fecha: </strong>' + $filter('date')(gate.gateTimestamp, 'dd/MM/yyyy HH:mm', '-0300') + '<br><strong>Buque: </strong>' + gate.buque + ' - <strong>Viaje: </strong>' + gate.viaje + '<br><strong>Contenedor: </strong>' + gate.contenedor + '</a>';
						} else {
							nuevoGateTemplate = '<span><a href ng-click="setearTerminal(\'' + gate.terminal + '\')"><strong>Tipo: </strong>' + gate.mov + ' - <strong>Fecha: </strong>' + $filter('date')(gate.gateTimestamp, 'dd/MM/yyyy HH:mm', '-0300');
						}
					}
					if (loginService.getType() == 'agp'){
						$scope.procesarNotificacion('gates', nuevoGateTemplate, 'Nuevo Gate ' + gate.terminal, gate.terminal);
					} else {
						if (gate.terminal == loginService.getFiltro()){
							$scope.procesarNotificacion('gates', nuevoGateTemplate, 'Nuevo Gate', gate.terminal);
						}
					}
				}
			}
		});

		$scope.$on('socket:invoice', function (ev, data) {
			if (loginService.getStatus()){
				if (loginService.getType() == 'agp' || (loginService.getType == 'terminal' && loginService.getFiltro() == data.data.terminal)){
					var comprobante = data.data;
					var nuevoComprobanteTemplate;
					if (comprobante.terminal == loginService.getFiltro()){
						nuevoComprobanteTemplate = '<span>Tipo: ' + $filter('nombreComprobante')(comprobante.codTipoComprob, false) + ' - Número: ' + comprobante.nroComprob + '<br>Razón social: ' + comprobante.razon + '<br>Emisión: ' + $filter('date')(comprobante.emision, 'dd/MM/yyyy', 'UTC') + '<br>Importe: ' + $filter('formatCurrency')($rootScope.moneda) + ' ' + $filter('currency')($filter('conversionMoneda')(comprobante.total, comprobante)) + '<br><a href ng-click="mostrarComprobante(\'' + comprobante._id + '\')">Ver comprobante</a></span>';
					} else {
						nuevoComprobanteTemplate = '<span><a href ng-click="setearTerminal(\'' + comprobante.terminal + '\')">Tipo: ' + $filter('nombreComprobante')(comprobante.codTipoComprob, false) + ' - Número: ' + comprobante.nroComprob + '<br>Razón social: ' + comprobante.razon + '<br>Emisión: ' + $filter('date')(comprobante.emision, 'dd/MM/yyyy', 'UTC') + '<br>Importe: ' + $filter('formatCurrency')($rootScope.moneda) + ' ' + $filter('currency')($filter('conversionMoneda')(comprobante.total, comprobante)) + '</a>';
					}
					if (loginService.getType() == 'agp'){
						$scope.procesarNotificacion('invoices', nuevoComprobanteTemplate, 'Nuevo Comprobante ' + comprobante.terminal, comprobante.terminal);
					} else {
						if (comprobante.terminal == loginService.getFiltro()){
							$scope.procesarNotificacion('invoices', nuevoComprobanteTemplate, 'Nuevo Comprobante', comprobante.terminal);
						}
					}
				}
			}
		});

		$scope.$on('$stateChangeStart', function(event, toState){
			notify.closeAll();
			if ($scope.colaNotificaciones.length > 0){
				switch ($state.current.name){
					case 'turnos':
						$scope.appointmentNotify = $scope.colaNotificaciones.length;
						break;
					case 'gates':
						$scope.gateNotify = $scope.colaNotificaciones.length;
						break;
					case 'invoices':
						$scope.invoiceNotify = $scope.colaNotificaciones.length;
						break;
				}
				$scope.colaNotificaciones = [];
			}
			switch (toState.name){
				case 'invoices':
					$rootScope.invoiceNotify = 0;
					break;
				case 'gates':
					$rootScope.gateNotify = 0;
					break;
				case 'turnos':
					$rootScope.appointmentNotify = 0;
					break;
			}
		});

		$scope.mostrarComprobante = function(comprobanteId){
			var comprobante={_id: comprobanteId};
			$rootScope.$broadcast('mostrarComprobante', comprobante);
		};

		$scope.notificacionDetalle = function(filtro, contenido){
			var data = {
				filtro: filtro,
				contenido: contenido
			};
			$rootScope.$broadcast('notificacionDetalle', data);
		};

		$scope.liberarNotificacion = function(){
			$scope.notificacionesMáximasPantalla++
		};

		$scope.chequearNotificaciones = function(){
			$timeout(function(){
				if ($scope.colaNotificaciones.length > 0){
					var ponerNotificaciones = $scope.colaNotificaciones.length;
					if (ponerNotificaciones > $scope.notificacionesMáximasPantalla) ponerNotificaciones = $scope.notificacionesMáximasPantalla;
					for (var i = 0; i < ponerNotificaciones; i++){
						var template = $scope.colaNotificaciones[i];
						notify({
							messageTemplate: template.messageTemplate,
							title: template.title,
							classes: template.clase,
							onClose: $scope.liberarNotificacion,
							scope: $scope
						});
						$scope.notificacionesMáximasPantalla--;
					}
					$scope.colaNotificaciones.splice(0, ponerNotificaciones);
				}
				if ($scope.colaNotificaciones.length > 0){
					$scope.chequearNotificaciones();
				} else {
					$scope.iniciarChequeo = true;
				}
			}, 21000)
		};

		$scope.onOffNotificaciones = function(){
			$rootScope.verNotificaciones = !$rootScope.verNotificaciones;
			$scope.colaNotificaciones = [];
			if (!$rootScope.verNotificaciones) notify.closeAll();
		};

	}]);