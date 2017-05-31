/**
 * Maintenance operations
 *  
 */

//Query without search parameters
function getData(listName) {
    var dataResults;
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + getUrl(listName),
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (data) {
            dataResults = data.d.results;
        },
        error: function (error) {
            alert(JSON.stringify(error));
        }
    });
    return dataResults;
}
//Query with search parameters
function getDataQuery(listName, query) {
    var dataResults;
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + getUrlQuery(listName, query),
        type: "GET",
        headers: {
            "accept": "application/json;odata=verbose",
        },
        success: function (data) {
            dataResults = data.d.results;
        },
        error: function (error) {
            alert(JSON.stringify(error));
        }
    });
    return dataResults;
}
//Creating a new registry element
function addData(listName, data) {
    var response = null;
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + getUrl(listName),
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "content-Type": "application/json;odata=verbose"
        },
        data: JSON.stringify(data),
        success: function (data) {
            response = data;
        },
        error: function (error) {
            alert(JSON.stringify(error));
        }
    });
    return response;
}
//Updating an item in the list
function updateData(listName, oldItem, newItem) {
    var response = null;
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + getUrl(listName),
        type: "PATCH",
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "content-Type": "application/json;odata=verbose",
            "X-Http-Method": "PATCH",
            "If-Match": oldItem.__metadata.etag
        },
        data: JSON.stringify(newItem),
        success: function (data) {
            response = data;
        },
        error: function (error) {
            alert(JSON.stringify(error));
        }
    });
    return response;
}
//Deleting record in the list
function deleteData(listName, oldItem) {
    var response = null;
    $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + getUrl(listName),
        type: "DELETE",
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "If-Match": oldItem.__metadata.etag
        },
        success: function (data) {
            response = data;
        },
        error: function (error) {
            alert(JSON.stringify(error));
        }
    });
    return response;
}

/*
*upload file
*/
function uploadFile(listName, listId, fileName, file) {
    uploadFileSP(urlProject, listName, listId, fileName, file)
        .then(
        function (files) {
            //msg
        },
        function (sender, args) {
            alert(args.get_message());
        }
        );
}

function uploadFileSP(urlProject, listName, id, fileName, file) {
    var deferred = $.Deferred();
    getFileBuffer(file).then(
        function (buffer) {
            var bytes = new Uint8Array(buffer);
            var content = new SP.Base64EncodedByteArray();
            var binary = '';
            for (var b = 0; b < bytes.length; b++) {
                binary += String.fromCharCode(bytes[b]);
            }
            var url = getUrlUpload(listName, id, file);
            var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
            $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
                var createitem = new SP.RequestExecutor(urlProject);
                createitem.executeAsync({
                    url: url,
                    method: "POST",
                    binaryStringRequestBody: true,
                    body: binary,
                    success: fsucc,
                    error: ferr,
                    state: "Update"
                });

                function fsucc(dataAdjunto) {
                    window.location.replace(urlProject);
                }

                function ferr(dataAdjunto) {
                    alert('error\n\n' + dataAdjunto.statusText + "\n\n" + dataAdjunto.responseText);
                }
            });
        },
        function (err) {
            deferred.reject(err);
        }
    );
    return deferred.promise();
}

function getFileBuffer(file) {
    var deferred = $.Deferred();
    var reader = new FileReader();
    reader.onload = function (e) {
        deferred.resolve(e.target.result);
    }
    reader.onerror = function (e) {
        deferred.reject(e.target.error);
    }
    reader.readAsArrayBuffer(file);
    return deferred.promise();
}
//get query string params
function GetQueryStringParams(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}
//get context from list
function getContext(listName) {

    var response = null;
    jQuery.ajax({
        url: listName + "/_api/contextinfo",
        type: "POST",
        async: false,
        headers: { "Accept": "application/json;odata=verbose" },

        success: function (data) {
            response = data.d.GetContextWebInformation.FormDigestValue;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
    return response;
}


/*
 *Internal methods 
*/
//create route from project
function getUrl(listName) {
    return "/_api/Web/Lists/GetByTitle('" + listName + "')/Items";
}
function getUrlUpload(listName, id, file) {
    return "/_api/web/lists/GetByTitle('" + listName + "')/items(" + id + ")/AttachmentFiles/add(FileName='" + file.name + "')";
}
function getUrlQuery(listName, query) {
    return "/_api/Web/Lists/GetByTitle('" + listName + "')/Items?" + query;
}

/**
 * validate input form
 */
function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(myForm.emailAddr.value)) {
        return (true)
    }
    return (false)
}
function getDateTime(date) {
    now = date;
    year = "" + now.getFullYear();
    month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}
function isCheck(inputtx) {
    if (inputtx.value.length == 0) {
        return false;
    }
    return true;
}
function isEmpty(str) {
    return !str.replace(/^\s+/g, '').length; // boolean (`true` if field is empty)
}