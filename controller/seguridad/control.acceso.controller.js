/**
 * Created by artiom on 13/05/15.
 */

myapp.controller('accessControlCtrl', ['$scope', 'ctrlUsersFactory', 'dialogs', '$q', 'loginService', '$filter', 'generalFunctions', function($scope, ctrlUsersFactory, dialogs, $q, loginService, $filter, generalFunctions){

	$scope.permiso = false;
	$scope.panelMensaje = {
		tipo: 'panel-info',
		titulo: 'Control de usuarios',
		mensaje: 'No posee permisos para requerir estos datos.'
	};

	$scope.searchUser = '';

	$scope.$on('errorInesperado', function(e, mensaje){
		$scope.cargaRutas = false;
		$scope.panelMensaje = mensaje;
		$scope.permiso = false;
	});

	$scope.usuarios = [];
	$scope.tareas = [];
	$scope.cargaRutas = true;
	$scope.usuarioElegido = undefined;

	$scope.currentPageGeneral = 1;
	$scope.currentPageAGP = 1;
	$scope.itemsPerPage = 10;

	$scope.rutasUsuarioOriginal = [];

	$scope.notificacionesUsuarioOriginal = [];

	$scope.modo = 'tareas';

	$scope.activeTab = 0;

	$scope.notificaciones = [
		//{ description: 'Nuevo usuario', habilitar: false},
		{ description: 'Nueva tarifa', habilitar: false, valor: 'price', mostrar: ''},
		//{ description: 'Baja del servicio', habilitar: false}
		{ description: 'Enviar mail a cliente por nuevo turno', habilitar: false, valor: 'emailAppointmentToApp', mostrar: 'terminal'},
		//{ description: 'Último comprobante', habilitar: false, valor: 'lastInvoice', mostrar: 'Diego Reyes'}
		{ description: 'Errores en turnos', habilitar: false, valor: 'appointmentError', mostrar: 'terminal'}
	];

	ctrlUsersFactory.getUsers(function(data){
		if (data.status == 'OK'){
			$scope.permiso = true;
			$scope.usuarios = data.data;
			ctrlUsersFactory.getRoutes(function(data){
				if (data.status == 'OK'){
					$scope.tareas = $filter('orderBy')(data.data, 'route');
				} else {
					$scope.panelMensaje.mensaje = 'Se ha producido un error al cargar el listado de tareas.';
					$scope.panelMensaje.tipo = 'panel-danger';
					$scope.usuarios = [];
					$scope.tareas = [];
				}
				$scope.cargaRutas = false;
			})
		}
	});

	$scope.cambioModo = function(modo, tab){
		$scope.modo = modo;
		$scope.activeTab = tab
	};

	$scope.chequearRuta = function(ruta){
		const partesRuta = ruta.route.split('.');
		if (!ruta.acceso){
			quitarHijos(ruta);
			quitarPadres(ruta.route);
		} else {
			if (partesRuta.length > 1){
				let rutaPadre;
				rutaPadre = partesRuta[0];
				if (partesRuta.length > 2){
					rutaPadre += '.' + partesRuta[1];
				}
				agregarPadres(rutaPadre);
			}
			agregarHijos(ruta.route);
		}
	};

	function agregarPadres(ruta){
		$scope.tareas.forEach((unaTarea) => {
			if (unaTarea.route == ruta) unaTarea.acceso = true
		});

		const partesRuta = ruta.split('.');
		if (partesRuta.length > 1){
			const rutaPadre = partesRuta[0];
			agregarPadres(rutaPadre);
		}
	}

	function quitarPadres(ruta){
		const partesRuta = ruta.split('.');
		if (partesRuta.length > 1){
			let rutaPadre;
			rutaPadre = partesRuta[0];
			for (let i=1; i < partesRuta.length - 1; i++){
				rutaPadre += '.' + partesRuta[1];
			}
			let hijosHabilitados = false;
			$scope.tareas.forEach((unaTarea) => {
				if (unaTarea.route.indexOf(rutaPadre + '.') >= 0 && unaTarea.acceso) hijosHabilitados = true;
			});
			if (!hijosHabilitados) {
				$scope.tareas.forEach((unaTarea) => {
					if (unaTarea.route == rutaPadre) unaTarea.acceso = false;
				})
			}
			quitarPadres(rutaPadre);
		}
	}

	function quitarHijos(ruta){
		$scope.tareas.forEach((unaTarea) => {
			if (unaTarea.route.indexOf(ruta.route + '.') >= 0) unaTarea.acceso = false;
		});
	}

	function agregarHijos(ruta){
		let hijoHabilitado = false;
		let rutaHija = '';
		$scope.tareas.forEach((unaTarea) => {
			if (unaTarea.route.indexOf(ruta + '.') >= 0 && unaTarea.acceso) hijoHabilitado = true;
		});
		if (!hijoHabilitado){
			$scope.tareas.forEach((unaTarea) => {
				if (unaTarea.route.indexOf(ruta + '.') >= 0 && !hijoHabilitado){
					rutaHija = unaTarea.route;
					unaTarea.acceso = true;
					hijoHabilitado = true;
				}
			})
		}
		if (hijoHabilitado) agregarHijos(rutaHija);
	}

	$scope.userSelected = function(usuario){
		if (angular.isDefined($scope.usuarioElegido) && $scope.usuarioElegido.full_name != usuario.full_name){
			$scope.guardar().then(function(){
				$scope.usuarioElegido.elegido = '';
				setearUsuario(usuario);
			});
		} else {
			setearUsuario(usuario);
		}
	};

	function setearUsuario(usuario){
		if (angular.isDefined($scope.usuarioElegido)) $scope.usuarioElegido.elegido = '';
		$scope.usuarioElegido = usuario;
		usuario.elegido = 'bg-info';
		angular.copy(usuario.acceso, $scope.rutasUsuarioOriginal);
		angular.copy(usuario.emailToApp, $scope.notificacionesUsuarioOriginal);
		$scope.tareas.forEach((tarea) => {
			tarea.acceso = generalFunctions.in_array(tarea.route, usuario.acceso);
		});
		$scope.notificaciones.forEach((notif) => {
			//notif.habilitar = generalFunctions.in_array(notif.valor, usuario.emailToApp);
			notif.habilitar = usuario.emailToApp[notif.valor]
		});
		$scope.usuarioElegido.resetData();
		$scope.cambioModo('tareas', 0);
	}

	$scope.guardar = function(){
		const deferred = $q.defer();
		$scope.tareas.forEach((unaTarea) => {
			if (unaTarea.acceso) $scope.usuarioElegido.tareasNuevas.push(unaTarea.route);
		});
		$scope.notificaciones.forEach((notif) => {
			if (notif.habilitar) $scope.usuarioElegido.notificacionesNuevas[notif.valor] = notif.habilitar;
		});
		if ($scope.usuarioElegido.tieneCambiosTareas || $scope.usuarioElegido.tieneCambiosNotificaciones){
			const dlg = dialogs.confirm("Control de acceso", `¿Desea guardar los cambios efectuados para el usuario ${$scope.usuarioElegido.full_name}?`);
			dlg.result.then(() => {
				$scope.usuarioElegido.guardarTareasNotificaciones().then(() => {
					dialogs.notify('Control de acceso', `La configuración para el usuario ${$scope.usuarioElegido.full_name} se ha guardado correctamente.'`);
					deferred.resolve();
				}).catch((error) => {
					dialogs.error('Control de acceso', `${error} Inténtelo nuevamente más tarde.`);
					deferred.reject();
				});
			}).catch(() => {
				$scope.usuarioElegido.resetData();
				deferred.resolve();
			});
		} else {
			$scope.usuarioElegido.resetData();
			deferred.resolve()
		}
		return deferred.promise;
	};
}]);
