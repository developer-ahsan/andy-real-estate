import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { fuseAnimations } from "@fuse/animations";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { InventoryService } from "app/modules/admin/apps/ecommerce/inventory/inventory.service";
import { ProductsDetails } from "app/modules/admin/apps/ecommerce/inventory/inventory.types";
import moment from "moment";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-dashboard-details",
  templateUrl: "./dashboard-details.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: fuseAnimations,
})
export class DashboardDetailsComponent implements OnInit, OnDestroy {

  /**
   * Constructor
   */
  constructor(
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */

  ngOnInit(): void {

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
  }
}
