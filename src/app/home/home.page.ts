import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  taskName: "";

  taskList: Array<any> = [];

  constructor(
    public alertCtrl: AlertController,
    public firestore: AngularFirestore,
  ) {
  }

  ngOnInit(
  ) {
    // this.retrieve();
    this.retrieveWatch();
  }

  retrieveWatch() {
    const firebase = this.firestore.collection("test").snapshotChanges()
      .pipe(map((action) => action.map((snapshot) => {
        const id = snapshot.payload.doc.id;
        const data = snapshot.payload.doc.data() as any;
        return {
          id: id,
          name: data.name,
        }
      })));

    firebase.subscribe(data => {
      this.taskList = data;
    })
  }

  // retrieve() {
  //   const firebase = this.firestore.collection("test").get();
  //   firebase.subscribe(snapshot => {
  //     this.taskList = [];
  //     snapshot.forEach(document => {
  //       let data: any = document.data();

  //       const obj = {
  //         "id": document.id,
  //         "name": data.name
  //       }
  //       this.taskList.push(obj);
  //     });
  //   });
  // }

  async addTask() {
    if (this.taskName.length > 0) {
      await this.firestore.collection("test").add({
        name: this.taskName
      })
      this.taskName = "";
    }
  }

  deleteTask(id) {
    this.firestore.collection("test").doc(id).delete();
  }

  async updateTask(id) {
    const alert = await this.alertCtrl.create({
      subHeader: 'Update Task?',
      message: 'Type in your new task to update.',
      inputs: [{ name: 'editTask', placeholder: 'Task' }],
      buttons:
        [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Update', handler: async data => {
              await this.firestore.collection("test").doc(id).update({
                "name": data.editTask
              });
            }
          },
        ]
    });
    await alert.present();
  }

}
