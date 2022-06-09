export class Shake {
    duration: number;
    frequency: number;
    sampleCount: number;
    samples: number[] = [];
    startTime: number;
    isShaking: boolean;
    time: number;

    constructor(duration: number, frequency: number) {
        this.duration = duration;
        this.frequency = frequency;
        this.sampleCount = (this.duration / 1000) * this.frequency;
        for (var i = 0; i < this.sampleCount; i++) {
            this.samples.push(Math.random() * this.vw(2));
        }
        this.startTime = 0;
        this.time = null;
        this.isShaking = false;
    }

    start = () => {
        this.startTime = Date.now();
        this.time = 0;
        this.isShaking = true;
    };

    update = () => {
        this.time = new Date().getTime() - this.startTime;
        if (this.time > this.duration) this.isShaking = false;
    };

    amplitude = (t?: number) => {
        if (t == undefined) {
            if (!this.isShaking) return 0;
            t = this.time;
        }

        var s = (t / 1000) * this.frequency;
        var s0 = Math.floor(s);
        var s1 = s0 + 1;
        var k = this.decay(t);
        return (this.noise(s0) + (s - s0) * (this.noise(s1) - this.noise(s0))) * k;
    };

    noise = (s): number => {
        if (s >= this.samples.length) return 0;
        return this.samples[s];
    };

    decay = (t): number => {
        if (t >= this.duration) return 0;
        return (this.duration - t) / this.duration;
    };

    vw = (v): number => {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        return (v * w) / 100;
    };
}
