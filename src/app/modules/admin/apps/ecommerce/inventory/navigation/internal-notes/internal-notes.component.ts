import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-internal-notes',
  templateUrl: './internal-notes.component.html'
})
export class InternalNotesComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  comments = [];
  commentator_emails: string[];
  allSelected = false;
  commentators: [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getCommentByProductId(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((comment) => {
        this.comments = comment["data"];
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getCommentators()
      .subscribe((commentators) => {
        console.log("commentators", commentators);
        this.commentators = commentators["data"];
        this.isLoadingChange.emit(false);
      });

    this.isLoadingChange.emit(false);
  }

  selectOption(list) {
    this.commentator_emails = list.selectedOptions.selected.map(item => item.value)
  }

  selectAll() {
    this.allSelected = !this.allSelected;
    this.commentator_emails = this.allSelected ? this.commentators.map(function (item) {
      return item['email'];
    }) : [];
  }
}


