const profanity = {
    test: () => {
        console.log("hello");
    }
};

// Export as default so it can be imported with any name
export default profanity;

// Ensure compatibility with Node.js (CommonJS)
if (typeof module !== "undefined" && module.exports) {
    module.exports = profanity;
}