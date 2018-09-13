class UpdateProxy {
    constructor() {
        this._hasUpdate = false;
        this._notifyFunctions = [];

        this.notify = this.notify.bind(this);
        this.subscribe = this.subscribe.bind(this);
    }

    notify() {
        this._hasUpdate = true;

        for (let f of this._notifyFunctions) {
            f();
        }
    }

    subscribe(f) {
        this._notifyFunctions.push(f);

        if (this._hasUpdate) {
            f();
        }
    }
}

export default UpdateProxy;