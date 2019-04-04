import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router'
import { Utility } from "../services/utility";
import { Request } from "../services/request";
import { OrderBy } from "./pipes/orderByPipe";
import { Http } from '@angular/http';

@Injectable()
export class SearchService {
	shownListings: any;
	listingSearchText: string = "";
	// Where to start displaying listings for pagination
	listingsStart: number = 0;
	// Number of results to show on search results page
	displayNumber: number = 10;

	minimumPrice: number;
	maximumPrice: number;
	minimumListingStars: number;
	// How to sort data
	sortBy: string = "-weight";

	// Pipe used for data sorting
	orderBy: OrderBy;
	filteredListings: any = [];

	// Temporary fix for returning data
	listingObjectHolder: any = {};

	currentlySelectedCategory: string;

	constructor(
		public router: Router,
		public utility: Utility,
		public http: Http,
		public request: Request) {

	}

	initialRemoteSearch() {
		this.searchListings();
		this.router.navigate(["/"])
	}



	searchListings() {
		this.shownListings = null;
		this.resetListingPagination();
		this.sortBy = "";
		this.router.navigate(["/"]);

		this.request.sendGET("/api/search?q=" + this.listingSearchText).then((data: any) => {
			console.log(data);
			console.log("EE")
			this.shownListings = [];
			for (let i = 0; i < data.results.results.length; i++) {
				this.shownListings.push(data.results.results[i].data);
			}

			console.log(this.shownListings)
			// Update list of currency codes and retrieve exchange rates
			this.utility.updateAllCurrencyCodes(this.shownListings);
			this.shownListings = this.sortShownListings(this.shownListings);
		}).catch((err) => {
			console.log(err);
		});

	}


	// Reset page back to 0 for listings
	resetListingPagination() {
		this.sortBy = "-weight";
		this.utility.resetPagination();
		this.listingsStart = 0;
	}


	applySearchFilters() {
		this.searchListings();
	}



	navigateToVendorListing(vendorPeerId: string, listingSlug: string) {
		this.router.navigate(['/vendor/' + vendorPeerId + '/store/' + listingSlug]);
	}

	selectListingCategory(categoryName: string) {
		this.shownListings = null;
		if (this.currentlySelectedCategory == categoryName) {
			this.currentlySelectedCategory = null;
		} else {
			this.currentlySelectedCategory = categoryName;
		}
	}

	// Return listings + filtered
	returnFilteredListings() {
		let filteredListings = JSON.parse(JSON.stringify(this.shownListings));
		if (this.maximumPrice) {
			filteredListings = this.filterMaximumPrice(filteredListings);
		}
		if (this.minimumPrice) {
			filteredListings = this.filterMinimumPrice(filteredListings);
		}
		if (this.minimumListingStars) {
			filteredListings = this.filterByStars(filteredListings);
		}
		// Sort listings after filters have been applied
		filteredListings = this.sortShownListings(filteredListings);
		return filteredListings;
	}


	sortShownListings(listings) {
		// listings = JSON.parse(JSON.stringify(listings));
		let filteredListings = [];
		if (this.sortBy) {
			if (this.sortBy.indexOf("Price") > -1) {
				for (let i = 0; i < listings.length; i++) {
					listings[i].bitcoinPrice = this.utility.returnBitcoinRate(listings[i].pricingCurrency, listings[i].price.amount, 7)
				}
			}
			filteredListings = new OrderBy().transform(listings, [this.sortBy]);
			return filteredListings;
		} else {
			return listings
		}
	}


	filterMinimumPrice(listings) {
		let filteredListings = [];

		const shownListings = listings;

		for (let i = 0; i < shownListings.length; i++) {
			if (this.utility.returnBitcoinCurrencyConversion(this.utility.primaryCurrencySelected, this.utility.returnBitcoinRate(shownListings[i].pricingCurrency, shownListings[i].price.amount, 7)) >= Number(this.minimumPrice)) {
				filteredListings.push(shownListings[i]);
			}
		}

		return filteredListings;
	}

	filterMaximumPrice(listings) {
		let filteredListings = [];

		const shownListings = listings;

		for (let i = 0; i < shownListings.length; i++) {
			if (this.utility.returnBitcoinCurrencyConversion(this.utility.primaryCurrencySelected, this.utility.returnBitcoinRate(shownListings[i].pricingCurrency, shownListings[i].price.amount, 7)) <= Number(this.maximumPrice)) {
				filteredListings.push(shownListings[i]);
			}
		}

		return filteredListings;
	}



	// Change minimum of listing stars
	changeMinimumListingStars(starMinimum: number) {
		// If minimum stars is already set to the option then de-select the option
		if (starMinimum == this.minimumListingStars) {
			this.minimumListingStars = null;
		} else {
			this.minimumListingStars = starMinimum;
		}
	}

	// Filter listings by number of stars
	filterByStars(listings) {
		let filteredListings = [];

		for (let i = 0; i < listings.length; i++) {
			// Check if listing has the minimum number of stars required
			if (listings[i].averageRating >= this.minimumListingStars) {
				filteredListings.push(listings[i]);
			}
		}
		return filteredListings;
	}


}