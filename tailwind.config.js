const defaultTheme = require('tailwindcss/defaultTheme')


module.exports = {
    // plugins: {"tailwindcss": {} , "autoprefixer": {}},
    theme: {
      extend: {
        colors: {
          'midnight': '#0d1020',
          'xdarkblue': '#282D46',

          // secondary
          'xmidblue': '#3A50F7',  //indigo-600
          'xmidpurple': '#860BCE', //purple-700 

          'xgreen': '#5BD300', //lime-500
          'xred': '#E91616',  //red-600
          'xyellow': '#FFB800', //yellow-500
          'xcyan': '#35F9F9', //cyan-400

          'darkpurple': '#1c1036',
          'midpurple': '#391c63',
          'lightpurple': '#b350d1',

          'darkblue': 'rgba(56,139,253,0.15)',
          'midblue': '#193f68',
          'lightblue': 'rgba(56,139,253,0.4)',

          'darkgreen': 'rgb(7, 58, 7)',
          'midgreen': 'rgb(21, 95, 21)',
          'lightgreen': '#90ee90',

          'darkred': 'rgba(248,81,73,0.15)',
          'midred': 'rgb(196, 39, 39)',
          'lightred': 'rgba(248,81,73,0.4)',
        
          'darkyellow': 'rgba(187,128,9,0.4)',
          'midyellow': '#b350d1',
          'lightyellow': '#f0e68c',

          'seethrough-30': 'rgba(255,255,255,0.3)',
        },
        fontFamily: {
          mono: [
            'Courier',
            // ...defaultTheme.fontFamily.mono,
          ]
        }
      }
    }
  }

// .ar {border: 2px solid white; color: white;}
// .bluearea { background: #0D2A4A; border-color: #193f68;}
// .purplearea { background: #1c1036; border-color: #391c63;}
// .greenarea { background: rgb(7, 58, 7); border-color: rgb(21, 95, 21);}
// .yellowarea { background: rgb(104, 105, 0); border-color: rgb(186, 189, 54);}
// .redarea { background: rgb(70, 7, 7); border-color: rgb(196, 39, 39);}
  
// .purplebutton {background: #391c63; border-color: #b350d1;}
// .purplebutton:hover { background: #742c8a;}
// .bluebutton {background: #00449e; border-color: lightskyblue;}
// .bluebutton:hover {background: #2b78dd;}
// .greenbutton {background: green; border-color: lightgreen;}
// .greenbutton:hover {background: rgb(36, 173, 36);}
// .yellowbutton {background: rgb(168, 168, 63); border-color: yellow;}
// .yellowbutton:hover {background: rgb(204, 204, 69);}
// .redbutton {background: rgb(109, 31, 31); border-color: red;}
// .redbutton:hover {background: darkred;}