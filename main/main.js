/**
 * Created by kolesnikov-a on 21/02/14.
 */

google.load("visualization", "1", {packages:["corechart"]});

Array.prototype.equals = function (array) {
	// if the other array is a falsy value, return
	if (!array)
		return false;

	// compare lengths - can save a lot of time
	if (this.length != array.length)
		return false;

	this.sort();
	array.sort();

	for (var i = 0, l=this.length; i < l; i++) {
		// Check if we have nested arrays
		if (this[i] instanceof Array && array[i] instanceof Array) {
			// recurse into the nested arrays
			if (!this[i].equals(array[i]))
				return false;
		}
		else if (this[i] != array[i]) {
			// Warning - two different object instances will never be equal: {x:20} != {x:20}
			return false;
		}
	}
	return true;
};

var myapp = angular.module('myapp', ['ui.router', 'ui.bootstrap', 'ui.bootstrap.datetimepicker', 'ngSanitize', 'ngCookies', 'multi-select', 'angular-cache', 'cgNotify', 'btford.socket-io', 'ngAnimate', 'ngTagsInput']);

myapp.constant('uiDatetimePickerConfig', {
	dateFormat: 'yyyy-MM-dd HH:mm',
	defaultTime: '00:00:00',
	html5Types: {
		date: 'yyyy-MM-dd',
		'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
		'month': 'yyyy-MM'
	},
	initialPicker: 'date',
	reOpenDefault: false,
	enableDate: true,
	enableTime: true,
	buttonBar: {
		show: true,
		now: {
			show: true,
			text: 'Ahora'
		},
		today: {
			show: true,
			text: 'Hoy'
		},
		clear: {
			show: true,
			text: 'Borrar'
		},
		date: {
			show: true,
			text: 'Fecha'
		},
		time: {
			show: true,
			text: 'Hora'
		},
		close: {
			show: true,
			text: 'Listo'
		}
	},
	closeOnDateSelection: true,
	closeOnTimeNow: true,
	appendToBody: false,
	altInputFormats: [],
	ngModelOptions: { },
	saveAs: false,
	readAs: false
});

myapp.config(['$httpProvider', function ($httpProvider) {

	$httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';

}]);

//Configuración para interceptar respuestas http y tratar errores
myapp.config(['$provide', '$httpProvider', function($provide, $httpProvider){

	// register the interceptor as a service
	$provide.factory('myHttpInterceptor', ['$rootScope', '$q',
		function($rootScope, $q) {
			return {
				// optional method
				'request': function(config) {
					return config;
				},
				// optional method
				'requestError': function(rejection) {
					// do something on error

					/*if (canRecover(rejection)) {
					 return responseOrNewPromise
					 }*/
					return $q.reject(rejection);
				},
				// optional method
				'response': function(response) {
					// do something on success
					return response;
				},
				// optional method
				'responseError': function(rejection) {
					//TODO config custom messages for http Error status
					//console.log(rejection);
					/*if (rejection.status == 401){
						if (rejection.config.url != configService.serverUrl + '/login'){
							$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
							var deferred = $q.defer();
							var req = {
								config: rejection.config,
								deferred: deferred
							};
							$rootScope.requests401.push(req);

							return deferred.promise;
							//$state.transitionTo('login');
						}
					}

					/*if (rejection.status == -1) rejection.data = { message: 'No se ha podido establecer comunicación con el servidor.', status: 'ERROR' };
					// do something on error
					/*if (canRecover(rejection)) {
					 return responseOrNewPromise
					 }*/
					if (rejection.data == null){
						rejection.data = {
							status: 'ERROR',
							message: 'Fallo de comunicación con el servidor'
						};
					}
					if (angular.isDefined(rejection.config.timeout)){
						if (rejection.config.timeout.$$state.value == 'canceled'){
							rejection.status = -5;
						}
					}
					return $q.reject(rejection);
				}
			};
		}]);

	$httpProvider.interceptors.push('myHttpInterceptor');

}]);

myapp.config(['$stateProvider', '$urlRouterProvider', '$provide', 'cacheServiceProvider', function ($stateProvider, $urlRouterProvider, $provide, cacheServiceProvider) {

	const initialLoadFactory = cacheServiceProvider.$get();

	$provide.decorator("$exceptionHandler", ['$delegate', '$injector', function($delegate, $injector){
		return function(exception, cause){
			var $rootScope = $injector.get("$rootScope");
			$rootScope.addError({message:"Exception", reason:exception});
			$delegate(exception, cause);
		};
	}]);

	// For any unmatched url, send to /login
	//$urlRouterProvider.otherwise("/login");
	$urlRouterProvider.otherwise( function($injector, $location) {
		var $state = $injector.get("$state");
		$state.go("login");
	});

	//noinspection JSValidateTypes
	$stateProvider
		.state('login', {
			url: "/login",
			templateUrl: "view/login.html",
			controller: "loginCtrl"
		})
		.state('register', {
			url: "/registro",
			templateUrl: "view/newUser.html",
			controller: "registerCtrl"
		})
		.state('tarifario', {
			url: "/pricelist",
			templateUrl: "view/pricelist.html",
			controller: "pricelistCtrl",
			resolve: {
				unitTypes: function(){
					return initialLoadFactory.cargaUnidades()
				}
			}
		})
		.state('invoices', {
			url: "/invoices",
			templateUrl: "view/invoices.html",
			controller: "invoicesCtrl",
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				//buques: initialLoadFactory.cargaBuques,
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ return initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			}
		})
		.state('matches', {
			url: "/match",
			templateUrl: "view/pricelistEdit.html",
			controller: 'matchPricesCtrl',
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() }
			}
		})
		.state('control', {
			url: "/control",
			templateUrl: "view/control.html",
			controller: "controlCtrl",
			resolve: {
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			}
		})
		.state('cfacturas', {
			url: "/controlComprobantes",
			templateUrl: "view/controlComprobantes.html",
			controller: 'controlComprobantesCtrl',
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				//buques: initialLoadFactory.cargaBuques,
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ return initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			},
			redirectTo: 'cfacturas.correlatividad'
		})
			.state('cfacturas.tasas', {
				url: '/tasas',
				templateUrl: 'view/control.tasas.html',
				controller: 'tasaCargasCtrl'
			})
			.state('cfacturas.correlatividad', {
				url: '/correlatividad',
				templateUrl: 'view/control.correlatividad.html',
				controller: 'correlatividadCtrl'
			})
			.state('cfacturas.codigos', {
				url: '/codigos',
				templateUrl: 'view/control.codigos.html',
				controller: 'codigosCtrl'
			})
			.state('cfacturas.revisar', {
				url: '/revisar',
				templateUrl: 'view/control.revisar.html'
			})
			.state('cfacturas.erroneos', {
				url: '/erroneos',
				templateUrl: 'view/control.erroneos.html'
			})
			.state('cfacturas.reenviar', {
				url: '/reenviar',
				templateUrl: 'view/control.reenviar.html'
			})
		.state('gates', {
			url: "/gates",
			templateUrl: "view/gates.html",
			controller: "gatesCtrl",
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				//buques: initialLoadFactory.cargaBuques,
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			}
		})
		.state('cgates', {
			url: '/controlGates',
			templateUrl: 'view/gates.control.html',
			controller: 'controlGatesCtrl',
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				//buques: initialLoadFactory.cargaBuques,
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ return initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			},
			redirectTo: 'cgates.gates'
		})
			.state('cgates.gates', {
				url: '/gatesFaltantes',
				templateUrl: 'view/comprobantesSinGates.html'
			})
			.state('cgates.invoices', {
				url: '/comprobantesFaltantes',
				templateUrl: 'view/gatesSinFacturacion.html'
			})
			.state('cgates.appointments', {
				url: '/turnosFaltantes',
				templateUrl: 'view/gatesSinTurnos.html'
			})
		.state('gates.invoices', {
			url: "/contenedor=:contenedor",
			templateUrl: "view/gates.invoices.html"
		})
		.state('turnos', {
			url: "/turnos",
			templateUrl: "view/turnos.html",
			controller: "turnosCtrl",
			resolve: {
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				estados: function(){ return initialLoadFactory.cargaEstados() }
			}
		})
		.state('changepass', {
			url: "/cambiarpass",
			templateUrl: "view/newpass.html",
			controller: "changePassCtrl",
			resolve: {
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() }
			}
		})
		.state('container',{
			url: "/contenedor?container",
			params: {
				container: null
			},
			templateUrl: "view/container.html",
			controller: "buqueViajeCtrl",
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				//buques: initialLoadFactory.cargaBuques,
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ return initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			}
		})
		.state('buque',{
			url: "/buqueViaje",
			templateUrl: "view/buque.viaje.html",
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				buques: function(){ return initialLoadFactory.cargaBuqueViajes() },
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ return initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			}
		})
		.state('forbidden', {
			url: "/forbidden",
			templateUrl: "view/forbidden.html"
		})
		.state('reports', {
			url: "/reportes",
			templateUrl:"view/reportes.html",
			controller: 'reportsCtrl',
			redirectTo: 'reports.tasas'
		})
			.state('reports.tasas', {
				url:'/tasas',
				templateUrl: 'view/reportes.tasas.html',
				controller: 'ratesCtrl',
				resolve: {
					unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
					descripciones: function(){ return initialLoadFactory.cargaDescripciones() },
					ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
					allRates: function(){ return initialLoadFactory.cargaAllRates() },
					estados: function(){ return initialLoadFactory.cargaEstados() }
				}
			})
			.state('reports.tarifas', {
				url: '/tarifas',
				templateUrl: 'view/reportes.tarifas.html',
				controller: 'reporteTarifasCtrl',
				resolve: {
					ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() }
				}
			})
			.state('reports.empresas', {
				url: '/empresas',
				templateUrl: 'view/reportes.empresas.html',
				controller: 'facturacionPorEmpresaCtrl',
				resolve: {
					clientes: function(){ return initialLoadFactory.cargaClientes() },
					descripciones: function(){ return initialLoadFactory.cargaDescripciones() },
					ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
					estados: function(){ return initialLoadFactory.cargaEstados() }
				}
			})
			.state('reports.terminales', {
				url: '/terminales',
				templateUrl: 'view/reportes.terminales.html',
				controller: 'tarifasTerminalesCtrl',
				resolve: {
					descripciones: function(){ return initialLoadFactory.cargaDescripciones() },
					ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() }
				}
			})
		.state('afip', {
			url: "/afip",
			templateUrl: "view/afip.html",
			controller: "afipCtrl",
			resolve: {
				sumImpoBuques: function(){ return initialLoadFactory.cargaSumariaImpoBuques() },
				sumExpoBuques: function(){ return initialLoadFactory.cargaSumariaExpoBuques() },
				solicitudBuques: function(){ return initialLoadFactory.cargaSolicitudBuques() },
				afectacionBuques: function(){ return initialLoadFactory.cargaAfectacionBuques() }
			}
		})
		.state('afip.afectacion.afectacion1', {
			templateUrl: "view/afip.afectacion1.html"
		})
		.state('afip.afectacion.afectacion2', {
			templateUrl: "view/afip.afectacion2.html"
		})
		.state('afip.detalle.detimpo1', {
			templateUrl: "view/afip.detimpo1.html"
		})
		.state('afip.detalle.detimpo2', {
			templateUrl: "view/afip.detimpo2.html"
		})
		.state('afip.detalle.detimpo3', {
			templateUrl: "view/afip.detimpo3.html"
		})
		.state('afip.detalle.detexpo1', {
			templateUrl: "view/afip.detexpo1.html"
		})
		.state('afip.detalle.detexpo2', {
			templateUrl: "view/afip.detexpo2.html"
		})
		.state('afip.detalle.detexpo3', {
			templateUrl: "view/afip.detexpo3.html"
		})
		.state('afip.sumatorias.expo1', {
			templateUrl: "view/afip.expo1.html"
		})
		.state('afip.sumatorias.expo2', {
			templateUrl: "view/afip.expo2.html"
		})
		.state('afip.sumatorias.expo3', {
			templateUrl: "view/afip.expo3.html"
		})
		.state('afip.sumatorias.expo4', {
			templateUrl: "view/afip.expo4.html"
		})
		.state('afip.sumatorias.expo5', {
			templateUrl: "view/afip.expo5.html"
		})
		.state('afip.sumatorias.impo1', {
			templateUrl: "view/afip.impo1.html"
		})
		.state('afip.sumatorias.impo2', {
			templateUrl: "view/afip.impo2.html"
		})
		.state('afip.sumatorias.impo3', {
			templateUrl: "view/afip.impo3.html"
		})
		.state('afip.sumatorias.impo4', {
			templateUrl: "view/afip.impo4.html"
		})
		.state('afip.solicitud.solicitud1', {
			templateUrl: "view/afip.solicitud1.html"
		})
		.state('afip.solicitud.solicitud2', {
			templateUrl: "view/afip.solicitud2.html"
		})
		.state('afip.solicitud.solicitud3', {
			templateUrl: "view/afip.solicitud3.html"
		})
		.state('afip.removido.removido1', {
			templateUrl: "view/afip.removido1.html"
		})
		.state('afip.removido.removido2', {
			templateUrl: "view/afip.removido2.html"
		})
		.state('afip.removido.removido3', {
			templateUrl: "view/afip.removido3.html"
		})
		.state('afip.afectacion', {
			templateUrl: "view/afip.afectacion.html"
		})
		.state('afip.detalle', {
			templateUrl: "view/afip.detalle.html"
		})
		.state('afip.solicitud', {
			templateUrl: "view/afip.solicitud.html"
		})
		.state('afip.sumatorias', {
			templateUrl: "view/afip.sumatorias.html"
		})
		.state('afip.removido', {
			templateUrl: "view/afip.removido.html"
		})
		.state('afip.transbordos', {
			templateUrl: "view/afip.transbordos.html"
		})
		.state('afip.transbordos.impo', {
			templateUrl: "view/table.transbordos.html"
		})
		.state('afip.transbordos.expo', {
			templateUrl: "view/table.transbordos.html"
		})
		.state('users', {
			url: "/users",
			templateUrl: "view/users.html",
			controller: "usersCtrl"
		})
		.state('access', {
			url: "/controlAcceso",
			templateUrl: 'view/controlAcceso.html',
			controller: "accessControlCtrl"
		})
		.state('cturnos', {
			url: "/colaTurnos",
			templateUrl: 'view/turnosEncolados.html',
			controller: "queuedMailsCtrl",
			resolve: {
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() }
			}
		})
		.state('validar', {
			url: "/validarUsuario",
			templateUrl: "view/validarUsuario.html",
			controller: "validarUsuarioCtrl" //TODO tal vez necesite ratesMatches, revisarlo...
		})
		.state('liquidaciones', {
			url: "/liquidaciones",
			templateUrl: "view/liquidaciones.html",
			controller: "liquidacionesCtrl",
			resolve: {
				unitTypes: function(){ return initialLoadFactory.cargaUnidades() },
				//buques: initialLoadFactory.cargaBuques,
				//trenes: initialLoadFactory.cargaTrenes,
				//clientes: initialLoadFactory.cargaClientes,
				vouchers: function(){ return initialLoadFactory.cargaVouchers() },
				estados: function(){ return initialLoadFactory.cargaEstados() },
				matches: function(){ return initialLoadFactory.cargaMatchesArray() },
				ratesMatches: function(){ return initialLoadFactory.cargaMatchesRates() },
				descripciones: function(){ return initialLoadFactory.cargaDescripciones() }
			}
		})
		.state('modificarTarifario', {
			parent: 'matches',
			url: "/editarTarifario",
			templateUrl: "view/editPricelist.new.html"

		})
		//TODO controlar lo que devuelve el servidor
		.state('mturnos', {
			url: "/controlTurnos",
			templateUrl: "view/appointments.control.html"
		})
		.state('trackContainer', {
			url: "/trackContainer",
			templateUrl: "view/trackContainer.html",
			controller: 'trackContainerCtrl'
		})
		//TODO Esta vista no se está usando en realidad, no está la parte del servidor
		.state('mat', {
			url: "/mat",
			templateUrl: "view/mat.html"
		})
}]);

myapp.config(['$cookiesProvider', function($cookiesProvider){
	var hoy = new Date();

	$cookiesProvider.defaults.expires = new Date(hoy.getFullYear(), hoy.getMonth()+1, hoy.getDate());
}]);

myapp.run(['$rootScope', '$state', 'loginService', 'authFactory', 'dialogs', '$injector', '$cookies', 'appSocket', '$http', 'generalFunctions',
	function($rootScope, $state, loginService, authFactory, dialogs, $injector, $cookies, appSocket, $http, generalFunctions){ //El app socket está simplemente para que inicie la conexión al iniciar la aplicación

		$rootScope.pageTitle = 'Administración General de Puertos S.E.';
		$rootScope.socket = appSocket;

		$rootScope.socket.connect();

		$rootScope.appointmentNotify = 0;
		$rootScope.gateNotify = 0;
		$rootScope.invoiceNotify = 0;

		$rootScope.verNotificaciones = true;

		$rootScope.loadingNewView = false;

		$rootScope.dataTerminal = loginService;

		$rootScope.ordenarPor = function(filtro){
			if ($rootScope.predicate == filtro){
				$rootScope.reverse = !$rootScope.reverse;
			}
			$rootScope.predicate = filtro;
		};

		$rootScope.cambioMoneda = true;
		$rootScope.cambioTerminal = true;

		/*$rootScope.setEstiloTerminal = function(terminal){
		 if ($rootScope.dataTerminal.getFiltro() != terminal){
		 $cookies.put('themeTerminal', terminal);
		 loginService.setFiltro(terminal);
		 }
		 };*/

		if (loginService.getStatus()) loginService.setHeaders();

		$rootScope.mensajeResultado = {
			titulo: 'Comprobantes',
			mensaje: 'No se encontraron comprobantes para los filtros seleccionados.',
			tipo: 'panel-info'
		};

		$rootScope.addError = function(error){
			$rootScope.mensajeResultado = {
				titulo: 'Error',
				mensaje: 'Se ha producido un error inesperado. Intente recargar la página. Si el error persiste, comuníquese con A.G.P. S.E. ',
				tipo: 'panel-danger',
				error: error
			};
			$rootScope.$broadcast('errorInesperado', $rootScope.mensajeResultado);
		};

		$rootScope.moneda = "DOL";

		$rootScope.rutasComunes = ['login', 'forbidden', 'changepass', 'register'];
		$rootScope.rutasSinMoneda = ['reports', 'afip', 'tarifario', 'matches', 'turnos', 'users', 'agenda', 'access', 'control', 'cturnos', 'mat', 'liquidaciones', 'trackContainer'];
		$rootScope.rutasSinTerminal = ['control', 'afip', 'mat', 'access', 'users', 'cturnos', 'trackContainer'];
		$rootScope.$state = $state;
		// Variables Globales de Paginacion
		$rootScope.itemsPerPage = 15;
		$rootScope.currentPage = 1;
		$rootScope.page = { skip:0, limit: $rootScope.itemsPerPage };

		$rootScope.salir = function(){
			if (loginService.getStatus()) $rootScope.socket.emit('logoff', loginService.getInfo().user);
			authFactory.logout();
			$rootScope.appointmentNotify = 0;
			$rootScope.invoiceNotify = 0;
			$rootScope.gateNotify = 0;
			$rootScope.$broadcast('logout');
			$state.transitionTo('login');
			//$rootScope.setEstiloTerminal('BACTSSA');
		};


		$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from) {
			$rootScope.inTrackContainer = to.name == 'trackContainer';
			loginService.setFiltro($cookies.get('themeTerminal'));
			$rootScope.loadingNewView = false;
		});

		$rootScope.$on('$stateChangeStart', function(event, toState){
			if (toState.redirectTo){
				event.preventDefault();
				$state.transitionTo(toState.redirectTo);
			}

			$rootScope.loadingNewView = true;
			if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion < 10){
				dialogs.error('Error de navegador', 'La aplicación no es compatible con su versión de navegador. Los navegadores compatibles son Mozilla Firefox, Google Chrome y las versiones de IE mayores a 8.');
			}
			if (!loginService.getStatus() && $cookies.get('restoreSesion') === 'true'){
				event.preventDefault();
				authFactory.login().then(function(data){
					$rootScope.socket.emit('login', data.user);
					$rootScope.$broadcast('terminoLogin');
					if (toState.name == 'login') {
						$state.transitionTo('tarifario');
					} else {
						$state.transitionTo(toState.name);
					}
				}, function(err){
					//console.log(err);
					dialogs.error('Error', err.message);
					$rootScope.salir();
				});
			} else {
				$rootScope.verificaRutas(event, toState);
			}
		});

		$rootScope.verificaRutas = function(event, toState){
			$rootScope.cambioMoneda = !(generalFunctions.in_array(toState.name, $rootScope.rutasSinMoneda) || toState.name.indexOf('afip') != -1);
			$rootScope.cambioTerminal = !(generalFunctions.in_array(toState.name, $rootScope.rutasSinTerminal) || toState.name.indexOf('afip') != -1);
			if (!generalFunctions.in_array(toState.name, $rootScope.rutasComunes)){
				if (loginService.getStatus()){
					if ($cookies.get('isLogged') === 'true'){
						if(!generalFunctions.in_array(toState.name, loginService.getAcceso())){
							$rootScope.usuarioNoAutorizado(event);
						}
					} else {
						event.preventDefault();
						$rootScope.salir();
					}
				} else {
					$rootScope.usuarioNoAutorizado(event);
				}
			}
		};

		$rootScope.usuarioNoAutorizado = function(event){
			event.preventDefault();
			$state.transitionTo('forbidden');
		};

	}]);
