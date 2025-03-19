import { Input } from 'phaser';
import Keyboard = Input.Keyboard;

// Define a KeyMap class with static properties
export class KeyMap {
    static keyUP:     Keyboard.Key;
    static keyDOWN:   Keyboard.Key;
    static keyLEFT:   Keyboard.Key;
    static keyRIGHT:  Keyboard.Key;
    static keySELECT: Keyboard.Key;
    static keyRESET:  Keyboard.Key;
    static keyEXIT:   Keyboard.Key;
    static keySPACE:  Keyboard.Key;

    // sbz specific
    static keyShieldL : Keyboard.Key;
    static keyShieldC : Keyboard.Key;
    static keyShieldR : Keyboard.Key;
    static keyShield  : Record<string, Keyboard.Key>;
    static keyMove : Record<string, Keyboard.Key>;

    static isShielding() {
        return KeyMap.keyShieldL.isDown || KeyMap.keyShieldC.isDown || KeyMap.keyShieldR.isDown;
    }
    
    static keyDEBUG:  Keyboard.Key;

    static initialize(scene: Phaser.Scene) {
        KeyMap.keyUP     = scene.input.keyboard.addKey(Keyboard.KeyCodes.UP);
        KeyMap.keyDOWN   = scene.input.keyboard.addKey(Keyboard.KeyCodes.DOWN);
        KeyMap.keyLEFT   = scene.input.keyboard.addKey(Keyboard.KeyCodes.LEFT);
        KeyMap.keyRIGHT  = scene.input.keyboard.addKey(Keyboard.KeyCodes.RIGHT);
        KeyMap.keySELECT = scene.input.keyboard.addKey(Keyboard.KeyCodes.ENTER);
        KeyMap.keyRESET  = scene.input.keyboard.addKey(Keyboard.KeyCodes.R);
        KeyMap.keyEXIT   = scene.input.keyboard.addKey(Keyboard.KeyCodes.ESC);
        KeyMap.keySPACE  = scene.input.keyboard.addKey(Keyboard.KeyCodes.SPACE);

        KeyMap.keyShieldL = scene.input.keyboard.addKey(Keyboard.KeyCodes.Q);
        KeyMap.keyShieldC = scene.input.keyboard.addKey(Keyboard.KeyCodes.W);
        KeyMap.keyShieldR = scene.input.keyboard.addKey(Keyboard.KeyCodes.E);
        KeyMap.keyShield = {
            L: KeyMap.keyShieldL,
            C: KeyMap.keyShieldC,
            R: KeyMap.keyShieldR
        };
        KeyMap.keyMove = {
            L: KeyMap.keyLEFT,
            R: KeyMap.keyRIGHT
        };

        KeyMap.keyDEBUG  = scene.input.keyboard.addKey(Keyboard.KeyCodes.F2)
    }
}
