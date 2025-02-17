declare global {
    // vars
    let highScore : number;
    let musicOn   : boolean;

    // consts
    let assetPath : string;
}

export let gVar = {
    highScore : 0,
    musicOn : true,
}

export let gConst = {
    assetPath : process.env.NODE_ENV === 'production' ? './assets/' : '../assets/',
    uiConfig : {
        fontFamily: 'Chillen',
        fontSize: '32px',
        //backgroundColor: '#F3B141',
        color: '#FFFFFF',
        align: 'right',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    uiPopup : {
        fontFamily: 'Chillen',
        fontSize: '32px',
        //backgroundColor: '#F3B141',
        color: '#FFFFFF',
        align: 'center',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    titleConfig : {
        fontFamily: 'HapolePencil',
        fontSize: '32px',
        //backgroundColor: '#F3B141',
        color: '#000000',
        align: 'right',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    settingsConfig : {
        fontFamily: 'HapolePencil',
        fontSize: '32px',
        //backgroundColor: '#F3B141',
        color: '#FFFFFF',
        align: 'center',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
} as const;

/**
 * 
 * @param cookie Name of the cookie
 * @param value  Value of cookie
 * @param expires Expiration date. Defaults to 9999 years from today.
 */
export function saveCookie (cookie : string, value : any, expires? : Date) : void {
    if (expires == null) {
        expires = new Date();
        expires.setFullYear(expires.getFullYear() + 9999); // effectively no experation
    }
    
    document.cookie = `${cookie}=${value}; expires=${expires.toUTCString()}; path=/;`;
}
