/**
 * Created by artiom on 08/04/15.
 */

myapp.controller('buqueViajeCtrl', ['$rootScope', '$scope', 'invoiceFactory', 'controlPanelFactory', 'gatesFactory', 'turnosFactory', 'afipFactory', 'dialogs', 'generalCache', '$state', 'loginService', '$q', 'invoiceManager',
	function($rootScope, $scope, invoiceFactory, controlPanelFactory, gatesFactory, turnosFactory, afipFactory, dialogs, generalCache, $state, loginService, $q, invoiceManager){
		////// Para containers /////////////
		$scope.model = {
			'nroPtoVenta': '',
			'codTipoComprob': 0,
			'nroComprobante': '',
			'razonSocial': '',
			'documentoCliente': '',
			'fechaInicio': '',
			'fechaFin': '',
			'contenedor': '',
			'buqueNombre': '',
			'viaje': '',
			'estado': 'N',
			'code': '',
			'filtroOrden': 'gateTimestamp',
			'filtroOrdenAnterior': '',
			'filtroOrdenReverse': false,
			'order': '',
			'itemsPerPage': 15,
			'carga': '',
			'ontime': ''
		};
		//////////////////////////////////////

		$scope.pageComprobantes = {
			skip: 0,
			limit: $scope.model.itemsPerPage
		};

		$scope.loadingState = false;
		$scope.invoices = [];
		$scope.loadingInvoices = false;
		$scope.gates = [];
		$scope.loadingGates = false;
		$scope.turnos = [];
		$scope.loadingTurnos = false;
		$scope.tasas = [];
		$scope.loadingTasas = false;
		$scope.detalleGates = false;
		$scope.volverAPrincipal = false;
		$scope.ocultarFiltros = ['nroPtoVenta', 'codTipoComprob', 'nroComprobante', 'razonSocial', 'documentoCliente', 'codigo', 'estado', 'itemsPerPage', 'fechaInicio', 'fechaFin', 'buque', 'carga', 'ontime', 'rates'];
		$scope.filtrosComprobantes = ['codTipoComprob', 'nroComprobante', 'razonSocial', 'fechaInicio', 'nroPtoVentaOrden', 'codTipoComprobOrden', 'nroComprobOrden', 'razonOrden', 'fechaOrden', 'importeOrden', 'codigo', 'contenedor', 'comprobantes', 'buque', 'rates'];
		$scope.mensajeResultado = $rootScope.mensajeResultado;
		$scope.configPanelTasas = {
			tipo: 'panel-info',
			titulo: 'Tasas a las cargas',
			mensaje: 'No se encontraron tasas a las cargas para los filtros seleccionados.'
		};
		$scope.configPanelGates = {
			tipo: 'panel-info',
			titulo: 'Gates',
			mensaje: 'No se encontraron gates para los filtros seleccionados.'
		};
		$scope.configPanelTurnos = {
			tipo: 'panel-info',
			titulo: 'Turnos',
			mensaje: 'No se encontraron turnos para los filtros seleccionados.'
		};
		$scope.detalle = false;
		$scope.contenedorElegido = {
			contenedor: ''
		};
		$scope.currentPageContainers = 1;
		$scope.itemsPerPage = 10;
		$scope.totalItems = 0;
		$scope.panelMensaje = {
			titulo: 'Buque - Viaje',
			mensaje: 'Seleccione un buque para realizar la búsqueda.',
			tipo: 'panel-info'
		};
		$scope.totalSinRates = 0;
		$scope.panelContainerNoRates = {
			tipo: 'panel-info',
			titulo: 'Contenedores sin Tasa a las Cargas',
			mensaje: 'Seleccione un buque para realizar la búsqueda'
		};
		$scope.sumariaConfigPanel = {
			tipo: 'panel-info',
			titulo: 'A.F.I.P. sumaria',
			mensaje: 'No se encontraron datos de sumarias de A.F.I.P relacionados.'
		};

		$scope.buques = generalCache.get('buques' + loginService.getFiltro());
		$scope.buqueElegido = {
			viajes:[]
		};
		$scope.datosContainers = [];
		$scope.loadingState = false;
		$scope.cargandoSumaria = false;
		$scope.moneda = $rootScope.moneda;
		$scope.search = '';
		$scope.filtrarDesde = 0;
		$scope.mostrarAnterior = false;

		$scope.totalSinRates = 0;
		$scope.containersSinRates = [];
		$scope.hayError = false;

		$scope.mostrarMenosViajes = function(){
			$scope.filtrarDesde -= 5;
			if ($scope.filtrarDesde == 0){
				$scope.mostrarAnterior = false;
			}
		};

		$scope.mostrarMasViajes = function(){
			$scope.filtrarDesde += 5;
			$scope.mostrarAnterior = true;
		};

		$scope.$on('cambioPagina', function(event, data){
			$scope.currentPage = data;
			cargaComprobantes();
		});

		////// Para containers ////////////////////////////////////////////////////////////////////////////////
		$scope.$on('detalleContenedor', function(event, container){
			$scope.model.contenedor = container;
			$scope.contenedorElegido.contenedor = container;
			$scope.volverAPrincipal = !$scope.volverAPrincipal;
			$scope.filtrar();
		});

		$scope.$on('iniciarBusqueda', function(){
			$scope.volverAPrincipal = !$scope.volverAPrincipal;
			if ($scope.model.contenedor != ''){
				$scope.filtrar();
			} else {
				$scope.invoices = [];
				$scope.tasas = [];
				$scope.gates = [];
				$scope.turnos = [];
				$scope.sumariaConfigPanel = {
					tipo: 'panel-info',
					titulo: 'A.F.I.P. sumaria',
					mensaje: 'No se encontraron datos en los registros de A.F.I.P. para el contenedor seleccionado.'
				};
				$scope.configPanelTurnos = {
					tipo: 'panel-info',
					titulo: 'Turnos',
					mensaje: 'No se encontraron Turnos para los filtros seleccionados.'
				};
				$scope.configPanelGates = {
					tipo: 'panel-info',
					titulo: 'Gates',
					mensaje: 'No se encontraron gates para los filtros seleccionados.'
				};
				$scope.configPanelTasas = {
					tipo: 'panel-info',
					titulo: 'Tasas',
					mensaje: 'No se encontraron tasas para los filtros seleccionados.'
				};
				$scope.mensajeResultado = {
					titulo: 'Comprobantes',
					mensaje: 'No se encontraron comprobantes para los filtros seleccionados.',
					tipo: 'panel-info'
				};
			}
		});
		///////////////////////////////////////////////////////////////////////////////////////

		$scope.$on('errorInesperado', function(e, mensaje){
			$scope.loadingState = false;
			$scope.panelMensaje = mensaje;
			$scope.totalItems = 0;
			$scope.datosContainers = [];
			//// Para containers /////
			$scope.hayError = true;
			$scope.mensajeGeneral = mensaje;
			///////////////////////////////
		});

		$scope.$on('cambioOrden', function(event, data){
			$scope.cargaComprobantes();
		});

		$scope.buqueSelected = function(selected){
			$scope.buqueElegido.elegido = '';
			selected.elegido = 'bg-info';
			$scope.buqueElegido = selected;
			$scope.buqueElegido.viajes[0][2] = true;
			$scope.model.buqueNombre = selected.buque;
			$scope.model.viaje = selected.viajes[0][0];
			$scope.traerResultados();
		};

		$scope.filtrado = function(filtro, contenido){
			$scope.loadingState = true;
			$scope.currentPageContainers = 1;
			$scope.model.contenedor = '';
			var cargar = true;
			switch (filtro){
				case 'buque':
					if (contenido == '') {
						$scope.model = {
							buqueNombre: '',
							viaje: ''
						};
						$scope.datosContainers = [];
						$scope.buqueElegido = {};
						$scope.loadingState = false;
						cargar = false;
					} else {
						$scope.model.buqueNombre = contenido;
					}
					break;
				case 'viaje':
					$scope.model.viaje = contenido;
					break;
			}
			if (cargar){
				$scope.traerResultados();
			}
		};

		$scope.traerResultados = function(){
			$scope.detalle = false;
			$scope.loadingState = true;
			$scope.loadingTasaCargas = true;
			$scope.datosContainers = [];
			$scope.containersSinRates = [];
			invoiceFactory.getShipContainers($scope.model, function(data){
				if (data.status == 'OK'){
					$scope.datosContainers = data.data;
					$scope.totalItems = $scope.datosContainers.length;
					if ($scope.totalItems == 0){
						$scope.panelMensaje.mensaje = 'No se encontraron contenedores para los filtros seleccionados';
					}
				} else {
					$scope.panelMensaje = {
						titulo: 'Buque - Viaje',
						mensaje: 'Se ha producido un error al cargar los datos.',
						tipo: 'panel-danger'
					};
				}
				$scope.loadingState = false;
			});
			invoiceFactory.getContainersSinTasaCargas($scope.model, function(data){
				if (data.status == "OK"){
					$scope.totalSinRates = data.totalCount;
					if ($scope.totalSinRates == 0){
						$scope.panelContainerNoRates.mensaje = 'No se encontraron contenedores sin tasa a las cargas para los filtros seleccionados';
					}
					data.data.forEach(function(contenedor){
						contenedor = {contenedor: contenedor};
						$scope.containersSinRates.push(contenedor);
					});
				} else {
					$scope.totalSinRates = 0;
					$scope.hayError = true;
					$scope.panelContainerNoRates = {
						titulo: 'Error',
						mensaje: 'Se ha producido un error al cargar los datos.',
						tipo: 'panel-danger'
					};
				}
				$scope.loadingTasaCargas = false;
			});
		};

		$scope.filtrar = function(){
			$scope.hayError = false;
			cargaComprobantes();
			cargaTasasCargas();
			cargaGates();
			cargaTurnos();
			cargaSumaria();
		};

		$scope.verDetalles = function(contenedor){
			$scope.volverAPrincipal = !$scope.volverAPrincipal;
			$scope.invoices = [];
			$scope.gates = [];
			$scope.turnos = [];
			$scope.tasas = [];
			$scope.detalle = true;
			$scope.contenedorElegido = contenedor;
			$scope.model.contenedor = contenedor.contenedor;
			$scope.filtrar();
		};

		var cargaComprobantes = function(){
			$scope.loadingInvoices = true;
			$scope.mensajeResultado = {
				titulo: 'Comprobantes',
				mensaje: 'No se encontraron comprobantes para los filtros seleccionados.',
				tipo: 'panel-info'
			};
			$scope.pageComprobantes.skip = (($scope.currentPage - 1) * $scope.model.itemsPerPage);
			$scope.pageComprobantes.limit = $scope.model.itemsPerPage;
			/*invoiceFactory.getInvoice($scope.$id, $scope.model, $scope.pageComprobantes, function(data){
				if(data.status === 'OK'){
					$scope.invoices = data.data;
					$scope.invoicesTotalItems = data.totalCount;
				} else {
					$scope.mensajeResultado = {
						titulo: 'Comprobantes',
						mensaje: 'Se ha producido un error al cargar los datos de los comprobantes.',
						tipo: 'panel-danger'
					};
				}
				$scope.loadingInvoices = false;
			});*/
			invoiceManager.getInvoices($scope.$id, $scope.model, $scope.pageComprobantes, function(data){
				if(data.status === 'OK'){
					$scope.invoices = data.data;
					$scope.invoicesTotalItems = data.totalCount;
				} else {
					$scope.mensajeResultado = {
						titulo: 'Comprobantes',
						mensaje: 'Se ha producido un error al cargar los datos de los comprobantes.',
						tipo: 'panel-danger'
					};
				}
				$scope.loadingInvoices = false;
			})
		};

		var cargaTasasCargas = function(){
			if (angular.isDefined($scope.model.contenedor) && $scope.model.contenedor != ''){
				$scope.loadingTasas = true;
				$scope.configPanelTasas = {
					tipo: 'panel-info',
					titulo: 'Tasas',
					mensaje: 'No se encontraron tasas para los filtros seleccionados.'
				};
				var datos = { contenedor: $scope.model.contenedor, currency: $scope.moneda, buqueNombre: $scope.model.buqueNombre, viaje: $scope.model.viaje};
				controlPanelFactory.getTasasContenedor(datos, $state.current.name, function(data){
					if (data.status === 'OK'){
						$scope.tasas = data.data;
						$scope.totalTasas = data.totalTasas;
					} else {
						$scope.configPanelTasas = {
							tipo: 'panel-danger',
							titulo: 'Tasas',
							mensaje: 'Se ha producido un error al cargar los datos de las tasas.'
						};
					}
					$scope.loadingTasas = false;
				});
			}
		};

		var cargaGates = function(page){
			$scope.loadingGates = true;
			$scope.configPanelGates = {
				tipo: 'panel-info',
				titulo: 'Gates',
				mensaje: 'No se encontraron gates para los filtros seleccionados.'
			};
			page = page || { skip: 0, limit: $scope.itemsPerPage };
			if (page.skip == 0){ $scope.currentPage = 1}
			gatesFactory.getGate($scope.model, page, function (data) {
				if (data.status === "OK") {
					$scope.gates = data.data;
					$scope.gatesTotalItems = data.totalCount;
					$scope.gatesTiempoConsulta = (data.time / 1000).toFixed(2);
				} else {
					$scope.configPanelGates = {
						tipo: 'panel-danger',
						titulo: 'Gates',
						mensaje: 'Se ha producido un error al cargar los gates.'
					};
				}
				$scope.loadingGates = false;
			});
		};

		var cargaTurnos = function(page){
			$scope.loadingTurnos = true;
			$scope.configPanelTurnos = {
				tipo: 'panel-info',
				titulo: 'Turnos',
				mensaje: 'No se encontraron Turnos para los filtros seleccionados.'
			};
			page = page || { skip:0, limit: $scope.itemsPerPage };
			turnosFactory.getTurnos($scope.model, page, function(data){
				if (data.status === "OK"){
					$scope.turnos = data.data;
					$scope.turnosTotalItems = data.totalCount;
				} else {
					$scope.configPanelTurnos = {
						tipo: 'panel-danger',
						titulo: 'Turnos',
						mensaje: 'Se ha producido un error al cargar los turnos.'
					};
				}
				$scope.loadingTurnos = false;
			});
		};

		var cargaSumariaImpo = function(){
			var deferred = $q.defer();
			afipFactory.getContainerSumaria($scope.model.contenedor, function(data){
				if (data.status == 'OK'){
					deferred.resolve(data.data);
				} else {
					$scope.sumariaConfigPanel = {
						tipo: 'panel-danger',
						titulo: 'A.F.I.P. sumaria',
						mensaje: 'Se ha producido un error al cargar los datos de la sumaria del contenedor.'
					};
					deferred.reject()
				}
			});
			return deferred.promise;
		};

		var cargaSumariaExpo = function(){
			var deferred = $q.defer();
			afipFactory.getContainerSumariaExpo($scope.model.contenedor, function(data){
				if (data.status == 'OK'){
					deferred.resolve(data.data);
				} else {
					$scope.sumariaConfigPanel = {
						tipo: 'panel-danger',
						titulo: 'A.F.I.P. sumaria',
						mensaje: 'Se ha producido un error al cargar los datos de la sumaria del contenedor.'
					};
					deferred.reject()
				}
			});
			return deferred.promise;
		};

		var cargaSumaria = function(){
			$scope.sumariaAfip = [];
			$scope.cargandoSumaria = true;
			$scope.sumariaConfigPanel = {
				tipo: 'panel-info',
				titulo: 'A.F.I.P. sumaria',
				mensaje: 'No se encontraron datos en los registros de A.F.I.P. para el contenedor seleccionado.'
			};
			var llamadas = [];
			llamadas.push(cargaSumariaImpo());
			llamadas.push(cargaSumariaExpo());
			$q.all(llamadas)
				.then(function(result){
					result.forEach(function(resultado){
						resultado.forEach(function(data){
							$scope.sumariaAfip.push(data);
						})
					});
					$scope.cargandoSumaria = false;
				}, function(){
					$scope.cargandoSumaria = false;
				})
		};

		$rootScope.$watch('moneda', function(){
			$scope.moneda = $rootScope.moneda;
			if ($scope.detalle){
				cargaTasasCargas();
			}
		});

		/*$scope.$on('cambioTerminal', function(){
			$scope.volverAPrincipal = !$scope.volverAPrincipal;
			$scope.invoices = [];
			$scope.gates = [];
			$scope.turnos = [];
			$scope.tasas = [];
			$scope.detalle = false;
			$scope.totalItems = 0;
			$scope.datosContainers = [];
			$scope.totalSinRates = 0;
			$scope.containersSinRates = [];
			$scope.buques = generalCache.get('buques' + loginService.getFiltro());
			$scope.buqueElegido = {
				viajes:[]
			};
			if ($scope.model.contenedor != ''){
				$scope.filtrar();
			}
		});*/

		$scope.$on('destroy', function(){
			invoiceFactory.cancelRequest();
			turnosFactory.cancelRequest();
			//Agregar las que falten
		});

	}]);
