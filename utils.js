'use strict';

function arraysEqual(arr1, arr2) {
    if (arr1 === arr2) { return true; }
    if (arr1 === null || arr2 === null) { return false; }
    if (arr1.length !== arr2.length) { return false; }

    for (var i = 0; i < arr1.length; ++i) {
        if (arr1[i] !== arr2[i]) { return false; }
    }

    return true;
}

function needInject(parameters) {
    var skipRules = [
        [],
        ['req'],
        ['req', 'res'],
        ['req', 'res', 'next'],
        ['err', 'req', 'res', 'next'],
        ['error', 'req', 'res', 'next']
    ];
    for (var i = 0; i < skipRules.length; ++i) {
        if (arraysEqual(skipRules[i], parameters)) {
            return false;
        }
    }
    return true;
}

exports.needInject = needInject;
