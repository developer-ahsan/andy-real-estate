import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerService } from '../../store-manager.service';
import { DashboardsService } from 'app/modules/admin/dashboards/dashboard.service';
import { StoreSettings } from '../../stores.types';

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}


@Component({
  selector: 'app-store-settings',
  templateUrl: './store-settings.component.html'
})
export class StoreSettingsComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  isStoreFetch: boolean = true;
  selected = 'YES';
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  quillModules: any = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': ['white'] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };
  storeSettingsForm: FormGroup;

  mainScreen: string = "Store Settings";
  screens = [
    "Store Settings",
    "Jaggaer Settings"
  ];

  isStoreSettingsUpdate: boolean = false;
  flashMessage: 'success' | 'error' | null = null;
  suppliersList: any = [];
  constructor(
    private _storesManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _commonService: DashboardsService
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  };
  getStoreDetails() {
    this._storesManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
        this.getSuppliers();
        this._storesManagerService.settings$.pipe(takeUntil(this._unsubscribeAll))
          .subscribe((settings: any) => {
            let storeSetting = settings["data"][0];
            let selectedStore = items["data"][0];
            selectedStore["reportColor"] = `#${selectedStore["reportColor"]}`;
            storeSetting["cashbackPercent"] = storeSetting["cashbackPercent"] * 100;
            storeSetting["shippingMargin"] = storeSetting["shippingMargin"] * 100;
            storeSetting["extrasMargin"] = storeSetting["extrasMargin"] * 100;

            this.storeSettingsForm.patchValue(selectedStore);
            this.storeSettingsForm.patchValue(storeSetting);

            this.isStoreFetch = false;
          });
      });
  }
  getSuppliers() {
    this.suppliersList.push({ companyName: 'NONE - Use master product level imprint settings', pk_companyID: 0 })
    this._commonService.suppliersData$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(suppliers => {
        const activeSuppliers = suppliers["data"].filter(element => element.blnActiveVendor);
        this.suppliersList.push(...activeSuppliers);
      })
  }
  initialize() {
    this.storeSettingsForm = this._formBuilder.group({
      storeName: ['', Validators.required],
      storeCode: [''],
      businessName: [''],
      storeURL: [''],
      tagLine: [''],
      browserTitle: [''],
      metaDesc: [''],
      metaKeywords: [''],
      registrationText: [''],
      storeHandling: [''],
      siteMaxSiteID: [''],
      siteMaxQueueID: [''],
      googleAnalyticsID: [''],
      googleTag: [''],
      bingTag: [''],
      reportColor: [''],
      protocol: [''],
      blnShipping: [''],
      fk_creditTermID: [''],
      blnTaxExempt: [''],
      blnCostCenterCodes: [''],
      blnShowCostCenterCodes: [''],
      blnRequireCostCenterCode: [''],
      blnRequireLocation: [''],
      blnRequireAccountCode: [''],
      blnPDFInvoice: [''],
      blnPDFShippingNotifications: [''],
      blnLogoBank: [''],
      blnTopReviewEmail: [''],
      blnElectronicInvoicing: [''],
      blnStoreHeaderImage: [''],
      blnProductNumbers: [''],
      blnCustomerLogoBank: [''],
      blnDecliningProgramNotifications: [''],
      blnCheckoutReferral: [''],
      blnExpandedProductSearch: [''],
      blnQuoteHelp: [''],
      blnExitSurvey: [''],
      blnSmartArtQuotes: [''],
      blnSalesReport: [''],
      blnChat: [''],
      productBuilderText: [''],
      blnAllowRegistration: [''],
      blnRequireReference: [''],
      blnWelcomeEmail: [''],
      blnWelcomeEmailPromocode: [''],
      blnReorderEmails: [''],
      blnReviewEmails: [''],
      blnReorderPromoCode: [''],
      blnTopRatedScroller: [''],
      blnMasterAccountShowAllOrders: [''],
      blnCashback: [''],
      cashbackPercent: [''],
      blnRegisteredUsersCashbackDefault: [''],
      blnMSRP: [''],
      blnPercentSavings: [''],
      blnWaiveFirstImprintCharge: [''],
      blnQuoteFinalizationReminders: [''],
      extrasMargin: [''],
      blnImprintSetups: [''],
      storeApparelDecoratorID: [''],
      shippingMargin: ['']
    });
  }

  calledScreen(screenName): void {
    this.mainScreen = screenName;
  };

  callStoreScreen(): void {
    this.mainScreen = "Store Settings";
  };

  saveChanges(): void {
    const { pk_storeID, championName, blnEProcurement, blnElectronicInvoicing } = this.selectedStore;
    const formValues = this.storeSettingsForm.getRawValue();

    let payload: StoreSettings = {
      store_id: pk_storeID,
      store_name: formValues.storeName?.replace(/'/g, "''"),
      store_code: formValues.storeCode?.replace(/'/g, "''"),
      store_url: formValues.storeURL?.replace(/'/g, "''"),
      store_description: formValues.metaDesc?.replace(/'/g, "''"),
      store_handling: formValues.storeHandling,
      site_max_id: formValues.siteMaxSiteID,
      site_max_queue_id: formValues.siteMaxQueueID,
      google_analytics_id: formValues.googleAnalyticsID,
      tagline: formValues.tagLine?.replace(/'/g, "''"),
      champion_name: championName?.replace(/'/g, "''"),
      bln_eprocurement: blnEProcurement,
      bln_electronic_invoice: blnElectronicInvoicing,
      browser_title: formValues.browserTitle?.replace(/'/g, "''"),
      meta_description: formValues.metaDesc?.replace(/'/g, "''"),
      meta_keyword: formValues.metaKeywords?.replace(/'/g, "''"),
      bln_shipping: formValues.blnShipping,
      protocol: formValues.protocol?.replace(/'/g, "''"),
      business_name: formValues.businessName?.replace(/'/g, "''"),
      report_color: formValues.reportColor?.replace(/'/g, "''"),
      fk_credit_term_id: formValues.fk_creditTermID,
      registration_text: formValues.registrationText?.replace(/'/g, "''"),
      bln_require_reference: formValues.blnRequireReference,
      bln_tax_exempt: formValues.blnTaxExempt,
      bln_cost_center_codes: formValues.blnCostCenterCodes,
      bln_show_cost_center_codes: formValues.blnShowCostCenterCodes,
      bln_welcome_email: formValues.blnWelcomeEmail,
      google_tag: formValues.googleTag?.replace(/'/g, "''"),
      bing_tag: formValues.bingTag?.replace(/'/g, "''"),
      bln_require_cost_center_code: formValues.blnRequireCostCenterCode,
      bln_require_location: formValues.blnRequireLocation,
      bln_product_numbers: formValues.blnProductNumbers,
      bln_pdf_invoice: formValues.blnPDFInvoice,
      bln_logo_bank: formValues.blnLogoBank,
      bln_decline_program_notification: formValues.blnDecliningProgramNotifications,
      bln_checkout_referral: formValues.blnCheckoutReferral,
      bln_expanded_product_search: formValues.blnExpandedProductSearch,
      bln_review_emails: formValues.blnReviewEmails,
      bln_reorder_promo_code: formValues.blnReorderPromoCode,
      bln_reorder_emails: formValues.blnReorderEmails,
      bln_welcome_email_promo_code: formValues.blnWelcomeEmailPromocode,
      bln_quote_help: formValues.blnQuoteHelp,
      bln_exit_survey: formValues.blnExitSurvey,
      bln_require_account_code: formValues.blnRequireAccountCode,
      bln_top_review_email: formValues.blnTopReviewEmail,
      bln_smart_art_quotes: formValues.blnSmartArtQuotes,
      bln_customer_logo_bank: formValues.blnCustomerLogoBank,
      bln_master_account_show_all_orders: formValues.blnMasterAccountShowAllOrders,
      bln_sales_report: formValues.blnSalesReport,
      bln_cash_back: formValues.blnCashback,
      cashback_percent: formValues.cashbackPercent / 100,
      product_builder_text: formValues.productBuilderText?.replace(/'/g, "''"),
      bln_allow_registration: formValues.blnAllowRegistration,
      bln_pdf_shipping_notification: formValues.blnPDFShippingNotifications,
      bln_registered_user_cashback_default: formValues.blnRegisteredUsersCashbackDefault,
      bln_chat: formValues.blnChat,
      extrasMargin: formValues.extrasMargin / 100,
      blnImprintSetups: formValues.blnImprintSetups,
      storeApparelDecoratorID: formValues.storeApparelDecoratorID,
      blnQuoteFinalizationReminders: formValues.blnQuoteFinalizationReminders,
      shippingMargin: formValues.shippingMargin / 100,
      blnMSRP: formValues.blnMSRP,
      blnPercentSavings: formValues.blnPercentSavings,
      blnWaiveFirstImprintCharge: formValues.blnWaiveFirstImprintCharge,
      store_setting: true,
    };
    payload = this._commonService.replaceNullSpaces(payload);
    payload = this._commonService.replaceSingleQuotesWithDoubleSingleQuotes(payload);
    this.isStoreSettingsUpdate = true;
    this._storesManagerService.updateStoreSettings(payload)
      .subscribe((response) => {
        this.showFlashMessage(
          response["success"] === true ?
            'success' :
            'error'
        );
        this.isStoreSettingsUpdate = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._snackBar.open("Some error occured", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3500
        });
        this.isStoreSettingsUpdate = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });
  };

  /**
 * Show flash message
 */
  showFlashMessage(type: 'success' | 'error'): void {
    // Show the message
    this.flashMessage = type;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Hide it after 3.5 seconds
    setTimeout(() => {

      this.flashMessage = null;

      // Mark for check
      this._changeDetectorRef.markForCheck();
    }, 3500);
  };

  /**
     * On destroy
     */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };

}
