/* Short UI messages in the page's language (English, Telugu, Hindi). Tool scripts read window.CT_I18N. */
(function () {
  var M = {
    te: { needTopic: 'ముందు మీ వీడియో టాపిక్ రాయండి.', needComment: 'ముందు comment paste చేయండి.', working: '⏳ రాస్తోంది... (5–15 సెకన్లు)',
          wait: 'రాస్తోంది, కొంచెం ఆగండి...', nothing: 'కాపీ చేయడానికి ఇంకా ఏమీ లేదు. ముందు generate చేయండి.', copied: 'కాపీ అయింది',
          fail: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.', offline: 'Server కి connect అవ్వలేదు. Internet చూసి మళ్ళీ ప్రయత్నించండి.',
          needTitle: 'ముందు మీ వీడియో టైటిల్ రాయండి.', needLang: 'కనీసం ఒక భాష ఎంచుకోండి.', max: 'ఒకసారి గరిష్ఠం 6 భాషలు ఎంచుకోవచ్చు.',
          title: 'టైటిల్', desc: 'డిస్క్రిప్షన్', copyTitle: 'టైటిల్ కాపీ', copyDesc: 'డిస్క్రిప్షన్ కాపీ' },
    hi: { needTopic: 'पहले अपने वीडियो का टॉपिक लिखें।', needComment: 'पहले comment paste करें।', working: '⏳ लिख रहा है... (5–15 सेकंड)',
          wait: 'लिख रहा है, थोड़ा रुकें...', nothing: 'कॉपी करने के लिए अभी कुछ नहीं है। पहले generate करें।', copied: 'कॉपी हो गया',
          fail: 'कुछ गलत हुआ। फिर से कोशिश करें।', offline: 'Server से connect नहीं हुआ। Internet जाँचें और फिर कोशिश करें।',
          needTitle: 'पहले अपने वीडियो का टाइटल लिखें।', needLang: 'कम से कम एक भाषा चुनें।', max: 'एक बार में 6 भाषाएँ तक चुन सकते हैं।',
          title: 'टाइटल', desc: 'डिस्क्रिप्शन', copyTitle: 'टाइटल कॉपी करें', copyDesc: 'डिस्क्रिप्शन कॉपी करें' }
  };
  var lang = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
  window.CT_I18N = M[lang] || {};
})();
