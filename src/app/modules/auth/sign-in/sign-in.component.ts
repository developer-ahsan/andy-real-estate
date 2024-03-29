import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _dashboardService: DashboardsService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _httpClient: HttpClient,
        private _snackbar: MatSnackBar
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });

        this.signInForm.patchValue({
            email: localStorage.getItem('userEmail'),
            password: localStorage.getItem('userPassword')
        })
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        localStorage.clear();
        sessionStorage.clear();
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        const { email, password, rememberMe } = this.signInForm.getRawValue();
        if (rememberMe) {
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);
        }
        // let payload = {
        //     email: email,
        //     password: password,
        //     login: true
        // }
        let obj = {
            email: email,
            password: password,
        }
        const secretKey = 'admin_login';
        const objectString = JSON.stringify(obj);
        const encryptedObject = CryptoJS.AES.encrypt(objectString, secretKey).toString();
        let payload = {
            payload: encryptedObject,
            admin_login: true
        }
        this._authService.siginPostApiCall(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["success"]) {
                localStorage.setItem('userDetails', JSON.stringify(res["userDetails"]));
                this._authService.SignInUsingEmailPassword(email, password)
                    .then(() => {
                        const { loginMessageNumber } = this._authService;
                        switch (loginMessageNumber) {
                            case 0: {
                                // Set the redirect url.
                                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                                // to the correct page after a successful sign in. This way, that url can be set via
                                // routing file and we don't have to touch here.
                                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                                const userDetails = JSON.parse(localStorage.getItem('userDetails'));
                                let roles: any;
                                let roleIDs: any = [];
                                if (userDetails.roles) {
                                    roles = userDetails.roles.split(',,');
                                    roles.forEach(role => {
                                        const [id, name] = role.split('::');
                                        roleIDs.push(id);
                                    });
                                }
                                const checkID = roleIDs.find(id => id == 3);
                                if (redirectURL == '/signed-in-redirect') {
                                    let targetURL = '/dashboards/home';
                                    if (userDetails.blnManager) {
                                        targetURL = '/dashboards/manager';
                                    } else if (checkID == 3) {
                                        targetURL = '/dashboards/employee';
                                    }
                                    this._router.navigateByUrl(targetURL);
                                } else {
                                    this._router.navigateByUrl(redirectURL);
                                }
                                break;
                            }
                            case 1: {
                                // Re-enable the form
                                this.signInForm.enable();

                                // Set the alert
                                this.alert = {
                                    type: 'error',
                                    message: 'User is already login'
                                };

                                // Show the alert
                                this.showAlert = true
                                break;
                            }
                            default: {
                                // Re-enable the form
                                this.signInForm.enable();

                                // Reset the form
                                this.signInForm.get('password').reset();

                                // Set the alert
                                this.alert = {
                                    type: 'error',
                                    message: 'Wrong email or password'
                                };

                                // Show the alert
                                this.showAlert = true;
                                break;
                            }
                        };
                    });
            } else {
                this._snackbar.open(res["message"], '', {
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    duration: 3500
                });
                this.signInForm.enable();
            }
        }, err => {
            this.signInForm.enable();
        })
        // Sign in callback to avoid timeout

    }
}
