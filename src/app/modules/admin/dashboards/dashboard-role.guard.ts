import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { switchMap, takeUntil } from 'rxjs/operators';
import { DashboardsService } from './dashboard.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _dashboardService: DashboardsService,
    private _router: Router
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    if (userDetails.blnManager) {
      return true;
    } else {
      // Redirect to a forbidden page or handle access denied as needed
      this._router.navigate(['/dashboards/home']);
      return false;
    }
  }
}
