import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Items} from "../../mocks/providers/items";
import {AngularFirestore} from "angularfire2/firestore";
import {UserService} from "../../providers/user/user";
import {User} from "firebase";

@IonicPage()
@Component({
  selector: 'page-content',
  templateUrl: 'content.html'
})
export class ContentPage {

  item: any;
  messages: any[] = [];
  user: User;
  text: string = null;
  itemCollections;
  username: string;
  constructor(public navCtrl: NavController, private _nav: NavParams, private _items: Items,
              private _store: AngularFirestore, private _user: UserService) {
    this.item = _nav.get('item') || _items.defaultItem;
    this._user.user$.subscribe((data) => {
      this.user = data;
      this._store.collection('userProfile').doc(this.user.uid).valueChanges().subscribe((data: {name: string}) => {
        this.username = data.name;
      })
    });
    this.itemCollections = this._store.collection<any>('messages');
    this.itemCollections.doc(this.item.name).valueChanges().subscribe((data: {messages: any[]}) => {
      console.log(data);
      this.messages = data.messages;

    })
  }

  send() {
    if (this.text) {
      this.messages.push({sender_id: this.user.uid, sender: this.username, message: this.text, timestamp: new Date().toJSON()});
      this.text = null;
      this.itemCollections.doc(this.item.name)
        .update({messages: this.messages})
        .then((d) => {
          console.log(d);
        })
    }
  }

}
