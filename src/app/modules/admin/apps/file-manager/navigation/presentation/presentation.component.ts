import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { finalize, takeUntil, map } from "rxjs/operators";
import { FileManagerService } from "../../store-manager.service";
import { environment } from "environments/environment";
@Component({
  selector: "app-presentation",
  templateUrl: "./presentation.component.html",
  styleUrls: ["./presentation.scss"],
})
export class PresentationComponent implements OnInit {
  @Input() selectedStore: any;
  @Input() isLoading: boolean;
  @Output() isLoadingChange = new EventEmitter<boolean>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

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
  siteColorsForm: FormGroup;
  mastHeadImg = "";
  socialMediaForm: FormGroup;
  // News Feed
  newsFeedData: any;
  // Special Offers
  specialOfferForm: FormGroup;
  // Typekit
  ngTypeKit = "";
  // Campaigns
  campaignData: any;
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
  constructor(
    private _fileManagerService: FileManagerService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.isLoadingChange.emit(false);
    this.initialize();
  }
  initialize() {
    this.mastHeadImg =
      environment.storeMedia +
      `/mastheads/` +
      this.selectedStore.pk_storeID +
      ".gif";
    this.featureImageUrl =
      environment.featureImage + this.selectedStore.pk_storeID + "/";
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
      HomeFeatureLink: new FormControl("", Validators.required),
      secondaryHighlight: new FormControl("", Validators.required),
      mainNavLinkColor: new FormControl("", Validators.required),
      mainNavLinkColorHover: new FormControl("", Validators.required),
    });
    this.socialMediaForm = new FormGroup({
      facebookPage: new FormControl(""),
      twitterPage: new FormControl(""),
      linkedInPage: new FormControl(""),
      instagramPage: new FormControl(""),
    });
    this.specialOfferForm = new FormGroup({
      blnOffer: new FormControl(false),
      offerText: new FormControl(""),
      offerTextBox: new FormControl(""),
      offerFooter: new FormControl(""),
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
  }
  get color() {
    return this.siteColorsForm.controls;
  }
  currentTestimonial: string[] = ["id", "name", "decorator", "order"];
  // displayedColumns: string[] = ['id', 'method', 'decorator', 'active', 'action'];
  // dataSource = [];
  displayedColumns: string[] = ["spid", "name", "master", "store"];
  dataSource = [];

  calledScreen(screenName): void {
    this.drawerOpened = false;
    if (screenName != this.presentationScreen) {
      this.addNewFeature = false;
      this.presentationScreen = screenName;
      if (screenName == "Site Color") {
        this.getScreenData("color", screenName);
      } else if (screenName == "Social Media") {
        this.getScreenData("social_media", screenName);
      } else if (screenName == "News Feed") {
        this.getScreenData("news_feed", screenName);
      } else if (screenName == "Special offers") {
        this.getScreenData("special_offer", screenName);
      } else if (screenName == "Typekit") {
        this.getScreenData("type_kit", screenName);
      } else if (screenName == "Feature Campaign") {
        this.getScreenData("campaign", screenName);
      } else if (screenName == "Payment methods") {
        this.getScreenData("payment_method", screenName);
      } else if (screenName == "Support Team") {
        this.getScreenData("support_team", screenName);
        this.getScreenData("available_support_team", screenName);
      } else if (screenName == "Feature Images") {
        this.getScreenData("feature_image", screenName);
      }
    }
  }
  getScreenData(value, screen) {
    this.isPageLoading = true;
    let params = {
      presentation: true,
      store_id: this.selectedStore.pk_storeID,
      [value]: true,
    };
    this._fileManagerService
      .getPresentationData(params)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res: any) => {
        if (screen == "Site Color") {
          this.siteColorsForm.patchValue(res.data[0]);
        } else if (screen == "Social Media") {
          this.socialMediaForm.patchValue(res.data[0]);
        } else if (screen == "News Feed") {
          this.newsFeedData = res.data;
        } else if (screen == "Special offers") {
          this.specialOfferForm.patchValue(res.data[0]);
        } else if (screen == "Typekit") {
          this.ngTypeKit = res.data[0].typeKitID;
        } else if (screen == "Feature Campaign") {
          this.campaignData = res.data;
        } else if (screen == "Payment methods") {
          this.onlineCreditForm.patchValue(res.data[0]);
          this.prepaymentForm.patchValue(res.data[1]);
          this.thirdPartyForm.patchValue(res.data[2]);
          this.creditTermsForm.patchValue(res.data[3]);
        } else if (screen == "Support Team") {
          if (value == "available_support_team") {
            this.availableTeamData = res.data;
          } else {
            this.teamData = res.data;
            this.teamForm = this.formBuilder.group({
              memberDetails: this.formBuilder.array(
                this.teamData.map((x) =>
                  this.formBuilder.group({
                    roleName: [x.roleName, [Validators.required]],
                    email: [x.email, [Validators.required]],
                    blnProgramManager: [
                      x.blnProgramManager,
                      [Validators.required],
                    ],
                    displayOrder: [x.displayOrder, [Validators.required]],
                  })
                )
              ),
            });
          }
        } else if (screen == "Feature Images") {
          this.featureImagesData = res.data;
        }
        this.isPageLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }
  openFeatureDialog(title): void {
    // Open the dialog
  }
  onUpdate(item, index) {
    console.log(this.teamForm.value[index]);
  }
  addNewFeatureImageToggle() {
    this.addNewFeature = !this.addNewFeature;
  }
  toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }
}
