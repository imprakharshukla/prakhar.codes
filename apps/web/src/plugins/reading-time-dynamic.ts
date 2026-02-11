import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

const WORDS_PER_MINUTE = 200;

export const getReadingTimeDynamic = (text: string): string | undefined => {
    if (!text || !text.length) return undefined;
    try {
        const plainText = toString(fromMarkdown(text));
        const words = plainText.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / WORDS_PER_MINUTE);
        if (minutes > 0) {
            return `${minutes} min read`;
        }
        return undefined;
    } catch (e) {
        return undefined;
    }
};
