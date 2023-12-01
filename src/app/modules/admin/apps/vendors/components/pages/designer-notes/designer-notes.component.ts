import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { VendorsService } from '../../vendors.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-designer-notes',
  templateUrl: './designer-notes.component.html',
})
export class DesignerNotesComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  notes = null;
  updateLoader: boolean = false;
  supplierData : any;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _vendorService: VendorsService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getVendorsData();
  };

  update() {
    if (this.notes.slice(3, -4).trim() === '') {
      this._snackBar.open("Please fill the required field", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
  }

  getVendorsData() {
    this._vendorService.Single_Suppliers$.pipe(takeUntil(this._unsubscribeAll)).subscribe(supplier => {
      this.supplierData = supplier["data"][0];
      this.notes = this.supplierData.designerNotes;
    })
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
