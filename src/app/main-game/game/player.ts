export class Player {
    constructor(private name: string, private score: number) {
    }

    // adapted from http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
    hashCode(name): number {
        if (name.length > 0) {
            var hash = 0, i, chr;
            if (name.length === 0) return hash;
            for (i = 0; i < name.length; i++) {
                chr = name.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
        return -1;
    }
}