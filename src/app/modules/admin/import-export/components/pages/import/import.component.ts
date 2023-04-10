import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { Subject } from 'rxjs';
import { ImportExportService } from '../../import-export.service';

@Component({
  selector: 'app-import-order',
  templateUrl: './import.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderImportComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngType = 0;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService,
    private _ImportExportService: ImportExportService,
    private router: Router,
    private _activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {

  };
  goBack() {
    this.router.navigateByUrl('import-export/home');
  }
  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
