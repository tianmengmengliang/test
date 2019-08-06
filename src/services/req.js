
function quest(option, callback) {
  var url = option.url;
  var method = option.method;
  var data = option.data;
  var timeout = option.timeout || 0;

  var xhr = new XMLHttpRequest();
  (timeout > 0) && (xhr.timeout = timeout);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 400) {
        var result = xhr.responseText;
        try {result = JSON.parse(xhr.responseText);} catch (e) {}
        callback && callback(null, result);
      } else {
        callback && callback('status: ' + xhr.status);
      }
    }
  }.bind(this);
  xhr.open(method, url, true);
  if(typeof data === 'object'){
    try{
      data = JSON.stringify(data);
    }catch(e){}
  }
  xhr.send(data);
  xhr.ontimeout = function () {
    callback && callback('timeout');
    console.log('%c连%c接%c超%c时', 'color:red', 'color:orange', 'color:purple', 'color:green');
  };
};

export default function get(url, callback) {
  var option = url.url ? url : { url: url };
  option.method = 'get';
  option.headers = {
        "Content-type":"application:/x-www-form-urlencoded:charset=UTF-8",
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
  }
  quest(option, callback);
};
