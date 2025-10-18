const profanity_sexualWords = ["2g1c", "2 girls 1 cup", "acrotomophilia", "alabama hot pocket", "alaskan pipeline", "anal", "anilingus", "anus", "apeshit", "arsehole", "ass", "asshole", "assmunch", "auto erotic", "autoerotic", "babeland", "baby batter", "baby juice", "ball gag", "ball gravy", "ball kicking", "ball licking", "ball sack", "ball sucking", "bangbros", "bangbus", "bareback", "barely legal", "barenaked", "bastard", "bastardo", "bastinado", "bbw", "bdsm", "beaner", "beaners", "beaver cleaver", "beaver lips", "beastiality", "bestiality", "big black", "big breasts", "big knockers", "big tits", "bimbos", "birdlock", "bitch", "bitches", "black cock", "blonde action", "blonde on blonde action", "blowjob", "blow job", "blow your load", "blue waffle", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "booty call", "brown showers", "brunette action", "bukkake", "bulldyke", "bullet vibe", "bullshit", "bung hole", "bunghole", "busty", "butt", "buttcheeks", "butthole", "camel toe", "camgirl", "camslut", "camwhore", "carpet muncher", "carpetmuncher", "chocolate rosebuds", "cialis", "circlejerk", "cleveland steamer", "clit", "clitoris", "clover clamps", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "coon", "coons", "creampie", "cum", "cumming", "cumshot", "cumshots", "cunnilingus", "cunt", "darkie", "date rape", "daterape", "deep throat", "deepthroat", "dendrophilia", "dick", "dildo", "dingleberry", "dingleberries", "dirty pillows", "dirty sanchez", "doggie style", "doggiestyle", "doggy style", "doggystyle", "dog style", "dolcett", "dominatrix", "dommes", "donkey punch", "double dong", "double penetration", "dp action", "dry hump", "dvda", "eat my ass", "ecchi", "ejaculation", "erotic", "erotism", "escort", "eunuch", "fag", "faggot", "fecal", "felch", "fellatio", "feltch", "female squirting", "femdom", "figging", "fingerbang", "fingering", "fisting", "foot fetish", "footjob", "frotting", "fuck", "fuck buttons", "fuckin", "fucking", "fucktards", "fudge packer", "fudgepacker", "futanari", "gangbang", "gang bang", "gay sex", "genitals", "giant cock", "girl on", "girl on top", "girls gone wild", "goatcx", "goatse", "god damn", "gokkun", "golden shower", "goodpoop", "goo girl", "goregasm", "grope", "group sex", "g-spot", "guro", "hand job", "handjob", "hard core", "hardcore", "hentai", "homoerotic", "honkey", "hooker", "horny", "hot carl", "hot chick", "how to kill", "how to murder", "huge fat", "humping", "incest", "intercourse", "jack off", "jail bait", "jailbait", "jelly donut", "jerk off", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "leather restraint", "leather straight jacket", "lemon party", "livesex", "lolita", "lovemaking", "make me come", "male squirting", "masturbate", "masturbating", "masturbation", "menage a trois", "milf", "missionary position", "mong", "motherfucker", "mound of venus", "mr hands", "muff diver", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nig nog", "nimphomania", "nipple", "nipples", "nsfw", "nsfw images", "nude", "nudity", "nutten", "nympho", "nymphomania", "octopussy", "omorashi", "one cup two girls", "one guy one jar", "orgasm", "orgy", "paedophile", "paki", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "phone sex", "piece of shit", "pikey", "pissing", "piss pig", "pisspig", "playboy", "pleasure chest", "pole smoker", "ponyplay", "poof", "poon", "poontang", "punany", "poop chute", "poopchute", "porn", "porno", "pornography", "prince albert piercing", "pthc", "pubes", "pussy", "queaf", "queef", "quim", "raghead", "raging boner", "rape", "raping", "rapist", "rectum", "reverse cowgirl", "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters", "rusty trombone", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexcam", "sexo", "sexy", "sexual", "sexually", "sexuality", "shaved beaver", "shaved pussy", "shemale", "shibari", "shit", "shitblimp", "shitty", "shota", "shrimping", "skeet", "slanteye", "slut", "s&m", "smut", "snatch", "snowballing", "sodomize", "sodomy", "spastic", "spic", "splooge", "splooge moose", "spooge", "spread legs", "spunk", "strap on", "strapon", "strappado", "strip club", "style doggy", "suck", "sucks", "suicide girls", "sultry women", "swastika", "swinger", "tainted love", "taste my", "tea bagging", "threesome", "throating", "thumbzilla", "tied up", "tight white", "tit", "tits", "titties", "titty", "tongue in a", "topless", "tosser", "towelhead", "tranny", "tribadism", "tub girl", "tubgirl", "tushy", "twat", "twink", "twinkie", "two girls one cup", "undressing", "upskirt", "urethra play", "urophilia", "vagina", "venus mound", "viagra", "vibrator", "violet wand", "vorarephilia", "voyeur", "voyeurweb", "voyuer", "vulva", "wank", "wetback", "wet dream", "white power", "whore", "worldsex", "wrapping men", "wrinkled starfish", "xx", "xxx", "yaoi", "yellow showers", "yiffy", "zoophilia"] 
const profanity_slurs = ["nigger","chink","beaner","negro","coon","kike","faggot","trany","gippo","golliwog","paki","cocksucker","dyke"];
const profanity_swear_hard = ["ass","fuck","cunt","bitch","bitchass"];
const profanity_swear_soft = ["hell","shit","damn",];
const profanity = {
    clean: (text,badMods = ["sexualWords", "slurs", "swear_hard","swear_soft"],allowMods = []) => {
        return replaceAllBadWords(text,badMods,allowMods);
    },
    check: (text,badMods = ["sexualWords", "slurs", "swear_hard","swear_soft"],allowMods = []) => {
        if (replaceAllBadWords(text,badMods,allowMods) === text) return false;
        else return true;
    }
};


function replaceAllBadWords(string, type,allowType = []) {
    if (type === true || type == "all" || type == undefined) type = ["sexualWords", "slurs", "swear_hard","swear_soft"];

    const similarCharacters = {
        a: ["@", "4"],
        b: ["8"],
        c: ["(", "{", "[", "©"],
        d: ["|)"],
        e: ["3"],
        f: ["ph"],
        g: ["9"],
        h: ["#"],
        i: ["1", "!", "|","l"],
        j: [],
        k: [],
        l: ["1", "|","!","I"],
        m: [],
        n: [],
        o: ["0"],
        p: [],
        q: [],
        r: [],
        s: ["$", "5"],
        t: ["7", "+", "†"],
        u: ["v", "ü","a","b","c",'d',"e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","v","w","x","y","z"],
        v: ["u"],
        w: ["vv"],
        x: [],
        y: [],
        z: ["2"]
    };

    const badWords = {
        sexualWords: profanity_sexualWords,
        slurs: profanity_slurs,
        swear_hard: profanity_swear_hard,
        swear_soft: profanity_swear_soft,
    };
    const funnyWords = ["banana", "waffle", "pickle", "toaster", "snorkel"];

    function generateRegex(word) {
        // Allowing any characters (spaces, dots, hyphens) between letters
        let regexPattern = word
            .split("")
            .map(char => {
                let variations = similarCharacters[char.toLowerCase()] || [];
                return `[${char}${variations.join("")}]+`; // Allow repeated letters
            })
            .join(`[\\s\\.\\-]*`); // Allow spaces, dots, or hyphens between letters

        // Allow word variants like "fucking", "fucked", "bitches"
        let suffixes = "(ing|ed|er|es|s)?";
        return `(?<![a-zA-Z])${regexPattern}${suffixes}(?![a-zA-Z])`;
    }

    let allowPatterns = [];
    let blockPatterns = [];

    // Collect words for allowing
    allowType.forEach(category => {
        if (badWords[category]) {
            badWords[category].forEach(word => {
                allowPatterns.push(generateRegex(word));
            });
        }
    });

    // Collect words for blocking
    type.forEach(category => {
        if (badWords[category]) {
            badWords[category].forEach(word => {
                if (!allowType.includes(category)) {
                    blockPatterns.push(generateRegex(word));
                }
            });
        }
    });

    let allowRegex = allowPatterns.length > 0 ? new RegExp(allowPatterns.join("|"), "gi") : null;
    let blockRegex = new RegExp(blockPatterns.join("|"), "gi");

    // Step 1: Identify words that should be allowed
    let wordsToAllow = new Set();
    if (allowRegex) {
        string.replace(allowRegex, match => {
            wordsToAllow.add(match.toLowerCase());
            return match;
        });
    }

    // Step 2: Replace all bad words EXCEPT the allowed ones
    let censoredString = string.replace(blockRegex, (match) => {
        return wordsToAllow.has(match.toLowerCase()) ? match : funnyWords[Math.floor(Math.random() * funnyWords.length)];
    });

    // Special rule for "fuck" - catch it anywhere, even inside longer words
    let fuckPattern = /[fph]+[\s\.\-\_]*[uüv]+[\s\.\-\_]*[ck]+[a-z]*/gi;
    censoredString = censoredString.replace(fuckPattern, () => {
        return funnyWords[Math.floor(Math.random() * funnyWords.length)];
    });

    return censoredString;
}

// CommonJS support for Node.js
if (typeof module !== "undefined" && module.exports) {
    module.exports = profanity;
}
