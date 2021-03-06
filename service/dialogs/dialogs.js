/**
 * Created by kolesnikov-a on 26/04/2016.
 */
myapp.service('dialogs', ['$uibModal', function($uibModal){

    return {
        confirm: function(title, message){
            return $uibModal.open({
                controller: 'dialogsCtrl',
                templateUrl: './service/dialogs/confirm.html',
                resolve: {
                    title: function(){
                        return title;
                    },
                    message: function(){
                        return message;
                    }
                }
            })
        },
        error: function(title, message){
            return $uibModal.open({
                controller: 'dialogsCtrl',
                templateUrl: './service/dialogs/error.html',
                resolve: {
                    title: function(){
                        return title;
                    },
                    message: function(){
                        return message;
                    }
                }
            })
        },
        notify: function(title, message){
            return $uibModal.open({
                controller: 'dialogsCtrl',
                templateUrl: './service/dialogs/notify.html',
                resolve: {
                    title: function(){
                        return title
                    },
                    message: function(){
                        return message
                    }
                }
            })
        },
        login: function(){
            return $uibModal.open({
                controller: 'loginDialogCtrl',
                templateUrl: './service/dialogs/login.html',
                backdrop: 'static'
            })
        }
    }

}]);

myapp.controller('dialogsCtrl', ['$scope', '$uibModalInstance', 'title', 'message', function($scope, $uibModalInstance, title, message){

    $scope.modalData = {
        title: title,
        message: message
    };

    //console.log($scope.modalData);

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);

myapp.controller('loginDialogCtrl', ['$scope', '$uibModalInstance',  'Session', function($scope, $uibModalInstance, Session){

    $scope.user = Session;

    $scope.login = function(){
        $scope.user.login().then((response) => {
            $uibModalInstance.close(response);
        }, (error) => {

        });
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    }


}]);