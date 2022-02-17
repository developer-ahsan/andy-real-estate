import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from 'app/modules/admin/apps/ecommerce/inventory/inventory.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-licensing-term',
  templateUrl: './licensing-term.component.html'
})
export class LicensingTermComponent implements OnInit {
  @Input() selectedProduct: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  selected;
  foods = [];
  licensingTerms = [];
  licensingForm: FormGroup;

  radioButtonForm = false;
  seasons = [];

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _inventoryService: InventoryService,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    // Create the selected product form
    this.licensingForm = this._formBuilder.group({
      select: [''],
      radio: ['']
    });

    const { pk_productID } = this.selectedProduct;
    this._inventoryService.getLicensingCompany()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((licensingCompany) => {
        this.foods = licensingCompany["data"];
        this._changeDetectorRef.markForCheck();
      });

    this._inventoryService.getLicensingTerms(pk_productID)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((licensingTerms) => {
        this.licensingTerms = licensingTerms["data"];
        console.log("this.licensingTerms", this.licensingTerms)
        this._changeDetectorRef.markForCheck();
      });

    this.isLoadingChange.emit(false);
  }

  continue(): void {
    console.log(this.licensingForm.getRawValue());
    this.radioButtonForm = true;
  }
}
