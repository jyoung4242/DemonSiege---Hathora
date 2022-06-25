export class UIManager {
    queue: Function[] = [];
    params: any[] = [];
    index: number = 0;
    isRunning: boolean = false;
    speed: number;
    myInterval: NodeJS.Timer;
    ifStepping: boolean = false;
    ifUILock: boolean = false;
    UID: string = '';

    constructor(speed?: number, enabled?: boolean) {
        this.speed = speed ?? 1000;

        this.isRunning = enabled ?? false;
    }

    addQue = (entry: Function, params: any[]) => {
        //check for locking code
        if (entry.name.search('UI_') == -1) {
            this.queue.push(entry);
            this.params.push(params);
        } else {
            if (!this.ifUILock) {
                this.queue.push(entry);
                this.params.push(params);
            } else {
                console.log(`UI lock event blocked`);
            }
        }
        console.log(`que length: `, this.queue.length);
    };

    stepQue = () => {
        this.ifStepping = true;
        this.isRunning = true;
    };

    clearQue = () => {
        this.queue = [];
    };

    pauseQue = (flag: boolean) => {
        this.isRunning = flag;
    };

    getQue = () => {
        return this.queue;
    };

    clearLock = (lockID: string, entry: Function, params: any[]) => {
        if (lockID == this.UID) {
            this.ifUILock = false;
        }
        entry(...params);
    };

    lockUI = (entry: Function, params: any[]): string => {
        entry(...params);
        this.ifUILock = true;
        this.UID = Date.now().toString();
        return this.UID;
    };

    getUID = (): string => {
        return this.UID;
    };

    startQue = () => {
        this.myInterval = setInterval(async () => {
            if (this.isRunning && !this.ifUILock) {
                while (this.queue.length) {
                    //check for UI event
                    let currentFunc = this.queue.shift();
                    let currentParam: any[] = this.params.shift();
                    console.log(`Running func: `, currentFunc.name);
                    console.time('asyncFunc');
                    await currentFunc(...currentParam);
                    console.timeEnd(`asyncFunc`);
                }

                if (this.ifStepping) {
                    this.isRunning = false;
                    this.ifStepping = false;
                }
            }
        }, this.speed);
    };
}
