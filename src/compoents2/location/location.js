//import area from './area.js'
//从 session 中取得 area。
import BasicLayout from '../../layouts/BasicLayout.js'
const {area_key } = BasicLayout.area_key ;
const _area = sessionStorage.getItem( area_key);
let area = JSON.parse( _area); //字符串转JSON

/*
* @interface 根据省市id返回省市对象
* @provinceId {string} 省的id
* @cityId {string} 城市id
* @return {Array.object} 返回省市的对象
* */
export function searchLocationByValues(provinceId,cityId ,zoneId){
    //console.log('1area',area);
    // console.log('2provinceId', provinceId);
    if(!provinceId||!cityId) return [];
    if(!zoneId) return [];
    function loop(id,arr){
        if(!id||!arr) return {};
        try{
           for(var i=0,len= arr.length; i<len;i++){
               if(arr[i].id == id) { //value
                 //console.log('3匹配');
                 return arr[i]
               }
           }
            return {};
        }catch(e){
            console.log(e)
        }
        return {};
    }

    var province=loop(provinceId, area);
    var city=loop(cityId, area); //province.children
    var zone=loop(zoneId, area);
    var location=[];
    location.province={
      id: province.id, //value
      name: province.name, //label
    };
    location.city= city;
    location.zone= zone;

    return location
}
