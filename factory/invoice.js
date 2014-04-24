/**
 * Created by Diego Reyes on 3/19/14.
 */
myapp.factory('invoiceFactory', function($http, loginService){
	var factory = {};

	factory.getInvoice = function(page, callback) {
		var inserturl = serverUrl + '/invoices/' + page.skip + '/' + page.limit;
		$http({
			method: 'GET',
			url: inserturl,
			headers:
			{token: loginService.getToken()}
		}).success(function(data) {
			callback(data);
		}).error(function(response) {
			console.log(response);
			console.log("Error al cargar la lista Invoice");
		});
	};

	factory.getInvoiceByContainer = function(container, page, callback) {
		//var inserturl = serverUrl + '/invoices?contenedor=' + container; // El que se va a usar
		var inserturl = serverUrl + '/invoices/' + page.skip + '/' + page.limit;
		$http({
			method: 'GET',
			url: inserturl,
			headers:
			{token: loginService.getToken()}
		}).success(function(data) {
			callback(data);
		}).error(function(response) {
			console.log(response);
			console.log("Error al cargar la lista Invoice");
		});
	};

	factory.getByDate = function(desde, hasta, terminal, callback) {
		//Por ahora trabaja solo con un mock
		$http.get('mocks/correlativo.json')
			.success(function (data){
				callback(data);
			}).error(function(){
				console.log("Error al cargar la lista PriceList")
			});
	};

	factory.searchInvoice = function(invoice, callback){
		var inserturl = serverUrl + '/invoices?search=' + invoice; // El que se va a usar
		$http({
			method: 'GET',
			url: inserturl,
			headers:
			{token: loginService.getToken()}
		}).success(function(data) {
			callback(data);
		}).error(function(response) {
			console.log(response);
			console.log("Error al buscar Invoice");
		});
	};

	return factory;

});