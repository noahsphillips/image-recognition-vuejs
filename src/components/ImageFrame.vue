<template lang="html">
    <section id="app_wrapper">
        <div class="container">
            <div class="row">
                <div class="col-md-12 text-center">
                    <h1>Image Recognizer</h1>
                    <p>By: Noah Phillips</p>
                </div>
            </div>
            <hr>
            <div class="row height">
                <div class="col-md-6">
                    <form enctype="multipart/form-data" novalidate>
                        <h1>Upload an Image</h1>
                        <div class="dropbox">
                            <input type="file" multiple accept="image/*" @change="inputChange" class="input-file">
                            <p v-if="count <= 0">
                                Drag images here to analyze
                            </p>
                            <p v-else>{{count}} images left to analyze</p>
                        </div>
                    </form>
                </div>
                <div class="col-md-6">
                    <div class="images">
                        <div class="image" v-for="(image, index) in images">
                            <div class="image-holder" v-bind:style="{ backgroundImage: 'url(' + image.s3URL + ')' }">
                                <!-- CSS Background -->
                                <div class="loader" v-if="image.loading"><i class="bts bt-spinner-clock bt-spin"></i></div>
                            </div>
                            <div class="label">
                                <p>File Name: <strong>{{image.fileName}}</strong></p>
                                <p>My Best Guess: <strong>{{image.label}}</strong></p>
                                <p>Confidence: <strong>{{image.confidence}}%</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-12 text-left">
                    <p><small>Made with Vue.js, Node.js, and AWS Rekognition</small></p>
                </div>
            </div>
        </div>
    </section>
</template>

<script>

  import * as axios from 'axios';
  const BASE_URL = process.env.API_URL;
  const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

  export default {
    data() {
      return {
          images: [],
          count: 0
      }
    },
    methods: {
        inputChange(e) {

            this.images = [];

            var uploadPromises = [];
            var showPromises = [];

            var files = e.target.files || e.dataTransfer.files;

            this.count = files.length;

            for (var i = 0; i < files.length; i++) {
                var file = files.item(i);
                var theFile = {
                    file_name:file.name.split(' ').join('_'),
                    file_type:file.type,
                    fileSize:file.size,
                    fileIndex: i
                };

                this.images.push({
                    fileName: theFile.fileName,
                    loading: true
                });

                uploadPromises.push(this.doFileUpload(theFile, file, (this.images.length - 1)));
            }

            Promise.all(uploadPromises).then(()=> {
                console.log('complete');
            });

            for (var i = 0; i < files.length; i++) {
                var file = files.item(i);
                showPromises.push(this.showImage(file, i));
            }

            Promise.all(showPromises).then(()=> {
                console.log('complete');
            });

        },
        doFileUpload(file, theFile, fileIndex) {
            return new Promise((resolve, reject) => {
                axios.post(`https://athlete-beat-api.herokuapp.com/photos/sign`, file).then((response) => {
                    console.log(response);
                    var theFileName = response.data.fileName;
                    var uploadURL = response.data.url;
                    var options = {
                        headers: {
                            'Content-Type': theFile.type.fileName,
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNTI1OTcxODkzfQ.T809X9ZfgwkAN8T7AKIPTigyRsM8AnTX6ZcTU4eJkjs'
                        }
                    };
                    axios.put(response.data.signedUrl,theFile,options).then((response) => {
                        console.log(response)
                        // this.doRecognition(theFileName, fileIndex).then(() => {
                        //     resolve(true)
                        // });
                    });
                }).catch((err) => {
                    resolve(false);
                    console.log(err);
                });
            });
        },

        doRecognition(theFileName, fileIndex) {
            return new Promise((resolve, reject) => {
                axios.post(`${BASE_URL}/photos/recognize`, {fileName:theFileName}).then((response) => {
                    console.log(response);
                    var tempItem = this.images[fileIndex];
                    if (response.data.Labels.length == 0) {
                        tempItem.label = "Unrecognizable";
                        tempItem.confidence = 0;
                    } else {
                        tempItem.label = response.data.Labels[0].Name;
                        tempItem.confidence = response.data.Labels[0].Confidence.toFixed(2);
                    }
                    tempItem.loading = false;
                    this.$set(this.images, fileIndex, tempItem)
                    this.count--;
                    resolve(true);
                }).catch((err) => {
                    resolve(false);
                    console.log(err);
                });
            });
        },
        showImage(file, i) {
             return new Promise((resolve, reject) => {
                var reader = new FileReader();
                reader.onload = (e) => {
                    let imageURL = e.target.result;
                    let tempItem = this.images[i];
                    console.log('file: ', this.images[i]);
                    tempItem.s3URL = imageURL;
                    this.$set(this.images, i, tempItem)
                    resolve();
                }
                reader.readAsDataURL(file);
             });
        }
    },
    mounted() {
    },
  }

</script>

<style lang="scss" scoped>

@import "fonts";

.height {
    min-height: 70vh;
}

.dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
    @media (max-width: 767px) {
        height: 100px;
        min-height: auto;
    }
  }

  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
    left: 0;
    top: 0;
    @media (max-width: 767px) {
        height: 100px;
    }
  }

  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }

  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
    @media (max-width: 767px) {
        padding: 25px;
    }
  }

  .images {
      .image {
          margin-bottom: 20px;
          display: flex;
          .image-holder {
            width: 200px;
            flex: 0 0 200px;
            height: 120px;
            background-position: center;
            background-size: cover;
            position: relative;
            .loader {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.59);
                i {
                    color: rgba(255, 255, 255, 0.54);
                    position: absolute;
                    left: calc(50% - 25px);
                    top: calc(50% - 25px);
                    font-size: 50px;
                }
            }
          }
          .label {
              padding-left: 20px;
              p {
                  text-align: left;
                  margin-bottom: 0;
              }
          }
      }
  }
</style>
