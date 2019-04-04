import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';

declare let clipboard: any;
declare let moment: any;

@Injectable()
export class Utility {
	// Determines whether iframe should be open and which file it should be brought up
	currentImageBeingViewed: any;
	countryName: string;
	// Maintain list of all currency codes from listings
	allCurrencyCodes: any = {};
	copyId: string;
	primaryCurrencySelected: string;
	allCurrenciesList: Array<any> = [];
	constructor(public http: Http, public domSanitizer: DomSanitizer) {
		// Return current user location information
		this.returnGeoLocationInfo();
		// Get list of currencies for primary currency list
		this.initializeCurrencyList();
		setTimeout(() => {
			// Initialize main currency 
			this.primaryCurrencySelected = "USD";
			this.updateSingleCurrencyCode("USD");
		}, 500)
	}


	// Get list of currency abbreviations
	initializeCurrencyList() {
		this.http.get(this.returnCurrentHost() + "/assets/json/currencies.json").subscribe((response: any) => {
			const currencyList = JSON.parse(response._body);
			for (let i = 0; i < currencyList.length; i++) {
				this.allCurrenciesList.push({ label: currencyList[i], value: currencyList[i] })
			}

		}, (error: any) => {
			console.error(error)
		});
	}

	// Convert image hash to S3 URL
	convertImageHashToLink(imageHash: string) {
		return '/api/returnSingleImage/' + imageHash;
	}

	// return current host name
	returnCurrentHost() {
		let host = window.location.protocol + "//" + window.location.hostname;
		// If host has a port number (other than 80 or 443 then return this as well)
		if (window.location.port != "") {
			host = host + ":" + window.location.port;
		}
		host = host + "/";
		return host;
	}

	// Return exact url
	returnCurrentHref() {
		return location.href;
	}

	// Convert and display price properly
	returnCurrencyPrice(pricingCurrency: string, price: number) {
		if (pricingCurrency == "BTC") {
			return (price / 100000000)
		} else {
			// Standard conversion for any currency other than USD is divided by 100
			return (price / 100).toFixed(2);
		}
	}

	// Receive bitcoin price and return price in requested currency
	returnBitcoinCurrencyConversion(primaryCurrency: string, btcAmount: number) {
		if (primaryCurrency == "BTC") {
			return btcAmount;
		} else if (this.allCurrencyCodes[primaryCurrency]) {
			return (this.allCurrencyCodes[primaryCurrency].ratePerBitcoin * btcAmount).toFixed(2);
		} else {
			return;
		}
	}

	// Retrieve country information for user
	returnGeoLocationInfo() {
		this.http.get("https://freegeoip.live/json/").subscribe((response: any) => {
			let userInformation = JSON.parse(response._body);
			this.countryName = userInformation.country_name.toUpperCase().replace(/ /g, "_");
		}, (error: any) => {
			console.error(error)
		});
	}

	// Update bitcoin exchange rates
	updateExchangeRates() {
		let currencyCodeList = Object.keys(this.allCurrencyCodes);
		for (let i = 0; i < currencyCodeList.length; i++) {
			this.http.get("https://api.coindesk.com/v1/bpi/currentprice/" + currencyCodeList[i] + ".JSON").subscribe((response: any) => {
				const parsedResponse = JSON.parse(response._body);
				this.allCurrencyCodes[currencyCodeList[i]].ratePerBitcoin = Number(parsedResponse.bpi[currencyCodeList[i]].rate.replace(/,/g, ""));
			}, (error: any) => {
				console.error(error)
			});

		}
	}

	// Update list of currency codes
	updateAllCurrencyCodes(listings: Array<any>) {
		// Update list of pricing currencies
		for (let i = 0; i < listings.length; i++) {
			if ((listings[i].pricingCurrency != "BTC") && !this.allCurrencyCodes[listings[i].pricingCurrency]) {
				this.allCurrencyCodes[listings[i].pricingCurrency] = {};
			}
		}
		this.updateExchangeRates();
	}

	// Update a single currency code (used when swtiching primary currency)
	updateSingleCurrencyCode(currencyCode: string) {
		if (!this.allCurrencyCodes[currencyCode] || this.allCurrencyCodes[currencyCode].ratePerBitcoin) {
			this.allCurrencyCodes[currencyCode] = {};
			this.updateExchangeRates();
		}
	}



	// Return exchange rate for currency versus bitcoin
	returnBitcoinRate(pricingCurrency: string, price: number, roundTo: number): number {
		if (pricingCurrency == "BTC") {
			return (price / 100000000);
		} else if (this.allCurrencyCodes[pricingCurrency]) {
			const conversionRate = this.allCurrencyCodes[pricingCurrency].ratePerBitcoin
			return Number(((price / 100) / conversionRate).toFixed(roundTo));
		} else {
			return null;
		}
	}

	// Format select fields for primeNG select
	formatSelectOptions(dataList: Array<any>) {
		let dataHolder = [];
		for (let i = 0; i < dataList.length; i++) {
			dataHolder.push({ label: dataList[i].name, value: dataList[i].name })
		}
		return dataHolder;
	}

	// Generate flag class for sprite image
	generateFlagClass(flagCode: string) {
		if (flagCode) {
			return "flag-" + flagCode.toLowerCase()
		}
	}

	// Return an array used to determine how many stars product/vendor should have
	returnRatingsArray(ratingAverageNumber: number) {
		if (ratingAverageNumber) {
				let starList = [];

			for (let i = 0; i < 5; i++) {
				if (ratingAverageNumber >= 1) {
					starList.push(1);
				} else if (ratingAverageNumber > 0) {
					starList.push(0.5);
				} else {
					starList.push(0);
				}
				ratingAverageNumber--;
			}
			return starList;
		}
	}

	// Return sanitized URL for href
	sanitizeUrl(url: string) {
		return this.domSanitizer.bypassSecurityTrustUrl(url);
	}



	convertTime(date: string) {
		return moment(date).fromNow();
	}

	// Generate total number of ratings 
	// generateTotalRatingCount(vendorPeerId: string, allListings: Array<any>) {
	// 	let ratingCount = 0;
	// 	for (let i = 0; i < allListings.length; i++) {
	// 		if (allListings[i].vendor.peerId == vendorPeerId) {
	// 			if (allListings[i].ratingScore) {
	// 				ratingCount = ratingCount + allListings[i].ratingScore.length;
	// 			}
	// 		}
	// 	}
	// 	return ratingCount;
	// }

	refreshPage() {
		location.href = "/";
	}


	// Re-initialize listings
	resetPagination() {
		setTimeout(() => {
		let pageReset: any = document.getElementsByClassName("ui-paginator-first ui-paginator-element ui-state-default ui-corner-all")[0];
		if (pageReset) {
			pageReset.onclick = function() { return false; };
			pageReset.click();
		}
		let pageOne: any = document.getElementsByClassName("ui-paginator-page ui-paginator-element ui-state-default ui-corner-all ui-state-active")[0];
		if (pageOne && pageOne.innerHTML == "1") {
			pageOne.click();
		}
	}, 10)
	}


	// Needed to remove image magnifying glass
	leaveListingImageHover() {
        setTimeout(() => {
            let zoomContainers: any = document.getElementsByTagName("image-zoom-container"),
                zoomLens: any = document.getElementsByTagName("image-zoom-lens");

            for (let i = 0; i < zoomContainers.length; i++) {
                zoomContainers[i].style.display = "none";
            }

            for (let i = 0; i < zoomLens.length; i++) {
                zoomLens[i].style.display = "none";
            }
        }, 100)
    }
	
}