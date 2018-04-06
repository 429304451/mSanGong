/**
 * Created by coder on 2017/8/1.
 */

var CryptoJS = require("crypto-js");

Encrypt = {};

Encrypt.AESEncrypt = function (data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
};

Encrypt.AESDecrypt = function (data, key) {
    var decryptedData = CryptoJS.AES.decrypt(data, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.AESEncryptHex = function (data, key) {
    var b64 = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    return CryptoJS.enc.Base64.parse(b64).toString(CryptoJS.enc.Hex);
};

Encrypt.AESDecryptHex = function (data, key) {
    var b64 = CryptoJS.enc.Hex.parse(data).toString(CryptoJS.enc.Base64);
    var decryptedData = CryptoJS.AES.decrypt(b64, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.DESEncrypt = function (data, key) {
    return CryptoJS.DES.encrypt(JSON.stringify(data), key).toString()
};

Encrypt.DESDecrypt = function (data, key) {
    var decryptedData = CryptoJS.DES.decrypt(data, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.TripleDESEncrypt = function (data, key) {
    return CryptoJS.TripleDES.encrypt(JSON.stringify(data), key).toString()
};

Encrypt.TripleDESDecrypt = function (data, key) {
    var decryptedData = CryptoJS.TripleDES.decrypt(data, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.RabbitEncrypt = function (data, key) {
    return CryptoJS.Rabbit.encrypt(JSON.stringify(data), key).toString()
};

Encrypt.RabbitDecrypt = function (data, key) {
    var decryptedData = CryptoJS.Rabbit.decrypt(data, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.RC4Encrypt = function (data, key) {
    return CryptoJS.Rabbit.encrypt(JSON.stringify(data), key).toString()
};

Encrypt.RC4Decrypt = function (data, key) {
    var decryptedData = CryptoJS.Rabbit.decrypt(data, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.RC4DropEncrypt = function (data, key) {
    return CryptoJS.Rabbit.encrypt(JSON.stringify(data), key).toString()
};

Encrypt.RC4DropDecrypt = function (data, key) {
    var decryptedData = CryptoJS.Rabbit.decrypt(data, key);
    var data = decryptedData.toString(CryptoJS.enc.Utf8);
    return JSON.parse(data);
};

Encrypt.MD5 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.MD5(data).toString();
};

Encrypt.SHA1 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.SHA1(data).toString();
};

Encrypt.SHA256 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.SHA256(data).toString();
};

Encrypt.SHA512 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.SHA512(data).toString();
};

Encrypt.HmacMD5 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.HmacMD5(data).toString();
};

Encrypt.HmacSHA1 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.HmacSHA1(data).toString();
};

Encrypt.HmacSHA256 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.HmacSHA256(data).toString();
};

Encrypt.HmacSHA512 = function (data) {
    if(typeof data != 'string')
        data = JSON.stringify(data);

    return CryptoJS.HmacSHA512(data).toString();
};

Encrypt.xor = function (data, key) {

    var result = "";

    var length = key.length;

    var array = [63, 31, 15, 7, 3, 1];

    for (var i = 0; i < array.length; i++) {
        if (length > array[i]) {
            length = array[i];
            break;
        }
    }

    for (var i = 0; i < data.length; i++) {
        var charCode = data.charCodeAt(i) ^ key.charCodeAt(i & length);
        if (charCode != 0)
            result += String.fromCharCode(charCode);
        else
            result += data[i];
    }

    return result;
};

Encrypt.xorEncode = function (data, key) {
    return Encrypt.xor(JSON.stringify(data), key);
};

Encrypt.xorDecode = function (data, key) {
    return JSON.parse(Encrypt.xor(data, key));
};

Encrypt.xorWord = function (data, key) {

    var result = "";

    var length = key.length;

    var array = [63, 31, 15, 7, 3, 1];

    for (var i = 0; i < array.length; i++) {
        if (length > array[i]) {
            length = array[i];
            break;
        }
    }

    for (var i = 0; i < data.length; i++) {
        var charCode = data.charCodeAt(i) ^ key.charCodeAt(i & length);

        if ((charCode >= 48 && charCode <= 48 + 9) || (charCode >= 65 && charCode <= 65 + 25) || (charCode >= 97 && charCode <= 97 + 25))
        {
            result += String.fromCharCode(charCode);
            continue;
        }

        var words = "_-";
        for(var index in words)
        {
            if(words.charCodeAt(index) == charCode)
            {
                words = null;
                result += String.fromCharCode(charCode);
                break;
            }
        }

        if(words == null)
            continue;

        result += data[i];
    }

    return result;
};

Encrypt.xorWordEncode = function (data, key) {
    return Encrypt.xorWord(JSON.stringify(data), key);
};

Encrypt.xorWordDecode = function (data, key) {
    return JSON.parse(Encrypt.xorWord(data, key));
};

Encrypt.packetEvent = function (eventName, key) {
    if (typeof key == "object") {
        key = key.id;
        if (key == null) {
            console.error("参数错误", arguments);
            return null;
        }

        if (key.indexOf('#') != -1)
            key = key.substring(key.indexOf('#') + 1);
    }

    return Encrypt.xor(eventName, key);
};

Encrypt.packetEvent2 = function (eventName) {
    return Encrypt.SHA1(eventName);
};

Encrypt.packetData = function (data, socket) {
    data = data || {};
    socket.msgID = socket.msgID == null ? 1 : socket.msgID + 1;

    var key = socket.id;
    if (key == null) {
        console.error("参数错误", arguments);
        return null;
    }

    if (key.indexOf('#') != -1)
        key = key.substring(key.indexOf('#') + 1);

    var message = {};
    message.data = data;
    message.msgID = socket.msgID;
    message._sign = Encrypt.MD5(message);
    return Encrypt.xorEncode(message, key);
};

Encrypt.decryptData = function (message, socket) {
    if (!message || typeof message != "string") {
        console.error("数据包类型错误", message);
        return null;
    }

    var key = socket.id;
    if (key.indexOf('#') != -1)
        key = key.substring(key.indexOf('#') + 1);

    try {
        if (typeof cc != "undefined" && typeof cc.sys != "undefined" && cc.sys.isNative)
            message = JSON.parse(message);

        message = Encrypt.xorDecode(message, key);

        if (message.msgID <= socket.msgID) {
            console.error("数据包msgID错误", message);
            return null;
        }

        socket.msgID = message.msgID;

        var _sign = message._sign;
        delete message._sign;

        if (_sign != Encrypt.MD5(message)) {
            console.error("数据包签名错误", _sign, message);
            return null;
        }

        return message.data;
    }
    catch (err) {
        console.error("数据包错误", err);
    }

    return null;
};

Encrypt.packetData2 = function (data) {
    data = data || {};

    var key = "U2FsdGVkX188YsAYNpx8M27UIUtPvo4gV47HP7QTYD9PSHqnqSnNy3g3uWWDaW0vmg8EEjvbYHhtdhUIv6dDotlAo8UJ/HTn/RbSx5QCvXs=";

    var message = {};
    message.data = data;
    message._sign = Encrypt.MD5(message);
    return Encrypt.xorEncode(message, key);
};

Encrypt.decryptData2 = function (message) {
    if (!message || typeof message != "string") {
        console.error("数据包类型错误", message);
        return null;
    }

    try {
        if (typeof cc != "undefined" && typeof cc.sys != "undefined" && cc.sys.isNative)
            message = JSON.parse(message);

        var key = "U2FsdGVkX188YsAYNpx8M27UIUtPvo4gV47HP7QTYD9PSHqnqSnNy3g3uWWDaW0vmg8EEjvbYHhtdhUIv6dDotlAo8UJ/HTn/RbSx5QCvXs=";

        message = Encrypt.xorDecode(message, key);

        var _sign = message._sign;
        delete message._sign;

        if (_sign != Encrypt.MD5(message)) {
            console.error("数据包签名错误", _sign, message);
            return null;
        }

        return message.data;
    }
    catch (err) {
        console.error("数据包错误", err);
    }

    return null;
};

module.exports = Encrypt;
