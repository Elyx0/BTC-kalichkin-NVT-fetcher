/* eslint-disable @typescript-eslint/no-explicit-any */
import {Tesseract} from 'tesseract.ts';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default (image: any) => {
    return Tesseract
        .recognize(image)
        .progress(console.log)
        .catch(console.error);
};
