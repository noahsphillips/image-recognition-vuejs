<template lang="html">
    <section id="app_wrapper">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <form enctype="multipart/form-data" novalidate>
                        <h1>Upload an Image</h1>
                        <div class="dropbox">
                            <input type="file" multiple accept="image/*" @change="inputChange" class="input-file">
                            <p>
                                Drag an image here to begin to analyze
                            </p>
                        </div>
                    </form>
                </div>
                <div class="col-md-6">
                    Uploaded Images:
                    {{images}}
                    <div class="images">
                        <div class="image" v-for="image in images">
                            <div class="image-holder" v-bind:style="{backgroundImage: + 'url(' + image.s3URL + ');' }">
                                <!-- CSS Background -->
                            </div>
                            <div class="label">
                                <p>File Name: {{image.fileName}}</p>
                                <p>My Best Guess: {{image.label}} | {{image.confidence}}% Confident</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
  //import { doFileUpload, upload } from './ImageFrameControl';
  import * as axios from 'axios';
  const BASE_URL = 'http://localhost:8000';
  const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

  export default {
    data() {
      return {
          images: [],
      }
    },
    methods: {
        inputChange(e) {

            var thePromises = [];

            var files = e.target.files || e.dataTransfer.files;

            for (var i = 0; i < files.length; i++) {
                var file = files.item(i);
                var theFile = {
                    fileName:file.name.split(' ').join('_'),
                    fileType:file.type,
                    fileSize:file.size,
                    fileIndex: i
                };
                this.images.push({
                    fileName: theFile.fileName
                });

                thePromises.push(this.doFileUpload(theFile, file, (this.images.length - 1)));
            }

            Promise.all(thePromises).then(()=> {
                console.log('complete');
            });
        },
        doFileUpload(file, theFile, fileIndex) {
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
                        this.images[fileIndex].s3URL = uploadURL;
                        console.log(this.images);
                        this.doRecognition(theFileName).then(() => {
                            resolve(true)
                        });
                    });
                }).catch((err) => {
                    resolve(false);
                    console.log(err);
                });
            });
        },

        doRecognition(theFileName) {
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
    },
    mounted() {
    },
  }

</script>

<style lang="scss" scoped>
.dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
  }

  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }

  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }

  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }

  .images {
      .image {
          display: flex;
          .image-holder {
              width: 200px;
              height: 120px;
          }
          .label {
              p {
                  text-align: left;
              }
          }
      }
  }
</style>
