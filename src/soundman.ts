export class Sound {
    private id: string;
    path: string;
    weight: number;
  
    constructor() {
        this.id = crypto.randomUUID();
    };

    static createInstance() {
        return new Sound();
    }
    
    getID() : string {
        return this.id;
    }
}

export enum LoadMode {
    IMMEDIATE,
    LAZY
}

// probably makes more sense to simply make SoundMan a scene
export class SoundMan {
    // Dictionary where each key corresponds to an array of Sounds
    private static sounds: { [key: string] : Sound[] } = {};
    private static scene : Phaser.Scene;

    static init(scene : Phaser.Scene) {
        SoundMan.scene = scene;
    }

    private static warning() : Boolean {
        if (!SoundMan.scene) {
            console.error("SoundMan.init(scene) must be called before new sounds can be added!");
            return true;
        }
        return false;
    }

    // Add sounds to the dictionary under a specific key
    static add(key : string, path : string, weight : number = 1) : void {
        if (SoundMan.warning()) return;

        let sound : Sound;
        sound        = Sound.createInstance();
        sound.path   = path;
        sound.weight = weight;
        SoundMan.scene.load.audio(sound.getID(), `${sound.path}`);
        SoundMan.scene.load.start();
        SoundMan.scene.load.once('complete', () => {
            if (!SoundMan.sounds[key]) SoundMan.sounds[key] = [];
            SoundMan.sounds[key].push(sound);
        });
    }

    /** @brief Assumes data is formated as: { "key" [ {path, weight} ], ... }
     *  @path Path from within asset folder to json file.
     */
    static importJSON(path : string) : void {
        if (SoundMan.warning()) return;
        const jsonCache = crypto.randomUUID();
        SoundMan.scene.load.json(jsonCache, `${path}`);
        SoundMan.scene.load.once('complete', () => {
            var data = SoundMan.scene.cache.json.get(jsonCache);
            //console.log(data);
            for (const key in data) {
                if (!Array.isArray(data[key])) {
                    console.error(`{key} is non-list in ${path}!`);
                    continue;
                }

                const list = data[key];
                list.forEach((sound : {path: string, weight: number}) => {
                    let s    = Sound.createInstance();
                    s.path   = sound.path;
                    s.weight = sound.weight;
                    SoundMan.scene.load.audio(s.getID(), `${s.path}`);
                    if (!SoundMan.sounds[key]) SoundMan.sounds[key] = [];
                    SoundMan.sounds[key].push(s);
                });
            }

            SoundMan.scene.load.start();
        });
        SoundMan.scene.load.start();
    }
 
    static play(key : string) : void {
        SoundMan.scene.sound.play(SoundMan.getSound(key).getID());        
    }

    static playUnweight(key : string) : void {
        SoundMan.scene.sound.play(SoundMan.getSoundUnweight(key).getID());
    }

    // Get a random sound based on the weight of each sound
    static getSound(key: string) : Sound | null {
        const soundList = SoundMan.sounds[key];
        if (!soundList) {
            console.warn(`No sounds found for key: ${key}`);
            return null;
        }
    
        // Calculate total weight
        const totalWeight = soundList.reduce((sum, sound) => sum + sound.weight, 0);
    
        // Randomly pick a sound based on the weight
        let randomValue = Math.random() * totalWeight;
        for (const sound of soundList) {
            randomValue -= sound.weight;
            if (randomValue <= 0) {
                return sound;
            }
        }
    
        // In case something goes wrong, return null
        return null;
    }
  
    // Get a random sound without considering weight (uniform random)
    static getSoundUnweight(key: string) : Sound | null {
        const soundList = SoundMan.sounds[key];
        if (!soundList) {
            console.warn(`No sounds found for key: ${key}`);
            return null;
        }
    
        return soundList[Math.floor(Math.random() * soundList.length)];
    }

    static getSoundAll(key : string) : Sound[] | null {
        const soundList = SoundMan.sounds[key];
        if (!soundList) {
            console.warn(`No sounds found for key: ${key}`);
        }
        return SoundMan.sounds[key];
    }
}
