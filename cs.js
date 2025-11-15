class CSChannel {
    constructor(name,obj) {
        this.name = name;
        this.enabled = obj.enabled ?? false;
        this.quiet = obj.quiet ?? false;
        this.history = [];
        this.prefixText = obj.prefixText ?? name;
        this.styles = obj.styles ?? {};
        this.join = obj.join ?? ", ";
    }

    enable() { this.enabled = true; return this; }
    disable() { this.enabled = false; return this; }
    silence() {this.quiet = true; return this; }
    loud() {this.quiet = false; return this; }

    color(hex) { this.styles.color = hex; return this; }

    prefix(text) { this.prefixText = text; return this; }

}
let cs = {
    list: [],

    set(name,obj) {
        let channel = new CSChannel(name,obj);
        this.list.push(channel);
        return channel;
    },
    get(name) {
        return this.list.find(c => c.name === name) || null;
    },
    listen(name,...args) {
        let channel = this.get(name);
        if (!channel) return;
        if (!channel.enabled) return;
        
        let outputString = args.join(channel.join);
        console.log(`[${channel.prefixText}] ${outputString}`);

    }

}

// Export for Node.js
module.exports = cs;