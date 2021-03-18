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
  photo : any = "";

  location : any ;

  constructor(
    public firestore: AngularFirestore,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    // this.takePicture();
    // this.getTask();
    // this.getTask2();
    // this.getNotification();
    // this.show();
  }

  async ionicToast(){
    const toast = await this.toastController.create({
      message: "Ionic Toast",
      duration: 5000,
      color: 'warning'
    });

    await toast.present();
  }

  async show() {
    await Toast.show({
      text: 'Hello Toast plugin!'
    });
  }

  async getCurrentPosition() {
    await Toast.show({
      text: 'before'
    });
    const coordinates = await Geolocation.getCurrentPosition();

    this.location = coordinates.coords.latitude;
    await Toast.show({
      text: this.location
    });
    console.log('Current');
    console.log('Current', coordinates.coords);
  }

  async getNotification(){
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Title",
          body: "Body",
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
    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    // var imageUrl = image.webPath;
    // Can be set to the src of an image now
    // imageElement.src = imageUrl;

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
      this.taskName = "";
    }

    // console.log("You have clicked this button!");
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
