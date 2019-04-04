import { Component, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { Utility } from "../services/utility";
import { SearchService } from "../services/search";
import { Request } from "../services/request";
import { Title } from '@angular/platform-browser';

@Component({
	selector: 'individualListing',
	templateUrl: './individualListing.html',
	styleUrls: ['./individualListing.css'],
})

export class IndividualListing {
	listing: any;
	currentLocation: string;
	expiredListingMessage: Array<any> = [{
		severity: 'error',
		summary: '',
		detail: `This listing has expired because it has not been active in the last seven days`
	}]
	listingOptions: any = {};
	zone: NgZone = new NgZone({ enableLongStackTrace: false });

	constructor(public route: ActivatedRoute,
		public http: Http,
		public utility: Utility,
		public searchService: SearchService,
		public titleService: Title,
		public request: Request) {

		this.route.params.subscribe((params: any) => {
			const listingSlug = params['listingSlug'],
				vendorPeerID = params['vendorId'];

			this.getIndividualListing(listingSlug, vendorPeerID);
		});

	}


	// Get single listing information
	getIndividualListing(listingSlug: string, vendorPeerID: string) {
		this.request.sendGET(`/api/returnIndividualListing/${vendorPeerID}-${listingSlug}`).then((data: any) => {
			this.listing = data;
			console.log(this.listing);

			// Set page title when listing comes in
			this.titleService.setTitle(this.listing.title + " | RawFlood");


			// Format select options for Primeng selection dropdown
			this.formatSelectOptions();

			this.utility.updateAllCurrencyCodes([this.listing]);

			// If listing has shipping options then set here
			if (this.listing.shippingOptions && this.listing.shippingOptions.length > 0) {
				if (this.utility.countryName) {
					this.resetShippingOptions(true);
				} else {
					// Keep checking if country has been returned before filling in shipping information
					let checkExist = setInterval(() => {
						if (this.utility.countryName) {
							this.resetShippingOptions(true);
							clearInterval(checkExist)
						}
					}, 500);
				}


			}

			if (this.listing.pricingCurrency != "BTC") {
				// Retrieve price in Bitcoin
				this.http.get("https://blockchain.info/tobtc?currency=" + this.listing.pricingCurrency + "&value=" + this.listing.price.amount / 100).subscribe((response: any) => {
					this.listing.bitcoinPrice = response._body;
				}, (error: any) => {
					console.error(error);
				});
			}

		}).catch((err) => {
			console.log(err);
		})
	}


	// Return a formatted version of each listing type
	formatListingType(listingType: string) {
		switch (listingType) {
			case "DIGITAL_GOOD":
				return "Digital"
			case "PHYSICAL_GOOD":
				return "Physical"
			case "SERVICE":
				return "Service";
		}
	}

	// Return an estimate of how long shipping will take
	returnShippingApproximate() {
		for (let i = 0; i < this.listing.shippingOptions.length; i++) {
			if (this.listing.shippingOptions[i].name == this.listingOptions.shippingName) {
				for (let y = 0; y < this.listing.shippingOptions[i].services.length; y++) {
					if (this.listing.shippingOptions[i].services[y].name == this.listingOptions.shippingService) {
						return this.listing.shippingOptions[i].services[y].estimatedDelivery;
					}
				}
			}
		}
		return null;
	}



	checkAllShippingFields() {
		if (this.listingOptions.shippingCountry && this.listingOptions.shippingService && this.listingOptions.shippingName) {
			return true;
		} else {
			return false;
		}
	}

	// Initialize shipping options
	resetShippingOptions(firstRun: boolean) {
		this.zone.run(() => {
			if (firstRun) {
				if (!this.listingOptions.shippingName) {
					this.listingOptions.shippingName = this.listing.shippingOptions[0].name;
				}

				if (this.returnCurrentShippingOption().services[0]) {
					this.listingOptions.shippingService = this.returnCurrentShippingOption().services[0].name;
				}

				// Initialize shipping country with country derived from user's IP address
				if (this.returnCurrentShippingOption().regions.indexOf(this.utility.countryName) > -1) {
					this.listingOptions.shippingCountry = this.utility.countryName;
				} else if (this.returnCurrentShippingOption().regions.indexOf("ALL") > -1) {
					this.listingOptions.shippingCountry = "ALL";
				} else {
					this.listingOptions.shippingCountry = this.returnCurrentShippingOption().regions[0];
				}
			}

			this.listingOptions.shippingEstimate = [];

			let shippingPrice;

			let checkExist = setInterval(() => {
				if (this.utility.returnBitcoinCurrencyConversion(this.utility.primaryCurrencySelected, this.utility.returnBitcoinRate(this.listing.pricingCurrency, this.returnCurrentShippingService().price, 7))) {
					if (this.returnCurrentShippingService() && this.returnCurrentShippingService().price) {
						//shippingPrice = `${this.utility.returnCurrencyPrice(this.listing.pricingCurrency, this.returnCurrentShippingService().price)} ${this.listing.pricingCurrency}`;
						shippingPrice = `
				${this.utility.returnBitcoinCurrencyConversion(this.utility.primaryCurrencySelected, this.utility.returnBitcoinRate(this.listing.pricingCurrency, this.returnCurrentShippingService().price, 7))} 
				${this.utility.primaryCurrencySelected}`;
					} else {
						shippingPrice = "Free";
					}
					this.listingOptions.shippingEstimate = [{
						severity: 'info',
						summary: '',
						detail: `Shipping will be <b>${shippingPrice}</b> and take approximately <b>${this.returnShippingApproximate()}</b> &nbsp;&nbsp;`
					}];
					clearInterval(checkExist);
				}

			}, 1000);

		});
	}


	// Return the shipping option object
	returnCurrentShippingOption() {
		if (this.listingOptions.shippingName && this.listing) {
			for (let i = 0; i < this.listing.shippingOptions.length; i++) {
				if (this.listingOptions.shippingName == this.listing.shippingOptions[i].name) {
					return this.listing.shippingOptions[i]
				}
			}
		}
	}

	// Return the shipping service object
	returnCurrentShippingService() {
		let shippingOption = this.returnCurrentShippingOption();
		if (shippingOption && this.listingOptions.shippingService) {
			for (let i = 0; i < shippingOption.services.length; i++) {
				if (this.listingOptions.shippingService == shippingOption.services[i].name) {
					return shippingOption.services[i];
				}
			}
		}
	}

	returnListingVariantPrice() {
		let optionVariantCombination = [];
		let combinationPriceIncrease = 0;
		if (this.listing.options) {
			for (let i = 0; i < this.listing.options.length; i++) {
				optionVariantCombination.push(this.listing.options[i].variantSelected);
			}
			for (let i = 0; i < this.listing.skus.length; i++) {
				if (this.listing.skus[i].variantCombo && this.listing.skus[i].variantCombo.toString() == optionVariantCombination.toString()) {
					if (this.listing.skus[i].surcharge) {
						combinationPriceIncrease = this.listing.skus[i].surcharge;
					}
				}
			}
		}
		return this.listing.price.amount + combinationPriceIncrease;
	}

	// Format select options for Primeng selection dropdown
	formatSelectOptions() {
		// Format listing option variants
		if (this.listing.options) {
			// this.optionVariantCombination = []
			for (let i = 0; i < this.listing.options.length; i++) {
				this.listing.options[i].variantsFormatted = [];
				this.listing.options[i].variantSelected = 0;
				for (let y = 0; y < this.listing.options[i].variants.length; y++) {
					this.listing.options[i].variantsFormatted.push({
						label: this.listing.options[i].variants[y].name,
						value: y
					})
				}
			}
		}

		this.listing.optionNamesFormatted = [];

		if (this.listing.shippingOptions) {
			// Format shipping option names
			for (let i = 0; i < this.listing.shippingOptions.length; i++) {
				this.listing.shippingOptions[i].servicesFormatted = [];
				this.listing.shippingOptions[i].regionsFormatted = [];

				this.listing.optionNamesFormatted.push({ label: this.listing.shippingOptions[i].name, value: this.listing.shippingOptions[i].name });

				// Format Shipping service names 
				for (let y = 0; y < this.listing.shippingOptions[i].services.length; y++) {
					this.listing.shippingOptions[i].servicesFormatted.push({ label: this.listing.shippingOptions[i].services[y].name, value: this.listing.shippingOptions[i].services[y].name });
				}

				// Format Shipping region names
				for (let z = 0; z < this.listing.shippingOptions[i].regions.length; z++) {
					// Format country names
					const formattedCountry = this.listing.shippingOptions[i].regions[z].replace(/_/g, " ").toLowerCase();
					this.listing.shippingOptions[i].regionsFormatted.push({ label: formattedCountry, value: this.listing.shippingOptions[i].regions[z] });
				}
			}
		}
	};

	convertRatingTimestamp(timestamp: number) {
		return new Date(timestamp * 1000);
	}

	returnShippingTime() {
		return [{ severity: 'info', summary: 'Info Message', detail: 'PrimeNG rocks' }]
	}
}
