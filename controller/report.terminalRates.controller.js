/**
 * Created by kolesnikov-a on 10/05/2016.
 */

myapp.controller ('tarifasTerminalesCtrl', ['$scope', 'reportsFactory', 'loginService', 'cacheService', 'dialogs', function($scope, reportsFactory, loginService, cacheService, dialogs){

    $scope.descripciones = cacheService.cache.get('descripciones' + loginService.getFiltro());

    $scope.model = {
        tipo: 'year',
        fecha: new Date(),
        loading: false
    };

    $scope.datepickerMonth = {
        minMode: 'month',
        datepickerMode: 'month',
        maxDate: new Date()
    };

    $scope.datepickerYear = {
        minMode: 'year',
        datepickerMode: 'year',
        maxDate: new Date()
    };

    $scope.mensajeResultado = {
        titulo: 'Reporte de tarifas',
        mensaje: 'Seleccione año o mes y año y presione cargar para ver el reporte.',
        tipo: 'panel-info'
    };

    $scope.dataReporte = [];

    $scope.disableDown = false;

    $scope.search = '';

    $scope.cargarReporte = function(){
        $scope.model.loading = true;
        var param = {
            year: $scope.model.fecha.getFullYear()
        };
        if ($scope.model.tipo == 'month'){
            param.month = $scope.model.fecha.getMonth() + 1;
        }
        reportsFactory.getReporteTerminales(param, function(data){
            $scope.model.loading = false;
            if (data.status == 'OK'){
                $scope.dataReporte = data.data;
                $scope.dataReporte.forEach(function(tarifa){
                    tarifa.descripcion = angular.isDefined($scope.descripciones[tarifa.code]) ? $scope.descripciones[tarifa.code] : 'Sin definir'
                })
            } else {
                $scope.dataReporte = [];
                $scope.mensajeResultado = {
                    titulo: 'Reporte de tarifas',
                    mensaje: 'Seleccione año o mes y año y presione cargar para ver el reporte.',
                    tipo: 'panel-danger'
                };
            }
        });
    };

    $scope.descargarCSV = function(){
        $scope.disableDown = true;
        var param = {
            year: $scope.model.fecha.getFullYear()
        };
        var nombreReporte = 'Tarifas_terminales_' + loginService.getFiltro() + '_' + param.year;
        if ($scope.model.tipo == 'month'){
            param.month = $scope.model.fecha.getMonth() + 1;
            nombreReporte += '_' + param.month;
        }
        param.output = 'csv';
        nombreReporte += '.csv';

        reportsFactory.getTerminalesCSV(param, nombreReporte, function(status){
            $scope.disableDown = false;

            if (status != 'OK'){
                dialogs.error('Reportes', 'Se ha producido un error al descargar los datos.');
            }
        })
    };

}]);