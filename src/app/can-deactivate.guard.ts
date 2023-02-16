import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
export interface PreventNavigation {
  canDeactivate: () => boolean;
}
@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<PreventNavigation> {
  canDeactivate(component: PreventNavigation) {
    if (component.canDeactivate()) {
      return true;
    } else {
      // your code here to handle the back button press
      return false; // to prevent navigation and page refresh
    }
  }
}