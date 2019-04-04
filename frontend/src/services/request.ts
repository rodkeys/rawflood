import { Injectable, NgZone, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers } from '@angular/http';


@Injectable()
export class Request {
	contentHeaders: Headers
	constructor(public router: Router, public http: Http) {
		this.contentHeaders = new Headers();
		this.contentHeaders.append('Accept', 'application/json');
		this.contentHeaders.append('Content-Type', 'application/json');
		this.contentHeaders.append('x-access-token', localStorage.getItem('jwt'))
	}


	// Create a POST HTTP call
	sendPOST(APIRoute: string, formDataList: any) {
		return new Promise((resolve, reject) => {
			const host = "https://" + window.location.hostname + (location.port ? ':' + location.port : '');
			this.http.post(host + APIRoute, formDataList, { headers: this.contentHeaders })
				.subscribe(
					(response: any) => {
						resolve(JSON.parse(response._body));
					},
					(error: any) => {
						reject(JSON.parse(error._body));
					});
		});
	}

	// Create a PUT HTTP call
	sendPUT(APIRoute: string, formDataList: any) {
		return new Promise((resolve, reject) => {
			const host = "https://" + window.location.hostname + (location.port ? ':' + location.port : '');
			this.http.put(host + APIRoute, formDataList, { headers: this.contentHeaders })
				.subscribe(
					(response: any) => {
						resolve(JSON.parse(response._body));
					},
					(error: any) => {
						reject(JSON.parse(error._body));
					});
		});
	}


	// Create a POST HTTP call
	sendGET(APIRoute: string) {
		return new Promise((resolve, reject) => {
			const host = "https://" + window.location.hostname + (location.port ? ':' + location.port : '');
			this.http.get(host + APIRoute, { headers: this.contentHeaders })
				.subscribe(
					(response: any) => {
						resolve(JSON.parse(response._body));
					},
					(error: any) => {
						reject(JSON.parse(error._body));
					});
		});
	}

	// Create a delete HTTP call
	sendDELETE(APIRoute: string) {
		return new Promise((resolve, reject) => {
			const host = "https://" + window.location.hostname + (location.port ? ':' + location.port : '');
			this.http.delete(host + APIRoute, { headers: this.contentHeaders })
				.subscribe(
					(response: any) => {
						resolve(JSON.parse(response._body));
					},
					(error: any) => {
						reject(JSON.parse(error._body));
					});
		});
	}

}