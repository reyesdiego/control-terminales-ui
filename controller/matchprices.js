/**
 * Created by Diego Reyes on 1/29/14.
 */

myapp.controller('matchPricesCtrl', ['$rootScope', '$scope', 'priceFactory', '$timeout', 'dialogs', 'loginService', '$filter', 'generalCache', 'initialLoadFactory', '$state', 'focus', 'Price', 'generalFunctions',
	function($rootScope, $scope, priceFactory, $timeout, dialogs, loginService, $filter, generalCache, initialLoadFactory, $state, focus, Price, generalFunctions) {
		'use strict';

		//Array con los tipos de tarifas para establecer filtros
		$scope.tiposTarifas = [
			{nombre: 'AGP', active: true},
			{nombre: 'Servicios', active: false},
			{nombre: 'Propios', active: false},
			{nombre: 'Con match', active: false}
		];

		$scope.newTopPrice = {
			from: new Date(),
			currency: 'DOL',
			price: ''
		};

		$scope.newPrice = new Price();

		$scope.newMatches = {
			array: []
		};

		$scope.nombre = loginService.getFiltro();

		$scope.flagGuardado = true;
		$scope.flagCambios = false;

		$scope.pricelist = [];
		$scope.filteredPrices = [];
		$scope.pricelistAgp = [];
		$scope.matchesTerminal = [];
		$scope.servicios = [];
		$scope.listaSeleccionada = [];

		$scope.codigoVacio = true;

		$scope.search = "";

		$scope.esRequerido = true;
		$scope.unidad = "CONTAINER";
		$scope.moneda = "PES";

		$scope.acceso = loginService.getType();

		$scope.flagEditando = false;
		$scope.codigosConMatch = [];
		$scope.tasas = false;

		$scope.tipoFiltro = 'AGP';

		$scope.propiosTerminal = [];

		$scope.preciosHistoricos = [];

		$scope.puedeEditar = function(){
			if ($scope.acceso == 'agp'){
				return generalFunctions.in_array('modificarTarifario', $rootScope.rutas);
			}
		};

		$scope.itemsPerPage = 10;

		$scope.newFrom = new Date();
		$scope.newCurrency = 'DOL';

		$scope.unidadesTarifas = generalCache.get('unitTypes');

		$scope.openFechaTarifa = false;
		$scope.openDate = function($event) {
			$event.preventDefault();
			$event.stopPropagation();
		};

		$scope.$on('cambioPagina', function(event, data){
			$scope.currentPage = data;
			//$scope.pageChanged();
		});

		$scope.$on('errorInesperado', function(e, mensaje){
			$scope.hayError = true;
			$scope.mensajeResultado = mensaje;
			$scope.totalItems = 0;
			$scope.pricelist = [];
		});

		$scope.prepararDatos = function(){
			priceFactory.getMatchPrices({onlyRates: $scope.tasas}, loginService.getFiltro(), function (data) {
				if (data.status == 'OK'){
					$scope.pricelist = data.data;
					$scope.pricelistAgp = [];
					$scope.servicios = [];
					$scope.codigosConMatch = [];
					$scope.propiosTerminal = [];
					$scope.matchesTerminal = [];
					//Cargo todos los códigos ya asociados de la terminal para control
					$scope.pricelist.forEach(function(price){
						$scope.matchesTerminal.push(price.code);
						if (price.tarifaAgp){
							$scope.pricelistAgp.push(price);
						}
						if (price.tarifaTerminal){
							$scope.propiosTerminal.push(price)
						}
						if (price.servicio){
							$scope.servicios.push(price)
						}
						if (price.tieneMatch()){
							$scope.codigosConMatch.push(price);
							$scope.matchesTerminal.push(price.getMatches());
						}
					});
					switch ($scope.tipoFiltro){
						case 'AGP':
							$scope.listaSeleccionada = $scope.pricelistAgp;
							break;
						case 'Servicios':
							$scope.listaSeleccionada = $scope.servicios;
							break;
						case 'Propios':
							$scope.listaSeleccionada = $scope.propiosTerminal;
							break;
						case 'Con match':
							$scope.listaSeleccionada = $scope.codigosConMatch;
							break;
					}
					$scope.totalItems = $scope.pricelist.length;
				} else {
					dialogs.error('Asociar', 'Se ha producido un error al cargar los datos de códigos asociados. ' + data.data);
					$scope.pricelist = [];
					$scope.totalItems = 0;
				}
			});
		};

		$scope.cambiarTarifas = function(tipoTarifa){
			$scope.tipoFiltro = tipoTarifa.nombre;
			$scope.tiposTarifas.forEach(function(unaTarifa){
				unaTarifa.active = (unaTarifa.nombre == tipoTarifa.nombre);
			});
			if (tipoTarifa.nombre == 'AGP'){
				$scope.listaSeleccionada = angular.copy($scope.pricelistAgp);
			} else if (tipoTarifa.nombre == 'Servicios'){
				$scope.listaSeleccionada = angular.copy($scope.servicios);
			} else if (tipoTarifa.nombre == 'Propios') {
				$scope.listaSeleccionada = angular.copy($scope.propiosTerminal);
			} else {
				$scope.listaSeleccionada = angular.copy($scope.codigosConMatch);
			}
			$scope.totalItems = $scope.listaSeleccionada.length
		};

		//Verifica que un codigo no se encuentre ya asociado antes de agregarlo
		$scope.checkMatch = function(matchCode){
			//TODO chequear si es posible que asignen a una tarifa, su mismo código como asociado
			matchCode.text = matchCode.text.toUpperCase();
			//return (!$scope.matchesTerminal.contains(matchCode.text))
			return !generalFunctions.in_array(matchCode.text, $scope.matchesTerminal);
		};

		$scope.abrirNuevoConcepto = function(tipo){
			$scope.esRequerido = true;
			if (!(tipo == 'editar')){
				$scope.newPrice = new Price();
				$scope.newMatches = {
					array: []
				};
			}
			$scope.flagEditando = (tipo == 'editar');
			$state.transitionTo('modificarTarifario');
		};

		//Agrega el top price a una tarifa
		$scope.addTopPrice = function(){
			$scope.newPrice.addTopPrice($scope.newTopPrice);
			$scope.newTopPrice = {
				from: new Date(),
				currency: 'DOL',
				price: ''
			};
			focus('focusMe');
		};

		//Guarda los cambios realizados sobre una tarifa
		$scope.savePrice = function(){
			var dlg = null;
			if (verificarEditado()){
				dlg = dialogs.confirm('Guardar', 'Se guardarán todos los cambios realizados sobre la tarifa, ¿confirma la operación?');
				dlg.result.then(function(){
					$scope.newPrice.unit = String($scope.newPrice.idUnit);
					$scope.newPrice.setMatches($scope.newMatches.array.map(function(matchCode){
						return matchCode.text;
					}));
					$scope.newPrice.saveChanges()
							.then(function(){
								initialLoadFactory.actualizarMatchesArray(loginService.getFiltro());
								dialogs.notify("Asociar","Los cambios se han guardado exitosamente.");
								$scope.prepararDatos();
								$state.transitionTo('matches');
							}, function(){
								dialogs.error('Asociar', 'Se ha producido un error al intentar guardar los cambios.');
							});
				});
			}
		};

		$scope.enableEdition = function(){
			if ($scope.flagEditando){
				if ($scope.acceso == 'terminal'){
					return $scope.newPrice.terminal == loginService.getFiltro();
				} else {
					return true;
				}
			} else {
				return true;
			}
		};

		//Carga la tarifa completa antes de poder editarla
		$scope.editarTarifa = function(tarifa){

			var indice = 0;
			$scope.pricelist.forEach(function(price){
				if (price.code == tarifa.code) $scope.posicionTarifa = indice;
				indice++;
			});

			priceFactory.getPriceById(tarifa._id, loginService.getFiltro(), function(success, price){
				if (success){
					$scope.newPrice = price;
					$scope.newPrice.topPrices.forEach(function(price){
						price.from = new Date(price.from);
					});
					$scope.newMatches.array = angular.copy(tarifa.matches[0].match);
					$scope.abrirNuevoConcepto('editar');
				} else {
					console.log(price);
					dialogs('Error', 'Se ha producido un error al cargar los datos de la tarifa.');
				}
			});

		};

		//Verifica que al modificar un código no coincida con otro ya existente
		var verificarEditado = function(){
			var flagCodigo = false;

			//Comparo que con los cambios hechos, no coincida el código con otra tarifa de la lista
			var listaSinCodigo = $scope.pricelist.slice();
			if ($scope.flagEditando) listaSinCodigo.splice($scope.posicionTarifa, 1);
			listaSinCodigo.forEach(function(tarifa){
				if ($scope.newPrice.code == tarifa.code){
					flagCodigo = true;
				}
				if (tarifa.matches != null && tarifa.matches.length > 0){
					tarifa.matches[0].match.forEach(function(codigo){
						if (codigo == $scope.newPrice.code){
							flagCodigo = true;
						}
					})
				}
			});

			//Si hubo coincidencia muestro mensaje de error
			if (flagCodigo){
				dialogs.error('Error', 'El código de la tarifa no puede coincidir con el de una tarifa existente.');
				return false;
			} else {
				return true;
			}
		};

		//Elimina una tarifa
		$scope.eliminarTarifa = function(){
			var dlg = dialogs.confirm('Eliminar', 'Se eliminará la tarifa, ¿confirma la operación?');
			dlg.result.then(function(){
				$scope.newPrice.removePrice()
						.then(function(response){
							if (response.status == 'OK'){
								dialogs.notify("Eliminar","La tarifa ha sido eliminada");
								$scope.prepararDatos();
								$state.transitionTo('matches');
							} else {
								dialogs.error('Asociar', 'Se ha producido un error al intentar eliminar la tarifa. ' + response.data);
							}
						}, function(response){
							dialogs.error('Asociar', 'Se ha producido un error al intentar eliminar la tarifa. ' + response.data);
						});
			})
		};

		//Borra el valor de un campo de la nueva tarifa
		$scope.eraseField = function(field){
			$scope.newPrice[field] = ''
		};

		//Descarga CSV
		$scope.descargarCSV = function(){
			var alterModel = {
				onlyRates: $scope.tasas,
				output: 'csv'
			};

			priceFactory.getMatchPricesCSV(alterModel, loginService.getFiltro(), function(data, status){
				if (status == 'OK'){
					var anchor = angular.element('<a/>');
					anchor.css({display: 'none'}); // Make sure it's not visible
					angular.element(document.body).append(anchor); // Attach to document

					anchor.attr({
						href: 'data:attachment/csv;charset=utf-8,' + encodeURI(data),
						target: '_blank',
						download: 'Asociacion_tarifario.csv'
					})[0].click();

					anchor.remove(); // Clean it up afterwards
				} else {
					dialogs.error('Asociar', 'Se ha producido un error al descargar los datos.');
				}
			})
		};

		if (loginService.getStatus()) $scope.prepararDatos();

		$scope.$on('terminoLogin', function(){
			$scope.acceso = $rootScope.esUsuario;
			$scope.nombre = loginService.getFiltro();
			$scope.prepararDatos();
		});

	}]);