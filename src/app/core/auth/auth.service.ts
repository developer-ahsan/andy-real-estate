import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import * as auth from 'firebase/auth';
import firebase from 'firebase/app';
import 'firebase/auth'

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private _userLoginMessage: number = 0;

    /**
     * Constructor
     */
    constructor(
        public afAuth: AngularFireAuth,
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    };

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    };

    get loginMessageNumber(): number {
        return this._userLoginMessage;
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    SignInUsingEmailPassword(email: string, password: string) {
        sessionStorage.removeItem('flpsAccessToken');
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            this._userLoginMessage = 1;
            return;
        };

        return this.afAuth
            .signInWithEmailAndPassword(email, password)
            .then((response: any) => {
                const result = response["user"]?.["_delegate"];
                // Creating basic payload for sign in
                const payload = {
                    accessToken: result["accessToken"],
                    tokenType: 'bearer',
                    user: {
                        avatar: result["photoURL"] || null,
                        email: result["email"],
                        id: result["uid"],
                        name: result["displayName"],
                        isVerifiedEmail: result["emailVerified"],
                        status: "online",
                        createdAt: result["metadata"]?.["creationTime"],
                        lastLogin: result["metadata"]?.["lastSignInTime"],
                        user_role: this.parseJwt(result["accessToken"])?.user_role
                    }
                };

                // Store the access token in the local storage
                this.accessToken = payload.accessToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = payload.user;

                // Login and do routing in ts
                this._userLoginMessage = 0;


                // Return a new observable with the response
                return of(payload);
            })
            .catch((error) => {
                this._userLoginMessage = 2;
                return;
            });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(environment.signInAuth, credentials)
            .pipe(
                switchMap((response: any) => {
                    const payload = {
                        accessToken: response["idToken"],
                        tokenType: 'bearer',
                        user: {
                            avatar: response["avatar"] || null,
                            email: response["email"],
                            id: response["localId"],
                            name: response["displayName"],
                            status: "online"
                        }
                    };

                    // Store the access token in the local storage
                    this.accessToken = payload.accessToken;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = payload.user;

                    // Return a new observable with the response
                    return of(payload);
                })
            );
    }

    /**
     * Decode using the access token
     */
    parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        const user = {
            avatar: this.parseJwt(this.accessToken)["avatar"] || null,
            email: this.parseJwt(this.accessToken)["email"],
            id: this.parseJwt(this.accessToken)["user_id"],
            name: this.parseJwt(this.accessToken)["display_name"]
        }
        this.accessToken = this.accessToken;
        this._userService.user = user;
        this._authenticated = true;
        return of(true);
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    public getToken$(): Observable<any> {
        return from(this.afAuth.currentUser).pipe(switchMap(user => {
            return from(user.getIdTokenResult(true)).pipe(map(token => {
                return token;
            }));
        }));
    }
    check(): Observable<boolean> {

        // this.afAuth.authState.subscribe(res => {
        //     if (res) {
        //         res.getIdToken(true).then(res => {
        //             this.accessToken = res;
        //         })
        //     }
        // });

        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
