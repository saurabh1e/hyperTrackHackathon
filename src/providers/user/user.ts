import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';

import { Api } from '../api/api';
import {AngularFireAuth} from "angularfire2/auth";
import {User} from "firebase";
import {Subject} from "rxjs/Subject";
import {App} from "ionic-angular";
import {WelcomePage} from "../../pages/welcome/welcome";

/**
 * Most apps have the concept of a User. This is a simple provider
 * with stubs for login/signup/etc.
 *
 * This User provider makes calls to our API at the `login` and `signup` endpoints.
 *
 * By default, it expects `login` and `signup` to return a JSON object of the shape:
 *
 * ```json
 * {
 *   status: 'success',
 *   user: {
 *     // User fields your app needs, like "id", "name", "email", etc.
 *   }
 * }Ø
 * ```
 *
 * If the `status` field is not `success`, then an error is detected and returned.
 */
@Injectable()
export class UserService {
  _user: any;
  _user$: Subject<User> = <Subject<User>>  new Subject();
  constructor(public api: Api, private afAuth: AngularFireAuth, private _app: App) {
    afAuth.authState.subscribe((user: User) => {
      if (user && !user.isAnonymous) {
        this.user = user;
      }
      else {
        this._app.getActiveNav().push(WelcomePage);
      }
    });
  }

  get user(): User {
    return this._user;
  }
  set user(user) {
    this._user = user;
    this._user$.next(user);
  }
  get user$() {
    return this.afAuth.authState;
  }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    let seq = this.api.post('login', accountInfo).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      } else {
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */
  signup(accountInfo: any) {
    let seq = this.api.post('signup', accountInfo).share();

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this.afAuth.app.auth().signOut().then((d) =>{


    },(err) => {

    });
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp.user;
  }
}
