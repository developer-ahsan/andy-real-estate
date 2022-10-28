import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialogComponent, ConfirmDialogModel } from '../../../confirmation-dialog/confirmation-dialog.component';
import { FileManagerService } from '../../../store-manager.service';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-presentation-scrollers',
  templateUrl: './presentation-scrollers.component.html',
})
export class PresentationScrollersComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  imgUrl = environment.products;
  mainScreen: string = "Scrollers";
  screens: string[] = [
    "Scrollers",
    "Default Scrollers",
    "Scroller Order",
    "Testimonials",
  ];
  isPageLoading: boolean = false;
  // Current Testimonials
  testimonialsData: any;
  testimonialColumns = ['delete', 'order', 'testimonial', 'name', 'title'];
  testimonialToggle: boolean = false;
  updateTestimonialLoader: boolean = false;
  deleteTestimonialLoader: boolean = false;
  addTestimonialLoader: boolean = false;
  addTestimonialForm: FormGroup;
  // Default Sccrollers 
  defaultScrollersData: any;
  defaultScrollerLoader: boolean = false;
  defaultScrollerMsg: boolean = false;
  defaultScrollerOrderLoader: boolean = false;
  defaultScrollerOrderMsg: boolean = false;
  // Scrollers
  scrollersData: any;
  scrollerColumns = ['title', 'active', 'action'];
  scrollersLoader: boolean = false;
  scrollersMsg: boolean = false;
  scrollerTitle = '';
  updateScroller: boolean = false;
  updateScrollerData: any;
  updateScrollerDataLoader: boolean = false;
  updateScrollerLoader: boolean = false;
  updateScrollerMsg: boolean = false;
  scrollerProducts: any;
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) { }


  ngOnInit() {
    this.initAddTestimonialForm();
    this._fileManagerService.settings$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.testimonialToggle = res["data"][0].blnTestimonials;
      }
    });
    this.getScreenData('scroller', 'Scrollers', 'get');
  }
  initAddTestimonialForm() {
    this.addTestimonialForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      name: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      testimonial: new FormControl('', Validators.required),
      displayOrder: new FormControl(1, Validators.required),
      add_testimonial: new FormControl(true)
    })
  }
  calledScreen(screen) {
    this.mainScreen = screen;
    if (screen == 'Testimonials') {
      if (!this.testimonialsData) {
        this.getScreenData('presentation_scroller_testimonials', screen, 'get');
      }
    } else if (screen == 'Default Scrollers') {
      if (!this.defaultScrollersData) {
        this.getScreenData('scroller', screen, 'get');
      }
    } else if (screen == 'Scrollers') {
      if (!this.scrollersData) {
        this.getScreenData('scroller', screen, 'get');
      }
    }

  }
  getScreenData(value, screen, type) {
    if (type == 'get') {
      this.isPageLoading = true;
    }
    let params;
    if (screen == 'Default Scrollers' || screen == 'Scroller Order') {
      params = {
        store_id: this.selectedStore.pk_storeID,
        [value]: true,
        presentation: true,
        view_default: 1
      }
    } else if (screen == 'Scrollers') {
      params = {
        store_id: this.selectedStore.pk_storeID,
        [value]: true,
        presentation: true,
        view_default: 0
      }
    } else {
      params = {
        store_id: this.selectedStore.pk_storeID,
        [value]: true,
      };
    }
    this._fileManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        if (screen == "Testimonials") {
          this.testimonialsData = res["data"];
          if (type == 'delete') {
            this.deleteTestimonialLoader = false;
            this._snackBar.open("Testimonials Removed Successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3000
            });
            this._changeDetectorRef.markForCheck();
          } else if (type == 'add') {
            this.addTestimonialLoader = false;
            this._snackBar.open("Testimonials Added Successfully", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3000
            });
            this.initAddTestimonialForm();
            this._changeDetectorRef.markForCheck();
          }
        } else if (screen == "Default Scrollers" || screen == 'Scroller Order') {
          this.defaultScrollersData = res["data"];
        } else if (screen == "Scrollers") {
          this.scrollerTitle = '';
          this.scrollersData = res["data"];
          if (type == 'add') {
            setTimeout(() => {
              this.scrollersMsg = false;
              this._changeDetectorRef.markForCheck();
            }, 2000);
          } else if (type == 'update') {
            this.updateScrollerLoader = false;
            this.backToScrollerList();
            // this.updateScrollerMsg = true;
            // setTimeout(() => {
            //   this.updateScrollerMsg = false;
            //   this._changeDetectorRef.markForCheck();
            // }, 2000);
          }
        }
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  // Testimonials
  UpdateTestimonialStatus() {
    let payload = {
      fk_storeID: this.selectedStore.pk_storeID,
      blnTestimonials: this.testimonialToggle,
      update_testimonial_status: true
    }
    this._fileManagerService.UpdateTestimonialStatus(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this._fileManagerService.getStoreSetting(this.selectedStore.pk_storeID).pipe(takeUntil(this._unsubscribeAll)).subscribe();
    })
  }
  UpdateTestimonials() {
    this.updateTestimonialLoader = true;
    let testimonials = [];
    this.testimonialsData.forEach(element => {
      testimonials.push({
        displayOrder: Number(element.displayOrder),
        testimonial: element.testimonial,
        name: element.name,
        title: element.title,
        pk_testimonialID: Number(element.pk_testimonialID)
      });
    });
    let payload = {
      testimonials, update_testimonials: true
    }
    this._fileManagerService.UpdateTestimonials(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.updateTestimonialLoader = false;
        this._snackBar.open("Testimonials Updated Successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.updateTestimonialLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  DeleteTestimonial() {
    this.deleteTestimonialLoader = true;
    let testimonial_ids = [];
    this.testimonialsData.forEach(element => {
      if (element.blnCheck) {
        testimonial_ids.push(element.pk_testimonialID);
      }
    });
    let payload = {
      testimonial_ids,
      store_id: this.selectedStore.pk_storeID,
      delete_testimonials: true
    }
    this._fileManagerService.DeleteTestimonial(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getScreenData('presentation_scroller_testimonials', this.mainScreen, 'delete');
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.deleteTestimonialLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  AddTestimonial() {
    const { name, title, testimonial, displayOrder } = this.addTestimonialForm.getRawValue();
    if (name == '' || title == '' || testimonial == '' || displayOrder == '') {
      this._snackBar.open("Please fill out the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.addTestimonialLoader = true;
      this._fileManagerService.AddTestimonial(this.addTestimonialForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.getScreenData('presentation_scroller_testimonials', this.mainScreen, 'add');
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.addTestimonialLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }
  }
  // Default Scrollers
  UpdateDefaultScroller() {
    this.defaultScrollerLoader = true;
    let scrollers = [];
    this.defaultScrollersData.forEach(element => {
      scrollers.push({
        blnActive: element.blnActive,
        scroller_id: Number(element.pk_scrollerID)
      });
    });
    let payload = {
      scrollers, update_default_scroller: true
    }
    this._fileManagerService.UpdateDefaultScroller(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.defaultScrollerLoader = false;
        this.defaultScrollerMsg = true;
        setTimeout(() => {
          this.defaultScrollerMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 2000);
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.defaultScrollerLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdateScrollerOrder() {
    this.defaultScrollerOrderLoader = true;
    let scrollers = [];
    this.defaultScrollersData.forEach(element => {
      let order = 1;
      if (element.displayOrder != '') {
        order = element.displayOrder;
      }
      scrollers.push({
        displayOrder: Number(order),
        scroller_id: Number(element.pk_scrollerID)
      });
    });
    let payload = {
      scrollers, update_scroller_order: true
    }
    this._fileManagerService.UpdateScrollerOrder(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.defaultScrollerOrderLoader = false;
        this.defaultScrollerOrderMsg = true;
        setTimeout(() => {
          this.defaultScrollerOrderMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 2000);
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.defaultScrollerOrderLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Scrollers
  AddScroller() {
    if (this.scrollerTitle == '') {
      this._snackBar.open("Please fill out the required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      this.scrollersLoader = true;
      let payload = {
        fk_storeID: this.selectedStore.pk_storeID, add_scroller: true, title: this.scrollerTitle
      }
      this._fileManagerService.AddScroller(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res["success"]) {
          this.scrollersLoader = false;
          this.scrollersMsg = true;
          this.getScreenData('scroller', 'Scrollers', 'add');
          this._changeDetectorRef.markForCheck();
        }
      }, err => {
        this.scrollersLoader = false;
        this._changeDetectorRef.markForCheck();
      })
    }
  }
  DeleteScroller(obj) {
    const message = ``;

    const dialogData = new ConfirmDialogModel("Are you sure you want to remove this scroller?  This action cannot be undone.", message);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      maxWidth: "500px"
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        obj.deleteLoader = true;
        this._changeDetectorRef.markForCheck();
        let payload = {
          scroller_id: obj.pk_scrollerID,
          delete_scroller: true
        }
        this._fileManagerService.DeleteScroller(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          obj.deleteLoader = false;
          if (res["success"]) {
            this.scrollersData = this.scrollersData.filter((value) => {
              return value.pk_scrollerID != obj.pk_scrollerID;
            });
            this._changeDetectorRef.markForCheck();
          }
        }, err => {
          obj.deleteLoader = false;
          this._changeDetectorRef.markForCheck();
        })
      }
    });
  }
  updateScrollerToggle(obj) {
    this.updateScroller = true;
    this.updateScrollerData = obj;
    this.scrollerTitle = obj.title;
    this.getScrollerProduct();
  }
  backToScrollerList() {
    this.updateScroller = false;
    this.updateScrollerData = null;
    this.scrollerTitle = '';
    this.scrollerProducts = null;
  }
  getScrollerProduct() {
    this.updateScrollerDataLoader = true;
    let params = {
      presentation_scroller_items: true,
      scroller_id: this.updateScrollerData.pk_scrollerID
    }
    this._fileManagerService.getStoresData(params).subscribe(res => {
      this.updateScrollerDataLoader = false;
      this.scrollerProducts = res["data"];
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.updateScrollerDataLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  UpdateScroller() {
    this.updateScrollerLoader = true;
    let payload = {
      title: this.scrollerTitle,
      update_scroller: true,
      blnActive: this.updateScrollerData.blnActive,
      scroller_id: this.updateScrollerData.pk_scrollerID
    }
    this._fileManagerService.UpdateScroller(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this.getScreenData('scroller', 'Scrollers', 'update');
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.updateScrollerLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  onImgError(event) {
    event.target.src = 'https://assets.consolidus.com/globalAssets/Products/coming_soon.jpg'
    //Do other stuff with the event.target
  }
}
