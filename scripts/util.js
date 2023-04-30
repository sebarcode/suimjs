import { nextTick } from 'vue'

const suimContext = {
    notif: null
}

export default {
    addNumbSep(number, thouSep) {
        return number.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thouSep)
    },

    formatMoney(number, options) {
        let { thouSep, decSep, decimal } = options || {}
        thouSep = thouSep || ','
        decSep = decSep || '.'
        decimal = isNaN(decimal) ? 0 : Math.abs(decimal)

        let _nSplits = (Number(number) || 0).toFixed(decimal).split('.')
        let _numbStr = _nSplits[0]
        let _decStr = _nSplits.length > 1 ? _nSplits[1] : ""
        _numbStr = this.addNumbSep(_numbStr, thouSep)

        return _numbStr + (_decStr ? decSep + _decStr : "")
    },

    nextTickN(n, f) {
        if (n == 0) {
            nextTick(() => {
                f()
            })
        } else {
            nextTick(() => {
                this.nextTickN(n - 1, f)
            })
        }
    },

    uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },

    getErrorMessage(e) {
        if (e == undefined || e == null) return "unknown error"

        const msg = e.response && e.response.data ? e.response.data :
            e.data && e.data.message ? e.data.message :
                e.message ? e.message :
                    e.reason ? e.reason : e

        if (msg=='') return "unknown error"

        return msg
    },

    setNotifStore (store) {
        suimContext.notif = store
    },

    sendNotif (kind, message) {
        if (suimContext.notif==undefined || suimContext.notif==null) return

        suimContext.notif.add({kind: kind, message: message})
    },

    showInfo (message) {
        this.sendNotif('info', message)
    },

    showWarning (message) {
        this.sendNotif('warning', message)
    },

    showError (message) {
        this.sendNotif('error', message)
    },

    nextTickN(n, f) {
        if (n == 0) {
            nextTick(() => {
                f()
            })
        } else {
            nextTick(() => {
                this.nextTickN(n - 1, f)
            })
        }
    },
}