/**
 * Created by artiom on 13/07/15.
 */
myapp.factory('liquidacionesFactory', ['$http', 'loginService', 'formatService', function($http, loginService, formatService){

	var factory = {};

	factory.getComprobantesLiquidar = function(page, datos, callback){
		var inserturl = serverUrl + '/paying/notPayed/' + loginService.getFiltro() + '/' + page.skip + '/' + page.limit;
		$http.get(inserturl, { params: formatService.formatearDatos(datos) })
			.success(function(data){
				console.log(data);
				callback(data);
			}).error(function(error){
				if (error == null){
					error = {
						status: 'ERROR'
					}
				}
				callback(error);
			})
	};

	factory.getComprobantesLiquidados = function(datos, callback){

	};

	factory.payAll = function(data, callback){
		console.log(data);
		var inserturl = serverUrl + '/paying/setPayment/' + loginService.getFiltro();
		$http.post(inserturl, data)
			.success(function(data){
				callback(data);
			}).error(function(error){
				if (error == null){
					error = {
						status: 'ERROR'
					}
				}
				callback(error);
			})
	};

	return factory;

}]);