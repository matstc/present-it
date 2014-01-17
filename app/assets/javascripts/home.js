app = angular.module('PresentItApp', []);
 
app.controller('PresentItController',
    ['$scope', '$rootScope', 'uploadManager', 
    function ($scope, $rootScope, uploadManager) {
    $scope.files = [];
    $scope.percentage = 0;
    $scope.error = '';

    $scope.upload = function () {
        uploadManager.upload();
    };

    $rootScope.$on('fileAdded', function (e, call) {
        $scope.error = null;
        $scope.files.push(call);
        $scope.$apply();
        $scope.upload();
    });

    $rootScope.$on('uploadProgress', function (e, call) {
        $scope.percentage = call;
        $scope.$apply();
    });

    $rootScope.$on('presentationSaved', function(e, url){
        $scope.url = url;
        $scope.files = [];
    });

    $rootScope.$on('uploadFailed', function(e, error){
        $scope.files = [];
        $scope.percentage = 0;
        $scope.error = error;
        $scope.$apply();
    });
}]);

app.factory('uploadManager', function ($rootScope) {
    var _files = [];
    return {
        add: function (file) {
            _files.push(file);
            $rootScope.$broadcast('fileAdded', file.files[0].name);
        },
        clear: function () {
            _files = [];
        },
        files: function () {
            var fileNames = [];
            $.each(_files, function (index, file) {
                fileNames.push(file.files[0].name);
            });
            return fileNames;
        },
        upload: function () {
            $.each(_files, function (index, file) {
                file.submit();
            });
            this.clear();
        },
        setProgress: function (percentage) {
            $rootScope.$broadcast('uploadProgress', percentage);
        }
    };
});

app.directive('upload', ['$rootScope', 'uploadManager', function factory($rootScope, uploadManager) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            $(element).fileupload({
                dataType: 'text',
                add: function (e, data) {
                    uploadManager.add(data);
                },
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    uploadManager.setProgress(progress);
                },
                done: function (e, data) {
                    var url = JSON.parse(data.result).url;
                    $rootScope.$broadcast('presentationSaved', url);
                    uploadManager.setProgress(0);
                }
            }).on('fileuploadfail', function(e, data){
              var error = JSON.parse(data.response().jqXHR.responseText).error;
              $rootScope.$broadcast('uploadFailed', error);
            });
        }
    };
}]);
