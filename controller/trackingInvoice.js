/**
 * Created by artiom on 03/09/14.
 */

function trackingInvoiceCtrl($scope, $modalInstance, estado, track, states) {

	$scope.states = states;

	$scope.interfazModal = {
		titulo: '',
		tipoModal: '',
		comentario: '',
		btnEstado: '',
		estado: '',
		divCuerpo: '',
		nuevoEstado: ''
	};

	$scope.tracking = track.data;
	$scope.estado = estado;
	$scope.interfazModal.nuevoEstado = estado;

	switch ($scope.estado.type){
		case 'UNKNOWN':
			$scope.interfazModal.tipoModal = 'bg-info';
			$scope.interfazModal.btnEstado = 'btn-info';
			$scope.interfazModal.divCuerpo = 'bg-info';
			break;
		case 'OK':
			$scope.interfazModal.tipoModal = 'bg-success';
			$scope.interfazModal.btnEstado = 'btn-success';
			$scope.interfazModal.divCuerpo = 'bg-success';
			break;
		case 'ERROR':
			$scope.interfazModal.tipoModal = 'bg-danger';
			$scope.interfazModal.btnEstado = 'btn-danger';
			$scope.interfazModal.divCuerpo = 'bg-danger';
			break;
		case 'WARN':
			$scope.interfazModal.tipoModal = 'bg-danger';
			$scope.interfazModal.btnEstado = 'btn-danger';
			$scope.interfazModal.divCuerpo = 'bg-danger';
			break;
	}

	$scope.interfazModal.titulo = 'Estado: ' + $scope.estado.description;
	$scope.interfazModal.estado = $scope.estado.description;

	$scope.trackInvoice = function(estado){
		$scope.interfazModal.nuevoEstado = estado;

		var btnClass = '';
		var cuerpoClass = '';
		if (estado.type === 'ERROR'){
			btnClass = 'btn-danger';
			cuerpoClass = 'bg-danger';
		} else if (estado.type === 'WARN'){
			btnClass = 'btn-warning';
			cuerpoClass = 'bg-warning';
		}
		else if (estado.type === 'OK'){
			btnClass = 'btn-success';
			cuerpoClass = 'bg-success';
		}
		else if (estado.type === 'UNKNOWN') {
			btnClass = 'btn-warning';
			cuerpoClass = 'bg-warning';
		}
		$scope.interfazModal.btnEstado = btnClass;
		$scope.interfazModal.estado = estado.description;
		$scope.interfazModal.divCuerpo = cuerpoClass;
	};

	$scope.guardar = function () {
		if ($scope.interfazModal.comentario == '' && $scope.interfazModal.nuevoEstado == $scope.estado){
			$scope.cancelar();
		} else {
			var commentData = {
				title: 'Nuevo estado: ' + $scope.interfazModal.estado,
				comment: $scope.interfazModal.comentario,
				newState: $scope.interfazModal.nuevoEstado
			};
			if ($scope.interfazModal.nuevoEstado._id == $scope.estado){
				commentData.title = $scope.interfazModal.estado
			}
			$modalInstance.close(commentData);
		}
	};

	$scope.cancelar = function () {
		$modalInstance.dismiss('cancel');
	};
}