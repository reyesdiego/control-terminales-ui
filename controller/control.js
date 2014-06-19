/**
 * Created by kolesnikov-a on 21/02/14.
 */

var controlCtrl = myapp.controller('ControlCtrl', function ($scope, datosGrafico, datosGraficoPorMes, datosFacturadoPorDiaTasas, datosGraficoGatesTurnosDias, controlPanelFactory, socket, formatDate){

	var fecha = formatDate.formatearFecha(new Date());

	$scope.control = {
		"invoicesCount": 0,
		"ratesCount": 0,
		"ratesTotal": 0
	};

	$scope.radioModel = 'Gates';

	$scope.chartTitle = "Datos enviados";
	$scope.chartWidth = 300;
	$scope.chartHeight = 380;
	$scope.chartData = datosGrafico;

	$scope.chartsHeight = 320;
	$scope.chartsWidth = 410;
	$scope.chartSeries = {3: {type: "line"}};

	$scope.chartTitleFacturas = "Facturado por mes";
	$scope.chartDataFacturas = datosGraficoPorMes;

	$scope.chartTitleGates = "Gates";
	$scope.chartDataGates = datosGraficoPorMes;

	$scope.chartTitleTurnos = "Turnos";
	$scope.chartDataTurnos = datosGraficoPorMes;

	$scope.chartTitleFacturadoTasas = "Total de tasa a las cargas por día";
	$scope.chartDataFacturadoTasas = datosFacturadoPorDiaTasas.dataGraf;

	$scope.chartTitleFacturado = "Facturado por día";
	$scope.chartDataFacturado = datosGraficoPorMes;

	$scope.chartTitleDiaGatesTurnos = "Cantidad por día";
	$scope.chartWidthDiaGatesTurnos = 1200;
	$scope.chartDataDiaGatesTurnos = datosGraficoGatesTurnosDias;

	$scope.isCollapsedMonth = true;
	$scope.isCollapsedDay = true;
	$scope.isCollapsedGates = true;
	$scope.isCollapsedTurnos = true;
	$scope.isCollapsedDayTasas = true;
	$scope.isCollapsedDayGatesTurnos = true;

	// Fecha (dia y hora)
	$scope.desde = new Date();
	$scope.desdeTasas = new Date();
	$scope.mesDesde = new Date($scope.desde.getFullYear() + '-' + ($scope.desde.getMonth() + 1) + '-01' );
	$scope.mesDesdeGates = new Date($scope.desde.getFullYear() + '-' + ($scope.desde.getMonth() + 1) + '-01' );
	$scope.mesDesdeTurnos = new Date($scope.desde.getFullYear() + '-' + ($scope.desde.getMonth() + 1) + '-01' );
	$scope.diaGatesTurnos = new Date();

	$scope.monthMode = 'month';
	$scope.formats = ['dd-MMMM-yyyy', 'yyyy-MM-dd', 'shortDate', 'yyyy-MM'];
	$scope.format = $scope.formats['yyyy-MM-dd'];
	$scope.formatSoloMes = $scope.formats[3];
	//Flag para mostrar los tabs con los resultados una vez recibidos los datos
	$scope.terminoCarga = false;

	$scope.control.ratesCount = 0;
	$scope.control.ratesTotal = 0;

	socket.on('invoice', function () {
		$scope.chartData[2][1]++;
		$scope.control.invoicesCount++;
	});

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

	controlPanelFactory.getByDay(fecha, function(data){
		$scope.control.invoicesCount = data.invoicesCount;
		$scope.fecha = fecha;
	});

	$scope.traerDatosFacturadoMes = function(){
		$scope.isCollapsedMonth = true;
		controlPanelFactory.getFacturasMeses($scope.mesDesde, function(graf){
			$scope.chartDataFacturas = controlCtrl.prepararDatosMes(graf);
		});
	};

	$scope.traerDatosGates = function(){
		$scope.isCollapsedGates = true;
		controlPanelFactory.getGatesMeses($scope.mesDesdeGates, function(graf){
			$scope.chartDataGates = controlCtrl.prepararDatosMes(graf);
		});
	};

	$scope.traerDatosTurnos = function(){
		$scope.isCollapsedTurnos = true;
		controlPanelFactory.getTurnosMeses($scope.mesDesdeTurnos, function(graf){
			$scope.chartDataTurnos = controlCtrl.prepararDatosMes(graf);
		});
	};

	$scope.traerDatosFacturadoDiaTasas = function(){
		$scope.isCollapsedDayTasas = true;
		controlPanelFactory.getTasas($scope.desdeTasas, function(graf){
			var result = controlCtrl.prepararDatosFacturadoDiaTasas(graf);
			$scope.chartDataFacturadoTasas = result.dataGraf;
			$scope.control.ratesCount = result.ratesCount;
			$scope.control.ratesTotal = result.ratesTotal;
		});
	};

	$scope.traerDatosFacturadoDia = function(){
		$scope.isCollapsedDay = true;
		controlPanelFactory.getFacturadoPorDia($scope.desde, function(graf){
			$scope.chartDataFacturado = controlCtrl.prepararDatosFacturadoDia(graf);
		});
	};

	$scope.traerDatosGatesTurnosDia = function(){
		$scope.isCollapsedDayGatesTurnos = true;
		if ($scope.radioModel == 'Gates'){
			controlPanelFactory.getGatesDia($scope.diaGatesTurnos, function(graf){
				$scope.chartDataDiaGatesTurnos = controlCtrl.prepararDatosGatesTurnosDia(graf);
			});
		}
		else if ($scope.radioModel == 'Turnos'){
			controlPanelFactory.getTurnosDia($scope.diaGatesTurnos, function(graf){
				$scope.chartDataDiaGatesTurnos = controlCtrl.prepararDatosGatesTurnosDia(graf);
			});
		}
	};

	$scope.traerDatosFacturadoMes();
	$scope.traerDatosGates();
	$scope.traerDatosTurnos();
	$scope.traerDatosFacturadoDiaTasas();
	$scope.traerDatosFacturadoDia();
	$scope.traerDatosGatesTurnosDia();

});

controlCtrl.prepararMatrizVacía = function($q){
	var defer = $q.defer();
	var base = [
		['Terminales', 'BACTSSA', 'Terminal 4', 'TRP', 'Promedio', { role: 'annotation'} ],
		['', 0, 0, 0, 0, ''],
		['', 0, 0, 0, 0, ''],
		['', 0, 0, 0, 0, ''],
		['', 0, 0, 0, 0, '']
	];
	defer.resolve(base);
	return defer.promise;
};

controlCtrl.prepararMatrizTasas = function($q){
	var defer = $q.defer();

	var result = {
		"ratesCount": 0,
		"ratesTotal": 0,
		"dataGraf": []
	};

	result.dataGraf = [
		['Datos', 'Facturado', { role: 'annotation' } ],
		['BACTSSA', 0, ''],
		['TERMINAL 4', 0, ''],
		['TRP', 0, '']
	];

	defer.resolve(result);
	return defer.promise;
};

controlCtrl.prepararMatrizVaciaGatesTurnos = function($q){
	var defer = $q.defer();
	var base = [
		['Terminales', 'BACTSSA', 'Terminal 4', 'TRP', 'Promedio', { role: 'annotation'} ],
		['00', 0, 0, 0, 0, ''], ['01', 0, 0, 0, 0, ''], ['02', 0, 0, 0, 0, ''], ['03', 0, 0, 0, 0, ''], ['04', 0, 0, 0, 0, ''],
		['05', 0, 0, 0, 0, ''], ['06', 0, 0, 0, 0, ''], ['07', 0, 0, 0, 0, ''], ['08', 0, 0, 0, 0, ''], ['09', 0, 0, 0, 0, ''],
		['10', 0, 0, 0, 0, ''], ['11', 0, 0, 0, 0, ''], ['12', 0, 0, 0, 0, ''], ['13', 0, 0, 0, 0, ''], ['14', 0, 0, 0, 0, ''],
		['15', 0, 0, 0, 0, ''], ['16', 0, 0, 0, 0, ''], ['17', 0, 0, 0, 0, ''], ['18', 0, 0, 0, 0, ''], ['19', 0, 0, 0, 0, ''],
		['20', 0, 0, 0, 0, ''], ['21', 0, 0, 0, 0, ''], ['22', 0, 0, 0, 0, ''], ['23', 0, 0, 0, 0, '']
	];
	defer.resolve(base);
	return defer.promise;
};

controlCtrl.primerCargaComprobantes = function(controlPanelFactory, $q){
	var defer = $q.defer();
	var fecha = new Date();
	controlPanelFactory.getTotales(fecha, function(graf){
		var base = [
//							['Datos', 'Facturas', 'Gates', 'Turnos', { role: 'annotation' } ],
			['Datos', 'Facturas', { role: 'annotation' } ],
//							['BACTSSA', 0, 0, 0, ''],
//							['TRP', 0, 0, 0, ''],
//							['TERMINAL 4', 0, 0, 0, '']
			['BACTSSA', 0, ''],
			['TRP', 0, ''],
			['TERMINAL 4', 0, '']
		];
		var i = 1;
		graf.forEach(function(terminal){
//							base[i] = [terminal.nombre, terminal.invoices, terminal.gates, terminal.turnos, ''];
//							base[i] = [terminal._id.terminal, terminal.invoicesCount, terminal.invoicesCount, terminal.invoicesCount, ''];
			base[i] = [terminal._id.terminal, terminal.cnt,''];
			i++;
		});
		defer.resolve(base);
	});
	return defer.promise;
};

controlCtrl.prepararDatosMes = function(datosGrafico){
	//Matriz base de los datos del gráfico, ver alternativa al hardcodeo de los nombres de las terminales
	var base = [
		['Terminales', 'BACTSSA', 'Terminal 4', 'TRP', 'Promedio', { role: 'annotation'} ]
	];
	//Para cambiar entre columnas
	var contarTerminal = 1;
	//Para cargar promedio
	var acum = 0;
	var meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre", "Diciembre"];
	//Los datos vienen en objetos que incluyen la fecha, la terminal, y la suma facturada(cnt)
	//ordenados por fecha, y siguiendo el orden de terminales "BACTSSA", "Terminal 4", "TRP"???????
	var flagPrimero = true;
	var fechaAnterior;
	var fila = ['', 0, 0, 0, 0, ''];
	datosGrafico.forEach(function(datosDia){
		if (flagPrimero){
			flagPrimero = false;
			fila[0] = meses[datosDia._id.month - 1] + ' del ' + datosDia._id.year;
			fechaAnterior = datosDia._id.month;
		}
		if (fechaAnterior != datosDia._id.month){
			//Al llegar a la tercer terminal cargo el promedio de ese día, meto la fila en la matriz y reseteo las columnas
			fila[4] = acum/3;
			base.push(fila.slice());
			//Meto la fila en la matriz y vuelvo a empezar
			fila = ['', 0, 0, 0, 0, ''];
			acum = 0;
			fechaAnterior = datosDia._id.month;
			fila[0] = meses[datosDia._id.month - 1] + ' del ' + datosDia._id.year;
		}
		switch (datosDia._id.terminal){
			case "BACTSSA":
				contarTerminal = 1;
				break;
			case "TERMINAL4":
				contarTerminal = 2;
				break;
			case "TRP":
				contarTerminal = 3;
				break;
		}
		fila[contarTerminal] = datosDia.cnt;
		acum += datosDia.cnt;
	});
	fila[4] = acum/3;
	base.push(fila.slice());
	//Finalmente devuelvo la matriz generada con los datos para su asignación
	return base;
};

controlCtrl.prepararDatosFacturadoDiaTasas = function(datos){
	//Matriz base de los datos del gráfico, ver alternativa al hardcodeo de los nombres de las terminales
	var base = [
		['Datos', 'Facturado', { role: 'annotation' } ],
		['BACTSSA', 0, ''],
		['TERMINAL 4', 0, ''],
		['TRP', 0, '']
	];
	//Para cambiar entre columnas
	var contarTerminal = 1;
	//Para cargar promedio
	//Los datos vienen en objetos que incluyen la terminal, y la suma facturada(cnt)
	if (datos.dataGraf.length){
		datos.dataGraf.forEach(function(datosDia){
			switch (datosDia._id.terminal){
				case "BACTSSA":
					contarTerminal = 1;
					break;
				case "TERMINAL4":
					contarTerminal = 2;
					break;
				case "TRP":
					contarTerminal = 3;
					break;
			}
			base[contarTerminal][1] = datosDia.total;
		});
	}
	datos.dataGraf = base;
	//Finalmente devuelvo la matriz generada con los datos para su asignación
	return datos;
};

controlCtrl.prepararDatosFacturadoDia = function(datosGrafico){
	//Matriz base de los datos del gráfico, ver alternativa al hardcodeo de los nombres de las terminales
	var base = [
		['Terminales', 'BACTSSA', 'Terminal 4', 'TRP', 'Promedio', { role: 'annotation'} ]
	];
	//Para cambiar entre columnas
	var contarTerminal = 1;
	//Para cargar promedio
	var acum = 0;
	var fila = ['', 0, 0, 0, 0, ''];
	var flagPrimero = true;
	var fechaAnterior;
	//Los datos vienen en objetos que incluyen la fecha, la terminal, y la suma facturada(cnt)
	//ordenados por fecha
	datosGrafico.forEach(function(datosDia){
		if (flagPrimero){
			//Primera iteración, cargo el día y lo establezco como fecha para comparar
			fila[0] = datosDia._id.day + '/' + datosDia._id.month + '/' + datosDia._id.year;
			fechaAnterior = datosDia._id.day;
			flagPrimero = false;
		}
		if (fechaAnterior != datosDia._id.day){
			//Al haber un cambio en la fecha cargo el promedio de ese día, avanzo una fila y reseteo las columnas
			fila[4] = acum/3;
			base.push(fila.slice());
			//Meto la fila en la matriz y vuelvo a empezar
			fila = ['', 0, 0, 0, 0, ''];
			fechaAnterior = datosDia._id.day;
			fila[0] = datosDia._id.day + '/' + datosDia._id.month + '/' + datosDia._id.year;
			acum = 0;
		}
		switch (datosDia._id.terminal){
			case "BACTSSA":
				contarTerminal = 1;
				break;
			case "TERMINAL4":
				contarTerminal = 2;
				break;
			case "TRP":
				contarTerminal = 3;
				break;
		}
		fila[contarTerminal] = datosDia.cnt;
		acum += datosDia.cnt;
	});
	//Meto la última fila generada
	fila[4] = acum/3;
	base.push(fila.slice());
	//Finalmente devuelvo la matriz generada con los datos para su asignación
	return base;
};

controlCtrl.prepararDatosGatesTurnosDia = function(datosGrafico){
	var matAux = [];
	matAux[0] = ['Terminales', 'BACTSSA', 'Terminal 4', 'TRP', 'Promedio', { role: 'annotation'} ];
	for (var i = 0; i <= 23; i++){
		if (i<10){
			matAux[i+1] = ['0' + i, 0, 0, 0, 0, ''];
		}
		else{
			matAux[i+1] = [i, 0, 0, 0, 0, ''];
		}
	}
	datosGrafico.forEach(function(datosDia){
		switch (datosDia._id.terminal){
			case "BACTSSA":
				matAux[datosDia._id.hour+1][1] = datosDia.cnt;
				break;
			case "TERMINAL4":
				matAux[datosDia._id.hour+1][2] = datosDia.cnt;
				break;
			case "TRP":
				matAux[datosDia._id.hour+1][3] = datosDia.cnt;
				break;
		}
	});
	for (var e = 0; e <= 23; e++){
		matAux[e+1][4] = (matAux[e+1][1] + matAux[e+1][2] + matAux[e+1][3]) / 3;
	}
	return matAux;
};