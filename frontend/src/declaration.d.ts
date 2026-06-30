// declaration.d.ts
declare module 'xlsx/xlsx.mjs' {
    import * as XLSX from 'xlsx';
    export = XLSX;
}

declare module 'molstar/build/viewer/molstar.js' {
    export type MolstarViewer = {
        loadStructureFromUrl: (url: string, format: string) => Promise<void>;
    };

    export const Viewer: {
        create: (element: HTMLElement, options?: Record<string, any>) => Promise<MolstarViewer>;
    };
}
