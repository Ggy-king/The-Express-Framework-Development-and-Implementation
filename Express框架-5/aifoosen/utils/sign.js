var { appid, secret } = require('../config')
var axios = require('axios')
var sha1 = require('sah1')

// https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

async function getTicket() {  //获取ticket方法函数
    let tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    let token_data = await axios.get(tokenUrl)
    console.log('token',token_data)
    let access_token = token_data.data.access_token    //得到access_token
    let ticketUrl = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
        let ticket_data = await axios.get(ticketUrl)    //得到jsapi_ticket
    console.log('ticket', ticket_data)

    return ticket_data.data.ticket

}


var createNonceStr = function() {   //生成随机字符串
        return Math.random().toString(36).substring(2,15)
}
    
var createTimestamp = function() {
    return parseInt(new Date().getTime() / 1000) + '';
}

var row = function(obj) {    //处理数据格式的方法
    var keys = Object.keys(obj)
    keys = keys.sort()  //字典排序
    var newObj = {}
    keys.forEach((key => {
        newObj[key] = obj[key]
    }))
    var string = ''
    for(var k in newObj){
        string += '&' + k + '=' + newObj[k]
    }
    string = string.substr(1) 
    return string
}

var sign = async function(url) {  //生成signature签名等的方法
    let jsapi_ticket = await getTicket()
    var obj = {
        jsapi_ticket,
        noncestr:createNonceStr(),
        timestamp:createTimestamp(),
        url
    }
    var str = row(obj)
    var signature = sha1(str) //生成签名
    obj.signature = signature


    // 签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 
    // 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。
    // 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用 URL 键值对的格式（即key1=value1&key2=value2…）
    // 拼接成字符串string1。这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，
    // 不进行URL 转义。
    return obj
}


module.exports = sign