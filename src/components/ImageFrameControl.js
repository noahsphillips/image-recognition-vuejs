import * as axios from 'axios';

const BASE_URL = 'http://localhost:8000';

function upload(data, files) {

}

function doFileUpload(file, theFile) {
    return new Promise((resolve, reject) => {
        axios.post(`${BASE_URL}/photos/sign`, file).then((response) => {
            console.log(response);
            var theFileName = response.data.fileName;
            var uploadURL = response.data.url;
            var options = {
                headers: {
                    'Content-Type': theFile.type
                }
            };
            axios.put(response.data.signedRequest,theFile,options).then((response) => {
                doRecognition(theFileName).then(() => {
                    resolve(true)
                });
            });
        }).catch((err) => {
            resolve(false);
            console.log(err);
        });
    });
}

function doRecognition(theFileName) {
    console.log("entered dorec");
    return new Promise((resolve, reject) => {
        axios.post(`${BASE_URL}/photos/recognize`, {fileName:theFileName}).then((response) => {
            console.log(response);
            resolve(true);
        }).catch((err) => {
            resolve(false);
            console.log(err);
        });
    });
}

export { doFileUpload, upload }
