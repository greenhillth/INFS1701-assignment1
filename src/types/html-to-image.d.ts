declare module 'html-to-image' {
        interface ToImageOptions {
                cacheBust?: boolean;
                pixelRatio?: number;
                backgroundColor?: string;
                style?: Partial<CSSStyleDeclaration>;
        }

        export function toPng(node: HTMLElement, options?: ToImageOptions): Promise<string>;
}
