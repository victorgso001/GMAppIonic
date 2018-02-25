import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';

import { Geolocation } from '@ionic-native/geolocation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';

import { PhotoProvider, Photo } from '../../providers/photo/photo';

declare var cordova: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  photos: any[] = [];

  private photoOptions: object;
  private geolocationOptions: object;
  private gyroscopeOptions: GyroscopeOptions;
  private lat: number;
  private lng: number;
  private x: number;
  private y: number;
  private z: number;

  private orientationDone: boolean;
  private positionDone: boolean;
  private gatherInfoMessage: string;
  private hasError: boolean;

  lastImage: string = null;

  constructor (
                public navCtrl: NavController,
                private camera: Camera,
                private file: File,
                private toastCtrl: ToastController,
                private geolocation: Geolocation,
                private photoProvider: PhotoProvider,
                private gyroscope: Gyroscope
              ) {}

  ionViewDidLoad() {
    this.loadPhotos();
    this.gyroscopeOptions = {
      frequency: 1000
    };
    this.photoOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
    this.geolocationOptions = {
      timeout: 1000,
      enableHighAccuracy: true
    }
  }

  actionTakePicture() {
    this.camera.getPicture(this.photoOptions)
    .then((imagePath) => {
      this.gatherInfos(imagePath);
    })
    .catch(e => console.error(e));
  }

  private gatherInfos(imagePath) {
    this.orientationDone = false;
    this.positionDone = false;
    this.gatherInfoMessage = ' Error: ';
    this.hasError = false;

    this.geolocation.getCurrentPosition(this.geolocationOptions)
    .then((p) => {
      this.lat = p.coords.latitude;
      this.lng = p.coords.longitude;
      this.positionDone = true;
    })
    .catch((error)=>{
      console.error('Erro: location -> ' + error.message + ";");
      this.gatherInfoMessage += ' location -> ' + error.message + ";";
      this.positionDone = true;
      this.hasError = true;
    });

    this.gyroscope.getCurrent(this.gyroscopeOptions)
    .then((orientation: GyroscopeOrientation) => {
      this.x = orientation.x;
      this.y = orientation.y;
      this.z = orientation.z;
      this.orientationDone = true;
    })
    .catch((error)=>{
      console.error('Erro: orientation -> ' + error.message + ";");
      this.gatherInfoMessage = ' orientation -> ' + error.message + ";";
      this.orientationDone = true;
      this.hasError = true;
    });

    if (this.hasError) {
      this.showToast(this.gatherInfoMessage);
    }
    else {
      console.log(this.orientationDone + " --- " + this.positionDone);
      var currentName = imagePath.substr(imagePath.lastIndexOf('/')+1);
      var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/')+1);
      this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
    }
  }

  private loadPhotos() {
    this.photoProvider.getAll().then((result: any[]) => this.photos = result);
  }

  private createFileName () {
    return (new Date()).getTime() + ".jpg";
  }

  private copyFileToLocalDir(namePath, currentName, newFileName){
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
    .then(success => {
      this.lastImage = newFileName;
      // console.log('Caminho da imagem: ' + namePath + currentName);
      // console.log(this.coords);
      // console.log("Eixo x: "+ this.x + "; y: " + this.y + "; z: " + this.z);
      var newPhoto = new Photo();
      newPhoto.path = namePath + currentName;
      newPhoto.x = this.x;
      newPhoto.y = this.y;
      newPhoto.z = this.z;
      newPhoto.lat = this.lat;
      newPhoto.lng = this.lng;
      console.log(newPhoto);
      this.photoProvider.insert(newPhoto)
      .then(() => {
        this.showToast('Foto salva.');
        this.loadPhotos();
      })
      .catch(() => {
        this.showToast('Erro ao salvar a foto.');
      });

    })
    .catch(error => {
      this.showToast('Erro ao armazenar a foto');
    });
  }

  private showToast (text) {
    this.toastCtrl.create({
      message: text,
      duration: 5000,
      position: 'botton'
    }).present();
  }
}
