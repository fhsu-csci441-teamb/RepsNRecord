module.exports = {
  NextResponse: class NextResponse {
    constructor(body, init) {
      this._body = body;
      this.status = init?.status || 200;
      this.headers = init?.headers || {};
    }
    static json(obj, init) {
      return new NextResponse(obj, init);
    }
    async text() {
      if (typeof this._body === 'string') return this._body;
      return JSON.stringify(this._body);
    }
    json() {
      return this._body;
    }
  },
};
