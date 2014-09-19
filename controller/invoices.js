/**
 * Created by Diego Reyes on 2/3/14.
*/
(function(){
	myapp.controller('invoicesCtrl', function($scope, invoiceFactory, loginService){

		// Fecha (dia y hora)
		$scope.fechaDesde = new Date();
		$scope.fechaHasta = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

		// Puntos de Ventas
		$scope.todosLosPuntosDeVentas = [];

		$scope.model = {
			'nroPtoVenta': '',
			'codTipoComprob': 0,
			'nroComprobante': '',
			'razonSocial': '',
			'documentoCliente': '',
			'fechaDesde': $scope.fechaDesde,
			'fechaHasta': $scope.fechaHasta,
			'contenedor': '',
			'buque': '',
			'estado': 'N',
			'codigo': '',
			'filtroOrden': 'gateTimestamp',
			'filtroOrdenAnterior': '',
			'filtroOrdenReverse': false,
			'order': ''
		};

		$scope.comprobantesVistos = [];

		$scope.nombre = loginService.getFiltro();

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
				$scope.cargaFacturas();
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
				$scope.cargaFacturas();
			})
		};

		$scope.filtrar = function(filtro, contenido){
			switch (filtro) {
				case 'codigo':
					$scope.model.codigo = contenido;
					break;
			}
			$scope.cargaPuntosDeVenta();
		};

		$scope.pageChanged = function(){
			$scope.page.skip = (($scope.currentPage - 1) * $scope.itemsPerPage);
			$scope.cargaFacturas($scope.page);
		};

		$scope.cargaFacturas = function(page){
			page = page || { skip:0, limit: $scope.itemsPerPage };
			if (page.skip == 0){ $scope.currentPage = 1}
			invoiceFactory.getInvoice(cargaDatos(), page, function(data){
				if(data.status === 'OK'){
					$scope.invoices = data.data;
					$scope.totalItems = data.totalCount;
				}
			});
		};

		$scope.mostrarDetalle = function(comprobante){
			var encontrado = false;
			$scope.comprobantesVistos.forEach(function(unComprobante){
				if (unComprobante._id == comprobante._id){
					encontrado = true;
				}
			});
			if (!encontrado){
				$scope.comprobantesVistos.push(comprobante);
			}
			$scope.verDetalle = comprobante;
		};

		function cargaDatos(){
			return {
				'nroPtoVenta':		$scope.model.nroPtoVenta,
				'codTipoComprob':	$scope.model.codTipoComprob,
				'nroComprobante':	$scope.model.nroComprobante,
				'razonSocial':		$scope.model.razonSocial,
				'documentoCliente':	$scope.model.documentoCliente,
				'estado':			$scope.model.estado,
				'fechaDesde':		$scope.model.fechaDesde,
				'fechaHasta':		$scope.model.fechaHasta,
				'contenedor':		$scope.model.contenedor,
				'buque':			$scope.model.buque,
				'codigo':			$scope.model.codigo,
				'order':			$scope.model.order
			};
		}

		function cargaDatosSinPtoVenta(){
			var datos = cargaDatos();
			datos.nroPtoVenta = '';
			return datos;
		}

		$scope.cargaTodosLosPuntosDeVentas();

	});
})();