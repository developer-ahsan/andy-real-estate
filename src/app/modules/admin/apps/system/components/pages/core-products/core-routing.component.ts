import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { SystemService } from '../../system.service';
import { AddColor, AddImprintColor, AddImprintMethod, AddNewCore, DeleteColor, DeleteImprintColor, UpdateColor, UpdateImprintColor, UpdateImprintMethod } from '../../system.types';

@Component({
  selector: 'app-core-routing-products',
  templateUrl: './core-routing.component.html',
  styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CoreRoutingProductsComponent implements OnInit, OnDestroy {

  constructor(
  ) { }

  ngOnInit(): void {

  };
  /**
     * On destroy
     */
  ngOnDestroy(): void {
  };

}
