type SequenceObject = {
    element: HTMLElement | string;
    keyFrames: Keyframe[];
    options: KeyframeAnimationOptions;
};

type SequenceOptions = {
    loop: boolean;
    gapDelay: number;
};

export class waApiSequencer {
    sequence: SequenceObject[] = [];
    seqIndex: Animation[] = [];
    currentIndex: number;
    loop: boolean;
    gapDelay: number;

    constructor(args: SequenceOptions) {
        this.loop = args.loop;
        this.gapDelay = args.gapDelay;
        this.currentIndex = 0;
    }

    addSeq = (waObject: SequenceObject) => {
        this.sequence.push(waObject);

        return this;
    };

    playSeq = async () => {
        if (this.isElement(this.sequence[this.currentIndex].element)) {
            let myAnimation = (this.sequence[this.currentIndex].element as HTMLElement).animate(this.sequence[this.currentIndex].keyFrames, this.sequence[this.currentIndex].options);
            this.seqIndex[this.currentIndex] = myAnimation;
            myAnimation.addEventListener('finish', this.animationFinished);
        } else if (typeof this.sequence[this.currentIndex].element == 'string') {
            let myAnimation = document.getElementById(this.sequence[this.currentIndex].element as string).animate(this.sequence[this.currentIndex].keyFrames, this.sequence[this.currentIndex].options);
            this.seqIndex[this.currentIndex] = myAnimation;
            myAnimation.addEventListener('finish', this.animationFinished);
        }
    };

    animationFinished = (animation: Event) => {
        //increment index
        this.currentIndex += 1;

        //test for last animation

        if (this.sequence.length == this.currentIndex) {
            //if last animation but looping
            if (this.loop) {
                //reset animation index and restart next animation
                this.currentIndex = 0;
                if (this.gapDelay > 0) setTimeout(() => this.playSeq(), this.gapDelay);
                else this.playSeq();
            } else this.currentIndex = 0;
            //if not looping, reset to 0 and do nothing
        } else {
            //not last animation, move onto next one
            if (this.gapDelay > 0) setTimeout(() => this.playSeq(), this.gapDelay);
            else this.playSeq();
        }
    };

    pauseSeq = () => {
        this.seqIndex[this.currentIndex].pause();
    };

    resumeSeq = () => {
        this.seqIndex[this.currentIndex].play();
    };

    cancelSeq = () => {
        this.seqIndex.forEach(anim => {
            anim.cancel();
        });
        this.currentIndex = 0;
    };

    isElement = (obj: unknown) => {
        try {
            return obj instanceof HTMLElement;
        } catch (e) {
            return false;
        }
    };
}
