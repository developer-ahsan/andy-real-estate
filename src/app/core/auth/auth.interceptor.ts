import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import moment from 'moment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(private _authService: AuthService,
        private _afAuth: AngularFireAuth) {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request object
        let newReq = req.clone();
        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        if (this._authService.accessToken && !AuthUtils.isTokenExpired(this._authService.accessToken)) {
            this._afAuth.authState.subscribe(user => {
                if (user) {
                    this._afAuth.idTokenResult.subscribe(token => {
                        const now = moment().unix()
                        const lastFetched = token.claims.exp;
                        const duration = moment.duration(moment.unix(lastFetched).diff(moment.unix(now)));
                        const getMinutes = duration.asMinutes();
                        if (getMinutes <= 55) {
                            user.getIdToken(true).then(res => {
                                this._authService.accessToken = res;
                                localStorage.setItem('accessToken', res);
                            });
                        }
                    });
                }
            });
            newReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
            });
        }

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {
                if (error.error.message == "Invalid token specified") {
                    // Sign out
                    this._authService.signOut();

                    // Reload the app
                    location.reload();
                }

                // Catch "401 Unauthorized" responses
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    // Sign out
                    this._authService.signOut();
                    location.reload();
                }

                return throwError(error);
            })
        );
    }
}
