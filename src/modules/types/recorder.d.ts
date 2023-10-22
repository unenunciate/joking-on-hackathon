declare module 'mic-recorder-to-mp3'
{
    export interface RecorderOptions {
        bitRate: number
    }

    export declare class Recorder extends Object {
        constructor(opts?: RecorderOptions);
        start: () => Promise<unknown>
        stop: () => Promise<Recorder>
        getMp3: () => Promise<[buffer: Buffer, blob: Blob]>
    }

    export default Recorder
}