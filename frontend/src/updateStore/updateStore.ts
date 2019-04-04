import { Component } from '@angular/core';
import { SearchService } from '../services/search';
import { Request } from '../services/request';

@Component({
	selector: 'updateStore',
	templateUrl: './updateStore.html',
	styleUrls: ['./updateStore.css'],
})

export class UpdateStore {
	storePeerId: string;
	updateResponse: Array<any>;
	requestLoading: boolean;
	constructor(public searchService: SearchService, public request: Request) {

	}

	updateStore() {
		this.requestLoading = true;
		this.request.sendPUT(`/api/scrapePassedInPeer/${this.storePeerId}`, {}).then((data: any) => {
			this.requestLoading = false;
			console.log(data);

			this.updateResponse = [{
				severity: 'info',
				summary: 'Success',
				detail: `Your store will be updated within the next few minutes.`
			}];
		}).catch((err) => {
			this.requestLoading = false;
			this.updateResponse = [{
				severity: 'error',
				summary: '',
				detail: err.message
			}];
		})
	}

}
