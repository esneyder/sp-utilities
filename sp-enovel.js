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
    const response = null;
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
    const response = null;
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
    const response = null;
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
            const url = getUrlUpload(listName, id, file);
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
