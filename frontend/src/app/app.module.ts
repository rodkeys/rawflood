import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


/*
 * Platform and Environment providers/directives/pipes
 */
// List of components
import { AppComponent } from './app.component';
import { Welcome } from '../welcome/welcome';
import { About } from '../about/about';
import { IndividualListing } from '../individualListing/individualListing';
import { IndividualVendor } from '../individualVendor/individualVendor';
import { UpdateStore } from '../updateStore/updateStore';


// List of directives
import { DocViewer } from '../services/directives/docViewer/docViewer';
import { SearchBar } from '../services/directives/searchBar/searchBar';
import { FooterBar } from '../services/directives/footerBar/footerBar';




// List of Imports from external packages
import { DropdownModule } from 'primeng/primeng';
import { MessagesModule } from 'primeng/primeng';
import { PaginatorModule } from 'primeng/primeng';
import { RatingModule } from 'primeng/primeng';
import { CheckboxModule } from 'primeng/primeng';
import { MultiSelectModule } from 'primeng/primeng';


// import {FileStream, DropService, DropTarget} from '../services/fileDrop';


// List of Services
import { VendorService } from '../services/vendors';
import { Utility } from '../services/utility';
import { SearchService } from '../services/search';
import { Request } from '../services/request';


// List of pipes 
import { OrderBy } from '../services/pipes/orderByPipe';

// General Imports
import { RouteList } from './app.routes';


/**
 * `AppModule` is the main entry point into Angular2's bootstraping process 
 */
@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    IndividualListing,
    IndividualVendor,
    UpdateStore,
    Welcome,
    DocViewer,
    OrderBy,
    SearchBar,
    FooterBar,
    About
  ],
  imports: [ // import Angular's modules
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    DropdownModule,
    MessagesModule,
    PaginatorModule,
    CheckboxModule,
    MultiSelectModule,
    RatingModule,
    RouterModule.forRoot(RouteList)
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    VendorService,
    SearchService,
    Request,
    Utility
  ]
})
export class AppModule {
  constructor() {
  }

}

