(function(){
    'use strict';

    angular
        .module('starter.o2rUiBindingCreator')
        .directive('o2rUiBindingCreator', o2rUiBindingCreator);
    
    o2rUiBindingCreator.$inject = ["$log", "$window", "$document", "$http", "env"];
    function o2rUiBindingCreator($log, $window, $document, $http, env){
        return{
            restrict: 'E',
            scope: {
                codefiles: '@o2rCodefiles' 
            },
            templateUrl: 'app/o2rUiBindingCreator/o2rUiBindingCreator.template.html',
            link: link
        };

        function link(scope, element, attrs){
            var logger = $log.getInstance('o2rUiBindingCreator');
            var lines;
            var codeText;
            var selectedLinesIndex = [];
            // turn string into array and then add actual path
            // NOTE: Remove the prepareCodefiles wrappe as soon as the paths are consistent
            scope.codefiles = prepareCodefiles(angular.fromJson(scope.codefiles));
            scope.codefile = {path: scope.codefiles[0]}; //only use first codefile so far
            scope.figures = ["Figure 1", "Figure 2", "Figure 3", "Figure 4", "Figure 5"];
            scope.step3Done = step3Done;
            scope.step5Done = step5Done;
            scope.updateSelection = updateSelection;
            scope.updateValue = updateValue;

            scope.steps = {};
            scope.steps.step1 = {};
            scope.steps.step2 = {};
            scope.steps.step3 = {};
            scope.steps.step4 = {};
            scope.steps.step5 = {};

            scope.steps.step1.show = true;
            scope.steps.step2.show = false;
            scope.steps.step3.show = false;
            scope.steps.step4.show = false;
            scope.steps.step5.show = false;

            scope.steps.step1.options = [{text: "Change a variable", value:0}, {text: "other", value: 1}];
            scope.steps.step1.selected = null;

            scope.steps.step2.options = [{text: "Slider", value:0}, {text: "Switch", value:1}];
            scope.steps.step2.selected = null;

            scope.steps.step4.result = {};
            scope.steps.step4.result.show = false;

            scope.$watch('steps.step1.selected', function(newVal, oldVal){
                if(typeof newVal === 'number'){
                    switch (newVal) {
                        case 0:
                            scope.steps.step2.show = true;
                            break;
                        default:
                            break;
                    }
                }
            });

            scope.$watch('steps.step2.selected', function(newVal, oldVal){
                if(typeof newVal === 'number'){
                    switch (newVal) {
                        case 0:
                            scope.steps.step3.show = true;
                            scope.steps.step5.type = newVal;
                    }
                }
            });

            scope.$watch('codefile', function(newVal, oldVal){
                $http.get(newVal.path)
                    .then(function(response){
                        codeText = removeCarriage(response.data);
                    })
                    .catch(function(err){
                        logger.error(err);
                    });
            });

            //////////////////

            function prepareCodefiles(files){
                for(var i in files){
                    var parts = files[i].split('/');
                    var result = '';
                    for(var j in parts){
                        if(j==0) result += env.api + '/compendium/' + parts[j] + '/data/data';
                        else result += '/' + parts[j];
                    }
                    files[i] = result;
                }
                return files;
            }

            function updateSelection(){
                // only check selection if we are in step 3
                if(scope.steps.step3.show && !scope.steps.step4.show){

                    var selection = $window.getSelection().toString();
                    if(selection.length != 0){ //clicking creates empty selection. This should not be considered

                        var selectionLines = selection.split("\n");
                        var inverseSelection = codeText.split(selection);
                        var pre = inverseSelection[0].split("\n");
                        var selectionEndLine = pre.length + selectionLines.length -1;
                        
                        if(selectionLines[selectionLines.length -1] == ""){
                            selectionEndLine -= 1;
                            logger.info('empty string at end');
                        }
                        var result = {
                            start: pre.length,
                            end: selectionEndLine
                        };
                        selectedLinesIndex.push(result);
                        logger.info(selectedLinesIndex);
                    }
                }
            }


            function step3Done(){
                logger.info(selectedLinesIndex);
                scope.steps.step4.show = true;
            }

            function updateValue(){
                var selection = $window.getSelection().toString();
                logger.info(selection);
                var value = parseFloat(selection);
                if(isNaN(value)){
                    throw "Value not a number";
                } else {
                    scope.steps.step4.result.value = value;
                    scope.steps.step4.result.show = true;
                    scope.steps.step5.show = true;
                }
            }

            function step5Done(){

            }

            function removeCarriage(text){
                var noR = text.split("\r");
                var newtext = "";
                for(var i in noR){
                    newtext += noR[i];
                }
                logger.info('removed carriage');
                return newtext;
            }

        }
    }
})();