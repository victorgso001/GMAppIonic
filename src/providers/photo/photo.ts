import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite'
import { DatabaseProvider } from '../database/database'

@Injectable()
export class PhotoProvider {

  constructor(private dbProvider: DatabaseProvider) {}

  public insert(photo: Photo) {
  	return this.dbProvider.getDB()
      .then((db: SQLiteObject) => {
        let sql = 'insert into photos (PATH, X, Y, Z, LAT, LNG) values (?, ?, ?, ?, ?, ?)';
        let data = [photo.path, photo.x, photo.y, photo.z, photo.lat, photo.lng];
 
        return db.executeSql(sql, data).catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  }

  public update(photo: Photo) {
    return this.dbProvider.getDB()
      .then((db: SQLiteObject) => {
        let sql = 'update photos set PATH = ?, X = ?, Y = ?, Z = ?, LAT = ? LNG = ? where id = ?';
        let data = [photo.path, photo.x, photo.y, photo.z, photo.lat, photo.lng, photo.id];
 
        return db.executeSql(sql, data).catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  }

  public remove(id: number) {
    return this.dbProvider.getDB()
      .then((db: SQLiteObject) => {
        let sql = 'delete from photos where id = ?';
        let data = [id];
 
        return db.executeSql(sql, data).catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  }

  public get(id: number) {
    return this.dbProvider.getDB()
      .then((db: SQLiteObject) => {
        let sql = 'select * from photos where id = ?';
        let data = [id];
 
        return db.executeSql(sql, data)
          .then((data: any) => {
            if (data.rows.length > 0) {
              let item = data.rows.item(0);
              let photo = new Photo();
              photo.id = item.id;
              photo.path = item.PATH;
              photo.x = item.X;
              photo.y = item.Y;
              photo.z = item.Z;
              photo.lat = item.LAT;
              photo.lng = item.LNG;
 
              return photo;
            }
 
            return null;
          })
          .catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  }

  public getAll() {
    return this.dbProvider.getDB()
      .then((db: SQLiteObject) => {
        let sql = 'SELECT * FROM photos';
        let data: any[];

        return db.executeSql(sql, data)
          .then((data: any) => {
            if (data.rows.length > 0) {
              let photos: any[] = [];
              for (var i = 0; i < data.rows.length; i++) {
                var photo = new Photo();
                photo.id = data.rows.item(i).id;
                photo.path = data.rows.item(i).PATH;
                photo.x = data.rows.item(i).X;
                photo.y = data.rows.item(i).Y;
                photo.z = data.rows.item(i).Z;
                photo.lat = data.rows.item(i).LAT;
                photo.lng = data.rows.item(i).LNG;
                photos.push(photo);
              }
              return photos;
            } else {
              return [];
            }
          })
          .catch((e) => console.error(e));
      })
      .catch((e) => console.error(e));
  }
}

export class Photo {
  id: number;
  path: string;
  x: number;
  y: number;
  z: number;
  lat: number;
  lng: number;
}