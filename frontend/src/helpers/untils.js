export function getParams(location) {
    var params = {};
    var search = location.substring(1); // Exclude the "?" character

    if (search) {
        var paramPairs = search.split('&');

        for (var i = 0; i < paramPairs.length; i++) {
            var pair = paramPairs[i].split('=');
            var key = decodeURIComponent(pair[0]);
            var value = decodeURIComponent(pair[1] || '');

            // If the key already exists, convert it to an array
            if (params[key]) {
                if (!Array.isArray(params[key])) {
                    params[key] = [params[key]];
                }
                params[key].push(value);
            } else {
                params[key] = value;
            }
        }
    }

    return params;
}

export function convertToUrlParams(obj) {
    var params = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var value = obj[key];
            var encodedKey = encodeURIComponent(key);
            var encodedValue = encodeURIComponent(value);
            params.push(encodedKey + '=' + encodedValue);
        }
    }

    return params.join('&');
}