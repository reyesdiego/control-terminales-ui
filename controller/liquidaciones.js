/**
 * Created by artiom on 13/07/15.
 */
myapp.controller('liquidacionesCtrl', ['$rootScope', '$scope', 'liquidacionesFactory', 'loginService', 'invoiceFactory', '$filter', 'dialogs', '$modal', 'generalCache', 'downloadFactory', function($rootScope, $scope, liquidacionesFactory, loginService, invoiceFactory, $filter, dialogs, $modal, generalCache, downloadFactory){

	$scope.itemsDescription = generalCache.get('descripciones');
	$scope.estadosComprobantes = generalCache.get('estados');
	$scope.itemDescriptionInvoices = generalCache.get('descripciones');

	$scope.ocultarFiltros = ['nroPtoVenta', 'nroComprobante', 'codTipoComprob', 'nroPtoVenta', 'documentoCliente', 'contenedor', 'codigo', 'razonSocial', 'estado', 'buque', 'viaje', 'btnBuscar'];

	$scope.panelMensajeSinLiquidar = {
		titulo: 'Liquidaciones',
		mensaje: 'No se encontraron comprobantes pendientes a liquidar para los filtros seleccionados.',
		tipo: 'panel-info'
	};

	$scope.panelMensajeLiquidaciones = {
		titulo: 'Liquidaciones',
		mensaje: 'No se encontraron liquidaciones realizadas para los filtros seleccionados.',
		tipo: 'panel-info'
	};

	$scope.model = {
		'fechaInicio': $scope.fechaInicio,
		'fechaFin': $scope.fechaFin,
		'liquidacion': '',
		'itemsPerPage': 15
	};

	$scope.ocultarLiquidacion = true;

	$scope.cargando = false;

	$scope.modo = 'sinLiquidar';

	$scope.datosInvoices = [];

	$scope.itemsPerPage = 15;
	$scope.totalSinLiquidar = 0;
	$scope.totalLiquidadas = 0;

	$scope.currentPageSinLiquidar = 1;
	$scope.currentPageLiquidadas = 1;

	$scope.page = {
		skip: 0,
		limit: $scope.itemsPerPage
	};

	$scope.liquidadas = false;
	$scope.panelMensaje = $scope.panelMensajeSinLiquidar;

	$scope.comprobantesVistos = [];
	$scope.mostrarResultado = false;

	$scope.$on('cambioPagina', function(ev, data){
		$scope.page.skip = (data - 1) * $scope.itemsPerPage;
		$scope.cargarDatos();
	});

	$scope.$on('cambioFiltro', function(ev, data){
		console.log(data);
		console.log($scope.model);
		$scope.cargarDatos();
	});

	$scope.cambiarModo = function(modo){
		$scope.modo = modo;
		$scope.cargarDatos();
	};

	$scope.cargarSinLiquidar = function(){
		$scope.cargando = true;
		liquidacionesFactory.getComprobantesLiquidar($scope.page, $scope.model, function(data){
			if (data.status == 'OK'){
				$scope.datosInvoices = data.data;
				$scope.totalSinLiquidar = data.totalCount;
			} else {
				$scope.sinLiquidar = [];
			}
			$scope.cargando = false;
		})
	};

	$scope.cargarLiquidaciones = function(){

	};

	$scope.cargarDatos = function(){
		if ($scope.modo == 'sinLiquidar'){
			$scope.liquidadas = false;
			$scope.datosInvoices = $scope.sinLiquidar;
			$scope.cargarSinLiquidar();
		} else {
			$scope.liquidadas = true;
			$scope.datosInvoices = $scope.liquidaciones;
			$scope.cargarLiquidaciones();
		}
	};

	$scope.mostrarDetalle = function(comprobante){
		$scope.cargando = true;
		invoiceFactory.getInvoiceById(comprobante._id._id, function(dataComprob){
			console.log(dataComprob);
			$scope.verDetalle = dataComprob;
			$scope.mostrarResultado = true;
			$scope.cargando = false;

		});
	};

	$scope.existeDescripcion = function(itemId){
		return angular.isDefined($scope.itemsDescription[itemId]);
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
					invoiceFactory.putCambiarEstado(comprobante._id, dataComment.newState._id, function(){
						$scope.recargarResultado = true;
						var logInvoice = {
							title: dataComment.title,
							state: dataComment.newState._id,
							comment: dataComment.comment,
							invoice: comprobante._id
						};
						invoiceFactory.postCommentInvoice(logInvoice, function(dataRes){
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

	$scope.ocultarResultado = function(comprobante){
		console.log(comprobante);
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

	$scope.verPdf = function(){
		$scope.disablePdf = true;
		var imprimirComprobante = {};
		angular.copy($scope.verDetalle, imprimirComprobante);
		imprimirComprobante.codTipoComprob = $filter('nombreComprobante')(imprimirComprobante.codTipoComprob);
		imprimirComprobante.fecha.emision = $filter('date')(imprimirComprobante.fecha.emision, 'dd/MM/yyyy', 'UTC');
		imprimirComprobante.fecha.vcto = $filter('date')(imprimirComprobante.fecha.vcto, 'dd/MM/yyyy', 'UTC');
		imprimirComprobante.fecha.desde = $filter('date')(imprimirComprobante.fecha.desde, 'dd/MM/yyyy', 'UTC');
		imprimirComprobante.fecha.hasta = $filter('date')(imprimirComprobante.fecha.hasta, 'dd/MM/yyyy', 'UTC');
		imprimirComprobante.detalle.forEach(function(detalle){
			detalle.buque.fecha = $filter('date')(detalle.buque.fecha, 'dd/MM/yyyy', 'UTC');
		});
		downloadFactory.invoicePDF(imprimirComprobante, function(data, status){
			if (status == 'OK'){
				var file = new Blob([data], {type: 'application/pdf'});
				var fileURL = URL.createObjectURL(file);
				window.open(fileURL);
			} else {
				dialogs.error('Comprobantes', 'Se ha producido un error al procesar el comprobante');
			}
			$scope.disablePdf = false;
		})
	};

	if (loginService.getStatus()) $scope.cargarDatos();

	$scope.$on('terminoLogin', function(){
		$scope.cargarDatos();
	});

}]);