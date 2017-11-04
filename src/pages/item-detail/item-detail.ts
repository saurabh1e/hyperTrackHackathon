import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Items } from '../../providers/providers';
import {AngularFirestore} from "angularfire2/firestore";

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailPage {
  item: any;
  profiles: any[] = [];
  constructor(public navCtrl: NavController, navParams: NavParams, items: Items, private _cd: ChangeDetectorRef,
              private _store: AngularFirestore,) {
    console.log(navParams.get('item'));
    this.item = navParams.get('item') || items.defaultItem;
    console.log(this.item);
    let itemsCollection = this._store.collection<any>('events', ref => ref.where('name', '==', this.item.name));
    itemsCollection.valueChanges().subscribe((data) => {
      console.log(data);
      this.profiles = [];
      data[0].phones.forEach((event: string) => {
          this._store.collection<any>('userProfile',
            ref => ref.where('phone', '==', event)
          ).valueChanges().subscribe((d) => {
            console.log(d);
            this.profiles.push(d[0]);
            console.log(this.profiles);
            this._cd.markForCheck();
          });
        });
      })
    }
}
