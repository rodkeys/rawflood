import { Routes } from '@angular/router';
import { Welcome } from '../welcome/welcome';
import { About } from '../about/about';
import { UpdateStore } from '../updateStore/updateStore';
import { IndividualListing } from '../individualListing/individualListing';
import { IndividualVendor } from '../individualVendor/individualVendor';

export const RouteList: Routes = [
  { path: '', component: Welcome },
  { path: 'about', component: About },
  { path: 'updateStore', component: UpdateStore },
  { path: 'vendor/:vendorId', component: IndividualVendor },
  { path: 'vendor/:vendorId/store/:listingSlug', component: IndividualListing }
];
