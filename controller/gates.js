/**
 * Created by leo on 31/03/14.
 */
(function(){
	myapp.controller('gatesCtrl', function ($scope, gatesFactory) {

		// Fecha (dia y hora)
		$scope.fechaDesde = new Date();
		$scope.fechaHasta = new Date();
		$scope.fechaDesde.setHours(0, 0);
		$scope.fechaHasta.setMinutes(0);

		// Variable para almacenar la info principal que trae del factory
		$scope.gates = {};

		$scope.model = {
			'fechaDesde': $scope.fechaDesde,
			'fechaHasta': $scope.fechaHasta,
			'contenedor': '',
			'buque': '',
			'filtroOrden': 'gateTimestamp',
			'filtroOrdenAnterior': '',
			'filtroOrdenReverse': true,
			'order': '"gateTimestamp": -1'
		};

		$scope.$on('cambioPagina', function(event, data){
			$scope.currentPage = data;
			$scope.pageChanged();
		});

		$scope.filtrar = function(){
			$scope.cargaGates();
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
			$scope.filtrar();
		};

		// Pone estilo al horario de acuerdo si esta o no a tiempo
		$scope.colorHorario = function (gate) {
			var horarioGate = new Date(gate.gateTimestamp);
			var horarioInicio = new Date(gate.turnoInicio);
			var horarioFin = new Date(gate.turnoFin);
			if (horarioGate >= horarioInicio && horarioGate <= horarioFin) {
				return 'green'
			} else {
				return 'red'
			}
		};

		$scope.cargaGates = function (page) {
			page = page || { skip: 0, limit: $scope.itemsPerPage };
			if (page.skip == 0){ $scope.currentPage = 1}
			gatesFactory.getGate(cargaDatos(), page, function (data) {
				if (data.status === "OK") {
					$scope.gates = data.data;
					$scope.totalItems = data.totalCount;
				}
			});
		};

		$scope.pageChanged = function () {
			$scope.page.skip = (($scope.currentPage - 1) * $scope.itemsPerPage);
			$scope.cargaGates($scope.page);
		};

		function cargaDatos() {
			return {
				'fechaDesde':			$scope.model.fechaDesde,
				'fechaHasta':			$scope.model.fechaHasta,
				'contenedor':			$scope.model.contenedor,
				'buque':				$scope.model.buque,
				'order':				$scope.model.order
			};
		}

	});

	myapp.controller('gatesInvoicesCtrl', function($scope, $stateParams, invoiceFactory){
		$scope.contenedor = $stateParams.contenedor;
		$scope.filtrosGates = ['codComprobante', 'nroComprobante', 'razonSocial', 'fechaDesde', 'nroPtoVentaOrden', 'codTipoComprobOrden', 'nroComprobOrden', 'razonOrden', 'fechaOrden', 'importeOrden'];

		$scope.cargaFacturas = function(){
			var datos = { 'contenedor': $scope.contenedor };
			invoiceFactory.getInvoice(datos, { skip: 0, limit: $scope.itemsPerPage }, function (data) {
				if (data.status === 'OK') {
					$scope.invoices = data.data;
				}
			});
		};

		$scope.cargaFacturas();
	});
})();