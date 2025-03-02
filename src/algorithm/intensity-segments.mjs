/**
 * Class to manage intensity segments.
 */
export class IntensitySegments {
    constructor() {
        // Array of [start, value] pairs representing segments
        this.segments = new Map();
    }

    add(from, to, amount) {
        let keys = this.sortedKeys()
        if (keys.length == 0) {
            this.set(from, to, amount)
            return
        }

        let lkeys = keys.length
        if (to < keys[0] || from > keys[lkeys - 1]) {
            this.set(from, to, amount)
            return
        }

        if (!this.segments.has(to)) {
            let l = this.getLeftKey(to)
            this.segments.set(to, this.segments.get(l))
        }

        if (from < keys[0]) {
            this.segments.set(from, amount)
        } else if (from == keys[0]) {
            this.segments.set(from, this.segments.get(from) + amount)
        } else {
            if (!this.segments.has(from)) {
                this.segments.set(from, amount)
                let l = this.getLeftKey(from)
                if (l != -1) {
                    this.segments.set(from, this.segments.get(from) + this.segments.get(l))
                }
            } else {
                this.segments.set(from, this.segments.get(from) + amount)
            }
        }

        keys.forEach(k => {
            if (k > from && k < to) {
                this.segments.set(k, this.segments.get(k) + amount)
            }
        })

        this.mergeKeys()
    }
    /**
     * set a new range(from <-> to, to not included) of intensity based on existing one.
     * @param {*} from
     * @param {*} to
     * @param {*} amount
     * @returns
     */
    set(from, to, amount) {
        let keys = this.sortedKeys()
        if (keys.length == 0) {
            this.segments.set(to, 0)
            this.segments.set(from, amount)
            return
        }

        let lkeys = keys.length
        if (to < keys[0] || to > keys[lkeys - 1]) {
            this.segments.set(to, 0)
        } else if (!this.segments.has(to)) {
            let l = this.getLeftKey(to)
            this.segments.set(to, this.segments.get(l))
        }

        this.segments.set(from, amount)

        keys = this.sortedKeys()
        keys.forEach(k => {
            if (k > from && k < to) {
                this.segments.delete(k)
            }
        })

        this.mergeKeys()
    }
    /**
     * return the dumped string simply
     */
    toString() {
        return this.transferToString()
    }

    /**
     * get sorted keys of 'segments' member.
     * @returns a sorted keys of segments
     */
    sortedKeys() {
        let keys = this.segments.keys()
        let ks = Array.from(keys)
        ks.sort()
        return ks
    }

    /**
     * get the left segment number for x from this.segments
     * @param {*} x
     * @returns the left segment number of the given.
     */
    getLeftKey(x) {
        let l = -1
        let keys = this.sortedKeys()
        keys.forEach(k => {
            if (k < x) {
                l = k
            }
        })
        return l
    }

    /**
     * mergeKeys continous segments to together if they have same intensity
     * @returns
     */
    mergeKeys() {
        let keys = this.sortedKeys()
        if (keys.length == 0) {
            return
        }

        let i = 0
        for (; i < keys.length && this.segments.get(keys[i]) == 0; i++) {
            this.segments.delete(keys[i])
        }
        keys.splice(0, i)

        for (i = keys.length - 1; i >= 0; i--) {
            if (this.segments.get(keys[i]) == 0) {
                if (i - 1 >= 0 && this.segments.get(keys[i - 1]) == 0) {
                    this.segments.delete(keys[i])
                    keys.splice(i, 1)
                }
            }
        }

        let last
        last = this.segments.get(keys[0])
        for (let i = 1; i < keys.length; i++) {
            if (this.segments.get(keys[i]) == last && last != 0) {
                this.segments.delete(keys[i])
            } else {
                last = this.segments.get(keys[i])
            }
        }

        last = 0
        for (let i = keys.length - 2; i >= 0; i--) {
            if (this.segments.get(keys[i]) == 0 && last == 0) {
                this.segments.delete(keys[i])
            } else {
                last = this.segments.get(keys[i])
            }
        }
    }

    /**
     * transferToString return a string of simple format, i.e. [[20 1] [30 2] [40 0]]
     * @returns
     */
    transferToString() {
        let keys = this.sortedKeys()
        let rlt = []
        keys.forEach(k => {
            rlt.push(`[${k},${this.segments.get(k)}]`)
        })

        return `[${rlt.join(",")}]`
    }
}