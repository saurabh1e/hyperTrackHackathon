import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Settings } from '../../providers/providers';
import {AngularFirestore} from "angularfire2/firestore";
import {UserService} from "../../providers/user/user";
import {User} from "firebase";
import {Observable} from "rxjs/Observable";

/**
 * The Settings page is a simple form that syncs with a Settings provider
 * to enable the user to customize settings for the app.
 *
 */
@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  // Our local settings object
  options: any;

  settingsReady = false;
  user: User;
  name: string;
  form: FormGroup;

  page: string = 'main';
  pageTitle: string = 'Profile';
  profile$: Observable<any[]>;

  constructor(public navCtrl: NavController,
              private _user: UserService,
              private _store: AngularFirestore,
    public settings: Settings,
    public translate: TranslateService) {
    this._user.user$.subscribe((data: User) =>{
      this.user = data;
      let col = this._store.collection<any>('userProfile');
      this.profile$ = col.doc(data.uid).valueChanges();
    });
  }


  ngOnChanges() {
    console.log('Ng All Changes');
  }
}
