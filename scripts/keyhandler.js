export class keyHandlerSetup {
    constructor(key1, key2, fn) {
        this.key1 = key1; // Alt, Ctrl, or Shift
        this.key2 = key2; // Any character
        this.fn = fn; // Function (event)
    }

    execute(event) {
        if (this.fn) {
            this.fn(event);
        }
    }
}

export class keyHandlers {
    constructor() {
        this.setups = []; // Array of keyHandlerSetup
    }

    add(keyHandlerSetup) {
        // Check if a setup with the same key1 and key2 already exists
        const existingIndex = this.setups.findIndex(setup => setup.key1 === keyHandlerSetup.key1 && setup.key2 === keyHandlerSetup.key2);

        if (existingIndex !== -1) {
            // Overwrite the existing setup
            this.setups[existingIndex] = keyHandlerSetup;
        } else {
            // Add the new setup
            this.setups.push(keyHandlerSetup);
        }
    }

    remove(k1, k2) {
        // Filter out the setup with the matching key1 and key2
        this.setups = this.setups.filter(setup => setup.key1 !== k1 || setup.key2 !== k2);
    }

    executeAll(event, parm) {
        this.setups.forEach(setup => {
            setup.execute(event, parm);
        });
    }

    handle(event) {
        const key1 = event.altKey ? 'Alt' : event.ctrlKey ? 'Ctrl' : event.shiftKey ? 'Shift' : null;
        const key2 = event.key;

        if (key1 && key2) {
            const setup = this.setups.find(s => s.key1 === key1 && s.key2 === key2);
            if (setup) {
                setup.execute(event); // pass event
            }
        }
    }

    handleKeyDown(document) {
        this.boundHandle = this.handle.bind(this); // Bind the handle function to preserve context
        document.addEventListener('keydown', this.boundHandle);
    }

    unhandleKeyDown(document) {
        if (this.boundHandle) {
            document.removeEventListener('keydown', this.boundHandle);
            this.boundHandle = null; // Clean up the reference
        }
    }
}

// Example usage:
// const keyHandler = new keyHandlerSetup('Ctrl', 'A', (event, parm) => console.log('Ctrl+A pressed', parm));
// keyHandler.execute(event, 'some parameter');

// const keyHandlers = new KeyHandlers();
// keyHandlers.add(new keyHandlerSetup('Ctrl', 'A', (event, parm) => console.log('Ctrl+A pressed', parm)));
// keyHandlers.executeAll(event, 'some parameter');
