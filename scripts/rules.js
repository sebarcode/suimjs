function textLength(min, max, allowBlank) {
    return function (data) {
      const dataLength = data.length;
      if (allowBlank && dataLength == 0) return "";
      if (dataLength < min && min > 0) return "minimal length is " + min;
      if (dataLength > max && max != undefined && max > 0)
        return "maximal length is " + max;
      return "";
    };
  }
  
  function strongPassword(minimalLength) {
    return function (data) {
      if (data == undefined)
        return (
          "strong password: has " +
          minimalLength +
          " chars minimal with combination of uppercase, lowercase and number only"
        );
  
      const dataLen = data.length;
      let hasCap = false;
      let hasLow = false;
      let hasNumber = false;
      let hasSpecialChar = false;
      let consistsInvalidChar = false;
  
      data.split("").forEach((ch) => {
        const validCar =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!_.#$-".indexOf(ch) >=
          0;
        if (!validCar) consistsInvalidChar = true;
        else {
          if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(ch) >= 0) hasCap = true;
          if ("abcdefghijklmnopqrstuvwxyz".indexOf(ch) >= 0) hasLow = true;
          if ("0123456789".indexOf(ch) >= 0) hasNumber = true;
          if ("!_.#$-".indexOf(ch) >=0) hasSpecialChar =true;
        }
      });
  
      return dataLen >= minimalLength &&
        !consistsInvalidChar &&
        hasCap &&
        hasLow &&
        hasSpecialChar &&
        hasNumber
        ? ""
        : "strong password: has " +
        minimalLength +
        " chars minimal with combination of uppercase, lowercase, number and special chars(!_.#$-) only"
    };
  }
  
  function isEmail(data) {
    if (data==undefined) return "email is not valid"
    const adpos = data.indexOf("@");
    const domain = data.substr(adpos)
    const dotpos = domain.indexOf(".");
    //console.log(adpos, dotpos, data.length);
  
    return adpos > 0 && dotpos > 0 && dotpos < domain.length - 1
      ? ""
      : "email is not valid";
  }
  
export default {
    minLength (x, msg) {
        if (msg==undefined || msg=='') {
            msg = 'minimal length is ' + x
        }

        return function (v) {
            if (x > 0 && v && v.length && v.length < x) {
                return msg
            } else if (x > 0 && v==undefined) {
                return msg
            } 

            return ''
        }
    },

    maxLength (x, msg) {
        if (msg==undefined || msg=='') {
            msg = 'maximal length is ' + x
        }

        return function (v) {
            if (v && v.length && v.length > x) {
                return msg
            }

            return ''
        }
    },

    textLength,
    strongPassword,
    isEmail
}

