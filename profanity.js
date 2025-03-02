const profanity = {
    test: () => {
        console.log("hello");
    }
};

// CommonJS support for Node.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = profanity;
}

// Browser support: Attach to `window`
if (typeof window !== "undefined") {
    window.profanity = profanity;
}
