import config from '@/config'
import jwt from 'jsonwebtoken'

const { HUGGY_SECRET, HUGGY_COMPANY, HUGGY_DEFAULT_COUNTRY, HUGGY_CONTEXT_ID, HUGGY_UUID } = config

function create ({ isUserLoggedIn, isCallCenterFeatureEnabled, userData }) {
  isCallCenterFeatureEnabled = HUGGY_SECRET && HUGGY_COMPANY && HUGGY_DEFAULT_COUNTRY && HUGGY_CONTEXT_ID && HUGGY_UUID && isCallCenterFeatureEnabled
  const { Huggy } = window
  const userHash = isCallCenterFeatureEnabled && jwt.sign({ jti: userData.email }, HUGGY_SECRET, { algorithm: 'HS256' })
  userData.hash = userHash
  userData.isUserLoggedIn = isUserLoggedIn
  window.userData = userData

  if (Huggy) {
    if (Huggy.closeBox) Huggy.closeBox()

    if (isUserLoggedIn && Huggy.init) {
      Huggy.init()

      return
    }

    if (!isUserLoggedIn && Huggy.logout) {
      Huggy.logout(false)
      Huggy.destroy()
    }

    return
  }

  if (isCallCenterFeatureEnabled && isUserLoggedIn) {
    const scriptTag = document.createElement('script')

    scriptTag.innerHTML = `
        var $_Huggy = {
          defaultCountry: '${HUGGY_DEFAULT_COUNTRY}',
          uuid: '${HUGGY_UUID}',
          company: '${HUGGY_COMPANY}',
          afterLoad: function () {
            if (userData.isUserLoggedIn) {
              Huggy.login({
                userIdentifier: userData.email,
                userHash: userData.hash
              });

              return;
            }
            
            Huggy.logout(false);
            Huggy.destroy();
          }
        };

        (function(i,s,o,g,r,a,m){ i[r]={context:{id:'${HUGGY_CONTEXT_ID}'}};a=o;o=s.createElement(o); o.async=1;o.src=g;m=s.getElementsByTagName(a)[0];m.parentNode.insertBefore(o,m); })(window,document,'script','https://js.huggy.chat/widget.min.js','pwz');
      `

    document.head.appendChild(scriptTag)
  }
}

export default { create }
