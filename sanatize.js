const sanitize = {
    number(value,options = {},callback) {
        let errLog = [];
        let clean = value;
        let fallback = options.default ?? false;
        let doFallback = options.default !== null ? true : false;
        let dirty = true;
        let counter = 0;
        let strict = options.strict ?? false;

        if (options.range) {
            options.min = options.range[0];
            options.max = options.range[1];
        }

        while (dirty) {
            let foundDirt = false;
            if (typeof clean !== "number" || isNaN(clean)) {
                let err = new Error("Not a number")
                clean = doFallback ? fallback : Number(clean);
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.whole && !Number.isInteger(clean)) {
                let err = new Error("Number must be whole")
                clean = doFallback ? fallback : Math.round(clean);
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.min !== null && clean < options.min) {
                let err = new Error(`Number must be >= ${options.min}`)
                clean = doFallback ? fallback : options.min;
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.max !== null && clean > options.max) {
                let err = new Error(`Number must be <= ${options.max}`)
                clean = doFallback ? fallback : options.max;
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.positive && clean < 0) {
                let err = new Error(`Number must be positive`);
                clean = doFallback ? fallback : clean * -1;
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.negative && clean > 0) {
                let err = new Error(`Number must be negative`);
                clean = doFallback ? fallback : clean * -1;
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.notZero && clean === 0) {
                let err = new Error(`Number can't be 0`);
                clean = doFallback ? fallback : clean + -1;
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.finite && !isFinite(clean)) {
                let err = new Error("Number must be finite")
                errLog.push(err);
                clean = doFallback ? fallback : 0;
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (options.multipleOf && clean % options.multipleOf !== 0) {
                clean = doFallback ? fallback : Math.round(clean / options.multipleOf) * options.multipleOf;
                let err = new Error(`Number must be a multiple of ${options.multipleOf}`)
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            if (typeof options.fixed === "number") {
                const decimalPlaces = (clean.toString().split(".")[1] || "").length;
                if (decimalPlaces > options.fixed) {
                    clean = doFallback ? fallback : parseFloat(clean.toFixed(options.fixed));
                    const err = new Error(`Number must be fixed to ${options.fixed} decimal place(s)`);
                    errLog.push(err);
                    foundDirt = true;
                    if (strict) return callback(err);
                }
            }

            if (!foundDirt) dirty = false;

            counter++;
            if (counter > 500) {
                return callback(new Error("Sanitize couldn't clean number"));
            }
        }

        return callback(errLog.length ? errLog : null, clean);
    },
    string(value,options = {},callback) {
        let errLog = [];
        let clean = value;
        let fallback = options.default ?? false;
        let doFallback = options.default !== null ? true : false;
        let dirty = true;
        let counter = 0;
        let strict = options.strict ?? false;

        while (dirty) {
            foundDirt = false;

            // Convert non-strings
            if (typeof clean !== "string") {
                clean = String(clean);
                const err = new Error("Value must be a string");
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            // Trim whitespace
            if (options.trim && clean.trim() !== clean) {
                clean = clean.trim();
                const err = new Error("String had leading or trailing whitespace");
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }

            // Enforce min length
            if (options.minLength != null && clean.length < options.minLength) {
                clean = doFallback ? fallback : clean.padEnd(options.minLength, " ");
                const err = new Error(`String must be at least ${options.minLength} characters`);
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }

            // Enforce max length
            if (options.maxLength != null && clean.length > options.maxLength) {
                clean = doFallback ? fallback : clean.slice(0, options.maxLength);
                const err = new Error(`String must be at most ${options.maxLength} characters`);
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }

            // Match regex
            if (options.pattern && !options.pattern.test(clean)) {
                clean = doFallback ? fallback : clean;
                const err = new Error(`String did not match required pattern`);
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }

            // Force lowercase
            if (options.lowercase && clean !== clean.toLowerCase()) {
                clean = clean.toLowerCase();
                const err = new Error("String was not lowercase");
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }

            // Force uppercase
            if (options.uppercase && clean !== clean.toUpperCase()) {
                clean = clean.toUpperCase();
                const err = new Error("String was not uppercase");
                errLog.push(err);
                foundDirt = true;
                if (strict) return callback(err);
            }
            // Check for valid email
            if (options.isEmail) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(clean)) {
                    clean = doFallback ? fallback : clean;
                    const err = new Error("String must be a valid email address");
                    errLog.push(err);
                    foundDirt = true;
                    if (strict) return callback(err);
                }
            }


            if (!foundDirt) dirty = false;
            counter++;
            if (counter > 500) {
                return callback(new Error("Sanitize couldn't clean number"));
            }
        }
        
        return callback(errLog.length ? errLog : null, clean);
    }
}


// CommonJS support for Node.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = sanitize;
}
