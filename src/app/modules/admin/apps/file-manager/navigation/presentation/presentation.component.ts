import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { finalize, takeUntil, map, concatAll } from "rxjs/operators";
import { FileManagerService } from "../../store-manager.service";
import { environment } from "environments/environment";
import moment from "moment";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LogoBankNotesUpdate } from "./presentation.types";
import { DeleteImage, RemoveStoreLogoBank, addStoreLogoBank, updateLogoBankOrder, updateStoreLogoBank, uploadImage } from "../../stores.types";
import * as imageConversion from 'image-conversion';
import html2canvas from 'html2canvas';
import { DashboardsService } from "app/modules/admin/dashboards/dashboard.service";

@Component({
  selector: "app-presentation",
  templateUrl: "./presentation.component.html",
  styleUrls: ["./presentation.scss"],
})
export class PresentationComponent implements OnInit, OnDestroy {
  selectedStore: any;
  isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('favICOImage') favICOImage: ElementRef;
  @ViewChild('fileInputLogo') fileInputLogo: ElementRef;
  @ViewChild('svgElement') svgElement: ElementRef;


  presentationScreen: string = "Look & Feel";
  selected = "YES";
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: ["white"] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };
  presentationButtons: string[] = [
    "Look & Feel",
    "Site Color",
    "Masthead",
    "Feature Images",
    "Social Media",
    "Support Team",
    "Special offers",
    "Typekit",
    "News Feed",
    "Logo bank",
    "Brand Guide",
    "Favicon",
    "Sitemap",
    "Payment methods",
    "Feature Campaign",
    "Home Page Scrollers",
    "Header Image",
    "Default Dashboard Emails",
    "Product Builder Settings",
    "Order Options",
    "Artwork tags",
    "Quick guides",
  ];
  checked = false;

  isPageLoading: boolean = false;
  mastHeadImg = "";
  socialMediaForm: FormGroup;
  // News Feed
  // Campaigns
  // Payment Methods
  onlineCreditForm: FormGroup;
  prepaymentForm: FormGroup;
  thirdPartyForm: FormGroup;
  creditTermsForm: FormGroup;
  // Support Team
  teamForm: FormGroup;
  teamData: any;
  teamImageUrl = environment.supportTeam;
  availableTeamData: any;
  // Feature Images
  featureImagesData: any;
  featureImageUrl = "";
  addNewFeature: boolean = false;

  drawerOpened: boolean = false;
  selectedIndex: any;
  drawerMode = "over";


  // Look & Feel 
  ngBlnColorHeader: boolean = false;
  lookFeelLoader: boolean = false;
  lookFeelMsg: boolean = false;
  // SiteColor
  siteColorsForm: FormGroup;
  siteColorLoader: boolean = false;
  siteColorMsg: boolean = false;
  // Special Offers
  specialOfferForm: FormGroup;
  specialOfferLoader: boolean = false;
  specialOfferMsg: boolean = false;
  // Typekit
  ngTypeKit = "";
  typekitLoader: boolean = false;
  typekitMsg: boolean = false;
  // News Feed
  newsFeedData: any;
  newsFeedAddLoader: boolean = false;
  newsFeedAddMsg: boolean = false;
  newsFeedAddForm: FormGroup;
  newsFeedUpdateForm: FormGroup;
  newsFeedUpdateLoader: boolean = false;
  newsFeedUpdateMsg: boolean = false;
  isNewsFeedAdd: boolean = false;
  isNewsFeedupdate: boolean = false;
  newsFeedColumns: string[] = ['id', 'date', 'title', 'action'];

  // Dashboard Emails 
  dashboardEmailsForm: FormGroup;
  dashboardEmailLoader: boolean = false;
  dashboardEmailMsg: boolean = false;
  // Featured Campaigns
  campaignData: any = [];
  fetureCampaignLoader: boolean = false;
  featureCampaignMsg: boolean = false;

  quickGuides = {
    screens: ['Quick Guide Header', 'New Quick Guide', 'Current Quick Guides'],
    mainScreen: 'Quick Guide Header'
  }
  imageValue: any;
  masHeadLoader: boolean = false;

  quickGuideImage = '';
  quickGuideCheck: boolean = true;
  quickGuideImageLoader: boolean = false;
  QuickimageValue: any;

  // Order Options
  orderOptions: any = {
    image: '',
    check: true,
    loader: false,
    imageValue: {
      imageUpload: '',
      type: ''
    }
  }
  presentationData: any;

  // Product Builder Settings
  productBuilderSettings: any;
  productBuilderLoader: boolean = false;
  productBuilderMsg: boolean = false;

  settings: any;
  isLogoBankNotesLoader: boolean = false;
  addLogoBankForm: FormGroup;
  isAddLogoBankLoader: boolean = false;
  logoBankImageValue: any;
  logoBanks: any = [];
  logoBanksLoader: boolean = false;
  logoBanksTotal = 0;
  logoBanksPage = 1;
  logoBanksLoadMore: boolean = false;
  ngLogoBank = 0;
  ngLogoKeyword = '';
  orderOptionImage: boolean = false;

  // FavICon
  favImage: string = '';
  favImageCheck: boolean = true;
  favimageValue: any;
  favUploadLoader: boolean = false;
  logoBankScreens = 'Current Logos';
  isUpdateLogoDisplayLoader: boolean = false;
  constructor(
    private _storeManagerService: FileManagerService,
    private _commonService: DashboardsService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getStoreDetails();
  }
  getStoreDetails() {
    this._storeManagerService.storeDetail$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((items: any) => {
        this.selectedStore = items["data"][0];
        this.initialize();
        this._storeManagerService.settings$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          if (res) {
            this.settings = res["data"][0];
            this.ngBlnColorHeader = res["data"][0].blnColorHeaders;
          }
        })
      });
  }
  initialize() {
    this.favImage = `https://assets.consolidus.com/globalAssets/Stores/Favicon/${this.selectedStore.pk_storeID}.ico?${Math.random()}`;
    this.initSiteColorForm();
    this.initSpecialOfferForm();
    this.initNewsFeedForm();
    this.initDashboardEmailForm();
    this.mastHeadImg = environment.storeMedia + `/mastheads/` + this.selectedStore.pk_storeID + ".gif?" + Math.random();
    this.quickGuideImage = environment.storeMedia + `/quickGuides/headers/` + this.selectedStore.pk_storeID + ".jpg?" + Math.random();
    this.featureImageUrl = environment.featureImage + this.selectedStore.pk_storeID + "/";

    this.socialMediaForm = new FormGroup({
      facebookPage: new FormControl(""),
      twitterPage: new FormControl(""),
      linkedInPage: new FormControl(""),
      instagramPage: new FormControl(""),
    });

    this.onlineCreditForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
    });
    this.prepaymentForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
    });
    this.thirdPartyForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
    });
    this.creditTermsForm = new FormGroup({
      title: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      blnActive: new FormControl("", Validators.required),
      blnPrimary: new FormControl("", Validators.required),
    });
    this.teamForm = this.formBuilder.group({
      memberDetails: this.formBuilder.array([]),
    });
    this.addLogoBankForm = new FormGroup({
      name: new FormControl("", Validators.required),
      description: new FormControl("", Validators.required),
      displayOrder: new FormControl("", Validators.required),
      bank_type: new FormControl(1, Validators.required),
      color_list: new FormControl("", Validators.required),
    });
  }
  initSiteColorForm() {
    this.siteColorsForm = new FormGroup({
      mainNav: new FormControl("", Validators.required),
      primaryHighlight: new FormControl("", Validators.required),
      mainNavHover: new FormControl("", Validators.required),
      catMenuLink: new FormControl("", Validators.required),
      catMenuLinkHover: new FormControl("", Validators.required),
      subCatMenuLink: new FormControl("", Validators.required),
      subCatMenuLinkHover: new FormControl("", Validators.required),
      link: new FormControl("", Validators.required),
      linkHover: new FormControl("", Validators.required),
      homeFeatureLink: new FormControl("", Validators.required),
      homeFeatureLinkHover: new FormControl(""),
      secondaryHighlight: new FormControl("", Validators.required),
      mainNavLinkColor: new FormControl("", Validators.required),
      mainNavLinkColorHover: new FormControl("", Validators.required),
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      site_colors_update: new FormControl(true)
    });
  }
  initSpecialOfferForm() {
    this.specialOfferForm = new FormGroup({
      blnOffer: new FormControl(false),
      offerText: new FormControl(""),
      offerTextBox: new FormControl(""),
      offerFooter: new FormControl(""),
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      update_special_offer: new FormControl(true)
    });
  }
  initNewsFeedForm() {
    this.newsFeedAddForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      title: new FormControl('', Validators.required),
      date: new FormControl(new Date(), Validators.required),
      news: new FormControl('', Validators.required),
      add_news_feed: new FormControl(true)
    });
    this.newsFeedUpdateForm = new FormGroup({
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      title: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      news: new FormControl('', Validators.required),
      pk_newsFeedID: new FormControl('', Validators.required),
      update_news_feed: new FormControl(true)
    });
  }
  initDashboardEmailForm() {
    this.dashboardEmailsForm = new FormGroup({
      rescheduleFollowUp: new FormControl(''),
      sampleEmail: new FormControl(''),
      paymentNotification: new FormControl(''),
      followUpEmail: new FormControl(''),
      reorderEmail: new FormControl(''),
      surveyEmail: new FormControl(''),
      surveyEmailSubject: new FormControl(''),
      quoteEmailSubject: new FormControl(''),
      quoteEmail: new FormControl(''),
      fk_storeID: new FormControl(this.selectedStore.pk_storeID),
      update_default_email: new FormControl(true)
    })
  }
  get color() {
    return this.siteColorsForm.controls;
  }
  currentTestimonial: string[] = ["id", "name", "decorator", "order"];
  // displayedColumns: string[] = ['id', 'method', 'decorator', 'active', 'action'];
  // dataSource = [];
  displayedColumns: string[] = ["spid", "name", "master", "store"];
  dataSource = [];
  calledScreenQuickGuide(screenName) {
    this.quickGuides.mainScreen = screenName;
  }
  calledScreen(screenName): void {
    this.presentationData = null;
    this.drawerOpened = false;
    if (screenName != this.presentationScreen) {
      this.addNewFeature = false;
      this.presentationScreen = screenName;
      if (screenName == "Site Color") {
        this.getScreenData("color", screenName);
      } else if (screenName == "Social Media") {
        this.getScreenData("social_media", screenName);
      } else if (screenName == "News Feed") {
        this.isNewsFeedAdd = false;
        this.isNewsFeedupdate = false;
        this.getScreenData("news_feed", screenName);
      } else if (screenName == "Special offers") {
        this.getScreenData("special_offer", screenName);
      } else if (screenName == "Typekit") {
        this.getScreenData("type_kit", screenName);
      } else if (screenName == "Feature Campaign") {
        this.getScreenData("presentation_feature_campaigns", screenName);
      } else if (screenName == "Payment methods") {
        this.getScreenData("payment_method", screenName);
      } else if (screenName == "Support Team") {
        this.getScreenData("support_team", screenName);
        this.getScreenData("available_support_team", screenName);
      } else if (screenName == "Feature Images") {
        this.getScreenData("presentation_feature_image", screenName);
      } else if (screenName == "Default Dashboard Emails") {
        this.getScreenData("presentation_default_emails", screenName);
      } else if (screenName == 'Artwork tags') {
        this.getScreenData("artwork_tags_presentation", screenName);
      } else if (screenName == 'Product Builder Settings') {
        this.getScreenData("product_builder_presentation", screenName);
      } else if (screenName == 'Quick guides') {
        this.getScreenData("quickGuides_presentation", screenName);
      } else if (screenName == 'Header Image') {
        this.getScreenData("header_image_presentation", screenName);
      } else if (screenName == 'Logo bank') {
        this.getLogoBanks(1);
      } else if (screenName == 'Order Options') {
        let url = environment.storeMedia + `/orderOptionsHeaders/` + this.selectedStore.pk_storeID + ".jpg";
        this.checkIfImageExists(url);
      }
    }
  }

  checkIfImageExists(url) {
    const img = new Image();
    img.src = url;

    img.onload = () => {
      this.orderOptionImage = true;
      this.orderOptions.image = url;
      this._changeDetectorRef.markForCheck();
    };

    img.onerror = () => {
      this.orderOptionImage = false;
      this._changeDetectorRef.markForCheck();
    };
  }

  deleteImage() {
    let payload = {
      files: [`/globalAssets/Stores/orderOptionsHeaders/${this.selectedStore.pk_storeID}.jpg`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this._storeManagerService.snackBar('Image Removed Successfully');
        this.orderOptionImage = false;
        this.orderOptions.image = '';
        this._changeDetectorRef.markForCheck();
      }, err => {
        this._changeDetectorRef.markForCheck();
      })
  }

  getScreenData(value, screen) {
    this.isPageLoading = true;
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      [value]: true,
    };
    this._storeManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        if (screen == "Site Color") {
          this.siteColorsForm.patchValue(res.data[0]);
          this.siteColorsForm.patchValue({
            homeFeatureLink: res.data[0].HomeFeatureLink
          })
        } else if (screen == "Social Media") {
          this.presentationData = res.data[0];
        } else if (screen == "News Feed") {
          this.isNewsFeedAdd = false;
          this.isNewsFeedupdate = false;
          this.presentationData = res.data;
          this.newsFeedData = res.data;
        } else if (screen == "Special offers") {
          this.presentationData = res.data[0];
        } else if (screen == "Typekit") {
          this.ngTypeKit = res.data[0].typeKitID;
        } else if (screen == "Feature Campaign") {
          this.campaignData = res.data;
        } else if (screen == "Payment methods") {
          this.presentationData = res.data;
          this.onlineCreditForm.patchValue(res.data[0]);
          this.prepaymentForm.patchValue(res.data[1]);
          this.thirdPartyForm.patchValue(res.data[2]);
          this.creditTermsForm.patchValue(res.data[3]);
        } else if (screen == "Support Team") {
          if (value == "available_support_team") {
            this.availableTeamData = res;
          } else {
            this.teamData = res.data;
            this.presentationData = res.data;
          }
        } else if (screen == "Feature Images") {
          this.featureImagesData = res.data;
          this.presentationData = res.data;
        } else if (screen == "Default Dashboard Emails") {
          // this.dashboardEmailsForm.patchValue(res.data[0]);
          this.presentationData = res.data[0];
        } else if (screen == "Artwork tags") {
          this.presentationData = res.data;
        } else if (screen == "Product Builder Settings") {
          this.productBuilderSettings = res.data[0];
        } else if (screen == "Quick guides") {
          this.presentationData = res.data;
        } else if (screen == "Header Image") {
          this.presentationData = res.data[0];
        }
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  openFeatureDialog(title): void {
    // Open the dialog
  }
  onUpdate(item, index) {
    // console.log(this.teamForm.value[index]);
  }
  addNewFeatureImageToggle() {
    this.addNewFeature = !this.addNewFeature;
  }
  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  };
  // Look & Feel
  colorHeaderUpdate() {
    this.lookFeelLoader = true;
    let payload = {
      blnColorHeaders: this.ngBlnColorHeader,
      fk_storeID: this.selectedStore.pk_storeID,
      color_header_update: true
    }
    this._storeManagerService.colorHeaderUpdate(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.lookFeelLoader = false;
      if (res["success"]) {
        this._storeManagerService.getStoreSetting(this.selectedStore.pk_storeID).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        this.lookFeelMsg = true;
        setTimeout(() => {
          this.lookFeelMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.lookFeelLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Site Colors
  colorsUpdate() {
    const { primaryHighlight,
      secondaryHighlight,
      mainNav,
      mainNavHover,
      mainNavLinkColor,
      mainNavLinkColorHover,
      catMenuLink,
      catMenuLinkHover,
      subCatMenuLink,
      subCatMenuLinkHover,
      link,
      linkHover,
      homeFeatureLink,
      homeFeatureLinkHover,
      fk_storeID,
      site_colors_update } = this.siteColorsForm.getRawValue();
    let payload = {
      secondaryHighlight: secondaryHighlight.replace('#', ''),
      primaryHighlight: primaryHighlight.replace('#', ''),
      mainNav: mainNav.replace('#', ''),
      mainNavHover: mainNavHover.replace('#', ''),
      mainNavLinkColor: mainNavLinkColor.replace('#', ''),
      mainNavLinkColorHover: mainNavLinkColorHover.replace('#', ''),
      catMenuLink: catMenuLink.replace('#', ''),
      catMenuLinkHover: catMenuLinkHover.replace('#', ''),
      subCatMenuLink: subCatMenuLink.replace('#', ''),
      subCatMenuLinkHover: subCatMenuLinkHover.replace('#', ''),
      link: link.replace('#', ''),
      linkHover: linkHover.replace('#', ''),
      homeFeatureLink: homeFeatureLink.replace('#', ''),
      homeFeatureLinkHover: homeFeatureLinkHover.replace('#', ''),
      fk_storeID,
      site_colors_update
    }
    this.siteColorLoader = true;
    this._storeManagerService.colorsUpdate(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.siteColorLoader = false;
      if (res["success"]) {
        this.siteColorMsg = true;
        setTimeout(() => {
          this.siteColorMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.siteColorLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Special Offers
  UpdateSpecialOffer() {
    this.specialOfferLoader = true;
    this._storeManagerService.UpdateSpecialOffer(this.specialOfferForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.specialOfferLoader = false;
      if (res["success"]) {
        this.specialOfferMsg = true;
        setTimeout(() => {
          this.specialOfferMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.specialOfferLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // Special Offers
  UpdateTypeKit() {
    let payload = {
      typeKitID: this.ngTypeKit,
      fk_storeID: this.selectedStore.pk_storeID,
      update_typekit: true
    }
    this.typekitLoader = true;
    this._storeManagerService.UpdateTypeKit(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.typekitLoader = false;
      if (res["success"]) {
        this.typekitMsg = true;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
          this.typekitMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
    }, err => {
      this.typekitLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  // News Feed
  isAddToggle(check) {
    this.isNewsFeedAdd = check;
    this.isNewsFeedupdate = false;
  }
  isEditToggle(check, obj) {
    this.isNewsFeedAdd = false;
    this.isNewsFeedupdate = check;
    if (check) {
      this.newsFeedUpdateForm.patchValue(obj);
    }
  }
  AddNewsFeed() {
    const { fk_storeID, title, date, news, add_news_feed } = this.newsFeedAddForm.getRawValue();
    if (title == '' || date == '' || news == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        fk_storeID, title, date: moment(date).format('MM/DD/yyyy'),
        news, add_news_feed
      }
      this.newsFeedAddLoader = true;
      this._storeManagerService.AddNewsFeed(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.newsFeedAddLoader = false;
        if (res["success"]) {
          this.getScreenData("news_feed", this.presentationScreen);
          this.newsFeedAddMsg = true;
          setTimeout(() => {
            this.newsFeedAddMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 3000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.newsFeedAddLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  UpdateNewsFeed() {
    const { fk_storeID, title, date, news, update_news_feed, pk_newsFeedID } = this.newsFeedUpdateForm.getRawValue();
    if (title == '' || date == '' || news == '') {
      this._snackBar.open("Please fill out required fields", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
    } else {
      let payload = {
        fk_storeID, title, date: moment(date).format('MM/DD/yyyy'),
        news, update_news_feed, pk_newsFeedID
      }
      this.newsFeedUpdateLoader = true;
      this._storeManagerService.UpdateNewsFeed(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        this.newsFeedUpdateLoader = false;
        if (res["success"]) {
          this.getScreenData("news_feed", this.presentationScreen);
          this.newsFeedUpdateMsg = true;
          setTimeout(() => {
            this.newsFeedUpdateMsg = false;
            this._changeDetectorRef.markForCheck();
          }, 3000);
        }
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.newsFeedUpdateLoader = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }
  DeleteNewsFeed(element) {
    element.deleteLoader = true;
    let payload = {
      fk_storeID: this.selectedStore.pk_storeID,
      pk_newsFeedID: element.pk_newsFeedID,
      delete_news_feed: true
    }
    this._storeManagerService.DeleteNewsFeed(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      element.deleteLoader = false;
      this.newsFeedData = this.newsFeedData.filter((value) => {
        return value.pk_newsFeedID != element.pk_newsFeedID;
      });
      if (res["success"]) {
        this._snackBar.open("News feed removed successfully", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      element.deleteLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Dashboard Emails
  DefaultEmailUpdate() {
    this.dashboardEmailLoader = true;
    this._storeManagerService.DefaultEmailUpdate(this.dashboardEmailsForm.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.dashboardEmailLoader = false;
      if (res["success"]) {
        this.dashboardEmailMsg = true;
        setTimeout(() => {
          this.dashboardEmailMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 3000);
      }
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.dashboardEmailLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  // Featured Campaigns
  UpdateFeatureCampaign() {
    this.fetureCampaignLoader = true;
    let campaignIDsList = []
    this.campaignData.forEach(element => {
      if (element.isFeature) {
        campaignIDsList.push({ pk_campaignID: element.pk_campaignID, isFeature: element.isFeature })
      }
    });
    let payload = {
      campaignIDsList: campaignIDsList,
      fk_storeID: this.selectedStore.pk_storeID,
      update_presentation_feature_campaign: true
    }
    this._storeManagerService.UpdateFeatureCampaign(payload)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.fetureCampaignLoader = false;
        this.featureCampaignMsg = true;
        setTimeout(() => {
          this.featureCampaignMsg = false;
          this._changeDetectorRef.markForCheck();
        }, 2500);
        this._changeDetectorRef.markForCheck();
      }, (err => {
        this.fetureCampaignLoader = false;
        this._changeDetectorRef.markForCheck();
      }))
  }
  // MastHead
  uploadImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 369 || image.height != 82) {
          this._snackBar.open("Dimensions allowed are 369px x 82px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.imageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.imageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    };
  };
  uploadMediaCampaign() {
    if (!this.imageValue) {
      this._snackBar.open("File is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    this.masHeadLoader = true;
    const { imageUpload, type } = this.imageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/mastheads/${this.selectedStore.pk_storeID}.gif`
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.mastHeadImg = environment.storeMedia + `/mastheads/` + this.selectedStore.pk_storeID + ".gif?" + Math.random();
        this.masHeadLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.masHeadLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  // Quick Guides
  CheckQuickGuideImage(image) {
    this.quickGuideCheck = false;
  }
  uploadQuickImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 1500 || image.height != 300) {
          this._snackBar.open("Dimensions allowed are 1500px x 300px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.QuickimageValue = null;
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.QuickimageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    };
  };
  uploadQuickMediaCampaign() {
    if (!this.QuickimageValue) {
      this._snackBar.open("File is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    this.quickGuideImageLoader = true;
    const { imageUpload, type } = this.QuickimageValue;
    const base64 = imageUpload.split(",")[1];
    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/quickGuides/headers/${this.selectedStore.pk_storeID}.jpg`
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.mastHeadImg = environment.storeMedia + `/quickGuides/headers/` + this.selectedStore.pk_storeID + ".jpg?" + Math.random();
        this.quickGuideCheck = true;
        this.quickGuideImageLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.quickGuideImageLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }

  // Common Upload File Function
  uploadFile(event, type): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (type == 'options') {
          if (image.width != 1500 || image.height != 300) {
            this._snackBar.open("Dimensions allowed are 1500px x 300px", '', {
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              duration: 3500
            });
            this.fileInput.nativeElement.value = '';
            this.orderOptions.imageValue = null;
            this._changeDetectorRef.markForCheck();
            return;
          };
          this.orderOptions.imageValue = {
            imageUpload: reader.result,
            type: file["type"]
          };
        }
      }
    };
  };
  uploadMedia(check) {
    let base64;
    let img_path = '';
    let url;
    if (check == 'options') {
      if (this.orderOptions.imageValue.imageUpload == "") {
        this._snackBar.open("File is required", '', {
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          duration: 3000
        });
        this.fileInput.nativeElement.value = '';
        return;
      } else {
        this.orderOptions.loader = true;
        const { imageUpload } = this.orderOptions.imageValue;
        base64 = imageUpload.split(",")[1];
        img_path = `/globalAssets/Stores/orderOptionsHeaders/${this.selectedStore.pk_storeID}.jpg`
        url = environment.storeMedia + `/orderOptionsHeaders/` + this.selectedStore.pk_storeID + ".jpg?" + Math.random();
      }
    }

    const payload = {
      file_upload: true,
      image_file: base64,
      image_path: img_path
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.mastHeadImg = url;
        if (check == 'options') {
          this.orderOptions.image = url;
          this.orderOptions.check = true;
          this.orderOptions.loader = false;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }, err => {
        if (check == 'options') {
          this.orderOptions.check = true;
          this.orderOptions.loader = false;
        }
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  checkImageExist(check) {
    if (check == 'options') {
      this.orderOptions.check = false;
    }
  }
  updateProductBuilderSettings() {
    this.productBuilderLoader = true;
    let payload = {
      store_id: this.selectedStore.pk_storeID,
      blnAllowImprintColorSelection: this.productBuilderSettings.blnAllowImprintColorSelection,
      update_product_builder: true
    }
    this._storeManagerService.UpdateProductBuilder(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      this.productBuilderLoader = false;
      this.productBuilderMsg = true;
      setTimeout(() => {
        this.productBuilderMsg = false;
        this._changeDetectorRef.markForCheck();
      }, 3000);
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.productBuilderLoader = false;
      this._changeDetectorRef.markForCheck();
    })
  }
  updateLogoBankNotes() {
    if (!this.settings.logoBankNotes) {
      this._storeManagerService.snackBar('Please add some notes');
      return;
    }
    let payload: LogoBankNotesUpdate = {
      notes: this.settings.logoBankNotes,
      fk_storeID: this.selectedStore.pk_storeID,
      update_logo_bank_notes: true
    }
    this.isLogoBankNotesLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
      }
      this.isLogoBankNotesLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isLogoBankNotesLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadLogoBank() {
    if (!this.logoBankImageValue) {
      this._storeManagerService.snackBar('Please select any file');
      return;
    }
    const { imageUpload, type } = this.logoBankImageValue;
    const base64 = imageUpload.split(",")[1];
    const { name, description, displayOrder, bank_type, color_list } = this.addLogoBankForm.getRawValue();
    let payload: addStoreLogoBank = {
      store_id: this.selectedStore.pk_storeID,
      name: name,
      description: description,
      displayOrder: displayOrder,
      bank_type: bank_type,
      file_extension: this.logoBankImageValue.type,
      color_list: color_list,
      base64File: base64,
      add_store_logoBank: true
    }
    this.isAddLogoBankLoader = true;
    this._storeManagerService.postStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        this.uploadMediaLogoBankVector(res["newId"], base64);
        this.uploadMediaLogoBank(res["newId"], res["jpgBase64"]);
        this.addLogoBankForm.reset();
      } else {
        this.isAddLogoBankLoader = false;
        this._changeDetectorRef.markForCheck();
      }
    }, err => {
      this.isAddLogoBankLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  uploadLogoBankFile(event): void {
    const file = event.target.files[0];
    let type = 'svg';
    if (file.name.includes('svg')) {
      type = 'svg';
    }
    // else if (file.type === 'application/pdf') {
    //   type = 'pdf';
    // } 
    else {
      this.logoBankImageValue = null;
      this.fileInputLogo.nativeElement.value = '';
      this._storeManagerService.snackBar('Please select only SVG or PDF file');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.logoBankImageValue = {
        imageUpload: reader.result,
        type: type
      };
    };
  };
  uploadMediaLogoBankVector(id, base64) {
    const { imageUpload, type } = this.logoBankImageValue;
    let eps = {
      storeID: Number(this.selectedStore.pk_storeID),
      logiBankId: Number(id),
      type: type
    }
    const payload: uploadImage = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/LogoBank2/${this.selectedStore.pk_storeID}/${id}.svg`
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        // Mark for check
        this.getLogoBanks(1);
        this.logoBankImageValue = null;
        this.fileInputLogo.nativeElement.value = '';
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.masHeadLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  uploadMediaLogoBank(id, base64) {
    const { imageUpload, type } = this.logoBankImageValue;
    let eps = {
      storeID: Number(this.selectedStore.pk_storeID),
      logiBankId: Number(id),
      type: type
    }
    const payload: uploadImage = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/LogoBank2/${this.selectedStore.pk_storeID}/Thumbs/${id}.jpg`
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        // Mark for check
        this.getLogoBanks(1);
        this.logoBankImageValue = null;
        this.fileInputLogo.nativeElement.value = '';
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.masHeadLoader = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      })
  }
  getLogoBanks(page) {
    const { pk_storeID } = this.selectedStore;
    let params = {
      store_logo_banks: true,
      store_id: pk_storeID,
      page: page,
      bank_type: this.ngLogoBank,
      keyword: this.ngLogoKeyword
    }
    if (page == 1) {
      this.logoBanksLoader = true;
      this.logoBanks = [];
    }
    // Get the supplier products
    this._storeManagerService.getStoresData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.logoBanks = this.logoBanks.concat(response["data"]);
        this.logoBanksTotal = response["totalRecords"];
        this.logoBanksLoader = false;
        this.logoBanksLoadMore = false;
        this.isAddLogoBankLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.logoBanksLoader = false;
        this.logoBanksLoadMore = false;
        this.isAddLogoBankLoader = false;
        this._changeDetectorRef.markForCheck();
      });
  };
  nextLogoBanks() {
    this.logoBanksPage++;
    this.logoBanksLoadMore = true;
    this._changeDetectorRef.markForCheck();
    this.getLogoBanks(this.logoBanksPage);
  }
  updateLogoBank(item) {
    let payload: updateStoreLogoBank = {
      name: item.name,
      description: item.description,
      color_list: item.color_list,
      logo_bank_id: item.pk_logoBankID,
      update_store_logoBank: true
    }
    item.updateLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
      }
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.updateLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  removeLogoBank(item) {
    let payload: RemoveStoreLogoBank = {
      logo_bank_id: item.pk_logoBankID,
      delete_store_logoBank: true
    }
    item.removeLoader = true;
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
        let index = this.logoBanks.findIndex(logo => logo.pk_logoBankID == item.pk_logoBankID);
        this.logoBanks.splice(index, 1);
        this.logoBanksTotal--;
      }
      item.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      item.removeLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
  checkFavImageExist(ev) {
    this.favImageCheck = false;
    this._changeDetectorRef.markForCheck();
  }
  uploadFaviconImage(event): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let image: any = new Image;
      image.src = reader.result;
      image.onload = () => {
        if (image.width != 16 || image.height != 16) {
          this._snackBar.open("Dimensions allowed are 16px x 16px", '', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 3500
          });
          this.favimageValue = null;
          this.favICOImage.nativeElement.value = '';
          this._changeDetectorRef.markForCheck();
          return;
        };
        this.favimageValue = {
          imageUpload: reader.result,
          type: file["type"]
        };
      }
    };
  };
  uploadMediaFavicon() {
    let payload;
    if (!this.favimageValue) {
      this._snackBar.open("File is required", '', {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 3000
      });
      return;
    }
    const { imageUpload, type } = this.favimageValue;
    const base64 = imageUpload.split(",")[1];
    this.favUploadLoader = true;
    payload = {
      file_upload: true,
      image_file: base64,
      image_path: `/globalAssets/Stores/Favicon/${this.selectedStore.pk_storeID}.ico`
    };

    this._storeManagerService.addPresentationMedia(payload)
      .subscribe((response) => {
        this.favImage = `https://assets.consolidus.com/globalAssets/Stores/Favicon/${this.selectedStore.pk_storeID}.ico`;
        this.favImageCheck = true;
        this.favimageValue = null;
        this.favICOImage.nativeElement.value = '';
        this._storeManagerService.snackBar('Favicon added successfully.');
        // Mark for check
        this.favUploadLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        // Mark for check
        this.favUploadLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  removeMediaFavICOImage() {
    this.favUploadLoader = true;
    let payload = {
      files: [`/globalAssets/Stores/Favicon/${this.selectedStore.pk_storeID}.ico`],
      delete_multiple_files: true
    }
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this._storeManagerService.snackBar('Image Removed Successfully');
        this.favImageCheck = false;
        this.favImage = null;
        this.favUploadLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.favUploadLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  removeImage() {
    let payload = {
      files: [`/globalAssets/Stores/orderOptionsHeaders/${this.selectedStore.pk_storeID}.jpg`],
      delete_multiple_files: true
    }
    this.orderOptions.delLoader = true;
    this._commonService.removeMediaFiles(payload).pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response) => {
        this._storeManagerService.snackBar('Image Removed Successfully');
        this.orderOptions.check = false;
        this.orderOptions.delLoader = false;
        this._changeDetectorRef.markForCheck();
      }, err => {
        this.orderOptions.delLoader = false;
        this._changeDetectorRef.markForCheck();
      })
  }
  async convertFileToBase64(file: File): Promise<string | null> {
    try {
      // Read the uploaded file as an ArrayBuffer
      const fileReader = new FileReader();
      const promise = new Promise<ArrayBuffer>((resolve) => {
        fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
        fileReader.readAsArrayBuffer(file);
      });
      const arrayBuffer = await promise;

      // Perform the conversion using image-conversion
      // const convertedImage = await imageConversion. convertToJpg(new Uint8Array(arrayBuffer));

      // Convert the binary image to base64 encoded string
      // const base64String = Buffer.from(convertedImage).toString('base64');
      const base64String = '';
      console.log('Conversion to base64 done');
      return base64String;
    } catch (error) {
      console.error('Error converting the image:', error);
      return null;
    }
  }

  onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement?.files?.[0];
    if (file) {
      this.convertFileToBase64(file).then((base64String) => {
        if (base64String) {
          console.log('Base64 encoded string:', base64String);
          // You can use the base64String as needed, for example, send it to the server or display an image.
        } else {
          console.log('Conversion failed.');
        }
      });
    }
  }
  nextLogoBankScreen(screenName) {
    this.logoBankScreens = screenName;
  }

  updateLogoDisplayOrder() {
    this.isUpdateLogoDisplayLoader = true;
    let logos = [];
    this.logoBanks.forEach(element => {
      logos.push({ logo_bank_id: element.pk_logoBankID, displayOrder: element.displayOrder })
    });
    let payload: updateLogoBankOrder = {
      logoBanks: logos,
      update_logoBank_order: true
    }
    this._storeManagerService.putStoresData(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res["success"]) {
        this._storeManagerService.snackBar(res["message"]);
      }
      this.isUpdateLogoDisplayLoader = false;
      this._changeDetectorRef.markForCheck();
    }, err => {
      this.isUpdateLogoDisplayLoader = false;
      this._changeDetectorRef.markForCheck();
    });
  }
}
