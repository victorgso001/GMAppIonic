import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {

  constructor(private sqlite: SQLite) {}

  public getDB() {
  	return this.sqlite.create({
      name: 'photos.db',
      location: 'default'
    });
  }

  public createDatabase() {
    return this.getDB()
    	.then((db: SQLiteObject) => this.createTables(db))
      	.catch(e => console.log(e));
  }

  private createTables(db: SQLiteObject) {
    db.sqlBatch([
    	[
      	'CREATE TABLE IF NOT EXISTS photos (' +
      		'id integer primary key AUTOINCREMENT NOT NULL,' +
      		'PATH TEXT,' +
      		'X REAL,' +
      		'Y REAL,' +
      		'Z REAL,' +
      		'LAT REAL,' +
      		'LNG REAL' +
      	')'
    	]
    ])
      .then(() => console.log('Tabelas criadas'))
      .catch(e => console.error('Erro ao criar as tabelas', e));
  }
}
