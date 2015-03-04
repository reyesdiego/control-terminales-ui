/**
 * Created by artiom on 02/10/14.
 */
(function() {

	myapp.controller('reporteHorariosCtrl', function($scope, reportsFactory, invoiceFactory, vouchersFactory, priceFactory, gatesFactory, loginService, dialogs, $state){

		$scope.fechaInicio = new Date();
		$scope.fechaFin = new Date();
		$scope.fechaInicio.setHours(0, 0);
		$scope.fechaFin.setMinutes(0);
		$scope.maxDate = new Date();

		$scope.loadingReportGates = false;

		$scope.model = {
			'fechaInicio': $scope.fechaInicio,
			'fechaFin': $scope.fechaFin,
			'contenedor': '',
			'buque': '',
			'order': '"gateTimestamp":-1'
		};

		$scope.datosReporteGates = {
			'gatesTotal': 0,
			'gatesEarly': 0,
			'gatesLate': 0,
			'gatesOk': 0
		};

		$scope.tarifasElegidas = 1;

		$scope.filtrar = function (filtro, contenido) {
			switch (filtro) {
				case 'contenedor':
					$scope.model.contenedor = contenido;
					break;
				case 'buque':
					$scope.model.buque = contenido;
					break;
			}
			$scope.cargarReporteHorarios();
		};

		$scope.maxDate = new Date();

		vouchersFactory.getVouchersType(function(data){
			$scope.comprobantesTipos = data.data;
		});

		$scope.tablaGrafico = [];

		$scope.barColors = {
			"bactssa":$scope.colorBactssa,
			"terminal4": $scope.colorTerminal4,
			"trp": $scope.colorTrp
		};
		$scope.chartSeries = {3: {type: "line"}};

		$scope.columnChart = 'column';
		$scope.pieChart = 'pie';

		$scope.chartTitleBarrasHorarios = "Detalle cumplimiento de turnos";
		$scope.chartWidthBarrasHorarios = 500;
		$scope.chartHeightBarrasHorarios = 400;

		$scope.chartDataBarras = [];

		$scope.chartTitleTortaHorarios = "Porcentaje";
		$scope.chartWidthTortaHorarios = 550;
		$scope.chartHeightTortaHorarios = 530;

		$scope.chartDataTorta = [];

		$scope.hasta = new Date();
		$scope.desde = new Date($scope.hasta.getFullYear(), $scope.hasta.getMonth());
		$scope.mesDesdeHorarios = new Date($scope.hasta.getFullYear() + '-' + ($scope.hasta.getMonth() + 1) + '-01' );

		$scope.monthMode = 'month';
		$scope.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'shortDate', 'yyyy-MM'];
		$scope.format = $scope.formats['yyyy-MM-dd'];
		$scope.formatSoloMes = $scope.formats[3];
		$scope.terminoCarga = false;
		$scope.tipoComprobante = "0";

		$scope.isCollapsedDesde = true;
		$scope.isCollapsedHasta = true;

		$scope.deleteRow = function (index) {
			$scope.chartData.splice(index, 1);
		};
		$scope.addRow = function () {
			$scope.chartData.push([]);
		};
		$scope.selectRow = function (index) {
			$scope.selected = index;
		};
		$scope.rowClass = function (index) {
			return ($scope.selected === index) ? "selected" : "";
		};

		$scope.cargaPorFiltros = function () {
			$scope.cargarReporteHorarios();
		};

		$scope.cargarReporteHorarios = function(){
			if ($state.current.name == 'reports'){
				console.log($state.current.name);
				$scope.loadingReportGates = true;
				gatesFactory.getReporteHorarios(cargaDatos(), function(data){
					$scope.datosReporteGates = data.data;
					var graficoBarra = [
						['Turnos', 'Cantidad', { role: 'annotation' } ],
						['Tardes', 0, ''],
						['Antes de turno', 0, ''],
						['En horario', 0, '']
					];
					var graficoTorta = [
						['Tardes', 0],
						['Antes de turno', 0],
						['En horario', 0]
					];
					graficoBarra[1][1] = $scope.datosReporteGates.gatesLate;
					graficoBarra[2][1] = $scope.datosReporteGates.gatesEarly;
					graficoBarra[3][1] = $scope.datosReporteGates.gatesOk;

					graficoTorta[0][1] = $scope.datosReporteGates.gatesLate;
					graficoTorta[1][1] = $scope.datosReporteGates.gatesEarly;
					graficoTorta[2][1] = $scope.datosReporteGates.gatesOk;

					$scope.chartDataBarras = graficoBarra.slice();
					$scope.chartDataTorta = graficoTorta.slice();
					$scope.loadingReportGates = false;
				});
			}
		};

		$scope.buqueSelected = function (selected) {
			if (angular.isDefined(selected)) {
				$scope.model.buque = selected.title;
				$scope.filtrar('buque', selected.title);
			}
		};

		$scope.containerSelected = function (selected) {
			if (angular.isDefined(selected)) {
				$scope.model.contenedor = selected.title;
				$scope.filtrar('contenedor', selected.title);
			}
		};

		$scope.filtrado = function (filtro, contenido) {
			$scope.filtrar(filtro, contenido);
		};

		function cargaDatos() {
			return {
				'fechaInicio': $scope.model.fechaInicio,
				'fechaFin': $scope.model.fechaFin,
				'contenedor': $scope.model.contenedor,
				'buque': $scope.model.buque,
				'order': $scope.model.order
			};
		}

	});

})();
