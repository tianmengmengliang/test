/**
 * Created by jpt on 2018/5/16 0016.
 */
/**
 * Created by jpt on 2018/4/18 0018.
 */
//import area from './area.js'
//从 session 中取得 area。
import BasicLayout from '../../layouts/BasicLayout.js'
const {s_Typekey } = BasicLayout.area_key ;
const _area = sessionStorage.getItem( s_Typekey);
let area = JSON.parse( _area); //字符串转JSON

/*
 * @interface 根据设备id返回对象
 * @provinceId {string} 设备类型的id
 * @return {Array.object} 返回类型的对象
 * */
export function searchSampleTypeByValues(deviceTypeId ){
  //console.log('deviceTypeId',deviceTypeId);
  if(!deviceTypeId) return  '';

  function loop(id, arr){
    if(!id||!arr) return {};
    try{
      for(var i=0, len = arr.length; i<len;i++){
        if(arr[i].id == id ) {
          return arr[i].name
        }
      }
      return '';
    }catch(e){
      console.log(e)
    }
    return {};
  }

  var location = '';
  location = loop(deviceTypeId, area);

  return location
}
