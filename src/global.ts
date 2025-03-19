const logo : string = `
           ###
         #######.
       ##-####.+#                                                  ####-+###
     ######   ##+#+                                                ####+  ##+##                            ..-+###########.#.
   ###+##      ++.##                                               ##..     #####-                          #############+##
  ##-+#          #++.                                              #.##     +#++##                                     ###+
  ##+-+           ##                                               #.#        #.##                                    #+-#
  -#+#-##                                                          ########-##-+#                                    #++#
     +####            ######  ##--###   ###                       #..####+###..++                    +-         ####++#          .####    .  ####
       ###+##        #-+####+-#+#+#+.  -+####  #.+..##    ### -+   ####-       ++#+#                 ###-       ..#.+##+         #######   ###.#####  .#######+
         ######        ##.##+ #.#     -#.# ++# ##+..+++  ##-++###  #-#          -#+##+               ##+#        ++###.         ##.# #++   ++.####.#  #+      ..
           ######       # #   ###     +-#   #+##.#+.## +##+   .##  ###            ##.##   ..          #-#        +#+.###       #+#    ##   ###    ##  .#####+#+
 ##          ######     #+#+  #.#     +#.    ##.+#   #  #.#+  .##  ###             +..# ##+####       #+#      ##.+           .##.    #+   ###    ##  #+#
..##+          ##.##    ####  #+#     +#+   .+####   #  #.#.#####  #+#            ##.#.+++#.+.#+#    .###     ##.+             #+#   .##   ###    ##  -+#.   ##
 #####         +#..#.   ####  #+#      +###++# #.#   # ### ..+###  #.###        ##.+# ##+     ### .#######   #++#              #+-# .###   ##    .#+   .######
   #+.##     ##.####    ####  ###       +####  #.#   #.# ++.##+##  ##+#.###   ##+### ##+       ## ##   +##  ##.#########+        ######.   ##     #
    ##.##.#####+##      ###+  #.#        ###               . ####  +#+##.#+###+.##  .##.    +#### #  +####  +##+ -#######+        -##+
      ######-##          ##   #+                     .##     #-#-  .##   #######     ####+###-.###.###. +#
       +#####                                         ##########           ###+        ####    ###
                                                       #######-`


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
        fontFamily: 'JBM',
        fontSize: '14px',
        //backgroundColor: '#F3B141',
        color: '#70161E',
        align: 'left',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    uiPopup : {
        fontFamily: 'JBM',
        fontSize: '32px',
        //backgroundColor: '#F3B141',
        color: '#70161E',
        align: 'center',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    titleConfig : {
        fontFamily: 'JBM',
        fontSize: '32px',
        //backgroundColor: '#F3B141',
        color: '#70161E',
        align: 'right',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    settingsConfig : {
        fontFamily: 'JBM',
        fontSize: '48px',
        //backgroundColor: '#F3B141',
        color: '#70161E',
        align: 'center',
        padding: {
            top: 5,
            bottom: 5,
        },
        fixedWidth: 0
    },
    menuText : `${logo}\r\r\r\r\r`,
    red : 0x70161E,
    playerDeathTime : 3000
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
