import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { VendorsService } from './components/vendors.service';

@Injectable({
  providedIn: 'root'
})
export class VendorStatusGuard implements CanActivate {
  constructor(private _vendorService: VendorsService, private router: Router) { };

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let isActive;
    this._vendorService.Single_Suppliers$.subscribe(res => {
      isActive = res["data"][0].blnActiveVendor

    });
    if (isActive) {
      return true;

    } else {
      // this.router.navigate(['/contact']);
    }

  }

}
