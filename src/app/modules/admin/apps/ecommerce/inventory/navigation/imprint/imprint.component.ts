import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Package } from 'app/modules/admin/apps/ecommerce/inventory/inventory.types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html'
})
export class ImprintComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  displayedColumns: string[] = ['location', 'method', 'decorator', 'active'];
  imprintDisplayedColumns: string[] = ['id', 'name', 'decorator', 'order', 'action'];
  dataSource = [];
  selectedValue: string;
  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];

  imprints = [];
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getImprints(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((imprint) => {
        this.dataSource = imprint["data"];
        console.log("this.dataSource", this.dataSource)
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  updateImprintDisplay(data): void {
    console.log("imprint order", data);
  }

}