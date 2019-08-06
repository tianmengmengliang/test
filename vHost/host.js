
// coldbox.yizhijie.com下服务器配置地址
(function(){
    var value = {
        PROXY: true,
        LOCAL_DEV: false,                           // 本地开发模式
        REMOTE_DEV_LINK_HOST: true,                // 远程开发模式
        PROD_HOST: {                                // 生产服务器
            URL: {
                protocol: 'http',
                hostname: 'coldbox.yizhijie.com',
                port: '80'
            }
        },
        REMOTE_DEV_HOST: {                          // 远程开发服务器
            URL: {
                protocol: 'http',
                hostname: 'coldboxtest.yizhijie.com',
                port: '80'
            }
        },
        LOCAL_DEV_HOST: {                           // 本地开发服务器
            URL: {
                protocol: 'http',
                hostname: '192.168.3.17',
                port: '18080'
            }
        },
    };
    if(typeof window === 'object'){
        setGlobalValue(window, 'vHost_host', value);
        return;
    }
    if(typeof global === 'object' && typeof module === 'object' && module.exports === 'object' && typeof require === 'function'){
        module.exports = value;
        return;
    }
    throw new Error('the enviroment is not browser or node')
    function setGlobalValue(global, namespaces, value){
        global[namespaces]= value
    }
})();
