/**
 * Created by kolesnikov-a on 21/02/14.
 */

function cfacturasCtrl($scope, $modal, invoiceFactory, priceFactory, vouchersFactory, loginService){
	'use strict';
	// Fecha (dia y hora)
	$scope.hasta = new Date();
	$scope.desde = new Date($scope.hasta.getFullYear(), $scope.hasta.getMonth());
	$scope.maxDateD = new Date();
	$scope.maxDateH = new Date();
	$scope.maxDateH.setDate($scope.maxDateH.getDate() + 1);

	$scope.ocultarFiltros = ['nroComprobante', 'codComprobante', 'documentoCliente', 'codigo', 'fechaDesde', 'fechaHasta', 'estado'];

	$scope.model = {
		'nroPtoVenta': '',
		'codTipoComprob': 0,
		'nroComprobante': '',
		'razonSocial': '',
		'documentoCliente': '',
		'fechaDesde': $scope.desde,
		'fechaHasta': $scope.hasta,
		'contenedor': '',
		'codigo': ''
	};

	vouchersFactory.getVouchersType(function(data){
		$scope.comprobantesTipos = data.data;
	});

	$scope.controlFiltros = 'tasas';

	$scope.dateOptions = {
		'startingDay': 0,
		'showWeeks': false
	};
	$scope.format = 'yyyy-MM-dd';
	$scope.verDetalle = "";
	$scope.tipoComprobante = "0";

	$scope.flagWatchCodigos = false;
	$scope.flagWatchFiltros = false;
	$scope.flagWatchRevisar = false;
	$scope.flagWatchError = false;

	$scope.currentPageTasaCargas = 1;
	$scope.totalItemsTasaCargas = 0;

	$scope.currentPageCodigos = 1;
	$scope.totalItemsCodigos = 0;
	$scope.pageCodigos = {
		skip: 0,
		limit: $scope.itemsPerPage
	};

	$scope.currentPageFiltros = 1;
	$scope.totalItemsFiltros = 0;
	$scope.pageFiltros = {
		skip:0,
		limit: $scope.itemsPerPage
	};

	$scope.currentPageTarifas = 1;
	$scope.totalItemsTarifas = 0;
	$scope.pageTarifas = {
		skip:0,
		limit: $scope.itemsPerPage
	};

	$scope.currentPageRevisar = 1;
	$scope.totalItemsRevisar = 0;
	$scope.pageRevisar = {
		skip:0,
		limit:$scope.itemsPerPage
	};

	$scope.currentPageError = 1;
	$scope.totalItemsError = 0;
	$scope.pageError = {
		skip:0,
		limit:$scope.itemsPerPage
	};

	$scope.pantalla = {
		"tituloCorrelativo":  "Correlatividad",
		"mensajeCorrelativo": "Seleccione punto de venta y tipo de comprobante para realizar la búsqueda",
		"cartelCorrelativo": "panel-info",
		"resultadoCorrelativo": [],
		"tituloCodigos": "Éxito",
		"mensajeCodigos": "No se hallaron códigos sin asociar",
		"cartelCodigos": "panel-success",
		"resultadoCodigos": [],
		"tituloTarifas": "Éxito",
		"mensajeTarifas": "No se hallaron tarifas mal cobradas",
		"cartelTarifas": "panel-success",
		"resultadoTarifas": [],
		"totalFacturas": 0,
		"totalFaltantes": 0,
		"active": 0,
		"mostrarResultado": 0,
		"mostrarResultadoTarifas": 0,
		"comprobantesRotos":[],
		"comprobantesMalCobrados": []
	};

	$scope.tasaCargas = {
		"titulo":"Éxito",
		"cartel": "panel-success",
		"mensaje": "No se hallaron comprobantes sin tasa a las cargas.",
		"resultado": [],
		"mostrarResultado": 0
	};

	$scope.loadingControlCodigos = false;
	$scope.cargandoPaginaComprobantes = true;
	$scope.anteriorCargaCodigos = [];

	$scope.comprobantesVistosTasas = [];
	$scope.comprobantesVistosCodigos = [];
	$scope.comprobantesVistosRevisar = [];
	$scope.comprobantesVistosError = [];

	$scope.comprobantesRevisar = [];
	$scope.comprobantesError = [];

	$scope.loadingTasaCargas = true;
	$scope.loadingCorrelatividad = false;
	$scope.loadingRevisar = false;
	$scope.loadingError = false;

	$scope.filtrarOrden = function(filtro){
		var filtroModo;
		$scope.filtroOrden = filtro;
		if ($scope.filtroOrden == $scope.filtroAnterior){
			$scope.filtroOrdenReverse = !$scope.filtroOrdenReverse;
		} else {
			$scope.filtroOrdenReverse = false;
		}
		if ($scope.filtroOrdenReverse){
			filtroModo = -1;
		} else {
			filtroModo = 1;
		}
		$scope.model.order = '"' + filtro + '":' + filtroModo;
		$scope.filtroAnterior = filtro;
		$scope.filtrar.cargar();
	};

	$scope.hayFiltros = false;
	$scope.terminalSellPoints = [];

	$scope.filtrar = {
		nroPtoVenta : function(filtro){
			$scope.model.nroPtoVenta = filtro;
			$scope.filtrar.cargar();
		},
		codigo : function(filtro){
			if (angular.isDefined(filtro) && filtro != ''){
				if ($scope.controlFiltros == 'codigos'){
					$scope.anteriorCargaCodigos = $scope.pantalla.comprobantesRotos.slice();
				}
				$scope.controlFiltros = 'codigosFiltrados';
				$scope.ocultarFiltros = [];
				$scope.model.codigo = filtro;
				$scope.hayFiltros = true;
				$scope.filtrar.cargar();
			} else{
				$scope.hayFiltros = false;
				$scope.model.codigo = '';
				$scope.controlFiltros = 'codigos';
				$scope.pantalla.comprobantesRotos = $scope.anteriorCargaCodigos;
				$scope.ocultarFiltros = ['nroComprobante', 'nroPtoVenta', 'codComprobante', 'documentoCliente', 'contenedor', 'codigo', 'razonSocial'];
				$scope.model = {
					'codTipoComprob': '',
					'nroComprobante': '',
					'razonSocial': '',
					'documentoCliente': '',
					'fechaDesde': $scope.model.fechaDesde,
					'fechaHasta': $scope.model.fechaHasta,
					'contenedor': ''
				};
			}
		},
		codComprobante : function(filtro){
			$scope.model.codTipoComprob = filtro;
			$scope.filtrar.cargar();
		},
		nroComprobante : function(filtro){
			$scope.model.nroComprobante = filtro;
			$scope.filtrar.cargar();
		},
		razonSocial : function(filtro){
			$scope.model.razonSocial = $scope.filtrarCaracteresInvalidos(filtro);
			$scope.filtrar.cargar();
		},
		documentoCliente : function(filtro){
			$scope.model.documentoCliente = filtro;
			$scope.filtrar.cargar();
		},
		fechaDesde : function(filtro){
			$scope.model.fechaDesde = filtro;
			$scope.filtrar.cargar();
		},
		fechaHasta : function(filtro){
			$scope.model.fechaHasta = filtro;
			$scope.filtrar.cargar();
		},
		contenedor : function(filtro){
			$scope.model.contenedor = filtro;
			$scope.filtrar.cargar();
		},
		cargar : function(){
			if ($scope.model.fechaDesde > $scope.model.fechaHasta && $scope.model.fechaHasta != ''){
				$scope.model.fechaHasta = new Date($scope.model.fechaDesde);
				$scope.model.fechaHasta.setDate($scope.model.fechaHasta.getDate() + 1);
			}
			switch ($scope.controlFiltros){
				case 'codigos':
					$scope.controlDeCodigos();
					break;
				case 'codigosFiltrados':
					invoiceFactory.getInvoice(cargaDatos(), $scope.pageFiltros, function(data){
						$scope.totalItemsFiltros = data.totalCount;
						$scope.pantalla.comprobantesRotos = data.data;
					});
					break;
				case 'tasas':
					$scope.controlTasaCargas();
					break;
				case 'correlativo':
					if ($scope.model.nroPtoVenta != '' && $scope.model.codTipoComprob != ''){
						$scope.controlCorrelatividad();
					}
					break;
				case 'revisar':
					$scope.traerComprobantesRevisar();
					break;
				case 'error':
					$scope.traerComprobantesError();
					break;
			}
		}
	};

	$scope.hitEnter = function(evt){
		if(angular.equals(evt.keyCode,13)){
			$scope.filtrar.cargar();
		}
	};

	$scope.filtrarCaracteresInvalidos = function(palabra){
		if (angular.isDefined(palabra) && palabra.length > 0){
			var palabraFiltrada;
			var caracteresInvalidos = ['*', '(', ')', '+', ':', '?'];
			palabraFiltrada = palabra;
			for (var i = 0; i <= caracteresInvalidos.length - 1; i++){
				if (palabraFiltrada.indexOf(caracteresInvalidos[i], 0) > 0){
					palabraFiltrada = palabraFiltrada.substring(0, palabraFiltrada.indexOf(caracteresInvalidos[i], 0));
				}
			}
			return palabraFiltrada.toUpperCase();
		} else {
			return palabra;
		}
	};

	$scope.controlDeCodigos = function(){
		$scope.controlFiltros = 'codigos';
		$scope.loadingControlCodigos = true;
		$scope.hayFiltros = false;
		$scope.model.codigo = '';
		$scope.pantalla.comprobantesRotos = [];
		priceFactory.noMatches($scope.model.fechaDesde, $scope.model.fechaHasta, function(dataNoMatches){
			$scope.pantalla.resultadoCodigos = dataNoMatches.data;
			if ($scope.pantalla.resultadoCodigos.length > 0){
				$scope.pantalla.mensajeCodigos = "Se hallaron códigos sin asociar: ";
				$scope.pantalla.cartelCodigos = "panel-danger";
				$scope.pantalla.tituloCodigos = "Error";
				$scope.pantalla.mostrarResultado = 1;
				$scope.cargandoPaginaComprobantes = true;

				invoiceFactory.getInvoicesNoMatches(cargaDatos(), $scope.pageCodigos, function(invoicesNoMatches){
					if (invoicesNoMatches.data != null){
						invoicesNoMatches.data.forEach(function(unComprobante){
							unComprobante._id.fecha = {
								emision: unComprobante._id.fecha
							};
							unComprobante._id.importe = {
								total: unComprobante._id.impTot
							};
							$scope.pantalla.comprobantesRotos.push(unComprobante._id);
						});
						$scope.totalItemsCodigos = invoicesNoMatches.totalCount;
					}
					$scope.cargandoPaginaComprobantes = false;
					$scope.loadingControlCodigos = false;
				});
			} else {
				$scope.pantalla.mensajeCodigos = "No se hallaron códigos sin asociar";
				$scope.pantalla.cartelCodigos = "panel-success";
				$scope.pantalla.tituloCodigos = "Éxito";
				$scope.pantalla.mostrarResultado = 0;
				$scope.totalItemsCodigos = 0;
				$scope.loadingControlCodigos = false;
				$scope.cargandoPaginaComprobantes = false;
			}
		});
	};

	$scope.controlTasaCargas = function(){
		/*Acá control de tasa a las cargas*/
		$scope.loadingTasaCargas = true;
		invoiceFactory.getSinTasaCargas(cargaDatos(), loginService.getFiltro(), $scope.page, function(data){
			if (data.status == "ERROR"){
				$scope.tasaCargas.titulo = "Error";
				$scope.tasaCargas.cartel = "panel-danger";
				$scope.tasaCargas.mensaje = "La terminal seleccionada no tiene códigos asociados.";
				$scope.tasaCargas.mostrarResultado = 0;
			} else {
				$scope.tasaCargas.resultado = data.data;
				if ($scope.tasaCargas.resultado.length > 0){
					$scope.totalItemsTasaCargas = data.totalCount;
					$scope.tasaCargas.titulo = "Error";
					$scope.tasaCargas.cartel = "panel-danger";
					$scope.tasaCargas.mensaje = "Se hallaron comprobantes sin tasa a las cargas.";
					$scope.tasaCargas.mostrarResultado = 1;
				} else {
					$scope.tasaCargas = {
						"titulo":"Éxito",
						"cartel": "panel-success",
						"mensaje": "No se hallaron comprobantes sin tasa a las cargas.",
						"resultado": [],
						"mostrarResultado": 0
					};
				}
			}
			$scope.loadingTasaCargas = false;
		});
	};

	$scope.traerPuntosDeVenta = function(){
		invoiceFactory.getCashbox({}, function(data){
			$scope.terminalSellPoints = data.data;
		})
	};

	$scope.controlCorrelatividad = function(){
		$scope.loadingCorrelatividad = true;
		invoiceFactory.getCorrelative(cargaDatos(), function(dataComprob) {
			$scope.result = dataComprob;
			if ($scope.result.totalCount > 0){
				$scope.pantalla.mensajeCorrelativo = "Se hallaron comprobantes faltantes: ";
				$scope.pantalla.cartelCorrelativo = "panel-danger";
				$scope.pantalla.tituloCorrelativo = "Error";
				$scope.pantalla.resultadoCorrelativo = $scope.result.data;
			} else {
				$scope.pantalla.tituloCorrelativo =  "Éxito";
				$scope.pantalla.mensajeCorrelativo = "No se hallaron comprobantes faltantes";
				$scope.pantalla.cartelCorrelativo = "panel-success";
				$scope.pantalla.resultadoCorrelativo = [];
			}
			$scope.loadingCorrelatividad = false;
		});
	};

	$scope.controlTarifas = function(){
		//Traigo todos los códigos de la terminal y me los guardo

		invoiceFactory.getTarifasTerminal(function(dataTarifas){
			$scope.tarifasTerminal = dataTarifas.data;

				invoiceFactory.getInvoice(cargaDatos(), $scope.pageTarifas, function(dataComprob) {
					$scope.result = dataComprob;
					$scope.totalFacturas= $scope.result.data.length;

					var contador = 0;
					$scope.control = 0;

					var flagErrorTarifas = false;
					var tarifa;

					//Por ahora se esta realizando el chequeo contra el mock, el algoritmo está hecho suponiendo que
					//el rango de facturas por fecha viene ordenado, tampoco hay nada que me permita comprobar que el primer
					//comprobante sea el correcto...
					$scope.result.data.forEach(function(comprob){
						comprob.tarifasMalCobradas = [];

						/*Aca control de tarifas*/
						var tarifa;
						comprob.detalle.forEach(function(detalle){
							detalle.items.forEach(function(item){
								if (angular.isDefined($scope.tarifasTerminal[item.id])){
									tarifa = $scope.tarifasTerminal[item.id].price * item.cnt;
									if (comprob.codMoneda == 'PES' && $scope.tarifasTerminal[item.id].currency == 'DOL'){
										tarifa = tarifa * comprob.cotiMoneda;
									}
									if (comprob.codMoneda == 'DOL' && $scope.tarifasTerminal[item.id].currency == 'PES'){
										tarifa = tarifa / comprob.cotiMoneda;
									}
									if (tarifa < item.impTot){
										$scope.pantalla.mensajeTarifas = "Se hallaron tarifas mal cobradas";
										$scope.pantalla.cartelTarifas = "panel-danger";
										$scope.pantalla.tituloTarifas = "Error";
										$scope.pantalla.mostrarResultadoTarifas = 1;
										comprob.tarifasMalCobradas.push("Codigo: " + item.id + " (Esperado: " + tarifa + " - Cobrado: " + item.impTot + ")");
										flagErrorTarifas = true;
									}
								}
							});
						});
						if (flagErrorTarifas){
							$scope.pantalla.comprobantesMalCobrados.push(comprob);
						}
					});
				});
		});
	};

	$scope.traerComprobantesRevisar = function(){
		$scope.loadingRevisar = true;
		invoiceFactory.getInvoice(cargaDatos(), $scope.pageRevisar, function(invoiceRevisar){
			$scope.comprobantesRevisar = invoiceRevisar.data;
			$scope.totalItemsRevisar = invoiceRevisar.totalCount;
			$scope.loadingRevisar = false;
		})
	};

	$scope.traerComprobantesError = function(){
		$scope.loadingError = true;
		invoiceFactory.getInvoice(cargaDatos(), $scope.pageError, function(invoiceError){
			$scope.comprobantesError = invoiceError.data;
			$scope.totalItemsError = invoiceError.totalCount;
			$scope.loadingError = false;
		})
	};

	$scope.controlDeCodigos();
	$scope.controlTasaCargas();
	$scope.traerPuntosDeVenta();

	$scope.mostrarDetalle = function(comprobante){
		var encontrado = false;
		switch ($scope.controlFiltros){
			case 'codigos':
			case 'codigosFiltrados':
				$scope.comprobantesVistosCodigos.forEach(function(unComprobante){
					if (unComprobante._id == comprobante._id){
						encontrado = true;
					}
				});
				if (!encontrado){
					$scope.comprobantesVistosCodigos.push(comprobante);
				}
				break;
			case 'tasas':
				$scope.comprobantesVistosTasas.forEach(function(unComprobante){
					if (unComprobante._id == comprobante._id){
						encontrado = true;
					}
				});
				if (!encontrado){
					$scope.comprobantesVistosTasas.push(comprobante);
				}
				break;
			case 'revisar':
				$scope.comprobantesVistosRevisar.forEach(function(unComprobante){
					if (unComprobante._id == comprobante._id){
						encontrado = true;
					}
				});
				if (!encontrado){
					$scope.comprobantesVistosRevisar.push(comprobante);
				}
				break;
			case 'error':
				$scope.comprobantesVistosError.forEach(function(unComprobante){
					if (unComprobante._id == comprobante._id){
						encontrado = true;
					}
				});
				if (!encontrado){
					$scope.comprobantesVistosError.push(comprobante);
				}
				break;
		}
		invoiceFactory.invoiceById(comprobante._id, function(miComprobante){
			$scope.verDetalle = miComprobante;
		});
	};

	$scope.quitarVista = function(comprobante){
		var pos;
		switch ($scope.controlFiltros){
			case 'codigos':
			case 'codigosFiltrados':
				pos = $scope.comprobantesVistosCodigos.indexOf(comprobante);
				$scope.comprobantesVistosCodigos.splice(pos, 1);
				break;
			case 'tasas':
				pos = $scope.comprobantesVistosTasas.indexOf(comprobante);
				$scope.comprobantesVistosTasas.splice(pos, 1);
				break;
			case 'revisar':
				pos = $scope.comprobantesVistosRevisar.indexOf(comprobante);
				$scope.comprobantesVistosRevisar.splice(pos, 1);
				break;
			case 'error':
				pos = $scope.comprobantesVistosError.indexOf(comprobante);
				$scope.comprobantesVistosError.splice(pos, 1);
				break;
		}
	};

	$scope.pageChangedTasa = function(){
		$scope.page.skip = (($scope.currentPageTasaCargas - 1) * $scope.itemsPerPage);
		invoiceFactory.getSinTasaCargas(cargaDatos(), loginService.getFiltro(), $scope.page, function(data){
			if (data.status == "ERROR"){
				$scope.tasaCargas.titulo = "Error";
				$scope.tasaCargas.cartel = "panel-danger";
				$scope.tasaCargas.mensaje = "La terminal seleccionada no tiene códigos asociados.";
				$scope.tasaCargas.mostrarResultado = 0;
			} else {
				$scope.tasaCargas.resultado = data.data;
				if ($scope.tasaCargas.resultado.length > 0) {
					$scope.totalItemsTasaCargas = data.totalCount;
					$scope.tasaCargas.titulo = "Error";
					$scope.tasaCargas.cartel = "panel-danger";
					$scope.tasaCargas.mensaje = "Se hallaron comprobantes sin tasa a las cargas.";
					$scope.tasaCargas.mostrarResultado = 1;
				}
			}
		});
	};

	$scope.pageChangedCodigos = function(){
		if ($scope.flagWatchCodigos){
			$scope.cargandoPaginaComprobantes = true;
			$scope.pantalla.comprobantesRotos = [];
			$scope.pageCodigos.skip = (($scope.currentPageCodigos - 1) * $scope.itemsPerPage);
			invoiceFactory.getInvoicesNoMatches(cargaDatos(), $scope.pageCodigos, function(data){
				data.data.forEach(function(unComprobante){
					unComprobante._id.fecha = {
						emision: unComprobante._id.fecha
					};
					unComprobante._id.importe = {
						total: unComprobante._id.impTot
					};
					$scope.pantalla.comprobantesRotos.push(unComprobante._id);
				});
				$scope.cargandoPaginaComprobantes = false;
			});
		} else {
			$scope.flagWatchCodigos = true;
		}
	};

	$scope.pageChangedFiltros = function(){
		if ($scope.flagWatchFiltros){
			$scope.pageFiltros.skip = (($scope.currentPageFiltros - 1) * $scope.itemsPerPage);
			invoiceFactory.getInvoice(cargaDatos(), $scope.pageFiltros, function(data){
				$scope.pantalla.comprobantesRotos = data.data;
			});
		} else {
			$scope.flagWatchFiltros = true;
		}
	};

	$scope.pageChangedRevisar = function(){
		if ($scope.flagWatchRevisar){
			$scope.pageRevisar.skip = (($scope.currentPageRevisar - 1) * $scope.itemsPerPage);
			invoiceFactory.getInvoice(cargaDatos(), $scope.pageRevisar, function(data){
				$scope.comprobantesRevisar = data.data;
			});
		} else {
			$scope.flagWatchRevisar = true;
		}
	};

	$scope.pageChangedError = function(){
		if ($scope.flagWatchError){
			$scope.pageError.skip = (($scope.currentPageError - 1) * $scope.itemsPerPage);
			invoiceFactory.getInvoice(cargaDatos(), $scope.pageError, function(data){
				$scope.comprobantesError = data.data;
			});
		} else {
			$scope.flagWatchError = true;
		}
	};

	$scope.cambioTab = function(unTab){
		$scope.controlFiltros = unTab;
		$scope.model = {
			'nroPtoVenta': '',
			'codTipoComprob': 0,
			'nroComprobante': '',
			'razonSocial': '',
			'documentoCliente': '',
			'fechaDesde': $scope.desde,
			'fechaHasta': $scope.hasta,
			'contenedor': '',
			'estado': ''
		};
		switch ($scope.controlFiltros){
			case 'codigos':
				$scope.ocultarFiltros = ['nroComprobante', 'codComprobante', 'nroPtoVenta', 'documentoCliente', 'contenedor', 'codigo', 'razonSocial', 'estado'];
				break;
			case 'tasas':
				$scope.ocultarFiltros = ['nroComprobante', 'codComprobante', 'documentoCliente', 'codigo', 'fechaDesde', 'fechaHasta', 'estado'];
				break;
			case 'correlativo':
				$scope.ocultarFiltros = ['nroComprobante', 'documentoCliente', 'contenedor', 'codigo', 'razonSocial', 'estado'];
				$scope.model.codTipoComprob = 1;
				break;
			case 'revisar':
				$scope.ocultarFiltros = ['nroPtoVenta', 'estado'];
				$scope.model.estado = 'Y';
				$scope.filtrar.cargar();
				break;
			case 'error':
				$scope.ocultarFiltros = ['nroPtoVenta', 'estado'];
				$scope.model.estado = 'R';
				$scope.filtrar.cargar();
				break;
		}
	};

	function cargaDatos(){
		return {
			'nroPtoVenta': $scope.model.nroPtoVenta,
			'codigo': $scope.model.codigo,
			'codTipoComprob': $scope.model.codTipoComprob,
			'nroComprobante': $scope.model.nroComprobante,
			'razonSocial': $scope.model.razonSocial,
			'documentoCliente': $scope.model.documentoCliente,
			'fechaDesde': $scope.model.fechaDesde,
			'fechaHasta': $scope.model.fechaHasta,
			'contenedor': $scope.model.contenedor,
			'order': $scope.model.order,
			'estado': $scope.model.estado
		};
	};

	$scope.trackInvoice = function(comprobante, estado){
		var estadoAnterior = comprobante.interfazEstado;
		switch (estado){
			case 'Y':
				comprobante.interfazEstado = {
					'estado': 'Revisar',
					'btnEstado': 'btn-warning'
				};
				break;
			case 'G':
				comprobante.interfazEstado = {
					'estado': 'Controlado',
					'btnEstado': 'btn-success'
				};
				break;
			case 'R':
				comprobante.interfazEstado = {
					'estado': 'Error',
					'btnEstado': 'btn-danger'
				};
				break;
		}
		if (estadoAnterior.estado == comprobante.interfazEstado.estado){
			comprobante.interfazEstado = estadoAnterior;
		} else {
			invoiceFactory.getTrackInvoice(comprobante._id, function(dataTrack){
				var modalInstance = $modal.open({
					templateUrl: 'view/trackingInvoice.html',
					controller: trackingInvoiceCtrl,
					backdrop: 'static',
					resolve: {
						estado: function () {
							return estado;
						},
						track: function() {
							return dataTrack;
						}
					}
				});
				dataTrack = [];
				modalInstance.result.then(function (dataComment) {
					invoiceFactory.cambiarEstado(comprobante._id, estado, function(data){
						var logInvoice = {
							title: dataComment.title,
							state: estado,
							comment: dataComment.comment,
							invoice: comprobante._id
						};
						invoiceFactory.commentInvoice(logInvoice, function(dataRes){
						});
					});
				}, function () {
					comprobante.interfazEstado = estadoAnterior;
				});
			});
		}
	};

}