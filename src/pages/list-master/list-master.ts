import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {AlertController, IonicPage, ModalController, NavController, ToastController} from 'ionic-angular';
import { Pro } from '@ionic/pro';

import { Item } from '../../models/item';
import { Items } from '../../providers/providers';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
import {UserService} from "../../providers/user/user";
import {default as firebase, User} from "firebase";
import {HyperTrack} from "@ionic-native/hyper-track";
import {Observable} from "rxjs/Observable";

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListMasterPage{
  private itemsCollection: AngularFirestoreCollection<any>;
  items: Observable<any[]>;
  events: any[] = [];
  user: User;
  userEvents: {name: string,
    geoFenceStatus: boolean}[] = [];
  constructor(public navCtrl: NavController, public _items: Items,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private _user: UserService, private _cd: ChangeDetectorRef,
              public modalCtrl: ModalController,  private _store: AngularFirestore,
              private hyperTrack: HyperTrack) {
    this.user = this._user.user;
    this._user.user$.subscribe((data: User) =>{
      this.user = data;
      this.itemsCollection = this._store.collection<any>('usersEvent');
      this.itemsCollection.doc(this.user.uid).valueChanges().subscribe((data: {events: {name: string,
        geoFenceStatus: boolean}[]}) => {
        if (data && 'events' in data) {
          this.userEvents = data.events;
          this.events = [];
          data.events.forEach((event) => {
            let collections = this._store.collection<any>('events',
              ref => ref.where('name', '==', event.name)
            ).valueChanges().subscribe((d) => {
              this.events.push(d[0]);
              this._cd.markForCheck();
            });
          });
        }
      });
    })
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {




  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    this.hyperTrack.getOrCreateUser('Saurabh', this.user.phoneNumber, '', this.user.uid).then((data) => {
      console.log(data);
      Pro.getApp().monitoring.log('This happens sometimes', { level: 'error' });
      Pro.getApp().monitoring.log(data, { level: 'error' });
      let prompt = this.alertCtrl.create({
        title: data,
        inputs: [{ name: 'confirmationCode', placeholder: 'Confirmation Code' }],
        buttons: [
          { text: 'Cancel',
            handler: data => { console.log('Cancel clicked'); }
          },
        ]
      });
      prompt.present();
      this.hyperTrack.setUserId(data).then(user => {
        // user (String) is a String representation of a User's JSON
        Pro.getApp().monitoring.log(user, { level: 'error' });
        this.hyperTrack.startTracking().then(userId => {}, trackingError => {});

        this.hyperTrack.getCurrentLocation().then(location => {
          // Handle location. It's a String representation of a Location's JSON.For example:
          // '{"mAccuracy":22.601,,"mLatitude":23.123456, "mLongitude":-100.1234567, ...}'
          console.log(location);
        }, error => {});

        // this.hyperTrack.stopTracking().then(success => {
        //   // Handle success (String). Should be "OK".
        // }, error => {});

      }, error => {});
    });
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    // this.items.delete(item);
    let index = this.userEvents.findIndex((event: {name: string,
      geoFenceStatus: boolean}) => {
      return event.name === item.name;
    });
    if (index) {
      this.userEvents.splice(index, 1);
      this.itemsCollection = this._store.collection<any>('usersEvent');
      this.itemsCollection.doc(this.user.uid).set({events: this.userEvents}).then(() => {
      });
    }

  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: any) {
    console.log(item);
    let event = this.userEvents.find((event: {name: string,
      geoFenceStatus: boolean}) => {
      return event.name === item.name;
    });
    if (event.geoFenceStatus) {
      this.navCtrl.push('ItemDetailPage', {
        item: item
      });
    } else {
      let toast = this.toastCtrl.create({
        message: "You are not at the location yet",
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }

  }
}
