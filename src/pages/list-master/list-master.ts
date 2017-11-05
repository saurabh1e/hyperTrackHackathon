import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
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
export class ListMasterPage implements AfterViewInit{
  private itemsCollection: AngularFirestoreCollection<any>;
  items: Observable<any[]>;
  events: any[] = [];
  user: User;
  userProfile: any;
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
      console.log(1);
      if (data) {
        this.user = data;
        this.itemsCollection = this._store.collection<any>('userProfile');
        this.itemsCollection.doc(this.user.uid).valueChanges().subscribe((data: any) => {
          console.log(data);
          this.userProfile = data;
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
      }

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
  ngAfterViewInit() {
    this.recheck();
  }

  recheck() {
    this.hyperTrack.checkLocationPermission().then(response => {
      // response (String) can be "true" or "false"
      if (response != "true") {
        // Ask for permissions
        this.hyperTrack.requestPermissions().then(response => {}, error => {});
      }
    }, error => {});

    // Check if app has location services enabled
    this.hyperTrack.checkLocationServices().then(response => {
      // response (String) can be "true" or "false"
      if (response != "true") {
        // Request services to be enabled
        this.hyperTrack.requestLocationServices().then(response => {}, error => {});
      }
    }, error => {});


    this.hyperTrack.getOrCreateUser('Saurabh', this.user.phoneNumber, '', this.user.uid).then((data) => {
      data = JSON.parse(data);
      alert('got user ' + data['name']);
      this.hyperTrack.setUserId(data.id).then(user => {
        // user (String) is a String representation of a User's JSON
        this.hyperTrack.startTracking().then(userId => {
          alert('tracking started')
        }, trackingError => {
        });

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

    if (this.userProfile.enableGeoFence) {
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

  openChat(item: any) {
    let event = this.userEvents.find((event: {name: string,
      geoFenceStatus: boolean}) => {
      return event.name === item.name;
    });
    if (event.geoFenceStatus) {
      this.navCtrl.push('ContentPage', {
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
