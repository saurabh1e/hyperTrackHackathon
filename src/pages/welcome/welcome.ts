import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {AngularFireAuth} from "angularfire2/auth";
import {User} from "firebase";
import {MainPage} from "../pages";

/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
*/
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {

  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth,) {
    afAuth.authState.subscribe((user: User) => {
      if (user && !user.isAnonymous) {
        this.navCtrl.push(MainPage);
      }
    });
  }

  login() {
    this.navCtrl.push('LoginPage');
  }

  signup() {
    this.navCtrl.push('SignupPage');
  }
}
