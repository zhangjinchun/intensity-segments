import { RBTree } from 'bintrees';

export class IntensitySegments {
    // RBTree to store segments with sorted keys
    constructor() {
        this.segments = new RBTree((a, b) => a.key - b.key);
    }

    /**
     * Add an intensity segment from 'from' to 'to' with the specified amount.
     * @param {number} from start of the range
     * @param {number} to end of the range (not included)
     * @param {number} amount intensity value
     */
    add(from, to, amount) {
        if (this.segments.size === 0) {
            this.set(from, to, amount);
            return;
        }

        // If the new segment does not overlap with existing segments, just set it directly
        if (to < this.getFirstKey() || from > this.getLastKey()) {
            this.set(from, to, amount);
            return;
        }

        // Ensure there is a segment at 'to' by copying the value from the leftmost key less than 'to'
        if (!this.segments.find({ key: to })) {
            const l = this.getLeftKey(to);
            this.segments.insert({ key: to, value: l ? l.value : 0 });
        }

        // Handle the case where 'from' is less than the first key in the tree
        if (from < this.getFirstKey()) {
            this.segments.insert({ key: from, value: amount });
        } else if (from === this.getFirstKey()) {
            // If 'from' is equal to the first key, increment its value
            const node = this.segments.find({ key: from });
            node.value += amount;
        } else {
            // If 'from' is not already a key in the tree, insert it and adjust its value
            if (!this.segments.find({ key: from })) {
                this.segments.insert({ key: from, value: amount });
                const l = this.getLeftKey(from);
                if (l) {
                    const node = this.segments.find({ key: from });
                    node.value += l.value;
                }
            } else {
                // If 'from' is already a key, just increment its value
                const node = this.segments.find({ key: from });
                node.value += amount;
            }
        }

        // Increment the values of all keys between 'from' and 'to'
        this.segments.each((node) => {
            if (node.key > from && node.key < to) {
                node.value += amount;
            }
        });

        // Merge continuous segments that have the same intensity
        this.mergeKeys();
    }

    /**
     * Set a new range (from <-> to, to not included) of intensity based on existing one.
     * @param {number} from start of the range
     * @param {number} to end of the range (not included)
     * @param {number} amount intensity value
     */
    set(from, to, amount) {
        if (this.segments.size === 0) {
            this.segments.insert({ key: to, value: 0 });
            this.segments.insert({ key: from, value: amount });
            return;
        }

        // Ensure there is a segment at 'to' by copying the value from the leftmost key less than 'to'
        if (to < this.getFirstKey() || to > this.getLastKey()) {
            this.segments.insert({ key: to, value: 0 });
        } else if (!this.segments.find({ key: to })) {
            const l = this.getLeftKey(to);
            this.segments.insert({ key: to, value: l ? l.value : 0 });
        }

        // Insert the new segment starting at 'from'
        this.segments.insert({ key: from, value: amount });

        // Remove any segments within the range (from, to)
        this.segments.each((node) => {
            if (node.key > from && node.key < to) {
                this.segments.remove(node);
            }
        });

        // Merge continuous segments that have the same intensity
        this.mergeKeys();
    }

    /**
     * Return the dumped string simply.
     * @returns {string} string representation of segments
     */
    toString() {
        return this.transferToString();
    }

    /**
     * Get the first key in the segments tree.
     * @returns {number} the first key
     */
    getFirstKey() {
        return this.segments.min().key;
    }

    /**
     * Get the last key in the segments tree.
     * @returns {number} the last key
     */
    getLastKey() {
        return this.segments.max().key;
    }

    /**
     * Get the left segment node for x from this.segments.
     * @param {number} x the key to find the left segment for
     * @returns {{key: number, value: number}} the left segment node of the given key
     */
    getLeftKey(x) {
        let l = null;
        this.segments.each((node) => {
            if (node.key < x) {
                l = node;
            }
        });
        return l;
    }

    /**
     * Merge continuous segments together if they have the same intensity.
     */
    mergeKeys() {
        const nodes = [];
        this.segments.each((node) => nodes.push(node));

        // Remove leading zeros
        let i = 0;
        while (i < nodes.length && nodes[i].value === 0) {
            this.segments.remove(nodes[i]);
            i++;
        }

        // Remove trailing zeros except the last zero if necessary
        for (i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].value === 0) {
                if (i - 1 >= 0 && nodes[i - 1].value === 0) {
                    this.segments.remove(nodes[i]);
                }
            }
        }

        // Merge consecutive segments with the same non-zero value
        let last = nodes[0].value;
        for (i = 1; i < nodes.length; i++) {
            if (nodes[i].value === last && last !== 0) {
                this.segments.remove(nodes[i]);
            } else {
                last = nodes[i].value;
            }
        }
    }

    /**
     * TransferToString returns a string of simple format, i.e. [[20 1] [30 2] [40 0]].
     * @returns {string} string representation of segments
     */
    transferToString() {
        let rlt = "[";
        this.segments.each((node) => {
            rlt += `[${node.key},${node.value}],`;
        });
        // Remove the trailing comma if there are any segments
        if (rlt.length > 1) {
            rlt = rlt.slice(0, -1);
        }
        rlt += "]";
        return rlt;
    }
}