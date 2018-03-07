import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';
import 'rxjs/add/observable/of';

import {User, UserWithoutRole} from '../user/user';
import {TimeoutService} from '../timeout/timeout.service';

import {Store} from '@ngrx/store';
import * as userActions from '../user/user.actions';
import * as fromRoot from '../reducers';
import {Router} from '@angular/router';
import * as cookie from 'cookie';


@Injectable()
export class AuthService {
  public redirectUrl: string;

  constructor(private http: HttpClient,
              private timeoutService: TimeoutService,
              private store: Store<fromRoot.State>,
              private router: Router) {
  }

  signup(newUser: UserWithoutRole): Observable<User> {
    return this.http
      .post<User>('/api/auth/signup', newUser);
  }

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>('/api/auth/signin', {usernameOrEmail: username, password: password})
      .pipe(map((user: User) => {
          this.authAccept(user);
          return user;
        }));
  }

  get token(): string {
    return cookie.parse(document.cookie)['sessionId'];
  }

  set token(token: string) {
    document.cookie = cookie.serialize('sessionId', token || '', { path: '/' });
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .get<{ message: string }>('/api/auth/signout')
      .pipe(map((message: { message: string }) => {
        this.router.navigate(['/']);
        this.nullifyAuth();
        return message;
      }));
  }

  authAccept(user: User): void {
    this.timeoutService.enable();
    this.store.dispatch(new userActions.LoadUser(user));
    if (this.redirectUrl) {
      this.router.navigate([this.redirectUrl]);
      this.redirectUrl = null;
    }
  }

  nullifyAuth(): void {
    this.token = null;
    this.timeoutService.disable();
    this.store.dispatch(new userActions.UnloadUser());
  }
}