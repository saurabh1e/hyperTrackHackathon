import {Component, InjectionToken, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AlertController, IonicPage, NavController, ToastController} from 'ionic-angular';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import {UserService} from '../../providers/providers';
import {MainPage} from '../pages';


export const WINDOW = new InjectionToken<Window>("WindowToken");

export function _window(): Window {
  return window;
}

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { email: string, password: string} = {email: null, password: null};
  recaptchaVerifier: any;

  // Our translated text strings
  private loginErrorString: string = 'Error Logging In';

  constructor(public navCtrl: NavController,
              public user: UserService,
              private fb: Facebook, private platform: Platform,
              private alertCtrl: AlertController,
              public toastCtrl: ToastController,
              private afAuth: AngularFireAuth,
              public translateService: TranslateService) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  ngOnInit() {
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("sign-in-button", {
      "size": "invisible",
      "callback": function (response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // onSignInSubmit();
      }
    });
  }

  signInWithFacebook() {
    if (this.platform.is('cordova')) {
      console.log(1);
      return this.fb.login(['email', 'public_profile']).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredential);
      })
    }
    else {
      this.afAuth.app.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(() => {
        this.navCtrl.push(MainPage);
      })
    }

  }
  signInWithGoogle() {
    // this.afAuth.app.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => {
    //   this.navCtrl.push(MainPage);
    // });
  }

  signIn(account: { email: string, password: string}) {
    let auth = this.afAuth.app.auth();
    let nav = this.navCtrl;
    this.afAuth.app.auth().createUserWithEmailAndPassword(account.email, account.password)
      .then(confirmationResult => {
        // const a = prompt("Enter Verification Code");
        console.log(confirmationResult);
        nav.push(MainPage);
      })
      .catch(function (error) {
        // this._loader.hide();
        auth.signInWithEmailAndPassword(account.email, account.password).then(() => {
            nav.push(MainPage);
        });
        console.error("SMS not sent", error);
      });
  }
}
