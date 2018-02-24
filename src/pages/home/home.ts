import { Component } from '@angular/core';
import { NavController, ActionSheetController, ToastController, Platform, LoadingController, Loading } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Transfer, TransferObject } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { StatusBar } from '@ionic-native/status-bar';

import { Geolocation, Coordinates } from '@ionic-native/geolocation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';

declare var cordova: any;
declare var google;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private coords: string;
  private error: string;
  private x: number;
  private y: number;
  private z: number;

  lastImage: string = null;
  loading: Loading;

  constructor(public navCtrl: NavController, private camera: Camera, private transfer: TransferObject,
              private file: File, private filePath: FilePath, public actionSheetCtrl: ActionSheetController,
              public toastCtrl: ToastController, public platform: Platform, public loadingCtrl: LoadingController,
              public statusBar: StatusBar, public geolocation: Geolocation, private gyroscope: Gyroscope) {

  }



  public presentActionSheet(){
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select image Source: ',
      buttons: [{
        text: 'Load from library',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },{
        text: 'Use camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },{
        text: 'Cancel',
        role: 'cancel'
      }
    ]
  });
  actionSheet.present();
  }

  itemSelected(item: string) {
    console.log("Selected Item", item);
  }

  //Take picture function
  public takePicture(sourceType){
    var options = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    //Gyroscope options
    let gyroOptions: GyroscopeOptions = {
      frequency: 1000
    }

    //Get data of an image:
    this.camera.getPicture(options).then((imagePath) =>{

      //Get LatLong:
      let localOptions = {timeout: 10000, enableHighAccuracy: true};
      this.geolocation.getCurrentPosition(localOptions).then((resp) =>{
        this.coords = resp.coords.latitude + ', ' + resp.coords.longitude;
      }).catch((error)=>{
        this.error = 'Error getting location: ' + error;
      });

      //Get gyroscope values:
      this.gyroscope.getCurrent(gyroOptions).then((orientation: GyroscopeOrientation) =>{
        this.x = orientation.x;
        this.y = orientation.y;
        this.z = orientation.z;
      }).catch()

      //Handling for Android library:
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY){
        this.filePath.resolveNativePath(imagePath).then(filePath => {
          let correctPath = filePath.substr(0, filePath.lastIndexOf('/')+1);
          let currentName = imagePath.substring(imagePath.lastIndexOf('/')+1, imagePath.lastIndexOf('?'));
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/')+1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/')+1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        }
      }, (err) => {
      this.presentToast('Error while selecting photo.');
    });
  }

  //Creating name for image:
  private createFileName(){
    var d = new Date(),
    n = d.getTime(),
    newFileName = n +".jpg";
    return newFileName;
  }

  //Copiando a imagem para uma pasta logal
  private copyFileToLocalDir(namePath, currentName, newFileName){
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success =>{
      this.lastImage = newFileName;
      console.log('Caminho da imagem: ' + namePath + currentName);
      console.log("Coordenadas: " + this.coords);
      console.log("Eixo x: "+ this.x + "; y: " + this.y + "; z: " + this.z);
    }, error =>{
      this.presentToast('Error while storing file');
    });
  }

  //Função para mostrar os Toast:
  private presentToast(text){
    let toast = this.toastCtrl.create({
        message: text,
        duration: 5000,
        position: 'top'
      });
      toast.present();
  }

  //get accurate path to the apps folder
  public pathForImage(img){
    if (img === null){
      return '';
    }else {
      return cordova.file.dataDirectory + img;
    }
  }


}
