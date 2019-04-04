import { Component, Input } from '@angular/core';
import { Utility } from "../../utility";

@Component({
	selector: 'docViewer',
	templateUrl: './docViewer.html',
	styleUrls: ['./docViewer.css']
})
export class DocViewer {

	@Input() fileName: string; //Must contain a file extension, used to determine type of file and display file name
	@Input() allImages: Array<any>;
	constructor(public utility: Utility) {
	}

	// Controls which file is currently being shown
	exitViewer() {
		this.utility.currentImageBeingViewed = null;
	}

	// Shift number depending on forward/backward arrow 
	shiftImageIndex(shiftNumber: number) {
		for (let i = 0; i < this.allImages.length; i++) {
			if (this.utility.currentImageBeingViewed == this.allImages[i].original) {
				if (this.allImages[i + shiftNumber]) {
					this.utility.currentImageBeingViewed = this.allImages[i + shiftNumber].original;
				} else if (shiftNumber == 1) {
					this.utility.currentImageBeingViewed = this.allImages[0].original;
				} else {
					this.utility.currentImageBeingViewed = this.allImages[this.allImages.length - 1].original;
				}
				break;
			}
		}

	}





}