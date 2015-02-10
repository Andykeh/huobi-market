/**
 * Created by Andy on 2015/2/8.
 */
var hbBtcNew     = 0,
    hbBtcHigh    = 0,
    hbBtcLow     = 0,
    hbLtcNew     = 0,
    hbLtcHigh    = 0,
    hbLtcLow     = 0,
    vcBtcNew     = 0,
    vcBtcHigh    = 0,
    vcBtcLow     = 0,
    vcLtcNew     = 0,
    vcLtcHigh    = 0,
    vcLtcLow     = 0,
    arrMsgBox    = ['1','1'],
    refreshBtc,refreshLtc;

//工具箱
function BitKit(){
    return {
        'scientific2float' : function(n){
            var num = typeof n == 'string' ? n.toLowerCase().replace(/\s/g,'') : n.toString().toLowerCase().replace(/\s/g,''),
                standby = '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                zf,pn,base,readyNum,offset,ext,len;
            if(/e/.test(num)){
                pn = /\+/.test(num);
                base = num.split('e');
                zf = /\-/.test(base[0].toString()) ? '-0.' : '0.';
                base[0] = base[0].replace('-','');
                offset = base[0].split('.')[1] ? base[0].split('.')[1].length : 0;
                ext = base[1];
                len = ext.split(pn ? '+' : '-')[1];
                base = base[0].replace('.','');
                return pn ? base + standby.substring(0,len - offset) :
                zf + standby.substring(0,len-1) + base;
            }else{
                return num;
            }
        },
        'Numbers' : function(num,n){
            var _str  = this.scientific2float(num),
                _ind  = _str.indexOf('.'),
                _len  = 0,
                _num  = 0,
                _temp = 1;

            if(isNaN(_str)){
                //非数字
                _num = 0;
            }else{

                if(n!==undefined){
                    //设置了保留位数

                    if(_ind > 0 ) {
                        //有小数
                        _len = (_str.substring(_ind + 1, _str.length)).length;
                        if(_len < n){
                            //位数不够增加0
                            for(var a = 0; a < (n-_len); a++){
                                _str = _str + '0'
                            }
                            _num = _str;
                        }else{
                            //保留相应位数
                            _num = _str.substring(0,n+1+_ind)
                        }

                        if(n <= 0){
                            _num = parseInt(num)
                        }

                    }else if( n > 0 ){
                        //无小数
                        _str = _str + '.';
                        for(var c = 0; c < n; c++){
                            _str = _str + '0'
                        }
                        _num = _str
                    }else if(n <= 0){
                        _num = _str
                    }

                }else{
                    //没有设置保留位数
                    _num = Number(_str)
                }
            }
            return _num
        }
    }
}

//行情箭头
function marketArrow(obj, newPrice, oldPrice, callback) {
    if (newPrice > oldPrice&&oldPrice!==''&&oldPrice>0) {
        obj.removeClass('rise').addClass('declining');
        callback && callback(1)
    } else if(newPrice < oldPrice && oldPrice !== '' && oldPrice>0) {
        obj.removeClass('declining').addClass('rise');
        callback && callback(2)
    }else{
        callback && callback(0)
    }
}

//数据类型
function SOCKET_API(version) {
    return {
        marketOverview: function(symbol) {
            return {
                "msg": {
                    msgType: "reqMsgSubscribe",
                    version: version || 1,
                    requestIndex: Date.now(),
                    symbolList: {
                        "marketOverview": [{
                            symbolId: symbol,
                            pushType: "pushLong"
                        }]
                    }
                },
                "msgType": "marketOverview"
            }
        }
    }
}

//行情连接
function IoDetail(URI) {
    var socket_api = SOCKET_API(),
        ioConn     = io.connect(URI);
    return {
        /*行情概览*/
        IoOverview: function(tradeType) {
            var marketOverview = socket_api['marketOverview'],
                selHbBtcNew  = $('#hb_btc_new'),
                selHbBtcHigh = $('#hb_btc_high'),
                selHbBtcLow  = $('#hb_btc_low'),
                selHbLtcNew  = $('#hb_ltc_new'),
                selHbLtcHigh = $('#hb_ltc_high'),
                selHbLtcLow  = $('#hb_ltc_low'),
                selVcBtcNew  = $('#vc_btc_new'),
                selVcBtcHigh = $('#vc_btc_high'),
                selVcBtcLow  = $('#vc_btc_low'),
                selVcLtcNew  = $('#vc_ltc_new'),
                selVcLtcHigh = $('#vc_ltc_high'),
                selVcLtcLow  = $('#vc_ltc_low');

            if (tradeType == 'futures') {
                ioConn.emit('request', marketOverview('btccnyweek').msg);
                ioConn.emit('request', marketOverview('ltccnyweek').msg);
            } else {
                ioConn.emit('request', marketOverview('btccny').msg);
                ioConn.emit('request', marketOverview('ltccny').msg);
            }

            ioConn.on('message', fn_call);

            //数据调用
            function fn_call(data) {
                var _coin = data.symbolId,
                    _payload = data.payload;

                if (data.msgType == 'marketOverview') {
                    switch (_coin) {
                        case 'btccny':
                            marketArrow(selHbBtcNew.parent(), _payload.priceNew, hbBtcNew);
                            hbBtcNew  = _payload.priceNew;
                            hbBtcHigh = _payload.priceHigh;
                            hbBtcLow  = _payload.priceLow;

                            break;
                        case 'ltccny':
                            marketArrow(selHbLtcNew.parent(), _payload.priceNew, hbLtcNew);
                            hbLtcNew  = _payload.priceNew;
                            hbLtcHigh = _payload.priceHigh;
                            hbLtcLow  = _payload.priceLow;

                            break;
                        case 'btccnyweek':
                            marketArrow(selVcBtcNew.parent(), _payload.priceNew, vcBtcNew);
                            vcBtcNew  = _payload.priceNew;
                            vcBtcHigh = _payload.priceHigh;
                            vcBtcLow  = _payload.priceLow;

                            break;
                        case 'ltccnyweek':
                            marketArrow(selVcLtcNew.parent(), _payload.priceNew, vcLtcNew);
                            vcLtcNew  = _payload.priceNew;
                            vcLtcHigh = _payload.priceHigh;
                            vcLtcLow  = _payload.priceLow;

                            break;
                        default:
                            return false;
                    }
                    fn_Dom();
                    Price_tip();
                }
            }

            //插入页面
            function fn_Dom() {

                if (tradeType == 'futures') {
                    /*期货*/
                    selVcBtcNew.html(BitKit().Numbers(vcBtcNew,2));
                    selVcBtcHigh.html(BitKit().Numbers(vcBtcHigh,2));
                    selVcBtcLow.html(BitKit().Numbers(vcBtcLow,2));
                    selVcLtcNew.html(BitKit().Numbers(vcLtcNew,2));
                    selVcLtcHigh.html(BitKit().Numbers(vcLtcHigh,2));
                    selVcLtcLow.html(BitKit().Numbers(vcLtcLow,2));
                } else {
                    /*现货*/
                    selHbBtcNew.html(BitKit().Numbers(hbBtcNew,2));
                    selHbBtcHigh.html(BitKit().Numbers(hbBtcHigh,2));
                    selHbBtcLow.html(BitKit().Numbers(hbBtcLow,2));
                    selHbLtcNew.html(BitKit().Numbers(hbLtcNew,2));
                    selHbLtcHigh.html(BitKit().Numbers(hbLtcHigh,2));
                    selHbLtcLow.html(BitKit().Numbers(hbBtcLow,2));
                }
            }
        }
    }
}
//价格预警
function Price_tip(){
    //console.log('预警价格：'+localStorage.Btc_price)
    //console.log('预警价格：'+localStorage.Ltc_price)

    if(!!localStorage.Btc_price && hbBtcNew !== 0 && hbBtcNew >= Number(localStorage.Btc_price)){

        if(arrMsgBox[0]==='1'){
            showMsg('btc');
        }
        arrMsgBox[0] = '0';
    }else{
        //console.log('B停止预警');
        arrMsgBox[0] = '1';
        clearTimeout(refreshBtc)
    }

    if (!!localStorage.Ltc_price && hbLtcNew !== 0 && hbLtcNew >= Number(localStorage.Ltc_price)) {
        if(arrMsgBox[1]==='1'){
            showMsg('ltc');
        }
        arrMsgBox[1] = '0';
    }else{
        //console.log('L停止预警');
        arrMsgBox[1] = '1';
        clearTimeout(refreshLtc)
    }

}
//桌面提示
function showMsg(coin_type){
    var _btc_icon,_ltc_icon, _time, _hour, _period;
    _btc_icon = 'btc_48.png';
    _ltc_icon = 'ltc_48.png';
    _time = /(..)(:..)(:..)/.exec(new Date());
    _hour = _time[1] % 12 || 12;
    _period = _time[1] < 12 ? '上午' : '下午';

    if(coin_type == 'btc'){
        new Notification('比特币价格预警',{
            icon: _btc_icon,
            body:'BTC价格已经达到' + hbBtcNew + "\n 时间" + _hour + _time[2] + _time[3] + ' ' + _period
        });
        //console.log('BTC价格已经达到' + hbBtcNew + "\n 时间" + _hour + _time[2] + _time[3] + ' ' + _period)
        refreshBtc = setTimeout(function(){
            showMsg(coin_type)
        },localStorage.Time_out)

    }else{

        new Notification('莱特币价格预警',{
            icon: _ltc_icon,
            body:'LTC价格已经达到' + hbLtcNew + "\n 时间" + _hour + _time[2] + _time[3] + ' ' + _period
        });
        //console.log('LTC价格已经达到' + hbLtcNew + "\n 时间" + _hour + _time[2] + _time[3] + ' ' + _period    )
        refreshLtc = setTimeout(function(){
            showMsg(coin_type)
        },localStorage.Time_out)
    }



}



$(function(){
    var hbUri = 'https://hq.huobi.com',
        vcUri = 'https://hq.bitvc.com',
        FuIo  = IoDetail(vcUri),
        AcIo  = IoDetail(hbUri),
        selOptionInfo= $('#app_option'),
        selOption = $('#option_btn'),
        selBtcNot = $('#btc_not'),
        selLtcNot = $('#ltc_not'),
        selTimeOut= $('#time_out');
    FuIo.IoOverview('futures');
    AcIo.IoOverview('actuals');
    //设置

    selOption.click(function(){
        if(selOptionInfo.is(':hidden')){
            selOptionInfo.slideDown()
        }else{
            selOptionInfo.slideUp()
        }

    });

    //价格报警
    selBtcNot.change(function(){
        localStorage.Btc_price = $(this).val();
    });

    selLtcNot.change(function(){
        localStorage.Ltc_price = $(this).val();
    });

    if(localStorage.Btc_price){
        selBtcNot.val(localStorage.Btc_price)
    }
    if(localStorage.Ltc_price){
        selLtcNot.val(localStorage.Ltc_price)
    }
    selTimeOut.change(function(){
        localStorage.Time_out = $(this).val()*1000;
    });

    if(localStorage.Time_out>0){
        selTimeOut.val(localStorage.Time_out/1000);
    }else{
        localStorage.Time_out = selTimeOut.val()*1000;
    }
});