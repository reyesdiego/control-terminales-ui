/**
 * Created by artiom on 12/03/15.
 */
myapp.controller('missingInfo', ['$rootScope', '$scope', 'gatesFactory', 'invoiceFactory', '$modal', 'loginService', 'dialogs', 'generalFunctions', 'generalCache', function($rootScope, $scope, gatesFactory, invoiceFactory, $modal, loginService, dialogs, generalFunctions, generalCache){
	$scope.currentPage = 1;

	$scope.itemsPerPage = [
		{ value: 10, description: '10 items por página', ticked: false},
		{ value: 15, description: '15 items por página', ticked: true},
		{ value: 20, description: '20 items por página', ticked: false},
		{ value: 50, description: '50 items por página', ticked: false}
	];

	$scope.filteredDatos = [];

	$scope.datosFaltantes = [];
	$scope.cargando = false;

	//Variables para control de fechas
	$scope.maxDateD = new Date();
	$scope.maxDateH = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
	$scope.comprobantesVistos = [];
	$scope.itemsDescription = generalCache.get('descripciones');
	$scope.estadosComprobantes = generalCache.get('estados');
	$scope.itemDescriptionInvoices = generalCache.get('descripciones');
	$scope.acceso = $rootScope.esUsuario;

	$scope.$on('errorInesperado', function(e, mensaje){
		$scope.cargando = false;
		$scope.datosFaltantes = [];
		$scope.configPanel = mensaje;
	});

	$rootScope.$watch('moneda', function(){
		$scope.moneda = $rootScope.moneda;
	});

	$scope.colorHorario = function (gate) {
		return generalFunctions.colorHorario(gate);
	};

	$scope.existeDescripcion = function(itemId){
		return angular.isDefined($scope.itemsDescription[itemId]);
	};

	$scope.openDate = function(event){
		generalFunctions.openDate(event);
	};

	$scope.cambioItemsPorPagina = function(data){
		$scope.filtrado('itemsPerPage', data.value);
	};

	$scope.trackInvoice = function(comprobante){
		var estado;
		estado = comprobante.interfazEstado;
		invoiceFactory.getTrackInvoice(comprobante._id, function(dataTrack){
			if (dataTrack.status == 'OK'){
				var modalInstance = $modal.open({
					templateUrl: 'view/trackingInvoice.html',
					controller: 'trackingInvoiceCtrl',
					backdrop: 'static',
					resolve: {
						estado: function () {
							return estado;
						},
						track: function() {
							return dataTrack;
						},
						states : function() {
							return angular.copy($scope.estadosComprobantes);
						}
					}
				});

				dataTrack = [];
				modalInstance.result.then(function (dataComment) {
					invoiceFactory.cambiarEstado(comprobante._id, dataComment.newState._id, function(){
						$scope.recargarResultado = true;
						var logInvoice = {
							title: dataComment.title,
							state: dataComment.newState._id,
							comment: dataComment.comment,
							invoice: comprobante._id
						};
						invoiceFactory.commentInvoice(logInvoice, function(dataRes){
							if (dataRes.status == 'OK'){
								comprobante.interfazEstado = dataComment.newState;
								switch (dataComment.newState.type){
									case 'WARN':
										comprobante.interfazEstado.btnEstado = 'text-warning';
										break;
									case 'OK':
										comprobante.interfazEstado.btnEstado = 'text-success';
										break;
									case 'ERROR':
										comprobante.interfazEstado.btnEstado = 'text-danger';
										break;
									case 'UNKNOWN':
										comprobante.interfazEstado.btnEstado = 'text-info';
										break;
								}
								var nuevoEstado = {
									_id: comprobante._id,
									estado: dataComment.newState,
									grupo: loginService.getGroup(),
									user: loginService.getInfo().user
								};
								comprobante.estado.push(nuevoEstado);
							}
						});
					});
				});
			} else {
				dialogs.error('Comprobantes', 'Se ha producido un error al cargar los comentarios del comprobante');
			}

		});
	};

	$scope.configPanel = {
		tipo: 'panel-success',
		titulo: 'Control gates',
		mensaje: 'No se encontraron comprobantes con gates faltantes para los filtros seleccionados.'
	};

	$scope.model = {
		fechaInicio: new Date(),
		fechaFin: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
		itemsPerPage: 15
	};

	$scope.ocultarFiltros = ['nroPtoVenta', 'nroComprobante', 'codTipoComprob', 'nroPtoVenta', 'documentoCliente', 'contenedor', 'codigo', 'razonSocial', 'estado', 'buque', 'viaje', 'btnBuscar'];

	$scope.filtrado = function(filtro, contenido){
		$scope.model[filtro] = contenido;
		if ($scope.model.fechaInicio > $scope.model.fechaFin && $scope.model.fechaFin != ''){
			$scope.model.fechaFin = new Date($scope.model.fechaInicio);
			$scope.model.fechaFin.setDate($scope.model.fechaFin.getDate() + 1);
		}
	};

	$scope.cargaDatos = function(){

		switch ($scope.datoFaltante){
			case 'gates':
				$scope.cargando = true;
				gatesFactory.getMissingGates(function(data){
					if (data.status == 'OK'){
						$scope.datosFaltantes = data.data;
						$scope.totalItems = $scope.datosFaltantes.length;
						$scope.datosFaltantes.forEach(function(comprob){
							if (angular.isDefined($scope.itemDescriptionInvoices[comprob.code])) {
								comprob.code = comprob.code + ' - ' + $scope.itemDescriptionInvoices[comprob.code];
							} else {
								comprob.code = comprob.code +  ' - No se halló la descripción, verifique que el código esté asociado.';
							}
						});
						$scope.cargando = false;
					} else {
						$scope.configPanel = {
							tipo: 'panel-success',
							titulo: 'Control gates',
							mensaje: 'Se ha producido un error al cargar los gates faltantes.'
						};
					}
				});
				break;
			case 'invoices':
				$scope.cargando = true;
				gatesFactory.getMissingInvoices(function(data){
					if (data.status == 'OK'){
						$scope.datosFaltantes = data.data;
						$scope.totalItems = $scope.datosFaltantes.length;
						$scope.cargando = false;
						$scope.datosFaltantes.forEach(function(registro){
							registro.fecha = registro.gateTimestamp;
						})
					} else {
						$scope.configPanel = {
							tipo: 'panel-success',
							titulo: 'Control gates',
							mensaje: 'Se ha producido un error al cargar los comprobantes faltantes.'
						};
					}
				});
				break;
		}
	};

	$scope.mostrarDetalle = function(comprobante){
		$scope.cargando = true;
		invoiceFactory.invoiceById(comprobante._id, function(dataComprob){
			$scope.verDetalle = dataComprob;
			$scope.mostrarResultado = true;
			$scope.cargando = false;

		});
	};

	$scope.ocultarResultado = function(comprobante){
		var encontrado = false;
		$scope.comprobantesVistos.forEach(function(unComprobante){
			if (unComprobante._id == comprobante._id){
				encontrado = true;
			}
		});
		if (!encontrado){
			$scope.comprobantesVistos.push(comprobante);
		}
		if ($scope.recargarResultado){
			$scope.comprobantesVistos.forEach(function(visto){
				if (visto._id == comprobante._id){
					visto.interfazEstado = comprobante.interfazEstado;
					visto.estado = comprobante.estado;
				}
			});
		}
		$scope.mostrarResultado = false;
	};

	$scope.cargaDatos();
}]);