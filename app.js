/**
 * Created by Andy on 2014/10/22.
 */
    $(function(){


var _conn,_url,_version,_btc_new,_btc_high,_btc_low,_ltc_new,_ltc_high,_ltc_low,_btc_price,_ltc_price,_option_btn,_option_info,_price_old,_class,_btc_not,_ltc_not,_msgBox,_time_out;


    _option_btn  = $('#option_btn');
    _option_info = $('#app_option');
    _url         = 'http://hq.huobi.com';
    _btc_new     = $('#btc_info');
    _btc_high    = $('#btc_high');
    _btc_low     = $('#btc_low');
    _btc_price   = 0;
    _ltc_new     = $('#ltc_info');
    _ltc_high    = $('#ltc_high');
    _ltc_low     = $('#ltc_low');
    _ltc_price   = 0;
    _version     = '';
    _price_old   = [];
    _class       = ['rise','declining'];
    _btc_not     = $('#btc_not');
    _ltc_not     = $('#ltc_not');
    _msgBox      = [true,true];
    _time_out    = $('#time_out');

var _marketOverview = function(symbol) {
        return {
            "msg": {
                msgType: "reqMsgSubscribe",
                version: _version || 1,
                requestIndex: new Date * 1,
                symbolList: {
                    "marketOverview": [{
                        symbolId: symbol,
                        pushType: "pushLong"
                    }]
                }
            },
            "msgType": "marketOverview"
        }
    };

    //链接行情
    _conn        = io.connect(_url);

    //绑定数据类型
    _conn.emit('request',_marketOverview('btccny').msg);
    _conn.emit('request',_marketOverview('ltccny').msg);

    //获取消息
    _conn.on('message',callback);

    function callback(data){
        var _data =data.payload;
        if(_data.symbolId=='btccny'){
            _btc_price = _data.priceNew;
            _btc_new.html(_data.priceNew);
            _btc_high.html(_data.priceHigh);
            _btc_low.html(_data.priceLow);
            marketArrow(_btc_new.parent(),_data.priceNew,_price_old[0]);
            _price_old[0] = _data.priceNew;
        }else{
            _ltc_price = _data.priceNew;
            _ltc_new.html(_data.priceNew);
            _ltc_high.html(_data.priceHigh);
            _ltc_low.html(_data.priceLow);
            marketArrow(_ltc_new.parent(),_data.priceNew,_price_old[1]);
            _price_old[1] = _data.priceNew;
        }
        if(localStorage.Btc_price || localStorage.Ltc_price){
            showMsg()
        }

    }

    //行情对比
    function marketArrow(obj, newPrice, oldPrice) {

        if (newPrice > oldPrice && oldPrice !=='' && oldPrice > 0) {
            obj.removeClass(_class[0]).addClass(_class[1]);
        } else if(newPrice < oldPrice && oldPrice !== '' && oldPrice > 0) {
            obj.removeClass(_class[1]).addClass(_class[0]);
        }

    }

    //价格报警
    _btc_not.change(function(){
        localStorage.Btc_price = $(this).val();
    });

    _ltc_not.change(function(){
        localStorage.Ltc_price = $(this).val();
    });

    if(localStorage.Btc_price){
        _btc_not.val(localStorage.Btc_price)
    }
    if(localStorage.Ltc_price){
        _ltc_not.val(localStorage.Ltc_price)
    }
    _time_out.change(function(){
        localStorage.Time_out = $(this).val()*1000;
    });

    if(localStorage.Time_out>0){
        _time_out.val(localStorage.Time_out/1000);
    }else{
        localStorage.Time_out = _time_out.val()*1000;
    }

    //桌面提示
    function showMsg(){
        var _btc_icon,_ltc_icon, _time, _hour, _period;
        _btc_icon = 'btc_48.png';
        _ltc_icon = 'ltc_48.png';
        _time = /(..)(:..)(:..)/.exec(new Date());
        _hour = _time[1] % 12 || 12;
        _period = _time[1] < 12 ? '上午' : '下午';

        if(localStorage.Btc_price){
            if(_btc_price!== 0 && _btc_price>=Number(localStorage.Btc_price)&&_msgBox[0]){

                new Notification('比特币价格预警',{
                    icon: _btc_icon,
                    body:'BTC价格已经达到' + _btc_price + "\n 时间" + _hour + _time[2] + _time[3] + ' ' + _period
                });
            _msgBox[0] = false;
                setTimeout(function(){
                    _msgBox[0] = true;
                },localStorage.Time_out)
            }

        }
        if(localStorage.Ltc_price){
            if(_ltc_price!== 0 && _ltc_price>=Number(localStorage.Ltc_price)&&_msgBox[1]){
                new Notification('莱特币价格预警',{
                    icon: _ltc_icon,
                    body:'LTC价格已经达到' + _ltc_price + "\n 时间" + _hour + _time[2] + _time[3] + ' ' + _period
                });
                _msgBox[1] = false;
                setTimeout(function(){
                    _msgBox[1] = true;
                },localStorage.Time_out)
            }
        }

    }

    //设置
    _option_btn.click(function(){
        if(_option_info.is(':hidden')){
            _option_info.slideDown()
        }else{
            _option_info.slideUp()
        }

    });

    });