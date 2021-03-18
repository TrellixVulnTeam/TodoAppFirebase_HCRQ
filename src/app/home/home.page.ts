import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';

import { Plugins, CameraResultType } from '@capacitor/core';

const { Camera, LocalNotifications, Geolocation, Toast } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  taskList: Array<any> = [];
  taskName: string = "";
  photo: any = "";

  location: any;

  constructor(
    public firestore: AngularFirestore,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    // this.takePicture();
    this.getTask();
    // this.getTask2();
    // this.getNotification();
    // this.show();
  }

  async ionicToast(location: any) {
    const toast = await this.toastController.create({
      message: `Latitude = ${location.latitude} , Longitude = ${location.longitude}`,
      duration: 5000,
      color: 'warning'
    });

    await toast.present();
  }

  async show(data: any, text: string) {
    // await Toast.show({
    //   text: `${name} ${text}`
    // });
    const toast = await this.toastController.create({
      message: `${data.name} with the id of ${data.id} ${text}`,
      duration: 5000,
      color: 'warning'
    });

    await toast.present();
  }

  async getCurrentPosition() {

    const coordinates = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
    });

    this.ionicToast(coordinates.coords);
  }

  async getNotification(msg: any) {
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Added to Firestore",
          body: `New Task: ${msg}`,
          id: 1,
          schedule: { at: new Date(Date.now() + 1000 * 5) },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('scheduled notifications', notifs);
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      saveToGallery: true
    });

    this.photo = image.webPath;
  }

  getTask() {
    const firebase = this.firestore.collection("task").snapshotChanges()
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
      console.log(this.taskList);
    });
  }

  addTask() {
    if (this.taskName.length > 0) {
      this.firestore.collection("task").add({
        name: this.taskName
      });
      this.getNotification(this.taskName);
      this.taskName = "";
    }

  }

  async updateTask(id: any) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      // header: 'Confirm!',
      subHeader: 'Update you task',
      message: 'Type in your new task to update.',
      inputs: [
        { name: 'editTask', placeholder: 'Enter your task' }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        }, {
          text: 'Update',
          handler: (data) => {
            this.firestore.collection("task").doc(id).update({
              name: data.editTask
            });
          }
        }
      ]
    });
    await alert.present();
  }

  deleteTask(id: any) {
    this.firestore.collection("task").doc(id).delete();
  }

}
