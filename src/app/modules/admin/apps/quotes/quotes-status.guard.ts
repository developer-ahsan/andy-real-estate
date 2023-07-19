import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { QuotesService } from './components/quotes.service';

@Injectable({
  providedIn: 'root'
})
export class VendorStatusGuard implements CanActivate {
  constructor(private _vendorService: QuotesService, private router: Router) { };

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return;

  }

}
