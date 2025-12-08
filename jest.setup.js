// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Provide missing web globals for Node/Jest environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Provide a minimal global Request constructor for modules that expect it
global.Request = function (url) {
	this.url = typeof url === 'string' ? url : url?.url || '';
	this.headers = new Map();
	this.method = 'GET';
};

// Provide a minimal fetch placeholder; tests can override/mock as needed
global.fetch = global.fetch || (() => Promise.reject(new Error('fetch unmocked')));

// Mock next/server NextResponse to avoid requiring the full Next runtime in tests
jest.mock('next/server', () => {
	return {
		NextResponse: class NextResponse {
			constructor(body, init) {
				this._body = body;
				this.status = init?.status || 200;
				this.headers = init?.headers || {};
			}
			static json(obj, init) { return new NextResponse(obj, init); }
			async text() { if (typeof this._body === 'string') return this._body; return JSON.stringify(this._body); }
			async arrayBuffer() { if (Buffer.isBuffer(this._body)) return this._body; if (typeof this._body === 'string') return Buffer.from(this._body); return Buffer.from(JSON.stringify(this._body)); }
			json() { return this._body; }
		}
	};
});
