/**
 * Created by leo on 05/09/14.
 */
(function(){
	myapp.directive('vistaComprobantes', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/vistaComprobantes.html',
			scope: {
				model:								'=',
				datosInvoices:						'=',
				ocultarFiltros:						'=',
				totalItems:							'=',
				loadingState:						'=',
				controlCodigos:						'&',
				codigosSinAsociar:					'=',
				mostrarPtosVenta:					'=',
				ocultarAccordionInvoicesSearch:		'=',
				ocultarAccordionComprobantesVistos:	'=',
				panelMensaje:						'=',
				filtroEstados:						'@'
			},
			controller: ['$rootScope', '$scope', '$modal', '$filter', 'invoiceFactory', 'loginService', 'priceFactory', 'vouchersFactory', 'statesFactory', function($rootScope, $scope, $modal, $filter, invoiceFactory, loginService, priceFactory, vouchersFactory, statesFactory){
				$scope.status = {
					open: true
				};
				$scope.currentPage = 1;
				$scope.itemsPerPage = 15;
				//Variables para control de fechas
				$scope.maxDateD = new Date();
				$scope.maxDateH = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
				//Tipos de comprobantes
				$scope.vouchers = $rootScope.vouchers;
				//Opciones de fecha para calendarios
				$scope.formatDate = $rootScope.formatDate;
				$scope.dateOptions = $rootScope.dateOptions;
				//Listas para autocompletado
				$scope.listaContenedores = $rootScope.listaContenedores;
				$scope.listaRazonSocial = $rootScope.listaRazonSocial;
				$scope.listaBuques = $rootScope.listaBuques;
				$scope.listaViajes = [];
				$scope.itemsPorPagina = [
					{ value: 10, description: '10 items por página', ticked: false},
					{ value: 15, description: '15 items por página', ticked: true},
					{ value: 20, description: '20 items por página', ticked: false},
					{ value: 50, description: '50 items por página', ticked: false}
				];
				$scope.estadosComprobantes = $filter('filter')($rootScope.estadosComprobantes, $scope.filtroEstados);

				$scope.estadosComprobantes.forEach(function(unEstado){
					unEstado.ticked = false;
				});

				$scope.comprobantesVistos = [];

				vouchersFactory.getVouchersArray(function(data){
					$scope.vouchersType = data.data;
				});

				$scope.acceso = $rootScope.esUsuario;

				// Puntos de Ventas
				$scope.todosLosPuntosDeVentas = [];

				$scope.mostrarResultado = false;
				$scope.verDetalle = {};

				//Control de tarifas
				$scope.controlTarifas = [];
				$scope.noMatch = false;

				$scope.commentsInvoice = [];

				$scope.recargarResultado = false;

				$scope.comprobantesControlados = [];

				priceFactory.getArrayMatches(loginService.getFiltro(), function(arrayMatches){
					$rootScope.matchesTerminal = arrayMatches;
				});

				priceFactory.getMatchPrices(loginService.getFiltro(), {tasaCargas: true}, function (data){
					$rootScope.tasaCargasTerminal = [];
					data.data.forEach(function(tasaCargas){
						if (tasaCargas.matches != null && tasaCargas.matches.length > 0){
							$rootScope.tasaCargasTerminal.push(tasaCargas.matches[0].match[0])
						}
					})
				});

				invoiceFactory.getDescriptionItem(function(data){
					$scope.itemsDescription = data.data;
				});

				$scope.$on('cargaGeneral', function(){
					$scope.listaContenedores = $rootScope.listaContenedores;
					$scope.listaRazonSocial = $rootScope.listaRazonSocial;
					$scope.listaBuques = $rootScope.listaBuques;
					$scope.estadosComprobantes = $filter('filter')($rootScope.estadosComprobantes, $scope.filtroEstados);
				});

				$scope.$on('iniciarBusqueda', function(event, data){
					$scope.filtrado(data.filtro, data.contenido);
				});

				$scope.$on('borrarEstado', function(){
					$scope.filtrado('estado', 'N');
				});

				$rootScope.$watch('moneda', function(){
					$scope.moneda = $rootScope.moneda;
				});

				$scope.$watch('ocultarFiltros', function() {
					$scope.currentPage = 1;
				});

				$scope.$watch('panelMensaje', function(){
					if (!angular.isDefined($scope.panelMensaje) || $scope.panelMensaje == {}){
						$scope.panelMensaje = {
							titulo: 'Comprobantes',
							mensaje: 'No se encontraron comprobantes para los filtros seleccionados.',
							tipo: 'panel-info'
						};
					}
				});

				$scope.cambioItemsPorPagina = function(data){
					$scope.filtrado('itemsPorPagina', data.value);
				};

				$scope.estadoSeleccionado = function(data){
					var contenido = '';
					if (data.ticked){
						$scope.estadosComprobantes.forEach(function(unEstado){
							if (unEstado.ticked){
								if (contenido == ''){
									contenido += unEstado._id;
								} else {
									contenido += ',' + unEstado._id;
								}
							}
						});
					} else {
						contenido = $scope.model.estado.replace(',' + data._id, '');
						contenido = contenido.replace(data._id + ',', '');
						contenido = contenido.replace(data._id, '');
						if (contenido == ''){
							contenido = 'N';
						}
					}
					$scope.filtrado('estado', contenido);
				};

				$scope.hitEnter = function(evt){
					if(angular.equals(evt.keyCode,13))
						$scope.cargaPuntosDeVenta();
				};

				$scope.openDate = function(event){
					$rootScope.openDate(event);
				};

				$scope.clientSelected = function(selected){
					if (angular.isDefined(selected) && selected.title != $scope.model.razonSocial){
						$scope.model.razonSocial = selected.title;
						$scope.filtrado('razonSocial', selected.title);
					}
				};

				$scope.containerSelected = function(selected){
					if (angular.isDefined(selected) && selected.title != $scope.model.contenedor){
						$scope.model.contenedor = selected.title;
						$scope.filtrado('contenedor', selected.title);
					}
				};

				$scope.buqueSelected = function(selected){
					if (angular.isDefined(selected) && selected.title != $scope.model.buque){
						$scope.model.buque = selected.originalObject.buque;
						//$scope.filtrado('buque', $scope.model.buque);
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
					if (angular.isDefined(selected) && selected.title != $scope.model.viaje){
						$scope.model.viaje = selected.title;
						$scope.filtrado('viaje', selected.title);
					}
				};

				$scope.filtrado = function(filtro, contenido){
					$scope.loadingState = true;
					$scope.mostrarResultado = false;
					$scope.currentPage = 1;
					switch (filtro){
						case 'nroPtoVenta':
							$scope.model.nroPtoVenta = contenido;
							break;
						case 'codigo':
							$scope.model.codigo = contenido;
							break;
						case 'codComprobante':
							$scope.model.codTipoComprob = contenido;
							break;
						case 'nroComprobante':
							$scope.model.nroComprobante = contenido;
							break;
						case 'razonSocial':
							$scope.model.razonSocial = $scope.filtrarCaracteresInvalidos(contenido);
							break;
						case 'documentoCliente':
							$scope.model.documentoCliente = contenido;
							break;
						case 'estado':
							$scope.model.estado = contenido;
							break;
						case 'fechaDesde':
							$scope.model.fechaDesde = contenido;
							break;
						case 'fechaHasta':
							$scope.model.fechaHasta = contenido;
							break;
						case 'contenedor':
							$scope.model.contenedor = contenido;
							break;
						case 'buque':
							$scope.model.buque = contenido;
							break;
						case 'viaje':
							$scope.model.viaje = contenido;
							break;
						case 'itemsPorPagina':
							$scope.model.itemsPerPage = contenido;
							break;
					}
					if ($scope.model.fechaDesde > $scope.model.fechaHasta && $scope.model.fechaHasta != ''){
						$scope.model.fechaHasta = new Date($scope.model.fechaDesde);
						$scope.model.fechaHasta.setDate($scope.model.fechaHasta.getDate() + 1);
					}
					if (filtro == 'nroPtoVenta'){
						$scope.$emit('cambioFiltro', $scope.model);
					} else {
						$scope.cargaPuntosDeVenta();
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

				$scope.filtrarOrden = function(filtro){
					var filtroModo;
					$scope.currentPage = 1;
					$scope.model.filtroOrden = filtro;
					if ($scope.model.filtroOrden == $scope.model.filtroAnterior){
						$scope.model.filtroOrdenReverse = !$scope.model.filtroOrdenReverse;
					} else {
						$scope.model.filtroOrdenReverse = false;
					}
					if ($scope.model.filtroOrdenReverse){
						filtroModo = -1;
					} else {
						filtroModo = 1;
					}
					$scope.model.order = '"' + filtro + '":' + filtroModo;
					$scope.model.filtroAnterior = filtro;

					$scope.$emit('cambioFiltro', $scope.model);
				};

				$scope.trackInvoice = function(comprobante){
					var estado;
					estado = comprobante.interfazEstado;
					invoiceFactory.getTrackInvoice(comprobante._id, function(dataTrack){

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
									return angular.copy($rootScope.estadosComprobantes);
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
												comprobante.interfazEstado.btnEstado = 'btn-warning';
												break;
											case 'OK':
												comprobante.interfazEstado.btnEstado = 'btn-success';
												break;
											case 'ERROR':
												comprobante.interfazEstado.btnEstado = 'btn-danger';
												break;
											case 'UNKNOWN':
												comprobante.interfazEstado.btnEstado = 'btn-info';
												break;
										}
										var nuevoEstado = {
											_id: comprobante._id,
											estado: dataComment.newState,
											grupo: loginService.getGroup(),
											user: loginService.getInfo().user
										};
										comprobante.estado.push(nuevoEstado);
										if (!$scope.ocultarAccordionInvoicesSearch && !$scope.mostrarResultado)
											$scope.cargaPuntosDeVenta();
									}
								});
							});
						});

					});
				};

				$scope.ocultarResultado = function(comprobante){
					$scope.mostrarResultado = false;
					if ($scope.recargarResultado){
						$scope.datosInvoices.forEach(function(comprob){
							if (comprob._id == comprobante._id){
								comprob.interfazEstado = comprobante.interfazEstado;
								comprob.estado = comprobante.estado;
							}
						});
						$scope.comprobantesVistos.forEach(function(visto){
							if (visto._id == comprobante._id){
								visto.interfazEstado = comprobante.interfazEstado;
								visto.estado = comprobante.estado;
							}
						});
					}
				};

				$scope.quitarVista = function (comprobante) {
					var pos = $scope.comprobantesVistos.indexOf(comprobante);
					$scope.comprobantesVistos.splice(pos, 1);
				};

				// Funciones de Puntos de Venta
				$scope.cargaPuntosDeVenta = function(){
					invoiceFactory.getCashbox(cargaDatosSinPtoVenta(), function(data){
						$scope.todosLosPuntosDeVentas.forEach(function(todosPtos){
							todosPtos.hide = data.data.indexOf(todosPtos.punto, 0) < 0;
							if (todosPtos.punto == $scope.model.nroPtoVenta && todosPtos.hide){
								$scope.model.nroPtoVenta = '';
								$scope.todosLosPuntosDeVentas[0].active = true;
							}
						});
						$scope.todosLosPuntosDeVentas[0].hide = false;
						$scope.currentPage = 1;

						$scope.$emit('cambioFiltro', $scope.model);
					});
				};

				$scope.cargaTodosLosPuntosDeVentas = function(){
					invoiceFactory.getCashbox('', function(data){
						var dato = {'heading': 'Todos los Puntos de Ventas', 'punto': '', 'active': true, 'hide': false};
						$scope.todosLosPuntosDeVentas.push(dato);
						data.data.forEach(function(punto){
							dato = {'heading': punto, 'punto': punto, 'active': false, 'hide': true};
							$scope.todosLosPuntosDeVentas.push(dato);
						});
						$scope.cargaPuntosDeVenta();
					})
				};

				$scope.mostrarDetalle = function(comprobante){
					$scope.recargarResultado = false;

					$scope.loadingState = true;
					var encontrado = false;
					$scope.comprobantesVistos.forEach(function(unComprobante){
						if (unComprobante._id == comprobante._id){
							encontrado = true;
						}
					});
					if (!encontrado){
						$scope.comprobantesVistos.push(comprobante);
					}

					invoiceFactory.invoiceById(comprobante._id, function(callback){
						$scope.verDetalle = callback;
						$scope.controlarTarifas($scope.verDetalle);

						$scope.commentsInvoice = [];
						$scope.mostrarResultado = true;
						$scope.loadingState = false;

						invoiceFactory.getTrackInvoice(comprobante._id, function(dataTrack){
							dataTrack.data.forEach(function(comment){
								if (comment.group == loginService.getGroup()){
									$scope.commentsInvoice.push(comment);
								}
							});
						});
					});
				};

				$scope.devolverEstado = function(estado){
					switch (estado){
						case 'G':
							return 'Controlado';
							break;
						case 'Y':
							return 'Sin revisar';
							break;
						case 'R':
							return 'Error';
							break;
					}
				};

				$scope.controlarTarifas = function(comprobante){
					var valorTomado;
					var tarifaError;

					var precioALaFecha;
					var monedaALaFecha;

					comprobante.controlTarifas = [];
					var lookup = {};
					for (var i = 0, len = $rootScope.matchesTerminal.length; i < len; i++) {
						lookup[$rootScope.matchesTerminal[i].codigo] = $rootScope.matchesTerminal[i];
					}

					$scope.noMatch = false;

					comprobante.detalle.forEach(function(detalle){
						detalle.items.forEach(function(item){
							if (angular.isDefined(lookup[item.id])){
								valorTomado = item.impUnit;
								lookup[item.id].topPrices.forEach(function(precioMatch){
									if (comprobante.fecha.emision > precioMatch.from){
										precioALaFecha = precioMatch.price;
										monedaALaFecha = precioMatch.currency
									}
								});
								if (monedaALaFecha != 'DOL'){
									valorTomado = item.impUnit * comprobante.cotiMoneda
								}
								if ($rootScope.tasaCargasTerminal.indexOf(item.id) >= 0){
									if (valorTomado != precioALaFecha){
										tarifaError = {
											codigo: item.id,
											currency: monedaALaFecha,
											topPrice: precioALaFecha,
											current: item.impUnit
										};
										comprobante.controlTarifas.push(tarifaError);
									}
								} else {
									if (valorTomado > precioALaFecha){
										tarifaError = {
											codigo: item.id,
											currency: monedaALaFecha,
											topPrice: precioALaFecha,
											current: item.impUnit
										};
										comprobante.controlTarifas.push(tarifaError);
									}
								}

							} else {
								$scope.noMatch = true;
							}
						});
					});
					$rootScope.noMatch = $scope.noMatch;
				};

				$scope.chequearTarifas = function(comprobante){
					if (angular.isDefined($scope.comprobantesControlados[comprobante._id])){
						return $scope.comprobantesControlados[comprobante._id];
					} else {
						$scope.controlarTarifas(comprobante);
						$scope.comprobantesControlados[comprobante._id] = (comprobante.controlTarifas.length > 0);
						return comprobante.controlTarifas.length > 0;
					}
				};

				$scope.existeDescripcion = function(itemId){
					return angular.isDefined($scope.itemsDescription[itemId]);
				};

				$scope.mostrarTope = function(){
					var max = $scope.currentPage * 10;
					return max > $scope.totalItems ? $scope.totalItems : max;
				};

				function cargaDatosSinPtoVenta(){
					var datos = $scope.model;
					datos.nroPtoVenta = '';
					return datos;
				}

				$scope.cargaTodosLosPuntosDeVentas();

			}]
		}
	});

	myapp.directive('tableInvoices', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/table.invoices.html'
		}
	});

	myapp.directive('tableGates', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/table.gates.html',
			scope: {
				model:				'=',
				datosGates:			'=',
				totalItems:			'=',
				detallesGates:		'=',
				ocultarFiltros:		'=',
				currentPage:		'=',
				loadingState:		'='
			},
			controller: ['$rootScope', '$scope', 'invoiceFactory', function($rootScope, $scope, invoiceFactory){
				$scope.totalGates = 0
				$scope.itemsPerPage = 10;
				$scope.configPanel = {
					tipo: 'panel-info',
					titulo: 'Gates'
				};
				$scope.listaBuques = $rootScope.listaBuques;
				$scope.listaViajes = [];
				$scope.$on('cargaGeneral', function(){
					$scope.listaBuques = $rootScope.listaBuques;
				});
				$scope.colorHorario = function (gate) {
					var horarioGate = new Date(gate.gateTimestamp);
					var horarioInicio = new Date(gate.turnoInicio);
					var horarioFin = new Date(gate.turnoFin);
					if (horarioGate >= horarioInicio && horarioGate <= horarioFin) {
						return 'green';
					} else {
						return 'red';
					}
				};
				$scope.mostrarDetalle = function(contenedor){
					$scope.paginaAnterior = $scope.currentPage;
					$scope.totalGates = $scope.totalItems;
					$scope.detallesGates = true;
					$scope.contenedor = contenedor.contenedor;
					var datos = { 'contenedor': contenedor.contenedor };
					invoiceFactory.getInvoice(datos, { skip: 0, limit: $scope.itemsPerPage }, function (data) {
						if (data.status === 'OK') {
							$scope.invoices = data.data;
							$scope.totalItems = data.totalCount;
						}
					});
				};
				$scope.filtrado = function(filtro, contenido){
					switch (filtro){
						case 'contenedor':
							$scope.model.contenedor = contenido;
							break;
						case 'buque':
							$scope.model.buque = contenido;
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
							break;
					}
					$scope.$emit('cambioFiltro', $scope.listaViajes);
				};
				$scope.filtrarOrden = function(filtro){
					var filtroModo;
					$scope.model.filtroOrden = filtro;
					if ($scope.model.filtroOrden == $scope.model.filtroAnterior){
						$scope.model.filtroOrdenReverse = !$scope.model.filtroOrdenReverse;
					} else {
						$scope.model.filtroOrdenReverse = false;
					}
					if ($scope.model.filtroOrdenReverse){
						filtroModo = -1;
					} else {
						filtroModo = 1;
					}
					$scope.model.order = '"' + filtro + '":' + filtroModo;
					$scope.model.filtroAnterior = filtro;
					$scope.$emit('cambioFiltro');
				};
			}]
		}
	});

	myapp.directive('tableGatesResult', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/gates.invoices.html'
		}
	});

	myapp.directive('tableTurnos', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/table.turnos.html',
			scope: {
				model:				'=',
				datosTurnos:		'=',
				totalItems:			'=',
				configPanel:		'=',
				currentPage:		'=',
				ocultarFiltros:		'=',
				loadingState:		'='
			},
			controller: 'searchController'
		}
	});

	myapp.directive('tableTasasCargas', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/table.tasas.cargas.html',
			link: function($scope){
				$scope.configPanel = {
					tipo: 'panel-info',
					titulo: 'Tasas a las Cargas'
				};
			}
		}
	});

	myapp.directive('accordionComprobantesVistos', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/accordion.comprobantes.vistos.html'
		}
	});

	myapp.directive('accordionInvoicesSearch', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/accordion.invoices.search.html'
		}
	});

	myapp.directive('invoicesResult', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/invoices.result.html'
		}
	});

	myapp.directive('invoiceTrack', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/comments.invoice.html'
		}
	});

	myapp.controller("searchController", ['$rootScope', '$scope', function($rootScope, $scope){
		$scope.status = {
			open: true
		};
		$scope.maxDate = new Date();
		$scope.formatDate = $rootScope.formatDate;
		$scope.dateOptions = $rootScope.dateOptions;
		//$scope.listaBuquesGates = $rootScope.listaBuquesGates;
		$scope.listaContenedoresGates = $rootScope.listaContenedoresGates;
		//$scope.listaBuquesTurnos = $rootScope.listaBuquesTurnos;
		$scope.listaContenedoresTurnos = $rootScope.listaContenedoresTurnos;
		//$scope.listaViajes = $rootScope.listaViajes;
		$scope.listaBuques = $rootScope.listaBuques;
		$scope.listaViajes = [];
		$scope.$on('cargaGeneral', function(){
			//$scope.listaBuquesGates = $rootScope.listaBuquesGates;
			$scope.listaContenedoresGates = $rootScope.listaContenedoresGates;
			//$scope.listaBuquesTurnos = $rootScope.listaBuquesTurnos;
			$scope.listaContenedoresTurnos = $rootScope.listaContenedoresTurnos;
			$scope.listaBuques = $rootScope.listaBuques;
		});
		$scope.$on('tengoViajes', function(event, data){
			$scope.listaViajes = data;
		});
		$scope.openDate = function(event){
			$rootScope.openDate(event);
		};
		$scope.hitEnter = function(evt){
			if(angular.equals(evt.keyCode,13))
				$scope.$emit('cambioFiltro');
		};
		$scope.buqueSelected = function(selected){
			if (angular.isDefined(selected)){
				$scope.model.buque = selected.originalObject.buque;
				//$scope.filtrado('buque', $scope.model.buque);
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
			switch (filtro){
				case 'fechaDesde':
					$scope.model.fechaDesde = contenido;
					break;
				case 'fechaHasta':
					$scope.model.fechaHasta = contenido;
					break;
				case 'contenedor':
					$scope.model.contenedor = contenido;
					break;
				case 'buque':
					$scope.model.buque = contenido;
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
					break;
				case 'viaje':
					$scope.model.viaje = contenido;
					break;
			}
			if ($scope.model.fechaDesde > $scope.model.fechaHasta && $scope.model.fechaHasta != ''){
				$scope.model.fechaHasta = new Date($scope.model.fechaDesde);
				$scope.model.fechaHasta.setDate($scope.model.fechaHasta.getDate() + 1);
			}
			$scope.$emit('cambioFiltro', $scope.listaViajes);
		};

		$scope.cargaPorFiltros = function () {
			$scope.status.open = !$scope.status.open;
			$scope.$emit('cambioFiltro');
		};
	}]);

	myapp.directive('containersGatesSearch', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/accordion.gates.search.html',
			scope: {
				model:			'=',
				ocultarFiltros:	'=',
				currentPage:	'='
			},
			controller: 'searchController'
		}
	});

	myapp.directive('accordionTurnosSearch', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/accordion.turnos.search.html',
			scope: {
				model:			'=',
				currentPage:	'='
			},
			controller: 'searchController'
		}
	});

	myapp.directive('divPagination', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/div.pagination.html',
			scope: {
				totalItems:			'=',
				currentPage:		'=',
				itemsPerPage:		'=',
				panelSize:			'='
			},
			link: function($scope){
				$scope.$watch('totalItems', function(){
					switch ($scope.panelSize){
						case 12:
						case undefined:
							if ($scope.totalItems / $scope.itemsPerPage >= 1000){
								$scope.maxSizeSM = 9;
								$scope.maxSizeMD = 13;
								$scope.maxSizeLG = 17;
							} else {
								$scope.maxSizeSM = 10;
								$scope.maxSizeMD = 15;
								$scope.maxSizeLG = 20;
							}
							break;
						case 10:
							if ($scope.totalItems / $scope.itemsPerPage >= 10000){
								$scope.maxSizeSM = 3;
								$scope.maxSizeMD = 7;
								$scope.maxSizeLG = 11;
							} else if ($scope.totalItems / $scope.itemsPerPage >= 1000){
								$scope.maxSizeSM = 5;
								$scope.maxSizeMD = 9;
								$scope.maxSizeLG = 13;
							} else if ($scope.totalItems / $scope.itemsPerPage >= 100) {
								$scope.maxSizeSM = 7;
								$scope.maxSizeMD = 11;
								$scope.maxSizeLG = 15;
							} else {
								$scope.maxSizeSM = 10;
								$scope.maxSizeMD = 15;
								$scope.maxSizeLG = 20;
							}
							break;
					}

				});
				$scope.pageChanged = function(){
					$scope.$emit('cambioPagina', $scope.currentPage);
				}
			}
		}
	});

	myapp.directive('divPanel', function(){
		return {
			restrict:		'E',
			transclude:		true,
			scope:	{
				configPanel:	'='
			},
			template:		'<div class="panel {{ configPanel.tipo }}">' +
				'	<div class="panel-heading">' +
				'		<h3 class="panel-title">{{ configPanel.titulo }}</h3>' +
				'	</div>' +
				'	<div class="panel-body">' +
				'		<span ng-transclude></span>' +
				'	</div>' +
				'</div>'
		}
	});

	myapp.directive('accordionBusquedaCorrelatividad', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/correlativeControlSearch.html',
			controller: ['$rootScope', '$scope', 'invoiceFactory', function($rootScope, $scope, invoiceFactory){
				$scope.status = {
					open: true
				};
				$scope.ocultarFiltros = ['razonSocial', 'nroPtoVenta', 'nroComprobante', 'documentoCliente', 'codigo', 'estado', 'buque', 'contenedor', 'viaje', 'itemsPerPage'];
				$scope.fechaDesde = new Date();
				$scope.fechaHasta = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
				$scope.maxDate = new Date();
				$scope.formatDate = $rootScope.formatDate;
				$scope.dateOptions = $rootScope.dateOptions;
				$scope.terminalSellPoints = [];
				$scope.configPanel = {
					tipo: 'panel-info',
					titulo: 'Puntos de venta de la terminal seleccionada.'
				};
				$scope.model = {
					'nroPtoVenta': '',
					'codTipoComprob': 1,
					'fechaDesde': $scope.fechaDesde,
					'fechaHasta': $scope.fechaHasta
				};
				$scope.traerPuntosDeVenta = function(){
					invoiceFactory.getCashbox({}, function(data){
						var i;
						$scope.terminalSellPoints = data.data;
						$scope.model.codTipoComprob = 1;
						$scope.model.nroPtoVenta = $scope.terminalSellPoints[0];
						for (i = 1; i<$scope.terminalSellPoints.length; i++){
							$scope.model.nroPtoVenta = $scope.model.nroPtoVenta + ',' + $scope.terminalSellPoints[i];
						}
					})
				};
				$scope.openDate = function(event){
					$rootScope.openDate(event);
				};
				$scope.hitEnter = function(evt){
					if(angular.equals(evt.keyCode,13))
						$scope.filtrar();
				};
				$scope.filtrado = function(filtro, contenido){
					$scope.mostrarResultado = false;
					$scope.currentPage = 1;
					switch (filtro){
						case 'nroPtoVenta':
							$scope.model.nroPtoVenta = contenido;
							break;
						case 'codComprobante':
							$scope.model.codTipoComprob = contenido;
							break;
						case 'fechaDesde':
							$scope.model.fechaDesde = contenido;
							break;
						case 'fechaHasta':
							$scope.model.fechaHasta = contenido;
							break;
					}
					if ($scope.model.fechaDesde > $scope.model.fechaHasta && $scope.model.fechaHasta != ''){
						$scope.model.fechaHasta = new Date($scope.model.fechaDesde);
						$scope.model.fechaHasta.setDate($scope.model.fechaHasta.getDate() + 1);
					}
					if ($scope.model.nroPtoVenta != '' && $scope.model.codTipoComprob != ''){
						$scope.$emit('cambioFiltro', cargaDatos());
					}
				};

				function cargaDatos(){
					return {
						'nroPtoVenta':		$scope.model.nroPtoVenta,
						'codTipoComprob':	$scope.model.codTipoComprob,
						'fechaDesde':		$scope.model.fechaDesde,
						'fechaHasta':		$scope.model.fechaHasta
					};
				}

				$scope.traerPuntosDeVenta();
			}]
		}
	});

	myapp.directive('impresionFiltros', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/print.filtros.html'
		}
	});

	myapp.directive('buqueViajeSearch', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/buque.viaje.search.html',
			controller: ['$rootScope', '$scope', 'invoiceFactory', 'controlPanelFactory', 'gatesFactory', 'turnosFactory', 'afipFactory',function($rootScope, $scope, invoiceFactory, controlPanelFactory, gatesFactory, turnosFactory, afipFactory){
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
				$scope.ocultarFiltros = ['buque', 'contenedor', 'comprobantes', 'razonSocial', 'codComprobante', 'nroComprobante', 'fechaDesde'];
				$scope.configPanelTurnos = {
					tipo: 'panel-info',
					titulo: 'Turnos'
				};
				$scope.detalle = false;
				$scope.contenedorElegido = {};
				$scope.currentPageContainers = 1;
				$scope.itemsPerPage = 10;
				$scope.totalItems = 0;
				$scope.panelMensaje = {
					titulo: 'Buque - Viaje',
					mensaje: 'No se encontraron contenedores para los filtros seleccionados.',
					tipo: 'panel-info'
				};
				$scope.sumariaConfigPanel = {
					tipo: 'panel-info',
					titulo: 'A.F.I.P. sumaria'
				};
				$scope.model = {
					buque: '',
					viaje: '',
					contenedor: ''
				};
				$scope.buques = [];
				$scope.buqueElegido = {};
				$scope.datosContainers = [];
				$scope.loadingState = false;
				$scope.cargandoSumaria = false;

				invoiceFactory.getShipTrips(function(data){
					$scope.buques = data.data;
				});

				$scope.buqueSelected = function(selected){
					if (angular.isDefined(selected)){
						$scope.buqueElegido = selected.originalObject;
						$scope.model.buque = selected.originalObject.buque;
						$scope.model.viaje = selected.originalObject.viajes[0];
						$scope.traerResultados();
					}
				};

				$scope.filtrado = function(filtro, contenido){
					$scope.loadingState = true;
					$scope.detalle = false;
					$scope.currentPageContainers = 1;
					$scope.model.contenedor = '';
					var cargar = true;
					switch (filtro){
						case 'buque':
							if (contenido == '') {
								$scope.model = {
									buque: '',
									viaje: ''
								};
								$scope.datosContainers = [];
								$scope.buqueElegido = {};
								$scope.loadingState = false;
								cargar = false;
							} else {
								$scope.model.buque = contenido;
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
					$scope.loadingState = true;
					$scope.datosContainers = [];
					invoiceFactory.getShipContainers($scope.model, function(data){
						$scope.datosContainers = data.data;
						$scope.totalItems = $scope.datosContainers.length;
						$scope.loadingState = false;
					});
				};

				$scope.verDetalles = function(contenedor){
					$scope.loadingInvoices = true;
					$scope.invoices = [];
					$scope.loadingGates = true;
					$scope.gates = [];
					$scope.loadingTurnos = true;
					$scope.turnos = [];
					$scope.loadingTasas = true;
					$scope.tasas = [];
					$scope.detalle = true;
					$scope.contenedorElegido = contenedor;
					$scope.model.contenedor = contenedor.contenedor;
					$scope.cargaComprobantes();
					$scope.cargaTasasCargas();
					$scope.cargaGates();
					$scope.cargaTurnos();
					$scope.cargaSumaria();
				};

				$scope.cargaComprobantes = function(page){
					page = page || { skip:0, limit: $scope.itemsPerPage };
					if (page.skip == 0){ $scope.currentPage = 1}
					invoiceFactory.getInvoice($scope.model, page, function(data){
						if(data.status === 'OK'){
							$scope.invoices = data.data;
							$scope.invoicesTotalItems = data.totalCount;
							$scope.loadingInvoices = false;
						}
					});
				};

				$scope.cargaTasasCargas = function(){
					var datos = { contenedor: $scope.contenedorElegido.contenedor, currency: $scope.moneda};
					controlPanelFactory.getTasasContenedor(datos, function(data){
						if (data.status === 'OK'){
							$scope.tasas = data.data;
							$scope.totalTasas = data.totalTasas;
							$scope.loadingTasas = false;
						}
					});
				};

				$scope.cargaGates = function(page){
					page = page || { skip: 0, limit: $scope.itemsPerPage };
					if (page.skip == 0){ $scope.currentPage = 1}
					gatesFactory.getGate($scope.model, page, function (data) {
						if (data.status === "OK") {
							$scope.gates = data.data;
							$scope.gatesTotalItems = data.totalCount;
							$scope.loadingGates = false;
						}
					});
				};

				$scope.cargaTurnos = function(page){
					page = page || { skip:0, limit: $scope.itemsPerPage };
					turnosFactory.getTurnos($scope.model, page, function(data){
						if (data.status === "OK"){
							$scope.turnos = data.data;
							$scope.turnosTotalItems = data.totalCount;
							$scope.loadingTurnos = false;
						}
					});
				};

				$scope.cargaSumaria = function(){
					$scope.cargandoSumaria = true;
					afipFactory.getContainerSumaria($scope.model.contenedor, function(data){
						if (data.status == 'OK'){
							$scope.sumariaAfip = data.data;
						}
						$scope.cargandoSumaria = false;
					})
				};

				$rootScope.$watch('moneda', function(){
					if ($scope.detalle){
						$scope.loadingTasas = true;
						$scope.cargaTasasCargas();
					}
				});

			}]
		}
	});

	myapp.directive('tableBuqueViaje', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/buque.viaje.result.html'
		}
	});

	myapp.directive('encabezadoTablaOrdenado', function() {
		return {
			restrict:		'E',
			transclude:		true,
			scope: {
				filtrarOrden:	'&',
				ocultaFiltros:	'=',
				model:			'=',
				filtro:			'@',
				filtroOrden:	'@',
				titulo:			'@'
			},
			template:		'<a href ng-click="filtrarOrden()" ng-hide="ocultarFiltros.indexOf(\'{{ filtroOrden }}\', 0) >= 0">' +
				'	<span class="glyphicon glyphicon-sort-by-attributes" ng-show="model.filtroOrden==\'{{ filtro }}\' && model.filtroOrdenReverse==false"></span>' +
				'	<span class="glyphicon glyphicon-sort-by-attributes-alt" ng-show="model.filtroOrden==\'{{ filtro }}\' && model.filtroOrdenReverse==true"></span>' +
				'	{{ titulo }}' +
				'</a>' +
				'<span ng-show="ocultarFiltros.indexOf(\'{{ filtroOrden }}\', 0) >= 0">{{ titulo }}</span>'
		}
	});

	myapp.directive('tableContainerSumaria', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/container.sumaria.html',
			scope: {
				datosSumaria:	'=',
				loadingState:	'=',
				configPanel:	'='
			}
		}
	});

	myapp.controller('missingInfo', function($rootScope, $scope, vouchersFactory, gatesFactory){
		$scope.currentPage = 1;

		$scope.itemsPorPagina = [
			{ value: 10, description: '10 items por página', ticked: false},
			{ value: 15, description: '15 items por página', ticked: true},
			{ value: 20, description: '20 items por página', ticked: false},
			{ value: 50, description: '50 items por página', ticked: false}
		];

		$scope.filteredDatos = [];

		$scope.datosFaltantes = [];
		$scope.cargando = false;

		$scope.predicate = '';
		$scope.reverse = false;

		//Variables para control de fechas
		$scope.maxDateD = new Date();
		$scope.maxDateH = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
		//Opciones de fecha para calendarios
		$scope.formatDate = $rootScope.formatDate;
		$scope.dateOptions = $rootScope.dateOptions;

		$scope.openDate = function(event){
			$rootScope.openDate(event);
		};

		$scope.cambioItemsPorPagina = function(data){
			$scope.filtrado('itemsPorPagina', data.value);
		};

		$scope.configPanel = {
			tipo: 'panel-success',
			titulo: 'Control gates'
		};

		$scope.model = {
			fechaDesde: new Date(),
			fechaHasta: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
			itemsPerPage: 15
		};

		$scope.ocultarFiltros = ['nroPtoVenta', 'nroComprobante', 'codComprobante', 'nroPtoVenta', 'documentoCliente', 'contenedor', 'codigo', 'razonSocial', 'estado', 'buque', 'viaje', 'btnBuscar'];

		$scope.filtrado = function(filtro, contenido){
			switch (filtro){
				case 'fechaDesde':
					$scope.model.fechaDesde = contenido;
					break;
				case 'fechaHasta':
					$scope.model.fechaHasta = contenido;
					break;
				case 'itemsPorPagina':
					$scope.model.itemsPerPage = contenido;
					break;
			}
			if ($scope.model.fechaDesde > $scope.model.fechaHasta && $scope.model.fechaHasta != ''){
				$scope.model.fechaHasta = new Date($scope.model.fechaDesde);
				$scope.model.fechaHasta.setDate($scope.model.fechaHasta.getDate() + 1);
			}
		};

		$scope.cargaDatos = function(){

			switch ($scope.datoFaltante){
				case 'gates':
					$scope.cargando = true;
					gatesFactory.getMissingGates(function(data){
						$scope.datosFaltantes = data.data;
						$scope.totalItems = $scope.datosFaltantes.length;
						$scope.cargando = false;
					});
					break;
				case 'invoices':
					$scope.cargando = true;
					gatesFactory.getMissingInvoices(function(data){
						$scope.datosFaltantes = data.data;
						$scope.totalItems = $scope.datosFaltantes.length;
						$scope.cargando = false;
						$scope.datosFaltantes.forEach(function(registro){
							registro.fecha = registro.gateTimestamp;
						})
					});
					break;
			}
		};

		vouchersFactory.getVouchersArray(function(data){
			$scope.vouchersType = data.data;
		});

		$scope.ordenarPor = function(filtro){
			if ($scope.predicate == filtro){
				$scope.reverse = !$scope.reverse;
			}
			$scope.predicate = filtro;
		};

		$scope.cargaDatos();
	});

	myapp.directive('tableMissingGates', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/missing.gates.html',
			scope: {
				datoFaltante:	'='
			},
			controller:		'missingInfo'
		}
	});

	myapp.directive('tableMissingInvoices', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/missing.invoices.html',
			scope: {
				datoFaltante: '='
			},
			controller:		'missingInfo'
		}
	});

	myapp.directive('textPop', function() {
		return {
			restrict:		'E',
			scope: {
				text:		'@',
				max:		'@'
			},
			template: '<span class="hidden-print">{{ text | maxLength : max }}<a href ng-show="(text.length > max)" popover="{{ text }}" popover-trigger="mouseenter"> (...)</a></span><span class="visible-print">{{ text }}</span>'
		}
	});

	myapp.directive('accordionAfipSearch', function(){
		return {
			restrict:		'E',
			templateUrl:	'view/accordion.afip.search.html'
		}
	})
})();